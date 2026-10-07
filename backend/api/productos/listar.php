<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    // ============================================
    // 1. ESTADÍSTICAS GLOBALES (sin filtros)
    // ============================================
    $stats = $pdo->query("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN estado = 'Inactivo' THEN 1 ELSE 0 END) as inactivos,
            SUM(CASE WHEN stock <= stock_minimo THEN 1 ELSE 0 END) as stock_bajo
        FROM productos
    ")->fetch();

    // ============================================
    // 2. LISTA DE PRODUCTOS (con filtros)
    // ============================================
    $where = [];
    $params = [];

    if (!empty($_GET['search'])) {
        $search = '%' . $_GET['search'] . '%';
        $where[] = "(nombre LIKE :search OR codigo LIKE :search OR categoria LIKE :search)";
        $params[':search'] = $search;
    }

    if (!empty($_GET['categoria'])) {
        $where[] = "categoria = :categoria";
        $params[':categoria'] = $_GET['categoria'];
    }

    if (!empty($_GET['estado'])) {
        $where[] = "estado = :estado";
        $params[':estado'] = $_GET['estado'];
    }

    if (isset($_GET['precio']) && $_GET['precio'] !== '') {
        $where[] = "precio_venta = :precio";
        $params[':precio'] = floatval($_GET['precio']);
    }

    if (isset($_GET['stock_bajo']) && $_GET['stock_bajo'] === 'true') {
        $where[] = "stock <= stock_minimo";
    }

    $sql = "SELECT id, codigo, nombre, categoria, precio_venta, costo, stock, stock_minimo, estado, created_at, updated_at FROM productos";
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY nombre ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $productos = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "productos" => $productos,
        "total_filtrados" => count($productos),
        "estadisticas" => [
            "total" => intval($stats['total']),
            "activos" => intval($stats['activos']),
            "inactivos" => intval($stats['inactivos']),
            "stock_bajo" => intval($stats['stock_bajo'])
        ]
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al consultar productos: " . $e->getMessage()]);
}
?>