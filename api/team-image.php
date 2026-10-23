<?php
declare(strict_types=1);

// Generate small display copies without changing the photos uploaded in the CMS.
$publicRoot = realpath(dirname(__DIR__) . '/public');
$image = $_GET['image'] ?? '';
$width = (int) ($_GET['width'] ?? 640);
if (!is_string($image) || !in_array($width, [320, 640, 960, 1280, 1920], true)) {
    http_response_code(400);
    exit;
}
$relative = ltrim($image, '/');
if (!preg_match('~^uploads/[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|gif)$~i', $relative)
    && $relative !== 'assets/home/Paride_Pino.webp') {
    http_response_code(404);
    exit;
}
$source = $publicRoot ? realpath($publicRoot . '/' . $relative) : false;
if (!$source || !str_starts_with($source, $publicRoot . DIRECTORY_SEPARATOR) || !is_file($source)) {
    http_response_code(404);
    exit;
}

function sendTeamImage(string $file, string $mime, string $key): void
{
    $etag = '"' . $key . '"';
    header('Content-Type: ' . $mime);
    header('Cache-Control: public, max-age=86400');
    header('ETag: ' . $etag);
    header('X-Content-Type-Options: nosniff');
    if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
        http_response_code(304);
        exit;
    }
    header('Content-Length: ' . filesize($file));
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') readfile($file);
    exit;
}

$info = @getimagesize($source);
$mime = $info['mime'] ?? '';
if (!$info || !in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true)) {
    http_response_code(404);
    exit;
}
$key = hash('sha256', 'team-v1|' . $source . '|' . filemtime($source) . '|' . filesize($source) . '|' . $width);
$cacheDir = sys_get_temp_dir() . '/bigmat-team-images-' . substr(hash('sha256', __DIR__), 0, 12);
$cached = $cacheDir . '/' . $key . '.webp';
if (is_file($cached)) sendTeamImage($cached, 'image/webp', $key);

// Keep the original available on hosts without GD or with an unwritable cache.
if (!function_exists('imagewebp') || !function_exists('imagecreatefromstring')
    || $info[0] * $info[1] > 20000000
    || (!is_dir($cacheDir) && !@mkdir($cacheDir, 0700, true) && !is_dir($cacheDir))) {
    sendTeamImage($source, $mime, $key . '-original');
}
$original = @imagecreatefromstring((string) file_get_contents($source));
if (!$original) sendTeamImage($source, $mime, $key . '-original');

// Retain the orientation of future JPEG uploads when their EXIF data is stripped.
if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
    $exif = @exif_read_data($source);
    $orientation = (int) ($exif['Orientation'] ?? 1);
    $angle = match ($orientation) { 3 => 180, 5, 6 => -90, 7, 8 => 90, default => 0 };
    if ($angle) {
        $rotated = imagerotate($original, $angle, 0);
        if ($rotated) {
            imagedestroy($original);
            $original = $rotated;
        }
    }
    if (in_array($orientation, [2, 5, 7], true)) imageflip($original, IMG_FLIP_HORIZONTAL);
    if ($orientation === 4) imageflip($original, IMG_FLIP_VERTICAL);
}
$targetWidth = min($width, imagesx($original));
$targetHeight = max(1, (int) round(imagesy($original) * $targetWidth / imagesx($original)));
$thumbnail = imagecreatetruecolor($targetWidth, $targetHeight);
if (!$thumbnail) sendTeamImage($source, $mime, $key . '-original');
imagealphablending($thumbnail, false);
imagesavealpha($thumbnail, true);
imagefill($thumbnail, 0, 0, imagecolorallocatealpha($thumbnail, 0, 0, 0, 127));
imagecopyresampled($thumbnail, $original, 0, 0, 0, 0, $targetWidth, $targetHeight, imagesx($original), imagesy($original));
$temporary = @tempnam($cacheDir, '.team-');
$saved = $temporary && imagewebp($thumbnail, $temporary, 82) && filesize($temporary) > 0;
imagedestroy($thumbnail);
imagedestroy($original);
if ($saved && @rename($temporary, $cached)) sendTeamImage($cached, 'image/webp', $key);
if ($temporary && is_file($temporary)) @unlink($temporary);
sendTeamImage($source, $mime, $key . '-original');
