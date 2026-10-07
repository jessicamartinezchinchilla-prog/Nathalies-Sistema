<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "ID de venta requerido"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // Verificar que la venta existe y está completada
    $stmt = $pdo->prepare("SELECT estado FROM ventas WHERE id = :id");
    $stmt->execute([':id' => $data['id']]);
    $venta = $stmt->fetch();

    if (!$venta) {
        throw new Exception("Venta no encontrada");
    }

    if ($venta['estado'] === 'Anulada') {
        throw new Exception("La venta ya está anulada");
    }

    // Obtener detalles para devolver stock
    $stmt = $pdo->prepare("SELECT tipo, item_id, cantidad FROM detalle_ventas WHERE venta_id = :venta_id");
    $stmt->execute([':venta_id' => $data['id']]);
    $detalles = $stmt->fetchAll();

    // Devolver stock de productos
    foreach ($detalles as $detalle) {
        if ($detalle['tipo'] === 'producto') {
            $stmtStock = $pdo->prepare("UPDATE productos SET stock = stock + :cantidad WHERE id = :id");
            $stmtStock->execute([
                ':cantidad' => $detalle['cantidad'],
                ':id' => $detalle['item_id']
            ]);
        }
    }

    // Cambiar estado a Anulada
    $stmt = $pdo->prepare("UPDATE ventas SET estado = 'Anulada' WHERE id = :id");
    $stmt->execute([':id' => $data['id']]);

    $pdo->commit();

    echo json_encode(["success" => true, "message" => "Venta anulada y stock restaurado"]);

} catch(Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>