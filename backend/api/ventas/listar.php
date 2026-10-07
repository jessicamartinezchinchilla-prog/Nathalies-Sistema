<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    $where = [];
    $params = [];

    // Filtro por fecha desde
    if (!empty($_GET['fecha_desde'])) {
        $where[] = "v.fecha >= :fecha_desde";
        $params[':fecha_desde'] = $_GET['fecha_desde'] . ' 00:00:00';
    }

    // Filtro por fecha hasta
    if (!empty($_GET['fecha_hasta'])) {
        $where[] = "v.fecha <= :fecha_hasta";
        $params[':fecha_hasta'] = $_GET['fecha_hasta'] . ' 23:59:59';
    }

    // Filtro por método de pago
    if (!empty($_GET['metodo_pago'])) {
        $where[] = "v.metodo_pago = :metodo_pago";
        $params[':metodo_pago'] = $_GET['metodo_pago'];
    }

    // Filtro por estado
    if (!empty($_GET['estado'])) {
        $where[] = "v.estado = :estado";
        $params[':estado'] = $_GET['estado'];
    }

    $sql = "SELECT v.id, v.codigo, v.fecha, v.total, v.metodo_pago, v.estado, u.nombre as usuario
            FROM ventas v
            LEFT JOIN usuarios u ON v.usuario_id = u.id";
    
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY v.fecha DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $ventas = $stmt->fetchAll();

    // Calcular totales
    $totalVentas = count($ventas);
    $totalMonto = array_sum(array_column($ventas, 'total'));

    echo json_encode([
        "success" => true,
        "ventas" => $ventas,
        "total_ventas" => $totalVentas,
        "total_monto" => $totalMonto
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al consultar ventas: " . $e->getMessage()]);
}
?>