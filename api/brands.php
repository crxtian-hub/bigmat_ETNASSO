<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = dirname(__DIR__) . '/data';
$uploadDir = dirname(__DIR__) . '/public/uploads/brands';
$dataFile = $dataDir . '/brands.json';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
}

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
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

function readBrands(string $file): array
{
    $json = file_get_contents($file);
    $brands = json_decode($json ?: '[]', true);
    return is_array($brands) ? $brands : [];
}

function writeBrands(string $file, array $brands): void
{
    file_put_contents($file, json_encode(array_values($brands), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

function inputField(string $name, string $default = ''): string
{
    if (isset($_POST[$name])) {
        return trim((string) $_POST[$name]);
    }

    return $default;
}

function uploadImage(?array $file, string $uploadDir): ?string
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        respond(['error' => 'Upload non riuscito.'], 400);
    }

    if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
        respond(['error' => 'La foto supera il limite di 5 MB.'], 400);
    }

    $info = getimagesize($file['tmp_name']);
    if ($info === false) {
        respond(['error' => 'Il file caricato non è una immagine valida.'], 400);
    }

    $mimeToExt = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    $mime = $info['mime'] ?? '';
    if (!isset($mimeToExt[$mime])) {
        respond(['error' => 'Formato immagine non supportato. Usa JPG, PNG, WEBP o GIF.'], 400);
    }

    $filename = bin2hex(random_bytes(12)) . '.' . $mimeToExt[$mime];
    $target = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        respond(['error' => 'Impossibile salvare la foto.'], 500);
    }

    return 'uploads/brands/' . $filename;
}

function deleteImage(?string $image, string $uploadDir): void
{
    if (!$image || !str_starts_with($image, 'uploads/brands/')) {
        return;
    }

    $path = $uploadDir . '/' . basename($image);
    if (is_file($path)) {
        unlink($path);
    }
}

function brandFromRequest(?array $existing, string $uploadDir): array
{
    $name = inputField('name', $existing['name'] ?? '');
    $link = inputField('link', $existing['link'] ?? '');
    $type = inputField('type', $existing['type'] ?? 'showroom');
    $image = $existing['image'] ?? '';

    if ($name === '') {
        respond(['error' => 'Il nome brand è obbligatorio.'], 422);
    }

    if (!in_array($type, ['showroom', 'rivendita'], true)) {
        respond(['error' => 'Tipologia non valida.'], 422);
    }

    $uploadedImage = uploadImage($_FILES['image'] ?? null, $uploadDir);
    if ($uploadedImage) {
        deleteImage($image, $uploadDir);
        $image = $uploadedImage;
    }

    return [
        'id' => $existing['id'] ?? bin2hex(random_bytes(8)),
        'name' => $name,
        'link' => $link,
        'type' => $type,
        'image' => $image,
        'updatedAt' => date(DATE_ATOM),
    ];
}

$method = $_POST['_method'] ?? $_SERVER['REQUEST_METHOD'];
$brands = readBrands($dataFile);

if ($method === 'GET') {
    respond(['brands' => $brands]);
}

requireAuthentication();

if ($method === 'POST') {
    $brand = brandFromRequest(null, $uploadDir);
    array_unshift($brands, $brand);
    writeBrands($dataFile, $brands);
    respond(['brand' => $brand], 201);
}

if ($method === 'PUT') {
    $id = $_GET['id'] ?? '';
    foreach ($brands as $index => $brand) {
        if (($brand['id'] ?? '') === $id) {
            $brands[$index] = brandFromRequest($brand, $uploadDir);
            writeBrands($dataFile, $brands);
            respond(['brand' => $brands[$index]]);
        }
    }

    respond(['error' => 'Brand non trovato.'], 404);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    foreach ($brands as $index => $brand) {
        if (($brand['id'] ?? '') === $id) {
            deleteImage($brand['image'] ?? '', $uploadDir);
            array_splice($brands, $index, 1);
            writeBrands($dataFile, $brands);
            respond(['ok' => true]);
        }
    }

    respond(['error' => 'Brand non trovato.'], 404);
}

respond(['error' => 'Metodo non supportato.'], 405);
