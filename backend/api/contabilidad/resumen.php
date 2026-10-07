<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

// Mostrar errores para debug (quitar en producción)
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once '../../config/db.php';
    
    $mes = intval($_GET['mes'] ?? date('m'));
    $anio = intval($_GET['anio'] ?? date('Y'));
    $fecha_limite = sprintf("%04d-%02d-28", $anio, $mes); // Usamos día 28 para evitar problemas con meses de 30/31 días

    // 1. INGRESOS DEL MES
    $stmt = $pdo->prepare("SELECT 
        COALESCE(SUM(total), 0) as total,
        COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN total ELSE 0 END), 0) as efectivo,
        COALESCE(SUM(CASE WHEN metodo_pago = 'Transferencia' THEN total ELSE 0 END), 0) as transferencia
        FROM ventas 
        WHERE estado = 'Completada' 
        AND MONTH(fecha) = :mes 
        AND YEAR(fecha) = :anio");
    $stmt->execute([':mes' => $mes, ':anio' => $anio]);
    $ingresos = $stmt->fetch();

    // 2. GASTOS DEL MES
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(monto), 0) as total 
        FROM gastos 
        WHERE estado = 'Activo' 
        AND MONTH(fecha) = :mes 
        AND YEAR(fecha) = :anio");
    $stmt->execute([':mes' => $mes, ':anio' => $anio]);
    $gastos = $stmt->fetch();

    // 3. COMPRAS DEL MES
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total 
        FROM compras 
        WHERE MONTH(fecha) = :mes 
        AND YEAR(fecha) = :anio");
    $stmt->execute([':mes' => $mes, ':anio' => $anio]);
    $compras = $stmt->fetch();

    $total_ingresos = floatval($ingresos['total']);
    $total_gastos = floatval($gastos['total']);
    $total_compras = floatval($compras['total']);
    $total_egresos = $total_gastos + $total_compras;
    $utilidad_mes = $total_ingresos - $total_egresos;

    // 4. CÁLCULOS ACUMULADOS (hasta el mes seleccionado)
    // Efectivo en caja
    $cash_in = floatval($pdo->query("SELECT COALESCE(SUM(monto_efectivo), 0) FROM ventas WHERE estado='Completada' AND fecha <= '$fecha_limite'")->fetchColumn());
    $cash_out_g = floatval($pdo->query("SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE estado='Activo' AND metodo_pago='Efectivo' AND fecha <= '$fecha_limite'")->fetchColumn());
    $cash_out_c = floatval($pdo->query("SELECT COALESCE(SUM(total), 0) FROM compras WHERE metodo_pago='Efectivo' AND fecha <= '$fecha_limite'")->fetchColumn());
    $efectivo_caja = $cash_in - $cash_out_g - $cash_out_c;

    // Transferencias
    $transf_in = floatval($pdo->query("SELECT COALESCE(SUM(monto_transferencia), 0) FROM ventas WHERE estado='Completada' AND fecha <= '$fecha_limite'")->fetchColumn());
    $transf_out_g = floatval($pdo->query("SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE estado='Activo' AND metodo_pago='Transferencia' AND fecha <= '$fecha_limite'")->fetchColumn());
    $transf_out_c = floatval($pdo->query("SELECT COALESCE(SUM(total), 0) FROM compras WHERE metodo_pago='Transferencia' AND fecha <= '$fecha_limite'")->fetchColumn());
    $saldo_bancos = $transf_in - $transf_out_g - $transf_out_c;

    // Inventario
    $inv_prod = floatval($pdo->query("SELECT COALESCE(SUM(stock * costo), 0) FROM productos")->fetchColumn());
    $inv_insum = floatval($pdo->query("SELECT COALESCE(SUM(stock * costo_unitario), 0) FROM insumos")->fetchColumn());
    $inventario = $inv_prod + $inv_insum;

    // Activos Fijos
    $activos_fijos = floatval($pdo->query("SELECT COALESCE(SUM(valor_compra), 0) FROM activos_fijos WHERE estado='Activo'")->fetchColumn());

    // Utilidad Acumulada
    $ing_hist = floatval($pdo->query("SELECT COALESCE(SUM(total), 0) FROM ventas WHERE estado='Completada' AND fecha <= '$fecha_limite'")->fetchColumn());
    $gas_hist = floatval($pdo->query("SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE estado='Activo' AND fecha <= '$fecha_limite'")->fetchColumn());
    $comp_hist = floatval($pdo->query("SELECT COALESCE(SUM(total), 0) FROM compras WHERE fecha <= '$fecha_limite'")->fetchColumn());
    $utilidad_acumulada = $ing_hist - $gas_hist - $comp_hist;

    // Deuda
    $deuda = floatval($pdo->query("SELECT COALESCE(SUM(monto_original - monto_pagado), 0) FROM cuentas_por_pagar WHERE estado != 'Pagada'")->fetchColumn());

    // Top Gastos
    $stmt = $pdo->prepare("SELECT c.nombre, SUM(g.monto) as monto 
        FROM gastos g 
        JOIN categorias c ON g.categoria_id = c.id 
        WHERE g.estado = 'Activo' 
        AND MONTH(g.fecha) = :mes 
        AND YEAR(g.fecha) = :anio 
        GROUP BY c.nombre 
        ORDER BY monto DESC 
        LIMIT 5");
    $stmt->execute([':mes' => $mes, ':anio' => $anio]);
    $top_gastos = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => [
            "mes" => [
                "ingresos" => $total_ingresos,
                "egresos" => $total_egresos,
                "utilidad" => $utilidad_mes
            ],
            "balance" => [
                "efectivo_caja" => $efectivo_caja,
                "saldo_bancos" => $saldo_bancos,
                "inventario" => $inventario,
                "activos_fijos" => $activos_fijos,
                "deuda_pendiente" => $deuda,
                "utilidad_acumulada" => $utilidad_acumulada
            ],
            "top_gastos" => $top_gastos
        ]
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>