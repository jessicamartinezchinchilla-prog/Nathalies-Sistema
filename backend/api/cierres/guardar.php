<?php
// 1. ENCABEZADOS CORS COMPLETOS (Obligatorios para POST desde React)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 2. MANEJAR LA PETICIÓN DE PRUEBA (OPTIONS)
// Si el navegador pregunta "¿puedo enviar esto?", le decimos que sí y terminamos.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. VERIFICAR QUE SEA UNA PETICIÓN POST REAL
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

// 4. LEER LOS DATOS QUE ENVÍA REACT
$data = json_decode(file_get_contents("php://input"), true);

// Validar que no esté vacío
if (empty($data)) {
    http_response_code(400);
    echo json_encode(["error" => "No se recibieron datos del formulario"]);
    exit();
}

// Validar campos obligatorios (ajusta los nombres si tu frontend envía otros)
if (empty($data['fecha']) || !isset($data['efectivo_real'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos obligatorios (fecha o efectivo_real)"]);
    exit();
}

try {
    // 5. CONEXIÓN A LA BASE DE DATOS
    require_once '../../config/db.php';

    // 6. PREPARAR LA CONSULTA SQL
    $stmt = $pdo->prepare("
        INSERT INTO cierres_caja 
        (fecha, ventas_total, ventas_efectivo, ventas_transferencia, ventas_tarjeta, 
         gastos_efectivo, efectivo_esperado, efectivo_real, diferencia, observaciones, usuario_id)
        VALUES 
        (:fecha, :vt, :ve, :vtr, :vta, :ge, :ee, :er, :dif, :obs, :usuario_id)
    ");
    
    // 7. EJECUTAR CON LOS DATOS
    $stmt->execute([
        ':fecha' => $data['fecha'],
        ':vt' => floatval($data['ventas_total'] ?? 0),
        ':ve' => floatval($data['ventas_efectivo'] ?? 0),
        ':vtr' => floatval($data['ventas_transferencia'] ?? 0),
        ':vta' => floatval($data['ventas_tarjeta'] ?? 0),
        ':ge' => floatval($data['gastos_efectivo'] ?? 0),
        ':ee' => floatval($data['efectivo_esperado'] ?? 0),
        ':er' => floatval($data['efectivo_real'] ?? 0),
        ':dif' => floatval($data['diferencia'] ?? 0),
        ':obs' => $data['observaciones'] ?? '',
        // Si tu frontend envía el ID del usuario, úsalo. Si no, deja el 1 por defecto.
        ':usuario_id' => intval($data['usuario_id'] ?? 1) 
    ]);

    // 8. RESPUESTA EXITOSA
    echo json_encode([
        "success" => true, 
        "message" => "Cierre de caja guardado exitosamente"
    ]);
    exit();

} catch(PDOException $e) {
    // Si hay un error de SQL (ej. columna que no existe), nos lo dirá aquí
    http_response_code(500);
    echo json_encode(["error" => "Error de Base de Datos: " . $e->getMessage()]);
    exit();
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error del Servidor: " . $e->getMessage()]);
    exit();
}
?>