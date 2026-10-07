<?php
require_once '../../config/db.php';
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['nombre'])) {
    http_response_code(400);
    echo json_encode(["error" => "El nombre del proveedor es obligatorio"]);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO proveedores (nombre, contacto, telefono, email, estado) VALUES (:nombre, :contacto, :telefono, :email, :estado)");
    $stmt->execute([
        ':nombre' => $data['nombre'],
        ':contacto' => $data['contacto'] ?? '',
        ':telefono' => $data['telefono'] ?? '',
        ':email' => $data['email'] ?? '',
        ':estado' => $data['estado'] ?? 'Activo'
    ]);
    echo json_encode(["success" => true, "message" => "Proveedor creado"]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>