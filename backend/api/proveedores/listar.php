<?php
require_once '../../config/db.php';
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    $stmt = $pdo->query("SELECT id, nombre, contacto, telefono, email, estado FROM proveedores ORDER BY nombre ASC");
    echo json_encode(["success" => true, "proveedores" => $stmt->fetchAll()]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>