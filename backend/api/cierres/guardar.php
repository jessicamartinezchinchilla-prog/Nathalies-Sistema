<?php
require_once '../../config/db.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['fecha']) || !isset($data['efectivo_real'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos obligatorios"]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO cierres_caja 
        (fecha, ventas_total, ventas_efectivo, ventas_transferencia, ventas_tarjeta, 
         gastos_efectivo, efectivo_esperado, efectivo_real, diferencia, observaciones, usuario_id)
        VALUES 
        (:fecha, :vt, :ve, :vtr, :vta, :ge, :ee, :er, :dif, :obs, 1)
    ");
    
    $stmt->execute([
        ':fecha' => $data['fecha'],
        ':vt' => $data['ventas_total'],
        ':ve' => $data['ventas_efectivo'],
        ':vtr' => $data['ventas_transferencia'],
        ':vta' => $data['ventas_tarjeta'],
        ':ge' => $data['gastos_efectivo'],
        ':ee' => $data['efectivo_esperado'],
        ':er' => $data['efectivo_real'],
        ':dif' => $data['diferencia'],
        ':obs' => $data['observaciones'] ?? ''
    ]);

    echo json_encode(["success" => true, "message" => "Cierre de caja guardado exitosamente"]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar cierre: " . $e->getMessage()]);
}
?>