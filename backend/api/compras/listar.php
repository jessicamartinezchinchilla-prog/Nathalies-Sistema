<?php
require_once '../../config/db.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    $where = [];
    $params = [];

    if (!empty($_GET['fecha_desde'])) {
        $where[] = "c.fecha >= :fecha_desde";
        $params[':fecha_desde'] = $_GET['fecha_desde'];
    }

    if (!empty($_GET['fecha_hasta'])) {
        $where[] = "c.fecha <= :fecha_hasta";
        $params[':fecha_hasta'] = $_GET['fecha_hasta'];
    }

    if (!empty($_GET['estado_pago'])) {
        $where[] = "c.estado_pago = :estado_pago";
        $params[':estado_pago'] = $_GET['estado_pago'];
    }

    if (!empty($_GET['proveedor_id'])) {
        $where[] = "c.proveedor_id = :proveedor_id";
        $params[':proveedor_id'] = intval($_GET['proveedor_id']);
    }

    $sql = "SELECT c.id, c.codigo, c.fecha, c.total, c.estado_pago, c.metodo_pago, c.fecha_vencimiento, p.nombre as proveedor
            FROM compras c
            LEFT JOIN proveedores p ON c.proveedor_id = p.id";
    
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY c.fecha DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $compras = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "compras" => $compras
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al consultar compras: " . $e->getMessage()]);
}
?>