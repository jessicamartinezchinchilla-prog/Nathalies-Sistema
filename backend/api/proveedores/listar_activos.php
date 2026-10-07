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
    $stmt = $pdo->query("SELECT id, nombre FROM proveedores WHERE estado = 'Activo' ORDER BY nombre ASC");
    $proveedores = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "proveedores" => $proveedores
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>