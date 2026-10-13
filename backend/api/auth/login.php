<?php

// Headers de CORS para permitir conexión desde React
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Manejar preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Correo y contraseña son requeridos"]);
    exit();
}

try {
    require_once '../../config/db.php';
    
    $stmt = $pdo->prepare("
        SELECT u.id, u.nombre, u.email, u.password, u.rol_id, u.estado, r.nombre as rol 
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.email = :email
    ");
    $stmt->execute([':email' => $data['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(["error" => "Credenciales inválidas"]);
        exit();
    }

    if ($user['estado'] !== 'Activo') {
        http_response_code(403);
        echo json_encode(["error" => "Cuenta inactiva. Contacta al administrador."]);
        exit();
    }

    unset($user['password']);
    
    echo json_encode([
        "success" => true,
        "user" => $user,
        "message" => "Bienvenido, " . $user['nombre']
    ]);
    exit();

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error del servidor: " . $e->getMessage()]);
    exit();
}
?>