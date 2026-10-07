<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    // ESTADÍSTICAS GLOBALES
    $stats = $pdo->query("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN estado = 'Inactivo' THEN 1 ELSE 0 END) as inactivos
        FROM servicios
    ")->fetch();

    // LISTA DE SERVICIOS (con filtros)
    $where = [];
    $params = [];

    if (!empty($_GET['search'])) {
        $search = '%' . $_GET['search'] . '%';
        $where[] = "(s.nombre LIKE :search OR s.codigo LIKE :search)";
        $params[':search'] = $search;
    }

    if (!empty($_GET['categoria'])) {
        $where[] = "s.categoria_id = :categoria";
        $params[':categoria'] = intval($_GET['categoria']);
    }

    if (!empty($_GET['estado'])) {
        $where[] = "s.estado = :estado";
        $params[':estado'] = $_GET['estado'];
    }

    if (isset($_GET['precio']) && $_GET['precio'] !== '') {
        $where[] = "s.precio = :precio";
        $params[':precio'] = floatval($_GET['precio']);
    }

    $sql = "SELECT s.id, s.codigo, s.nombre, s.categoria_id, c.nombre as categoria, 
                   s.precio, s.costo_estimado, s.descripcion, s.estado, s.created_at, s.updated_at 
            FROM servicios s
            LEFT JOIN categorias c ON s.categoria_id = c.id";
    
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY s.nombre ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $servicios = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "servicios" => $servicios,
        "total_filtrados" => count($servicios),
        "estadisticas" => [
            "total" => intval($stats['total']),
            "activos" => intval($stats['activos']),
            "inactivos" => intval($stats['inactivos'])
        ]
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al consultar servicios: " . $e->getMessage()]);
}
?>