<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    require_once '../../config/db.php';
    
    $fecha = $_GET['fecha'] ?? date('Y-m-d');

    $stmt = $pdo->prepare("
        SELECT c.id, c.fecha, c.ventas_total, c.ventas_efectivo, c.ventas_transferencia, 
               c.ventas_tarjeta, c.gastos_efectivo, c.efectivo_esperado, c.efectivo_real, 
               c.diferencia, c.observaciones, c.created_at,
               u.nombre as usuario
        FROM cierres_caja c
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.fecha = :fecha
        ORDER BY c.created_at DESC
    ");
    $stmt->execute([':fecha' => $fecha]);
    
    echo json_encode([
        "success" => true,
        "cierres" => $stmt->fetchAll()
    ]);
    exit();

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
    exit();
}
?>