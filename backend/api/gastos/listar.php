<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

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
    
    $where = ["g.estado = 'Activo'"];
    $params = [];

    if (!empty($_GET['search'])) {
        $where[] = "(g.descripcion LIKE :search OR g.codigo LIKE :search)";
        $params[':search'] = '%' . $_GET['search'] . '%';
    }

    if (!empty($_GET['categoria_id'])) {
        $where[] = "g.categoria_id = :categoria_id";
        $params[':categoria_id'] = intval($_GET['categoria_id']);
    }

    if (!empty($_GET['metodo_pago'])) {
        $where[] = "g.metodo_pago = :metodo_pago";
        $params[':metodo_pago'] = $_GET['metodo_pago'];
    }

    if (!empty($_GET['fecha_desde'])) {
        $where[] = "g.fecha >= :fecha_desde";
        $params[':fecha_desde'] = $_GET['fecha_desde'];
    }

    if (!empty($_GET['fecha_hasta'])) {
        $where[] = "g.fecha <= :fecha_hasta";
        $params[':fecha_hasta'] = $_GET['fecha_hasta'];
    }

    // Estadísticas
    $stats = $pdo->query("
        SELECT 
            COALESCE(SUM(monto), 0) as total_mes,
            COUNT(*) as total_registros
        FROM gastos 
        WHERE estado = 'Activo' 
        AND MONTH(fecha) = MONTH(CURRENT_DATE) 
        AND YEAR(fecha) = YEAR(CURRENT_DATE)
    ")->fetch();

    $sql = "SELECT g.id, g.codigo, g.fecha, g.descripcion, g.categoria_id, g.monto, 
                   g.metodo_pago, g.estado, c.nombre as categoria
            FROM gastos g
            LEFT JOIN categorias c ON g.categoria_id = c.id
            WHERE " . implode(" AND ", $where) . "
            ORDER BY g.fecha DESC, g.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $gastos = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "gastos" => $gastos,
        "estadisticas" => [
            "total_mes" => floatval($stats['total_mes']),
            "total_registros" => intval($stats['total_registros'])
        ]
    ]);
    exit();

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
    exit();
}
?>