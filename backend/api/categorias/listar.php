<?php
require_once '../../config/db.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

// Filtrar solo categorías de tipo "insumo"
$tipo = $_GET['tipo'] ?? 'insumo';

try {
    $stmt = $pdo->prepare("SELECT id, nombre FROM categorias WHERE tipo = :tipo ORDER BY nombre ASC");
    $stmt->execute([':tipo' => $tipo]);
    $categorias = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "categorias" => $categorias
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>