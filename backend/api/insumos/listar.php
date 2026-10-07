<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    // ESTADÍSTICAS GLOBALES (sin filtros)
    $stats = $pdo->query("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN estado = 'Inactivo' THEN 1 ELSE 0 END) as inactivos,
            SUM(CASE WHEN stock <= stock_minimo THEN 1 ELSE 0 END) as stock_bajo
        FROM insumos
    ")->fetch();

    // LISTA DE INSUMOS (con filtros)
    $where = [];
    $params = [];

    if (!empty($_GET['search'])) {
        $search = '%' . $_GET['search'] . '%';
        $where[] = "(i.nombre LIKE :search OR i.codigo LIKE :search)";
        $params[':search'] = $search;
    }

    if (!empty($_GET['categoria'])) {
        $where[] = "i.categoria_id = :categoria";
        $params[':categoria'] = intval($_GET['categoria']);
    }

    if (!empty($_GET['estado'])) {
        $where[] = "i.estado = :estado";
        $params[':estado'] = $_GET['estado'];
    }

    if (isset($_GET['costo']) && $_GET['costo'] !== '') {
        $where[] = "i.costo_unitario = :costo";
        $params[':costo'] = floatval($_GET['costo']);
    }

    if (isset($_GET['stock_bajo']) && $_GET['stock_bajo'] === 'true') {
        $where[] = "i.stock <= i.stock_minimo";
    }

    // JOIN con categorias para obtener el nombre
    $sql = "SELECT i.id, i.codigo, i.nombre, i.categoria_id, c.nombre as categoria, 
                   i.costo_unitario, i.stock, i.stock_minimo, i.estado, i.created_at, i.updated_at 
            FROM insumos i
            LEFT JOIN categorias c ON i.categoria_id = c.id";
    
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY i.nombre ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $insumos = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "insumos" => $insumos,
        "total_filtrados" => count($insumos),
        "estadisticas" => [
            "total" => intval($stats['total']),
            "activos" => intval($stats['activos']),
            "inactivos" => intval($stats['inactivos']),
            "stock_bajo" => intval($stats['stock_bajo'])
        ]
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al consultar insumos: " . $e->getMessage()]);
}
?>