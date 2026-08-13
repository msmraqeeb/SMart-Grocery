<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db   = 'kidspara_smart-grocery';
$user = 'kidspara_shakil';
$pass = 'msm039raqeeb';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     http_response_code(500);
     echo json_encode(["error" => "Database Connection Failed", "details" => $e->getMessage()]);
     exit();
}

$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? null;
$input = json_decode(file_get_contents('php://input'), true) ?? [];

function formatRow($row) {
    if (!$row) return null;
    foreach ($row as $k => $v) {
        if (in_array($k, ['is_featured', 'is_published', 'is_active', 'auto_apply'])) {
            $row[$k] = (bool)$v;
        }
        if (is_string($v) && (str_starts_with($v, '[') || str_starts_with($v, '{'))) {
            $json = json_decode($v, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $row[$k] = $json;
            }
        }
    }
    return $row;
}

try {
    switch ($action) {
        case 'products':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $images = json_encode($input['images'] ?? []);
                $variants = json_encode($input['variants'] ?? []);
                $stmt = $pdo->prepare("INSERT INTO products (name, slug, price, original_price, category, brand, unit, sku, images, image_url, short_description, description, badge, is_featured, variants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $input['name'], $input['slug'] ?? null, $input['price'], $input['original_price'] ?? null,
                    $input['category'] ?? null, $input['brand'] ?? null, $input['unit'] ?? null, $input['sku'] ?? null,
                    $images, $input['image_url'] ?? null, $input['short_description'] ?? null, $input['description'] ?? null,
                    $input['badge'] ?? null, !empty($input['is_featured']) ? 1 : 0, $variants
                ]);
                echo json_encode(["id" => $pdo->lastInsertId(), "success" => true]);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(["success" => true]);
            }
            break;

        case 'categories':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $stmt = $pdo->prepare("INSERT INTO categories (name, slug, parent_id, image_url) VALUES (?, ?, ?, ?)");
                $stmt->execute([$input['name'], $input['slug'] ?? null, $input['parent_id'] ?? null, $input['image_url'] ?? null]);
                echo json_encode(["id" => $pdo->lastInsertId(), "success" => true]);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(["success" => true]);
            }
            break;

        case 'brands':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM brands ORDER BY name ASC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $stmt = $pdo->prepare("INSERT INTO brands (name, slug, logo_url) VALUES (?, ?, ?)");
                $stmt->execute([$input['name'], $input['slug'] ?? null, $input['logo_url'] ?? null]);
                echo json_encode(["id" => $pdo->lastInsertId(), "success" => true]);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM brands WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(["success" => true]);
            }
            break;

        case 'banners':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM banners ORDER BY sort_order ASC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            }
            break;

        case 'blog-posts':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM blog_posts ORDER BY created_at DESC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            }
            break;

        case 'coupons':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM coupons ORDER BY created_at DESC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            }
            break;

        case 'reviews':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM reviews ORDER BY created_at DESC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $stmt = $pdo->prepare("INSERT INTO reviews (product_id, product_name, author_name, rating, comment) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([
                    $input['productId'] ?? $input['product_id'],
                    $input['productName'] ?? $input['product_name'],
                    $input['authorName'] ?? $input['author_name'],
                    $input['rating'],
                    $input['comment']
                ]);
                echo json_encode(["id" => $pdo->lastInsertId(), "success" => true]);
            }
            break;

        case 'attributes':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM attributes ORDER BY name ASC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            }
            break;

        case 'pages':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM pages ORDER BY created_at DESC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            }
            break;

        case 'settings':
            $key = $_GET['key'] ?? $input['key'] ?? null;
            if ($_SERVER['REQUEST_METHOD'] === 'GET' && $key) {
                $stmt = $pdo->prepare("SELECT * FROM settings WHERE `key` = ?");
                $stmt->execute([$key]);
                $row = $stmt->fetch();
                echo json_encode(formatRow($row));
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['key'])) {
                $valJson = is_string($input['value']) ? $input['value'] : json_encode($input['value']);
                $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
                $stmt->execute([$input['key'], $valJson]);
                echo json_encode(["success" => true]);
            }
            break;

        case 'orders':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $items = json_encode($input['items'] ?? []);
                $stmt = $pdo->prepare("INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, customer_district, customer_area, subtotal, shipping_cost, discount, total, status, items, coupon_code, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $input['customer_name'], $input['customer_email'] ?? null, $input['customer_phone'] ?? null,
                    $input['customer_address'] ?? null, $input['customer_district'] ?? null, $input['customer_area'] ?? null,
                    $input['subtotal'] ?? 0, $input['shipping_cost'] ?? 0, $input['discount'] ?? 0, $input['total'] ?? 0,
                    $input['status'] ?? 'Pending', $items, $input['coupon_code'] ?? null, $input['user_id'] ?? null
                ]);
                echo json_encode(["id" => $pdo->lastInsertId(), "success" => true]);
            }
            break;

        case 'profiles':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->query("SELECT id, email, full_name, role, created_at FROM profiles ORDER BY created_at DESC");
                $data = array_map('formatRow', $stmt->fetchAll());
                echo json_encode($data);
            }
            break;

        case 'login':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $stmt = $pdo->prepare("SELECT * FROM profiles WHERE email = ?");
                $stmt->execute([$input['email']]);
                $userRow = $stmt->fetch();
                if ($userRow) {
                    $token = bin2hex(random_bytes(16));
                    echo json_encode(["token" => $token, "user" => formatRow($userRow)]);
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Invalid email or password"]);
                }
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(["error" => "Invalid Action"]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
