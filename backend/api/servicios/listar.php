<?php
// 1. ENCABEZADOS CORS (Obligatorios para que React pueda conectar)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Manejar la petición de prueba del navegador (OPTIONS)
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
        $where[] = "(nombre LIKE :search OR codigo LIKE :search)";
        $params[':search'] = $search;
    }

    // NOTA: Filtro de categoría comentado por seguridad. 
    // Si tu tabla tiene 'categoria_id', puedes descomentarlo.
    /*
    if (!empty($_GET['categoria'])) {
        $where[] = "categoria_id = :categoria";
        $params[':categoria'] = intval($_GET['categoria']);
    }
    */

    if (!empty($_GET['estado'])) {
        $where[] = "estado = :estado";
        $params[':estado'] = $_GET['estado'];
    }

    if (isset($_GET['precio']) && $_GET['precio'] !== '') {
        $where[] = "precio = :precio";
        $params[':precio'] = floatval($_GET['precio']);
    }

    // CONSULTA SEGURA: Sin JOIN, seleccionando solo las columnas base
    $sql = "SELECT id, codigo, nombre, precio, costo_estimado, descripcion, estado, created_at, updated_at 
            FROM servicios";
    
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY nombre ASC";

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