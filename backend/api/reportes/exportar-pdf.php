<?php
require_once '../../config/db.php';
header("Content-Type: text/html; charset=UTF-8");

$fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
$fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-t');
$tipo_reporte = $_GET['tipo'] ?? 'Estado de resultados';

// Datos del negocio desde configuracion_sistema
$negocio = [
    'nombre_negocio' => "Nathalie's Nails & Lashes",
    'telefono' => '',
    'direccion' => '',
    'correo' => 'administracion@nathalies.com',
    'mensaje_ticket' => 'Documento financiero oficial generado por el sistema.'
];
try {
    $stmtCfg = $pdo->query("SELECT * FROM configuracion_sistema LIMIT 1");
    if ($rowCfg = $stmtCfg->fetch()) {
        $negocio['nombre_negocio'] = !empty($rowCfg['nombre_negocio']) ? $rowCfg['nombre_negocio'] : $negocio['nombre_negocio'];
        $negocio['telefono'] = $rowCfg['telefono'] ?? '';
        $negocio['direccion'] = $rowCfg['direccion'] ?? '';
        $negocio['correo'] = $rowCfg['correo'] ?? '';
    }
} catch (Exception $e) {}

// 1. Ingresos y Estado de Resultados
$stmtProd = $pdo->prepare("
    SELECT COALESCE(SUM(dv.subtotal), 0) as total
    FROM detalle_ventas dv
    INNER JOIN ventas v ON dv.venta_id = v.id
    WHERE v.estado = 'Completada' AND DATE(v.fecha) BETWEEN :inicio AND :fin AND dv.tipo = 'producto'
");
$stmtProd->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$venta_productos = floatval($stmtProd->fetch()['total']);

$stmtServ = $pdo->prepare("
    SELECT COALESCE(SUM(dv.subtotal), 0) as total
    FROM detalle_ventas dv
    INNER JOIN ventas v ON dv.venta_id = v.id
    WHERE v.estado = 'Completada' AND DATE(v.fecha) BETWEEN :inicio AND :fin AND dv.tipo = 'servicio'
");
$stmtServ->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$ingreso_servicios = floatval($stmtServ->fetch()['total']);

$stmtTotalVentas = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as cant FROM ventas WHERE estado = 'Completada' AND DATE(fecha) BETWEEN :inicio AND :fin");
$stmtTotalVentas->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$rowV = $stmtTotalVentas->fetch();
$total_ventas_tabla = floatval($rowV['total']);
$cant_ventas = intval($rowV['cant']);
if ($total_ventas_tabla > ($venta_productos + $ingreso_servicios)) {
    $venta_productos += ($total_ventas_tabla - ($venta_productos + $ingreso_servicios));
}
$total_ingresos = $venta_productos + $ingreso_servicios;

// Costo real de los productos vendidos en el período
$stmtCosto = $pdo->prepare("
    SELECT COALESCE(SUM(dv.cantidad * COALESCE(p.costo, 0)), 0) as costo_vendidos
    FROM detalle_ventas dv
    INNER JOIN ventas v ON dv.venta_id = v.id
    LEFT JOIN productos p ON dv.item_id = p.id AND dv.tipo = 'producto'
    WHERE v.estado = 'Completada' AND DATE(v.fecha) BETWEEN :inicio AND :fin AND dv.tipo = 'producto'
");
$stmtCosto->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$costo_ventas = floatval($stmtCosto->fetch()['costo_vendidos']);

$utilidad_bruta = $total_ingresos - $costo_ventas;

$stmtAlquiler = $pdo->prepare("
    SELECT COALESCE(SUM(monto), 0) as total FROM gastos
    WHERE estado = 'Activo' AND DATE(fecha) BETWEEN :inicio AND :fin
      AND categoria_id IN (SELECT id FROM categorias WHERE nombre LIKE '%alquiler%' OR nombre LIKE '%arriendo%' OR nombre LIKE '%renta%')
");
$stmtAlquiler->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$alquiler = floatval($stmtAlquiler->fetch()['total']);

$stmtServicios = $pdo->prepare("
    SELECT COALESCE(SUM(monto), 0) as total FROM gastos
    WHERE estado = 'Activo' AND DATE(fecha) BETWEEN :inicio AND :fin
      AND categoria_id IN (SELECT id FROM categorias WHERE nombre LIKE '%servicios%' OR nombre LIKE '%luz%' OR nombre LIKE '%agua%')
");
$stmtServicios->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$servicios_basicos = floatval($stmtServicios->fetch()['total']);

$stmtTotalGastos = $pdo->prepare("SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE estado = 'Activo' AND DATE(fecha) BETWEEN :inicio AND :fin");
$stmtTotalGastos->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$total_gastos = floatval($stmtTotalGastos->fetch()['total']);
$otros_gastos = max(0, $total_gastos - ($alquiler + $servicios_basicos));

$utilidad_neta = $utilidad_bruta - $total_gastos;

// Listados detallados
$stmtVentas = $pdo->prepare("
    SELECT v.codigo, v.fecha, v.total, v.metodo_pago, v.estado, COALESCE(u.nombre, 'Administrador') as vendedor,
           (SELECT GROUP_CONCAT(CONCAT(dv.cantidad, 'x ', dv.nombre_item) SEPARATOR ', ') FROM detalle_ventas dv WHERE dv.venta_id = v.id) as items
    FROM ventas v LEFT JOIN usuarios u ON v.usuario_id = u.id
    WHERE DATE(v.fecha) BETWEEN :inicio AND :fin ORDER BY v.fecha DESC
");
$stmtVentas->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$ventas = $stmtVentas->fetchAll();

$stmtCompras = $pdo->prepare("
    SELECT c.codigo, c.fecha, c.total, c.estado_pago, c.metodo_pago, COALESCE(p.nombre, 'Proveedor General') as proveedor
    FROM compras c LEFT JOIN proveedores p ON c.proveedor_id = p.id
    WHERE DATE(c.fecha) BETWEEN :inicio AND :fin ORDER BY c.fecha DESC
");
$stmtCompras->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$compras = $stmtCompras->fetchAll();

$productos_inv = $pdo->query("SELECT codigo, nombre, 'Producto' as tipo, COALESCE(categoria, 'General') as categoria, stock, stock_minimo, costo as costo_unitario, (stock * costo) as valor FROM productos WHERE estado = 'Activo' ORDER BY stock ASC")->fetchAll();
$insumos_inv = $pdo->query("SELECT i.codigo, i.nombre, 'Insumo' as tipo, COALESCE(cat.nombre, 'Insumos') as categoria, i.stock, i.stock_minimo, i.costo_unitario, (i.stock * i.costo_unitario) as valor FROM insumos i LEFT JOIN categorias cat ON i.categoria_id = cat.id WHERE i.estado = 'Activo' ORDER BY i.stock ASC")->fetchAll();
$inventario = array_merge($productos_inv, $insumos_inv);

$cuentas = $pdo->query("
    SELECT COALESCE(c.codigo, CONCAT('CMP-', cpp.compra_id)) as codigo, COALESCE(p.nombre, 'Proveedor') as proveedor,
           cpp.monto_original, cpp.monto_pagado, (cpp.monto_original - cpp.monto_pagado) as saldo, cpp.fecha_vencimiento, cpp.estado
    FROM cuentas_por_pagar cpp
    LEFT JOIN compras c ON cpp.compra_id = c.id
    LEFT JOIN proveedores p ON cpp.proveedor_id = p.id
    ORDER BY cpp.estado ASC, cpp.fecha_vencimiento ASC
")->fetchAll();

function fmt($n) {
    return '$ ' . number_format(floatval($n), 2, '.', ',');
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte Ejecutivo - <?php echo htmlspecialchars($negocio['nombre_negocio']); ?></title>
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body {
    margin: 0;
    padding: 32px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #f3f4f6;
    color: #1f2937;
  }
  .toolbar {
    max-width: 900px;
    margin: 0 auto 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #190C30;
    color: white;
    padding: 14px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  }
  .toolbar button {
    background: #c08497;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
  }
  .page {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    border: 1px solid #e5e7eb;
  }
  .header-banner {
    background: linear-gradient(135deg, #190C30 0%, #2d1654 100%);
    color: white;
    padding: 32px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 4px solid #c08497;
  }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand-logo {
    width: 54px; height: 54px;
    background: #c08497;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; font-weight: 800; color: white;
  }
  .brand h1 { margin: 0; font-size: 22px; letter-spacing: 0.3px; }
  .brand p { margin: 4px 0 0; font-size: 12px; color: #d8b4e2; }
  .doc-meta { text-align: right; font-size: 12px; line-height: 1.6; }
  .doc-meta .badge-title {
    display: inline-block;
    background: rgba(192,132,151,0.25);
    border: 1px solid #c08497;
    color: #fce7f3;
    padding: 4px 12px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
  }
  .content { padding: 32px 40px; }
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }
  .kpi-card {
    padding: 16px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
  }
  .kpi-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #6b7280; font-weight: 700; }
  .kpi-card .val { font-size: 20px; font-weight: 800; margin-top: 6px; }
  .section-title {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #190C30;
    border-left: 4px solid #c08497;
    padding-left: 10px;
    margin: 28px 0 14px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
  th {
    background: #190C30;
    color: white;
    padding: 10px 14px;
    text-align: left;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }
  td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f9fafb; }
  .text-right { text-align: right; font-family: 'Consolas', monospace; }
  .row-subtotal td { background: #f3f4f6 !important; font-weight: 700; border-top: 1px solid #9ca3af; }
  .row-total td { background: #fdf2f8 !important; font-weight: 800; font-size: 14px; color: #190C30; border-top: 2px solid #c08497; border-bottom: 2px solid #c08497; }
  .signatures {
    margin-top: 48px;
    padding-top: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    text-align: center;
    font-size: 12px;
    color: #4b5563;
  }
  .sig-line { border-top: 1px solid #9ca3af; padding-top: 8px; margin-top: 40px; font-weight: 600; }
  .footer-note {
    margin-top: 28px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #9ca3af;
  }
  @media print {
    body { background: white; padding: 0; }
    .toolbar { display: none !important; }
    .page { box-shadow: none; border: none; max-width: 100%; }
  }
</style>
</head>
<body>

<div class="toolbar">
  <div>
    <strong>📄 Vista Previa del Reporte Oficial</strong>
    <span style="font-size: 12px; color: #d8b4e2; margin-left: 10px;">Listo para imprimir o guardar como PDF en alta calidad</span>
  </div>
  <div style="display: flex; gap: 10px;">
    <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
  </div>
</div>

<div class="page">
  <div class="header-banner">
    <div class="brand">
      <div class="brand-logo">N</div>
      <div>
        <h1><?php echo htmlspecialchars($negocio['nombre_negocio']); ?></h1>
        <p>Sistema Administrativo, Contable y de Control Operativo</p>
        <?php if (!empty($negocio['direccion']) || !empty($negocio['telefono'])): ?>
          <p><?php echo htmlspecialchars(trim($negocio['direccion'] . ' ' . $negocio['telefono'])); ?></p>
        <?php endif; ?>
      </div>
    </div>
    <div class="doc-meta">
      <div class="badge-title">Reporte: <?php echo htmlspecialchars($tipo_reporte); ?></div>
      <div><strong>Período consultado:</strong> <?php echo htmlspecialchars($fecha_inicio); ?> al <?php echo htmlspecialchars($fecha_fin); ?></div>
      <div><strong>Fecha de emisión:</strong> <?php echo date('d/m/Y H:i'); ?></div>
    </div>
  </div>

  <div class="content">
    <!-- Indicadores Ejecutivos -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="label">Ingresos Totales</div>
        <div class="val" style="color: #059669;"><?php echo fmt($total_ingresos); ?></div>
      </div>
      <div class="kpi-card">
        <div class="label">Costo de Ventas</div>
        <div class="val" style="color: #d97706;"><?php echo fmt($costo_ventas); ?></div>
      </div>
      <div class="kpi-card">
        <div class="label">Gastos Operativos</div>
        <div class="val" style="color: #dc2626;"><?php echo fmt($total_gastos); ?></div>
      </div>
      <div class="kpi-card" style="background: <?php echo $utilidad_neta >= 0 ? '#ecfdf5' : '#fef2f2'; ?>; border-color: <?php echo $utilidad_neta >= 0 ? '#6ee7b7' : '#fca5a5'; ?>;">
        <div class="label">Utilidad Neta</div>
        <div class="val" style="color: <?php echo $utilidad_neta >= 0 ? '#047857' : '#b91c1c'; ?>;"><?php echo fmt($utilidad_neta); ?></div>
      </div>
    </div>

    <!-- 1. ESTADO DE RESULTADOS -->
    <?php if ($tipo_reporte === 'Estado de resultados' || $tipo_reporte === 'Completo'): ?>
    <div class="section-title">1. Estado de Resultados del Período</div>
    <table>
      <thead>
        <tr>
          <th>Concepto Financiero</th>
          <th>Categoría</th>
          <th class="text-right">Monto (USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Venta de productos (<?php echo $cant_ventas; ?> transacciones en el período)</td>
          <td>Ingresos Operativos</td>
          <td class="text-right"><?php echo fmt($venta_productos); ?></td>
        </tr>
        <tr>
          <td>Ingresos por servicios de salón (Uñas, Pestañas, Cejas, Cabello)</td>
          <td>Ingresos Operativos</td>
          <td class="text-right"><?php echo fmt($ingreso_servicios); ?></td>
        </tr>
        <tr class="row-subtotal">
          <td colspan="2">TOTAL INGRESOS BRUTOS</td>
          <td class="text-right" style="color: #059669;"><?php echo fmt($total_ingresos); ?></td>
        </tr>
        <tr>
          <td>Costo de productos vendidos</td>
          <td>Costo de Ventas</td>
          <td class="text-right"><?php echo fmt($costo_ventas); ?></td>
        </tr>
        <tr class="row-subtotal">
          <td colspan="2">UTILIDAD BRUTA OPERATIVA</td>
          <td class="text-right"><?php echo fmt($utilidad_bruta); ?></td>
        </tr>
        <tr>
          <td>Gasto de alquiler / arrendamiento de local</td>
          <td>Gasto Operativo</td>
          <td class="text-right"><?php echo fmt($alquiler); ?></td>
        </tr>
        <tr>
          <td>Servicios básicos (Agua, Energía eléctrica, Internet)</td>
          <td>Gasto Operativo</td>
          <td class="text-right"><?php echo fmt($servicios_basicos); ?></td>
        </tr>
        <?php if ($otros_gastos > 0): ?>
        <tr>
          <td>Otros gastos operativos (Mantenimiento, Marketing, Otros)</td>
          <td>Gasto Operativo</td>
          <td class="text-right"><?php echo fmt($otros_gastos); ?></td>
        </tr>
        <?php endif; ?>
        <tr class="row-subtotal">
          <td colspan="2">TOTAL GASTOS OPERATIVOS</td>
          <td class="text-right" style="color: #dc2626;"><?php echo fmt($total_gastos); ?></td>
        </tr>
        <tr class="row-total">
          <td colspan="2">UTILIDAD NETA DEL EJERCICIO</td>
          <td class="text-right"><?php echo fmt($utilidad_neta); ?></td>
        </tr>
      </tbody>
    </table>
    <?php endif; ?>

    <!-- 2. DETALLE DE VENTAS -->
    <?php if ($tipo_reporte === 'Ventas' || $tipo_reporte === 'Estado de resultados' || $tipo_reporte === 'Completo'): ?>
    <div class="section-title">Detalle de Ventas Registradas en el Período (<?php echo count($ventas); ?>)</div>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Fecha y Hora</th>
          <th>Detalle de Productos / Servicios</th>
          <th>Método</th>
          <th>Estado</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        <?php if (count($ventas) === 0): ?>
          <tr><td colspan="6" style="text-align:center; color:#6b7280; padding: 20px;">No hay ventas registradas en este rango de fechas.</td></tr>
        <?php else: ?>
          <?php foreach ($ventas as $v): ?>
          <tr>
            <td><strong><?php echo htmlspecialchars($v['codigo']); ?></strong></td>
            <td><?php echo htmlspecialchars($v['fecha']); ?></td>
            <td><?php echo htmlspecialchars($v['items'] ?: 'Venta general'); ?></td>
            <td><?php echo htmlspecialchars($v['metodo_pago']); ?></td>
            <td><?php echo htmlspecialchars($v['estado']); ?></td>
            <td class="text-right"><?php echo fmt($v['total']); ?></td>
          </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
    <?php endif; ?>

    <!-- 3. DETALLE DE COMPRAS -->
    <?php if ($tipo_reporte === 'Compras' || $tipo_reporte === 'Completo'): ?>
    <div class="section-title">Detalle de Compras a Proveedores (<?php echo count($compras); ?>)</div>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Fecha</th>
          <th>Proveedor</th>
          <th>Método de Pago</th>
          <th>Estado</th>
          <th class="text-right">Monto Total</th>
        </tr>
      </thead>
      <tbody>
        <?php if (count($compras) === 0): ?>
          <tr><td colspan="6" style="text-align:center; color:#6b7280; padding: 20px;">No hay compras registradas en este período.</td></tr>
        <?php else: ?>
          <?php foreach ($compras as $c): ?>
          <tr>
            <td><strong><?php echo htmlspecialchars($c['codigo']); ?></strong></td>
            <td><?php echo htmlspecialchars($c['fecha']); ?></td>
            <td><?php echo htmlspecialchars($c['proveedor']); ?></td>
            <td><?php echo htmlspecialchars($c['metodo_pago']); ?></td>
            <td><?php echo htmlspecialchars($c['estado_pago']); ?></td>
            <td class="text-right"><?php echo fmt($c['total']); ?></td>
          </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
    <?php endif; ?>

    <!-- 4. INVENTARIO -->
    <?php if ($tipo_reporte === 'Inventario' || $tipo_reporte === 'Completo'): ?>
    <div class="section-title">Valoración de Inventario Actual (Productos e Insumos)</div>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Artículo</th>
          <th>Tipo / Categoría</th>
          <th class="text-right">Stock Actual</th>
          <th class="text-right">Costo Unit.</th>
          <th class="text-right">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        <?php
        $suma_inv = 0;
        foreach ($inventario as $item):
          $suma_inv += floatval($item['valor']);
        ?>
        <tr>
          <td><strong><?php echo htmlspecialchars($item['codigo']); ?></strong></td>
          <td><?php echo htmlspecialchars($item['nombre']); ?></td>
          <td><?php echo htmlspecialchars($item['tipo'] . ' - ' . $item['categoria']); ?></td>
          <td class="text-right"><?php echo intval($item['stock']); ?> (Mín: <?php echo intval($item['stock_minimo']); ?>)</td>
          <td class="text-right"><?php echo fmt($item['costo_unitario']); ?></td>
          <td class="text-right"><?php echo fmt($item['valor']); ?></td>
        </tr>
        <?php endforeach; ?>
        <tr class="row-total">
          <td colspan="5">VALOR TOTAL DEL INVENTARIO VALORIZADO</td>
          <td class="text-right"><?php echo fmt($suma_inv); ?></td>
        </tr>
      </tbody>
    </table>
    <?php endif; ?>

    <!-- 5. CUENTAS POR PAGAR -->
    <?php if ($tipo_reporte === 'Cuentas por pagar' || $tipo_reporte === 'Completo'): ?>
    <div class="section-title">Estado de Cuentas por Pagar a Proveedores</div>
    <table>
      <thead>
        <tr>
          <th>Compra Ref.</th>
          <th>Proveedor</th>
          <th>Vencimiento</th>
          <th>Estado</th>
          <th class="text-right">Monto Original</th>
          <th class="text-right">Pagado</th>
          <th class="text-right">Saldo Pendiente</th>
        </tr>
      </thead>
      <tbody>
        <?php
        $suma_saldo = 0;
        foreach ($cuentas as $cta):
          $suma_saldo += floatval($cta['saldo']);
        ?>
        <tr>
          <td><strong><?php echo htmlspecialchars($cta['codigo']); ?></strong></td>
          <td><?php echo htmlspecialchars($cta['proveedor']); ?></td>
          <td><?php echo htmlspecialchars($cta['fecha_vencimiento']); ?></td>
          <td><?php echo htmlspecialchars($cta['estado']); ?></td>
          <td class="text-right"><?php echo fmt($cta['monto_original']); ?></td>
          <td class="text-right"><?php echo fmt($cta['monto_pagado']); ?></td>
          <td class="text-right"><strong><?php echo fmt($cta['saldo']); ?></strong></td>
        </tr>
        <?php endforeach; ?>
        <tr class="row-total">
          <td colspan="6">TOTAL SALDO PENDIENTE POR PAGAR</td>
          <td class="text-right"><?php echo fmt($suma_saldo); ?></td>
        </tr>
      </tbody>
    </table>
    <?php endif; ?>

    <div class="signatures">
      <div>
        <div class="sig-line">Elaborado por Administración</div>
        <div><?php echo htmlspecialchars($negocio['nombre_negocio']); ?></div>
      </div>
      <div>
        <div class="sig-line">Revisado y Autorizado por Gerencia / Contabilidad</div>
        <div>Firma y Sello</div>
      </div>
    </div>

    <div class="footer-note">
      <span><?php echo htmlspecialchars($negocio['mensaje_ticket']); ?></span>
      <span>Generado el <?php echo date('d/m/Y H:i:s'); ?></span>
    </div>
  </div>
</div>

<script>
  window.addEventListener('load', function() {
    setTimeout(function() {
      window.print();
    }, 350);
  });
</script>
</body>
</html>
