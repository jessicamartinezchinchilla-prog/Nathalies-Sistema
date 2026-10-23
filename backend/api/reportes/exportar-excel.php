<?php
require_once '../../config/db.php';

// Recibir fechas
$fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
$fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-t');

// 1. Headers para forzar descarga de Excel
header("Content-Type: text/csv; charset=UTF-8");
header("Content-Disposition: attachment; filename=reporte_financiero_{$fecha_inicio}_a_{$fecha_fin}.csv");
header("Pragma: no-cache");
header("Expires: 0");

// 2. Abrir salida
$output = fopen("php://output", "w");

// 3. Agregar BOM para Excel (ñ y tildes)
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// 4. Encabezados
fputcsv($output, ["Concepto", "Monto (USD)"]);

// 5. Obtener datos
$stmtIngresos = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE estado = 'Completada' AND DATE(fecha) BETWEEN :inicio AND :fin");
$stmtIngresos->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$ingresos = floatval($stmtIngresos->fetch()['total']);

$stmtEgresos = $pdo->prepare("SELECT COALESCE((SELECT SUM(monto) FROM gastos WHERE DATE(fecha) BETWEEN :inicio AND :fin AND estado = 'Activo'), 0) + COALESCE((SELECT SUM(total) FROM compras WHERE DATE(fecha) BETWEEN :inicio AND :fin), 0) as total_egresos");
$stmtEgresos->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$egresos = floatval($stmtEgresos->fetch()['total_egresos']);

$utilidad = $ingresos - $egresos;

// 6. Escribir en CSV
fputcsv($output, ["TOTAL INGRESOS (Ventas)", number_format($ingresos, 2, '.', ',')]);
fputcsv($output, ["TOTAL EGRESOS (Gastos + Compras)", number_format($egresos, 2, '.', ',')]);
fputcsv($output, ["UTILIDAD NETA", number_format($utilidad, 2, '.', ',')]);

fclose($output);
exit();
?>