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

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function adminPassword(): string
{
    $password = getenv('BIGMAT_ADMIN_PASSWORD');
    return $password !== false && $password !== '' ? $password : 'Etnfdbm2026!';
}

function isAuthenticated(): bool
{
    return ($_SESSION['admin_authenticated'] ?? false) === true;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    respond(['authenticated' => isAuthenticated()]);
}

if ($method === 'POST') {
    $payload = json_decode(file_get_contents('php://input') ?: '{}', true);
    $password = is_array($payload) ? (string) ($payload['password'] ?? '') : '';

    if (!hash_equals(adminPassword(), $password)) {
        respond(['error' => 'Password non corretta.'], 401);
    }

    session_regenerate_id(true);
    $_SESSION['admin_authenticated'] = true;
    respond(['authenticated' => true]);
}

if ($method === 'DELETE') {
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            (bool) $params['secure'],
            (bool) $params['httponly']
        );
    }

    session_destroy();
    respond(['authenticated' => false]);
}

respond(['error' => 'Metodo non supportato.'], 405);
