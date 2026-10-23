<?php
// 1. ENCABEZADOS CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

$fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-d');
$fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-d');

try {
    // Consulta flexible que busca por fecha (ignorando la hora)
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total_ventas, COUNT(*) as cantidad 
        FROM ventas 
        WHERE DATE(fecha) >= DATE(:inicio) 
        AND DATE(fecha) <= DATE(:fin)
        AND estado = 'Completada'
    ");
    $stmt->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true, 
        "total_ventas" => floatval($result['total_ventas']),
        "cantidad" => intval($result['cantidad']),
        "debug" => [
            "fecha_inicio" => $fecha_inicio,
            "fecha_fin" => $fecha_fin
        ]
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => "Error: " . $e->getMessage(),
        "total_ventas" => 0
    ]);
}
?>