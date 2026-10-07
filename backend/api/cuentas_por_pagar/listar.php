<?php
// CORS headers - DEBEN IR PRIMERO
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    require_once '../../config/db.php';
    
    $where = [];
    $params = [];

    if (!empty($_GET['estado'])) {
        $where[] = "c.estado = :estado";
        $params[':estado'] = $_GET['estado'];
    }

    if (!empty($_GET['proveedor_id'])) {
        $where[] = "c.proveedor_id = :proveedor_id";
        $params[':proveedor_id'] = intval($_GET['proveedor_id']);
    }

    $sql = "SELECT c.id, c.compra_id, c.proveedor_id, c.monto_original, c.monto_pagado, 
                   c.fecha_vencimiento, c.estado, p.nombre as proveedor, co.codigo as codigo_compra
            FROM cuentas_por_pagar c
            LEFT JOIN proveedores p ON c.proveedor_id = p.id
            LEFT JOIN compras co ON c.compra_id = co.id";
    
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY c.fecha_vencimiento ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode([
        "success" => true,
        "cuentas" => $stmt->fetchAll()
    ]);
    exit();

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
    exit();
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
    exit();
}
?>