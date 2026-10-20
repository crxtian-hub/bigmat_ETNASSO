<?php
declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$root = __DIR__;

if (str_starts_with($path, '/api/')) {
    $apiFile = realpath($root . $path);
    $apiRoot = realpath($root . '/api');

    if ($apiFile && $apiRoot && str_starts_with($apiFile, $apiRoot) && is_file($apiFile)) {
        require $apiFile;
        return true;
    }
}

$publicFile = realpath($root . '/public' . ($path === '/' ? '/index.html' : $path));
$publicRoot = realpath($root . '/public');

if ($publicFile && $publicRoot && str_starts_with($publicFile, $publicRoot) && is_file($publicFile)) {
    $extension = strtolower(pathinfo($publicFile, PATHINFO_EXTENSION));
    $contentTypes = [
        'css' => 'text/css; charset=UTF-8',
        'html' => 'text/html; charset=UTF-8',
        'jpeg' => 'image/jpeg',
        'jpg' => 'image/jpeg',
        'js' => 'text/javascript; charset=UTF-8',
        'jsx' => 'text/babel; charset=UTF-8',
        'png' => 'image/png',
        'svg' => 'image/svg+xml',
    ];

    header('Content-Type: ' . ($contentTypes[$extension] ?? 'application/octet-stream'));
    readfile($publicFile);
    return true;
}

require $root . '/public/index.html';
return true;
