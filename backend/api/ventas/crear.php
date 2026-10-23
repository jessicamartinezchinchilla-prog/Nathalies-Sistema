<?php
// 1. ENCABEZADOS CORS (¡ESTO ES LO QUE FALTABA Y CAUSABA EL ERROR DE CONEXIÓN!)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// 2. MANEJAR LA PETICIÓN DE PRUEBA DEL NAVEGADOR (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. TU LÓGICA ORIGINAL (Intacta y funcionando)
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['detalles']) || count($data['detalles']) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "La venta debe tener al menos un producto o servicio"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // Generar código
    $stmt = $pdo->query("SELECT codigo FROM ventas ORDER BY id DESC LIMIT 1");
    $ultimaVenta = $stmt->fetch();
    $numero = $ultimaVenta ? intval(explode('-', $ultimaVenta['codigo'])[1]) + 1 : 1;
    $codigoVenta = 'VTA-' . str_pad($numero, 4, '0', STR_PAD_LEFT);

    // Insertar venta
    $stmt = $pdo->prepare("
        INSERT INTO ventas (codigo, fecha, total, metodo_pago, monto_efectivo, monto_transferencia, monto_tarjeta, usuario_id, estado)
        VALUES (:codigo, NOW(), :total, :metodo_pago, :monto_efectivo, :monto_transferencia, :monto_tarjeta, :usuario_id, 'Completada')
    ");
    
    $stmt->execute([
        ':codigo' => $codigoVenta,
        ':total' => floatval($data['total']),
        ':metodo_pago' => $data['metodo_pago'] ?? 'Efectivo',
        ':monto_efectivo' => floatval($data['monto_efectivo'] ?? 0),
        ':monto_transferencia' => floatval($data['monto_transferencia'] ?? 0),
        ':monto_tarjeta' => floatval($data['monto_tarjeta'] ?? 0),
        ':usuario_id' => intval($data['usuario_id'] ?? 1)
    ]);
    
    $ventaId = $pdo->lastInsertId();

    // Insertar detalles y actualizar stock
    $stmtDetalle = $pdo->prepare("
        INSERT INTO detalle_ventas (venta_id, tipo, item_id, nombre_item, cantidad, precio_unitario, subtotal)
        VALUES (:venta_id, :tipo, :item_id, :nombre_item, :cantidad, :precio_unitario, :subtotal)
    ");

    foreach ($data['detalles'] as $detalle) {
        $stmtDetalle->execute([
            ':venta_id' => $ventaId,
            ':tipo' => $detalle['tipo'],
            ':item_id' => intval($detalle['item_id']),
            ':nombre_item' => $detalle['nombre'],
            ':cantidad' => floatval($detalle['cantidad']),
            ':precio_unitario' => floatval($detalle['precio']),
            ':subtotal' => floatval($detalle['subtotal'])
        ]);

        // ACTUALIZAR STOCK (Con validación de seguridad)
        if ($detalle['tipo'] === 'producto') {
            $stmtStock = $pdo->prepare("UPDATE productos SET stock = stock - :cantidad WHERE id = :id AND stock >= :cantidad");
            $stmtStock->execute([
                ':cantidad' => floatval($detalle['cantidad']),
                ':id' => intval($detalle['item_id'])
            ]);
            
            if ($stmtStock->rowCount() === 0) {
                throw new Exception("Stock insuficiente para el producto: " . $detalle['nombre']);
            }
        }
    }

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Venta registrada", "codigo" => $codigoVenta]);

} catch(Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Error al registrar venta: " . $e->getMessage()]);
}
?>