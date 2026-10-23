<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once '../../config/db.php';
$data = json_decode(file_get_contents("php://input"), true);

try {
    // Ajusta el nombre de la tabla 'cierres_caja' si en tu BD se llama diferente
    $stmt = $pdo->prepare("INSERT INTO cierres_caja (fecha_apertura, fecha_cierre, caja_inicial, ventas_turno, monto_real, diferencia, usuario_id) VALUES (:apertura, NOW(), :inicial, :ventas, :real, :diferencia, :usuario)");
    $stmt->execute([
        ':apertura' => $data['fecha_apertura'],
        ':inicial' => floatval($data['caja_inicial']),
        ':ventas' => floatval($data['ventas_turno']),
        ':real' => floatval($data['monto_real']),
        ':diferencia' => floatval($data['diferencia']),
        ':usuario' => intval($data['usuario_id'] ?? 1)
    ]);
    echo json_encode(["success" => true, "message" => "Cierre registrado"]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>