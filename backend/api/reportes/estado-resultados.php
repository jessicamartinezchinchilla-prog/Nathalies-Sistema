<?php
require_once '../../config/db.php';

try {
    $fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
    $fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-t');

    // 1. Venta de productos (desde detalle_ventas unido a ventas completadas)
    $stmtProd = $pdo->prepare("
        SELECT COALESCE(SUM(dv.subtotal), 0) as total
        FROM detalle_ventas dv
        INNER JOIN ventas v ON dv.venta_id = v.id
        WHERE v.estado = 'Completada'
          AND DATE(v.fecha) BETWEEN :inicio AND :fin
          AND dv.tipo = 'producto'
    ");
    $stmtProd->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $venta_productos = floatval($stmtProd->fetch()['total']);

    // 2. Ingresos por servicios (desde detalle_ventas unido a ventas completadas)
    $stmtServ = $pdo->prepare("
        SELECT COALESCE(SUM(dv.subtotal), 0) as total
        FROM detalle_ventas dv
        INNER JOIN ventas v ON dv.venta_id = v.id
        WHERE v.estado = 'Completada'
          AND DATE(v.fecha) BETWEEN :inicio AND :fin
          AND dv.tipo = 'servicio'
    ");
    $stmtServ->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $ingreso_servicios = floatval($stmtServ->fetch()['total']);

    // Verificar total general de ventas completadas
    $stmtTotalVentas = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as cantidad
        FROM ventas
        WHERE estado = 'Completada'
          AND DATE(fecha) BETWEEN :inicio AND :fin
    ");
    $stmtTotalVentas->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $rowVentas = $stmtTotalVentas->fetch();
    $total_ventas_tabla = floatval($rowVentas['total']);
    $cantidad_ventas = intval($rowVentas['cantidad']);

    $suma_detalles = $venta_productos + $ingreso_servicios;
    if ($total_ventas_tabla > $suma_detalles) {
        $venta_productos += ($total_ventas_tabla - $suma_detalles);
    }
    $total_ingresos = $venta_productos + $ingreso_servicios;

    // 3. Costo de ventas real (costo unitario de los productos vendidos en el período)
    $stmtCostoVendidos = $pdo->prepare("
        SELECT COALESCE(SUM(dv.cantidad * COALESCE(p.costo, 0)), 0) as costo_vendidos
        FROM detalle_ventas dv
        INNER JOIN ventas v ON dv.venta_id = v.id
        LEFT JOIN productos p ON dv.item_id = p.id AND dv.tipo = 'producto'
        WHERE v.estado = 'Completada'
          AND DATE(v.fecha) BETWEEN :inicio AND :fin
          AND dv.tipo = 'producto'
    ");
    $stmtCostoVendidos->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $costo_ventas = floatval($stmtCostoVendidos->fetch()['costo_vendidos']);

    // Total de compras a proveedores (para la pestaña de Compras)
    $stmtCompras = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as cantidad
        FROM compras
        WHERE DATE(fecha) BETWEEN :inicio AND :fin
    ");
    $stmtCompras->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $rowCompras = $stmtCompras->fetch();
    $total_compras = floatval($rowCompras['total']);
    $cantidad_compras = intval($rowCompras['cantidad']);

    $utilidad_bruta = $total_ingresos - $costo_ventas;

    // 4. Gastos operativos desglosados
    $stmtAlquiler = $pdo->prepare("
        SELECT COALESCE(SUM(monto), 0) as total
        FROM gastos
        WHERE estado = 'Activo'
          AND DATE(fecha) BETWEEN :inicio AND :fin
          AND categoria_id IN (SELECT id FROM categorias WHERE nombre LIKE '%alquiler%' OR nombre LIKE '%arriendo%' OR nombre LIKE '%renta%')
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

    $stmtTotalGastos = $pdo->prepare("
        SELECT COALESCE(SUM(monto), 0) as total
        FROM gastos
        WHERE estado = 'Activo'
          AND DATE(fecha) BETWEEN :inicio AND :fin
    ");
    $stmtTotalGastos->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $total_gastos = floatval($stmtTotalGastos->fetch()['total']);
    $otros_gastos = max(0, $total_gastos - ($alquiler + $servicios_basicos));

    $utilidad_neta = $utilidad_bruta - $total_gastos;

    // 5. Detalle de Ventas del período
    $stmtListaVentas = $pdo->prepare("
        SELECT v.id, v.codigo, v.fecha, v.total, v.metodo_pago, v.estado,
               COALESCE(u.nombre, 'Administrador') as vendedor,
               (SELECT GROUP_CONCAT(CONCAT(dv.cantidad, 'x ', dv.nombre_item) SEPARATOR ', ')
                FROM detalle_ventas dv WHERE dv.venta_id = v.id) as resumen_items
        FROM ventas v
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        WHERE DATE(v.fecha) BETWEEN :inicio AND :fin
        ORDER BY v.fecha DESC
    ");
    $stmtListaVentas->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $ventas_lista = $stmtListaVentas->fetchAll();

    // 6. Detalle de Compras del período
    $stmtListaCompras = $pdo->prepare("
        SELECT c.id, c.codigo, c.fecha, c.total, c.estado_pago, c.metodo_pago, c.fecha_vencimiento,
               COALESCE(p.nombre, 'Proveedor General') as proveedor
        FROM compras c
        LEFT JOIN proveedores p ON c.proveedor_id = p.id
        WHERE DATE(c.fecha) BETWEEN :inicio AND :fin
        ORDER BY c.fecha DESC, c.id DESC
    ");
    $stmtListaCompras->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
    $compras_lista = $stmtListaCompras->fetchAll();

    // 7. Inventario actual (Productos + Insumos)
    $productos_inv = $pdo->query("
        SELECT codigo, nombre, 'Producto' as tipo, COALESCE(categoria, 'General') as categoria,
               stock, stock_minimo, costo as costo_unitario, precio_venta,
               (stock * costo) as valor_inventario, estado
        FROM productos
        WHERE estado = 'Activo'
        ORDER BY stock ASC
    ")->fetchAll();

    $insumos_inv = $pdo->query("
        SELECT i.codigo, i.nombre, 'Insumo' as tipo, COALESCE(cat.nombre, 'Insumos') as categoria,
               i.stock, i.stock_minimo, i.costo_unitario, 0 as precio_venta,
               (i.stock * i.costo_unitario) as valor_inventario, i.estado
        FROM insumos i
        LEFT JOIN categorias cat ON i.categoria_id = cat.id
        WHERE i.estado = 'Activo'
        ORDER BY i.stock ASC
    ")->fetchAll();

    $inventario_lista = array_merge($productos_inv, $insumos_inv);

    // 8. Cuentas por pagar
    $cuentas_lista = $pdo->query("
        SELECT cpp.id, COALESCE(c.codigo, CONCAT('CMP-', cpp.compra_id)) as compra_codigo,
               COALESCE(p.nombre, 'Proveedor') as proveedor,
               cpp.monto_original, cpp.monto_pagado,
               (cpp.monto_original - cpp.monto_pagado) as saldo_pendiente,
               cpp.fecha_vencimiento, cpp.estado
        FROM cuentas_por_pagar cpp
        LEFT JOIN compras c ON cpp.compra_id = c.id
        LEFT JOIN proveedores p ON cpp.proveedor_id = p.id
        ORDER BY cpp.estado ASC, cpp.fecha_vencimiento ASC
    ")->fetchAll();

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
            "total_compras" => $total_compras,
            "utilidad_bruta" => $utilidad_bruta,
            "alquiler" => $alquiler,
            "servicios_basicos" => $servicios_basicos,
            "otros_gastos" => $otros_gastos,
            "gastos" => $total_gastos,
            "utilidad" => $utilidad_neta,
            "cantidad_ventas" => $cantidad_ventas,
            "cantidad_compras" => $cantidad_compras
        ],
        "ventas" => $ventas_lista,
        "compras" => $compras_lista,
        "inventario" => $inventario_lista,
        "cuentas_por_pagar" => $cuentas_lista
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en reportes: " . $e->getMessage()]);
}
?>
