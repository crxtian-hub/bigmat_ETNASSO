<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = dirname(__DIR__) . '/data';
$dataFile = $dataDir . '/product-categories.json';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode(seedCategories(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function requireAuthentication(): void
{
    if (($_SESSION['admin_authenticated'] ?? false) !== true) {
        respond(['error' => 'Accesso non autorizzato.'], 401);
    }
}

function seedCategories(): array
{
    return [
        'Edilizia' => ['Materiali', 'Utensili', 'Ferramenta', 'Termoidraulica', 'Sicurezza'],
        'Showroom' => [],
        'Noleggio' => [],
    ];
}

function normalizeSection(string $section): string
{
    $sections = ['Edilizia', 'Showroom', 'Noleggio'];
    foreach ($sections as $knownSection) {
        if (strtolower($knownSection) === strtolower(trim($section))) {
            return $knownSection;
        }
    }

    return 'Edilizia';
}

function cleanCategoryList(array $categories): array
{
    return array_values(array_filter(array_map('strval', $categories), fn($item) => trim($item) !== ''));
}

function readCategoryGroups(string $file): array
{
    $json = file_get_contents($file);
    $categories = json_decode($json ?: '[]', true);
    if (!is_array($categories)) {
        return seedCategories();
    }

    if (array_is_list($categories)) {
        return [
            'Edilizia' => cleanCategoryList($categories),
            'Showroom' => [],
            'Noleggio' => [],
        ];
    }

    $seed = seedCategories();
    foreach ($seed as $section => $fallback) {
        $seed[$section] = isset($categories[$section]) && is_array($categories[$section])
            ? cleanCategoryList($categories[$section])
            : $fallback;
    }

    return $seed;
}

function writeCategoryGroups(string $file, array $groups): void
{
    $clean = [];
    foreach (seedCategories() as $section => $fallback) {
        $clean[$section] = array_values(array_unique(array_map('trim', $groups[$section] ?? [])));
    }

    file_put_contents($file, json_encode($clean, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

$method = $_SERVER['REQUEST_METHOD'];
$section = normalizeSection((string) ($_GET['section'] ?? 'Edilizia'));
$categoryGroups = readCategoryGroups($dataFile);
$categories = $categoryGroups[$section] ?? [];

if ($method === 'GET') {
    respond(['categories' => $categories]);
}

requireAuthentication();

if ($method === 'POST') {
    $payload = json_decode(file_get_contents('php://input') ?: '{}', true);
    $name = is_array($payload) ? trim((string) ($payload['name'] ?? '')) : '';
    $section = normalizeSection(is_array($payload) ? (string) ($payload['section'] ?? $section) : $section);
    $categories = $categoryGroups[$section] ?? [];

    if ($name === '') {
        respond(['error' => 'Nome categoria obbligatorio.'], 422);
    }

    $exists = array_filter($categories, fn($category) => strtolower($category) === strtolower($name));
    if (!$exists) {
        $categories[] = $name;
        $categoryGroups[$section] = $categories;
        writeCategoryGroups($dataFile, $categoryGroups);
    }

    $categoryGroups = readCategoryGroups($dataFile);
    respond(['categories' => $categoryGroups[$section] ?? []], 201);
}

if ($method === 'DELETE') {
    $payload = json_decode(file_get_contents('php://input') ?: '{}', true);
    $name = is_array($payload) ? trim((string) ($payload['name'] ?? '')) : '';
    $section = normalizeSection(is_array($payload) ? (string) ($payload['section'] ?? $section) : $section);
    $categories = $categoryGroups[$section] ?? [];

    $categories = array_values(array_filter(
        $categories,
        fn($category) => strtolower($category) !== strtolower($name)
    ));
    $categoryGroups[$section] = $categories;
    writeCategoryGroups($dataFile, $categoryGroups);

    respond(['categories' => $categories]);
}

respond(['error' => 'Metodo non supportato.'], 405);
