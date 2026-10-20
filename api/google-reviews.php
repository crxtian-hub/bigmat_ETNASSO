<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = dirname(__DIR__) . '/data';
$cacheFile = $dataDir . '/google-reviews.json';
$cacheTtl = max(300, (int) (getenv('BIGMAT_GOOGLE_REVIEWS_CACHE_TTL') ?: 21600));

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function readCache(string $file): ?array
{
    if (!is_file($file)) {
        return null;
    }

    $payload = json_decode(file_get_contents($file) ?: '{}', true);
    return is_array($payload) ? $payload : null;
}

function writeCache(string $file, array $payload): void
{
    file_put_contents($file, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function httpGetJson(string $url, array $headers): array
{
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 10,
        ]);

        $body = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);
        curl_close($curl);

        if ($body === false || $status >= 400) {
            throw new RuntimeException($error ?: 'Risposta Google non valida.');
        }

        $data = json_decode($body, true);
        return is_array($data) ? $data : [];
    }

    $context = stream_context_create([
        'http' => [
            'header' => implode("\r\n", $headers),
            'ignore_errors' => true,
            'timeout' => 10,
        ],
    ]);
    $body = file_get_contents($url, false, $context);

    if ($body === false) {
        throw new RuntimeException('Impossibile contattare Google.');
    }

    $data = json_decode($body, true);
    return is_array($data) ? $data : [];
}

function localizedText(array $value): string
{
    return trim((string) ($value['text'] ?? $value['originalText']['text'] ?? ''));
}

function normalizeReviews(array $place): array
{
    $reviews = [];

    foreach (($place['reviews'] ?? []) as $review) {
        $rating = (int) ($review['rating'] ?? 0);
        $text = localizedText($review['text'] ?? []);

        if ($rating !== 5 || $text === '') {
            continue;
        }

        $author = $review['authorAttribution'] ?? [];
        $reviews[] = [
            'author' => trim((string) ($author['displayName'] ?? 'Cliente Google')),
            'rating' => $rating,
            'text' => $text,
            'publishedAt' => (string) ($review['publishTime'] ?? ''),
            'relativeTime' => (string) ($review['relativePublishTimeDescription'] ?? ''),
            'authorUri' => (string) ($author['uri'] ?? ''),
            'googleMapsUri' => (string) ($review['googleMapsUri'] ?? ($place['googleMapsUri'] ?? '')),
        ];
    }

    return $reviews;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['error' => 'Metodo non supportato.'], 405);
}

$cached = readCache($cacheFile);
if ($cached && (time() - (int) ($cached['cachedAt'] ?? 0)) < $cacheTtl) {
    respond($cached + ['cached' => true]);
}

$apiKey = getenv('BIGMAT_GOOGLE_PLACES_API_KEY') ?: getenv('GOOGLE_MAPS_API_KEY') ?: '';
$placeId = getenv('BIGMAT_GOOGLE_PLACE_ID') ?: '';

if ($apiKey === '' || $placeId === '') {
    respond($cached ?: [
        'configured' => false,
        'reviews' => [],
        'cachedAt' => null,
        'error' => 'Configura BIGMAT_GOOGLE_PLACES_API_KEY e BIGMAT_GOOGLE_PLACE_ID.',
    ]);
}

try {
    $fields = implode(',', [
        'id',
        'displayName',
        'googleMapsUri',
        'rating',
        'userRatingCount',
        'reviews',
    ]);
    $url = 'https://places.googleapis.com/v1/places/' . rawurlencode($placeId) . '?languageCode=it&regionCode=IT';
    $place = httpGetJson($url, [
        'X-Goog-Api-Key: ' . $apiKey,
        'X-Goog-FieldMask: ' . $fields,
    ]);

    $payload = [
        'configured' => true,
        'place' => [
            'id' => (string) ($place['id'] ?? $placeId),
            'name' => (string) ($place['displayName']['text'] ?? ''),
            'googleMapsUri' => (string) ($place['googleMapsUri'] ?? ''),
            'rating' => $place['rating'] ?? null,
            'userRatingCount' => $place['userRatingCount'] ?? null,
        ],
        'reviews' => normalizeReviews($place),
        'cachedAt' => time(),
    ];

    writeCache($cacheFile, $payload);
    respond($payload);
} catch (Throwable $error) {
    if ($cached) {
        respond($cached + ['cached' => true, 'stale' => true]);
    }

    respond([
        'configured' => true,
        'reviews' => [],
        'cachedAt' => null,
        'error' => 'Impossibile caricare le recensioni Google.',
    ], 502);
}
