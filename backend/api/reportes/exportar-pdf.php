<?php
require_once '../../config/db.php';

// 1. Recibir fechas
$fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
$fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-t');

// 2. Obtener los datos (misma lógica que en Excel)
$stmtIngresos = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE estado = 'Completada' AND DATE(fecha) BETWEEN :inicio AND :fin");
$stmtIngresos->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$ingresos = floatval($stmtIngresos->fetch()['total']);

$stmtEgresos = $pdo->prepare("SELECT COALESCE((SELECT SUM(monto) FROM gastos WHERE DATE(fecha) BETWEEN :inicio AND :fin AND estado = 'Activo'), 0) + COALESCE((SELECT SUM(total) FROM compras WHERE DATE(fecha) BETWEEN :inicio AND :fin), 0) as total_egresos");
$stmtEgresos->execute([':inicio' => $fecha_inicio, ':fin' => $fecha_fin]);
$egresos = floatval($stmtEgresos->fetch()['total_egresos']);

$utilidad = $ingresos - $egresos;

// 3. Headers para forzar la descarga del PDF
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="reporte_financiero.pdf"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');

// 4. Generación de PDF en PHP PURO (Sin librerías externas)
// Formatear números
$ingresos_fmt = number_format($ingresos, 2, '.', ',');
$egresos_fmt = number_format($egresos, 2, '.', ',');
$utilidad_fmt = number_format($utilidad, 2, '.', ',');

// Contenido del PDF (Usando sintaxis PDF nativa)
$texto = "BT /F1 14 Tf 50 750 Td (REPORTE FINANCIERO) Tj " .
         "0 -30 Td /F1 10 Tf (Periodo: {$fecha_inicio} al {$fecha_fin}) Tj " .
         "0 -50 Td /F1 12 Tf (TOTAL INGRESOS (Ventas): USD {$ingresos_fmt}) Tj " .
         "0 -25 Td (TOTAL EGRESOS (Gastos + Compras): USD {$egresos_fmt}) Tj " .
         "0 -40 Td /F1 14 Tf (UTILIDAD NETA: USD {$utilidad_fmt}) Tj ET";

// Estructura básica de un archivo PDF
$pdf = "%PDF-1.4\n";
$objects = [];
$objects[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
$objects[2] = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
$objects[3] = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
$objects[4] = "4 0 obj\n<< /Length " . strlen($texto) . " >>\nstream\n" . $texto . "\nendstream\nendobj\n";
$objects[5] = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

$xref = "xref\n0 6\n0000000000 65535 f \n";
$currentOffset = strlen($pdf);
foreach ($objects as $obj) {
    $xref .= str_pad($currentOffset, 10, "0", STR_PAD_LEFT) . " 00000 n \n";
    $pdf .= $obj;
    $currentOffset = strlen($pdf);
}

$pdf .= $xref;
$pdf .= "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" . strlen($pdf) . "\n%%EOF";

// 5. Enviar el PDF al navegador
echo $pdf;
exit();
?>
