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
    $stmt = $pdo->query("SELECT id, codigo, nombre, precio_venta, stock FROM productos WHERE estado = 'Activo'  ORDER BY nombre ASC");
    $productos = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "productos" => $productos
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>