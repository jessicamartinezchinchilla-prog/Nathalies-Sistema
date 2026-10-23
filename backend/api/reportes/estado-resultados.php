<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once '../../config/db.php';

    $fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
    $fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-t');

    // 1. Venta de productos (ventas donde haya productos)
    $stmtProd = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total 
        FROM ventas 
        WHERE estado = 'Completada' 
        AND DATE(fecha) BETWEEN :inicio AND :fin
        AND tipo_venta = 'producto'
    ");
    $stmtProd->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $venta_productos = floatval($stmtProd->fetch()['total']);

    // 2. Ingresos por servicios
    $stmtServ = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total 
        FROM ventas 
        WHERE estado = 'Completada' 
        AND DATE(fecha) BETWEEN :inicio AND :fin
        AND tipo_venta = 'servicio'
    ");
    $stmtServ->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $ingreso_servicios = floatval($stmtServ->fetch()['total']);

    // Si no tienes columna tipo_venta, usa esto en su lugar:
    // $venta_productos = 0;
    // $ingreso_servicios = 0;
    // $stmtAll = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE estado = 'Completada' AND DATE(fecha) BETWEEN :inicio AND :fin");
    // $stmtAll->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    // $total_ingresos = floatval($stmtAll->fetch()['total']);

    $total_ingresos = $venta_productos + $ingreso_servicios;

    // 3. Costo de ventas (compras del período)
    $stmtCosto = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total 
        FROM compras 
        WHERE DATE(fecha) BETWEEN :inicio AND :fin
    ");
    $stmtCosto->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $costo_ventas = floatval($stmtCosto->fetch()['total']);

    $utilidad_bruta = $total_ingresos - $costo_ventas;

    // 4. Gastos operativos
    $stmtAlquiler = $pdo->prepare("
        SELECT COALESCE(SUM(monto), 0) as total 
        FROM gastos 
        WHERE estado = 'Activo' 
        AND DATE(fecha) BETWEEN :inicio AND :fin
        AND categoria_id IN (SELECT id FROM categorias WHERE nombre LIKE '%alquiler%' OR nombre LIKE '%arriendo%')
    ");
    $stmtAlquiler->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $alquiler = floatval($stmtAlquiler->fetch()['total']);

    $stmtServicios = $pdo->prepare("
        SELECT COALESCE(SUM(monto), 0) as total 
        FROM gastos 
        WHERE estado = 'Activo' 
        AND DATE(fecha) BETWEEN :inicio AND :fin
        AND categoria_id IN (SELECT id FROM categorias WHERE nombre LIKE '%servicios%' OR nombre LIKE '%luz%' OR nombre LIKE '%agua%')
    ");
    $stmtServicios->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $servicios_basicos = floatval($stmtServicios->fetch()['total']);

    $total_gastos = $alquiler + $servicios_basicos;

    // Si no tienes categorías, usa esto:
    // $stmtGastos = $pdo->prepare("SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE estado = 'Activo' AND DATE(fecha) BETWEEN :inicio AND :fin");
    // $stmtGastos->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    // $total_gastos = floatval($stmtGastos->fetch()['total']);

    $utilidad_neta = $utilidad_bruta - $total_gastos;

    echo json_encode([
        "success" => true,
        "periodo" => [
            "inicio" => $fecha_inicio,
            "fin" => $fecha_fin
        ],
        "totales" => [
            "venta_productos" => $venta_productos,
            "ingreso_servicios" => $ingreso_servicios,
            "ingresos" => $total_ingresos,
            "costo_ventas" => $costo_ventas,
            "utilidad_bruta" => $utilidad_bruta,
            "alquiler" => $alquiler,
            "servicios_basicos" => $servicios_basicos,
            "gastos" => $total_gastos,
            "utilidad" => $utilidad_neta
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en reportes: " . $e->getMessage()]);
}
?>