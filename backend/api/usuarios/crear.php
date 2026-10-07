<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['nombre']) || empty($data['email']) || empty($data['password']) || empty($data['rol_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan campos obligatorios"]); exit();
}

try {
    require_once '../../config/db.php';
    
    // Verificar si el email ya existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email");
    $stmt->execute([':email' => $data['email']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "El correo electrónico ya está registrado"]); exit();
    }

    $hash = password_hash($data['password'], PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("
        INSERT INTO usuarios (nombre, email, password, rol_id, estado)
        VALUES (:nombre, :email, :password, :rol_id, :estado)
    ");
    $stmt->execute([
        ':nombre' => $data['nombre'],
        ':email' => $data['email'],
        ':password' => $hash,
        ':rol_id' => intval($data['rol_id']),
        ':estado' => $data['estado'] ?? 'Activo'
    ]);

    echo json_encode(["success" => true, "message" => "Usuario creado exitosamente"]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>