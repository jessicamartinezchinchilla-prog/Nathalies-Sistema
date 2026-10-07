<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    require_once '../../config/db.php';
    
    $fecha = $_GET['fecha'] ?? date('Y-m-d');

    // 1. Buscar el último cierre del día (si existe)
    $stmtUltimo = $pdo->prepare("
        SELECT created_at FROM cierres_caja 
        WHERE fecha = :fecha 
        ORDER BY created_at DESC LIMIT 1
    ");
    $stmtUltimo->execute([':fecha' => $fecha]);
    $ultimoCierre = $stmtUltimo->fetch();

    // Si ya hubo un cierre, solo contamos lo que pasó DESPUÉS
    $fechaDesde = $ultimoCierre ? $ultimoCierre['created_at'] : $fecha . ' 00:00:00';

    // 2. Totales de Ventas desde el último cierre
    $stmtVentas = $pdo->prepare("
        SELECT 
            COALESCE(SUM(total), 0) as ventas_total,
            COALESCE(SUM(monto_efectivo), 0) as ventas_efectivo,
            COALESCE(SUM(monto_transferencia), 0) as ventas_transferencia,
            COALESCE(SUM(monto_tarjeta), 0) as ventas_tarjeta,
            COUNT(*) as cantidad_ventas
        FROM ventas 
        WHERE DATE(fecha) = :fecha 
          AND fecha >= :fecha_desde
          AND estado = 'Completada'
    ");
    $stmtVentas->execute([
        ':fecha' => $fecha,
        ':fecha_desde' => $fechaDesde
    ]);
    $ventas = $stmtVentas->fetch();

    // 3. Totales de Gastos desde el último cierre
    $stmtGastos = $pdo->prepare("
        SELECT COALESCE(SUM(monto), 0) as gastos_total, COUNT(*) as cantidad_gastos
        FROM gastos 
        WHERE DATE(fecha) = :fecha 
          AND created_at >= :fecha_desde
          AND estado = 'Activo'
    ");
    $stmtGastos->execute([
        ':fecha' => $fecha,
        ':fecha_desde' => $fechaDesde
    ]);
    $gastos = $stmtGastos->fetch();

    $ventasEfectivo = floatval($ventas['ventas_efectivo']);
    $gastosEfectivo = floatval($gastos['gastos_total']);
    $efectivoEsperado = $ventasEfectivo - $gastosEfectivo;

    echo json_encode([
        "success" => true,
        "data" => [
            "ventas_total" => floatval($ventas['ventas_total']),
            "ventas_efectivo" => $ventasEfectivo,
            "ventas_transferencia" => floatval($ventas['ventas_transferencia']),
            "ventas_tarjeta" => floatval($ventas['ventas_tarjeta']),
            "gastos_efectivo" => $gastosEfectivo,
            "efectivo_esperado" => $efectivoEsperado,
            "cantidad_ventas" => intval($ventas['cantidad_ventas']),
            "cantidad_gastos" => intval($gastos['cantidad_gastos']),
            "es_segundo_cierre" => $ultimoCierre ? true : false
        ]
    ]);
    exit();

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
    exit();
}
?>