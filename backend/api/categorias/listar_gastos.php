<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

try {
    require_once '../../config/db.php';
    
    $stmt = $pdo->query("SELECT id, nombre FROM categorias WHERE tipo = 'gasto' ORDER BY nombre ASC");
    
    echo json_encode([
        "success" => true,
        "categorias" => $stmt->fetchAll()
    ]);
    exit();

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
    exit();
}
?>