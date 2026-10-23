<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
require_once '../../config/db.php';

$fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-d');
$fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-d');

try {
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total_ventas FROM ventas WHERE DATE(fecha) BETWEEN :inicio AND :fin AND estado = 'Completada'");
    $stmt->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $result = $stmt->fetch();
    echo json_encode(["success" => true, "total_ventas" => floatval($result['total_ventas'])]);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>