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
    // Traer solo insumos activos
    $stmt = $pdo->query("
        SELECT i.id, i.codigo, i.nombre, i.categoria_id, c.nombre as categoria, 
               i.stock, i.stock_minimo, i.costo_unitario, i.estado
        FROM insumos i
        LEFT JOIN categorias c ON i.categoria_id = c.id
        WHERE i.estado = 'Activo'
        ORDER BY i.nombre ASC
    ");
    $insumos = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "insumos" => $insumos
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>