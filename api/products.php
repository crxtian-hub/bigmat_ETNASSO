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
$uploadDir = dirname(__DIR__) . '/public/uploads';
$dataFile = $dataDir . '/products.json';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
}

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode(seedProducts(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
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

function readProducts(string $file): array
{
    $json = file_get_contents($file);
    $products = json_decode($json ?: '[]', true);
    return is_array($products) ? $products : [];
}

function writeProducts(string $file, array $products): void
{
    file_put_contents($file, json_encode(array_values($products), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

function inputField(string $name, string $default = ''): string
{
    if (isset($_POST[$name])) {
        return trim((string) $_POST[$name]);
    }

    return $default;
}

function normalizePrice(string $value): float
{
    $normalized = str_replace(',', '.', $value);
    return round(max(0, (float) $normalized), 2);
}

function requireProductCapacity(array $products, string $section, string $productCategory, ?string $excludeId = null): void
{
    $section = strtolower(trim($section));
    $productCategory = strtolower(trim($productCategory));
    if (!in_array($section, ['edilizia', 'showroom'], true)
        || $productCategory === '' || $productCategory === 'categoria') {
        return;
    }

    $count = count(array_filter($products, static fn(array $product): bool =>
        ($product['id'] ?? '') !== $excludeId
        && strtolower(trim($product['category'] ?? '')) === $section
        && strtolower(trim($product['productCategory'] ?? '')) === $productCategory
    ));
    if ($count >= 7) {
        respond(['error' => 'Puoi aggiungere al massimo 7 prodotti per categoria.'], 422);
    }
}

function normalizeRentalPrice(string $value): string
{
    return preg_replace('/[^0-9,.]/', '', $value) ?? '';
}

function renderTagsFromRequest(array $existing): array
{
    $raw = inputField('renderTags', '');
    if ($raw === '') {
        return $existing['renderTags'] ?? [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [];
    }

    $tags = [];
    foreach ($decoded as $tag) {
        if (!is_array($tag)) {
            continue;
        }

        $cleanTag = [
            'brand' => trim((string) ($tag['brand'] ?? '')),
            'product' => trim((string) ($tag['product'] ?? '')),
            'link' => trim((string) ($tag['link'] ?? '')),
            'x' => max(0, min(100, (float) ($tag['x'] ?? 50))),
            'y' => max(0, min(100, (float) ($tag['y'] ?? 50))),
        ];

        if ($cleanTag['brand'] !== '' || $cleanTag['product'] !== '' || $cleanTag['link'] !== '') {
            $tags[] = $cleanTag;
        }
    }

    return $tags;
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

    return 'uploads/' . $filename;
}

function deleteImage(?string $image, string $uploadDir): void
{
    if (!$image || !str_starts_with($image, 'uploads/')) {
        return;
    }

    $path = $uploadDir . '/' . basename($image);
    if (is_file($path)) {
        unlink($path);
    }
}

function productFromRequest(?array $existing, string $uploadDir): array
{
    $name = inputField('name', $existing['name'] ?? '');
    $category = inputField('category', $existing['category'] ?? '');
    $description = inputField('description', $existing['description'] ?? '');
    $price = normalizePrice(inputField('price', (string) ($existing['price'] ?? 0)));
    $featured = inputField('featured', (string) ($existing['featured'] ?? 'false')) === 'true';
    $brand = inputField('brand', $existing['brand'] ?? '');
    $model = inputField('model', $existing['model'] ?? '');
    $link = inputField('link', $existing['link'] ?? '');
    $miniDescription = inputField('miniDescription', $existing['miniDescription'] ?? '');
    $priceDay = normalizeRentalPrice(inputField('priceDay', $existing['priceDay'] ?? ''));
    $priceWeek = normalizeRentalPrice(inputField('priceWeek', $existing['priceWeek'] ?? ''));
    $priceMonth = normalizeRentalPrice(inputField('priceMonth', $existing['priceMonth'] ?? ''));
    $originalPrice = normalizeRentalPrice(inputField('originalPrice', $existing['originalPrice'] ?? ''));
    $discountedPrice = normalizeRentalPrice(inputField('discountedPrice', $existing['discountedPrice'] ?? ''));
    $priceSuffix = inputField('priceSuffix', $existing['priceSuffix'] ?? '');
    $productCategory = inputField('productCategory', $existing['productCategory'] ?? '');
    $renderTags = renderTagsFromRequest($existing ?? []);
    $image = $existing['image'] ?? '';

    if ($name === '') {
        respond(['error' => 'Il nome prodotto è obbligatorio.'], 422);
    }

    $uploadedImage = uploadImage($_FILES['image'] ?? null, $uploadDir);
    $photoRequiredCategories = ['Edilizia', 'Showroom', 'Noleggio', 'Promozioni', 'Showroom Render', 'Chi Siamo Persone'];
    $photoIsRequired = in_array(strtolower($category), array_map('strtolower', $photoRequiredCategories), true);
    if ($photoIsRequired && $image === '' && !$uploadedImage) {
        respond(['error' => 'La foto è obbligatoria.'], 422);
    }

    if ($uploadedImage) {
        deleteImage($image, $uploadDir);
        $image = $uploadedImage;
    }

    return [
        'id' => $existing['id'] ?? bin2hex(random_bytes(8)),
        'name' => $name,
        'category' => $category,
        'description' => $description,
        'price' => $price,
        'featured' => $featured,
        'brand' => $brand,
        'model' => $model,
        'link' => $link,
        'miniDescription' => $miniDescription,
        'priceDay' => $priceDay,
        'priceWeek' => $priceWeek,
        'priceMonth' => $priceMonth,
        'originalPrice' => $originalPrice,
        'discountedPrice' => $discountedPrice,
        'priceSuffix' => $priceSuffix,
        'productCategory' => $productCategory,
        'renderTags' => $renderTags,
        'image' => $image,
        'updatedAt' => date(DATE_ATOM),
    ];
}

function seedProducts(): array
{
    return [
        [
            'id' => 'sample-1',
            'name' => 'Pannello isolante',
            'category' => 'Edilizia',
            'description' => 'Pannello tecnico per isolamento termico e acustico.',
            'price' => 18.90,
            'featured' => true,
            'image' => '',
            'updatedAt' => date(DATE_ATOM),
        ],
        [
            'id' => 'sample-2',
            'name' => 'Collante professionale',
            'category' => 'Materiali',
            'description' => 'Adesivo ad alta tenuta per applicazioni da cantiere.',
            'price' => 11.50,
            'featured' => false,
            'image' => '',
            'updatedAt' => date(DATE_ATOM),
        ],
    ];
}

$method = $_POST['_method'] ?? $_SERVER['REQUEST_METHOD'];
$products = readProducts($dataFile);

if ($method === 'GET') {
    respond(['products' => $products]);
}

requireAuthentication();

// Serialize changes so simultaneous requests cannot exceed the product limit.
$productsLock = fopen($dataDir . '/products.lock', 'c');
if ($productsLock === false || !flock($productsLock, LOCK_EX)) {
    respond(['error' => 'Impossibile salvare i prodotti. Riprova.'], 500);
}
$products = readProducts($dataFile);

if ($method === 'POST' && ($_GET['action'] ?? '') === 'reorder-people') {
    $ids = json_decode(inputField('ids'));
    $people = array_values(array_filter($products, static fn(array $product): bool =>
        strtolower($product['category'] ?? '') === 'chi siamo persone'
    ));
    $currentIds = array_column($people, 'id');

    if (!is_array($ids) || !array_is_list($ids)
        || count($ids) !== count($currentIds)
        || count(array_filter($ids, 'is_string')) !== count($ids)
        || count(array_unique($ids)) !== count($ids)
        || array_diff($ids, $currentIds) || array_diff($currentIds, $ids)) {
        respond(['error' => 'Elenco persone non valido o modificato. Ricarica la pagina e riprova.'], 422);
    }

    $peopleById = array_column($people, null, 'id');
    $position = 0;
    foreach ($products as $index => $product) {
        if (strtolower($product['category'] ?? '') === 'chi siamo persone') {
            $products[$index] = $peopleById[$ids[$position++]];
        }
    }
    writeProducts($dataFile, $products);
    respond(['products' => $products]);
}

if ($method === 'POST') {
    requireProductCapacity($products, inputField('category'), inputField('productCategory'));
    $product = productFromRequest(null, $uploadDir);
    if (strtolower($product['category']) === 'chi siamo persone') {
        $products[] = $product;
    } else {
        array_unshift($products, $product);
    }
    writeProducts($dataFile, $products);
    respond(['product' => $product], 201);
}

if ($method === 'PUT') {
    $id = $_GET['id'] ?? '';
    foreach ($products as $index => $product) {
        if (($product['id'] ?? '') === $id) {
            $category = inputField('category', $product['category'] ?? '');
            $productCategory = inputField('productCategory', $product['productCategory'] ?? '');
            if (strtolower(trim($category)) !== strtolower(trim($product['category'] ?? ''))
                || strtolower(trim($productCategory)) !== strtolower(trim($product['productCategory'] ?? ''))) {
                requireProductCapacity($products, $category, $productCategory, $id);
            }
            $products[$index] = productFromRequest($product, $uploadDir);
            writeProducts($dataFile, $products);
            respond(['product' => $products[$index]]);
        }
    }

    respond(['error' => 'Prodotto non trovato.'], 404);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    foreach ($products as $index => $product) {
        if (($product['id'] ?? '') === $id) {
            deleteImage($product['image'] ?? '', $uploadDir);
            array_splice($products, $index, 1);
            writeProducts($dataFile, $products);
            respond(['ok' => true]);
        }
    }

    respond(['error' => 'Prodotto non trovato.'], 404);
}

respond(['error' => 'Metodo non supportato.'], 405);
