<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$ventaId = intval($_GET['id'] ?? 0);

if ($ventaId <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "ID de venta requerido"]);
    exit();
}

try {
    // Obtener datos de la venta
    $stmt = $pdo->prepare("
        SELECT v.*, u.nombre as usuario 
        FROM ventas v
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        WHERE v.id = :id
    ");
    $stmt->execute([':id' => $ventaId]);
    $venta = $stmt->fetch();

    if (!$venta) {
        http_response_code(404);
        echo json_encode(["error" => "Venta no encontrada"]);
        exit();
    }

    // Obtener detalles
    $stmt = $pdo->prepare("
        SELECT id, tipo, item_id, nombre_item, cantidad, precio_unitario, subtotal
        FROM detalle_ventas
        WHERE venta_id = :venta_id
        ORDER BY id ASC
    ");
    $stmt->execute([':venta_id' => $ventaId]);
    $detalles = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "venta" => $venta,
        "detalles" => $detalles
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>