<?php
// 1. ENCABEZADOS CORS (Obligatorios para que React pueda conectar)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 2. MANEJAR LA PETICIÓN DE PRUEBA DEL NAVEGADOR (OPTIONS)
// ¡Esta es la pieza que faltaba y causaba el error de conexión!
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. CONEXIÓN A LA BASE DE DATOS
require_once '../../config/db.php';

// 4. VERIFICAR QUE SEA POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['detalles']) || count($data['detalles']) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "La compra debe tener al menos un producto o insumo"]);
    exit();
}

if (empty($data['proveedor_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "El proveedor es obligatorio"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // Generar código
    $stmt = $pdo->query("SELECT codigo FROM compras ORDER BY id DESC LIMIT 1");
    $ultimaCompra = $stmt->fetch();
    $numero = $ultimaCompra ? intval(explode('-', $ultimaCompra['codigo'])[1]) + 1 : 1;
    $codigoCompra = 'COM-' . str_pad($numero, 4, '0', STR_PAD_LEFT);

    // Insertar compra
    $stmt = $pdo->prepare("
        INSERT INTO compras (codigo, fecha, proveedor_id, total, estado_pago, metodo_pago, fecha_vencimiento, usuario_id)
        VALUES (:codigo, :fecha, :proveedor_id, :total, :estado_pago, :metodo_pago, :fecha_vencimiento, :usuario_id)
    ");
    
    $stmt->execute([
        ':codigo' => $codigoCompra,
        ':fecha' => $data['fecha'],
        ':proveedor_id' => intval($data['proveedor_id']),
        ':total' => floatval($data['total']),
        ':estado_pago' => $data['estado_pago'] ?? 'Pendiente',
        ':metodo_pago' => $data['metodo_pago'] ?? null,
        ':fecha_vencimiento' => $data['fecha_vencimiento'] ?? null,
        ':usuario_id' => intval($data['usuario_id'] ?? 1)
    ]);
    
    $compraId = $pdo->lastInsertId();

    // Insertar detalles y actualizar stock
    $stmtDetalle = $pdo->prepare("
        INSERT INTO detalle_compras (compra_id, tipo, item_id, cantidad, costo_unitario, subtotal)
        VALUES (:compra_id, :tipo, :item_id, :cantidad, :costo_unitario, :subtotal)
    ");

    foreach ($data['detalles'] as $detalle) {
        $stmtDetalle->execute([
            ':compra_id' => $compraId,
            ':tipo' => $detalle['tipo'],
            ':item_id' => intval($detalle['item_id']),
            ':cantidad' => floatval($detalle['cantidad']),
            ':costo_unitario' => floatval($detalle['costo_unitario']),
            ':subtotal' => floatval($detalle['subtotal'])
        ]);

        if ($detalle['tipo'] === 'producto') {
            $pdo->prepare("UPDATE productos SET stock = stock + :cantidad WHERE id = :id")
                ->execute([':cantidad' => floatval($detalle['cantidad']), ':id' => intval($detalle['item_id'])]);
        } elseif ($detalle['tipo'] === 'insumo') {
            $pdo->prepare("UPDATE insumos SET stock = stock + :cantidad WHERE id = :id")
                ->execute([':cantidad' => floatval($detalle['cantidad']), ':id' => intval($detalle['item_id'])]);
        }
    }

    // ⭐ SI ES PENDIENTE, CREAR CUENTA POR PAGAR
    if (($data['estado_pago'] ?? 'Pendiente') === 'Pendiente' && !empty($data['fecha_vencimiento'])) {
        $stmtCuenta = $pdo->prepare("
            INSERT INTO cuentas_por_pagar (compra_id, proveedor_id, monto_original, monto_pagado, fecha_vencimiento, estado)
            VALUES (:compra_id, :proveedor_id, :monto, 0, :vencimiento, 'Pendiente')
        ");
        $stmtCuenta->execute([
            ':compra_id' => $compraId,
            ':proveedor_id' => intval($data['proveedor_id']),
            ':monto' => floatval($data['total']),
            ':vencimiento' => $data['fecha_vencimiento']
        ]);
    }

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Compra registrada", "codigo" => $codigoCompra]);

} catch(Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>