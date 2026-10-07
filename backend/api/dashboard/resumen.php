<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

try {
    require_once '../../config/db.php';

    // 1. Ventas y Caja del DÍA
    $stmtDia = $pdo->query("
        SELECT 
            COALESCE(SUM(total), 0) as total_dia,
            COALESCE(SUM(monto_efectivo), 0) as efectivo_dia,
            COALESCE(SUM(monto_transferencia), 0) as trans_dia
        FROM ventas WHERE DATE(fecha) = CURDATE() AND estado = 'Completada'
    ");
    $dia = $stmtDia->fetch();

    // 2. Ventas y Gastos del MES
    $stmtMes = $pdo->query("
        SELECT 
            (SELECT COALESCE(SUM(total), 0) FROM ventas WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE()) AND estado = 'Completada') as ventas_mes,
            (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE()) AND estado = 'Activo') as gastos_mes,
            (SELECT COUNT(DISTINCT categoria_id) FROM gastos WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())) as cats_gastos
    ");
    $mes = $stmtMes->fetch();
    
    $utilidad_mes = floatval($mes['ventas_mes']) - floatval($mes['gastos_mes']);
    $margen_mes = floatval($mes['ventas_mes']) > 0 ? round(($utilidad_mes / floatval($mes['ventas_mes'])) * 100) : 0;

    // 3. Cuentas por Pagar
    $stmtCtas = $pdo->query("
        SELECT COUNT(*) as pendientes, COALESCE(SUM(monto_original - monto_pagado), 0) as total 
        FROM cuentas_por_pagar WHERE estado IN ('Pendiente', 'Vencida')
    ");
    $ctas = $stmtCtas->fetch();

    // 4. Stock Bajo (Lista de items)
    $stmtStock = $pdo->query("
        (SELECT nombre, stock, stock_minimo FROM productos WHERE estado='Activo' AND stock <= stock_minimo LIMIT 3)
        UNION ALL
        (SELECT nombre, stock, stock_minimo FROM insumos WHERE estado='Activo' AND stock <= stock_minimo LIMIT 3)
        LIMIT 5
    ");
    $stockBajoList = $stmtStock->fetchAll();

    // 5. Últimas Ventas (con descripción concatenada)
    $stmtUltimas = $pdo->query("
        SELECT v.codigo, v.fecha, v.total, v.metodo_pago, 
               GROUP_CONCAT(d.nombre_item SEPARATOR ' + ') as descripcion
        FROM ventas v
        JOIN detalle_ventas d ON v.id = d.venta_id
        WHERE v.estado = 'Completada'
        GROUP BY v.id
        ORDER BY v.fecha DESC LIMIT 5
    ");
    $ultimas = $stmtUltimas->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => [
            "ventas_dia" => floatval($dia['total_dia']),
            "ventas_dia_efectivo" => floatval($dia['efectivo_dia']),
            "ventas_dia_trans" => floatval($dia['trans_dia']),
            "ventas_mes" => floatval($mes['ventas_mes']),
            "gastos_mes" => floatval($mes['gastos_mes']),
            "gastos_categorias" => intval($mes['cats_gastos']),
            "utilidad_mes" => $utilidad_mes,
            "margen_mes" => $margen_mes,
            "ctas_pendientes" => intval($ctas['pendientes']),
            "ctas_total" => floatval($ctas['total']),
            "stock_bajo_count" => count($stockBajoList),
            "stock_bajo_list" => $stockBajoList,
            "ultimas_ventas" => $ultimas
        ]
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>