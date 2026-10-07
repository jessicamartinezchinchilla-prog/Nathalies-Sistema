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

if (empty($data['id']) || !isset($data['monto_pagado'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // Actualizar cuenta por pagar
    $stmt = $pdo->prepare("
        UPDATE cuentas_por_pagar 
        SET monto_pagado = :monto_pagado, estado = 'Pagada'
        WHERE id = :id
    ");
    $stmt->execute([
        ':monto_pagado' => $data['monto_pagado'],
        ':id' => intval($data['id'])
    ]);

    // Actualizar la compra relacionada a "Pagada"
    $stmtCompra = $pdo->prepare("
        UPDATE compras 
        SET estado_pago = 'Pagada', metodo_pago = :metodo_pago
        WHERE id = (SELECT compra_id FROM cuentas_por_pagar WHERE id = :id)
    ");
    $stmtCompra->execute([
        ':metodo_pago' => $data['metodo_pago'] ?? 'Efectivo',
        ':id' => intval($data['id'])
    ]);

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Cuenta marcada como pagada"]);

} catch(Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>