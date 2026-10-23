<?php
// 1. ENCABEZADOS CORS COMPLETOS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 2. MANEJAR LA PETICIÓN DE PRUEBA (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. VERIFICAR QUE SEA POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

// 4. LEER DATOS
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data)) {
    http_response_code(400);
    echo json_encode(["error" => "No se recibieron datos"]);
    exit();
}

try {
    require_once '../../config/db.php';
    
    // Crear tabla si no existe (por seguridad)
    $pdo->exec("CREATE TABLE IF NOT EXISTS cierres_caja (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fecha_apertura DATETIME NOT NULL,
        fecha_cierre DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        caja_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
        ventas_turno DECIMAL(10,2) NOT NULL DEFAULT 0,
        monto_real DECIMAL(10,2) NOT NULL DEFAULT 0,
        diferencia DECIMAL(10,2) NOT NULL DEFAULT 0,
        usuario_id INT DEFAULT 1,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Insertar el cierre
    $stmt = $pdo->prepare("
        INSERT INTO cierres_caja 
        (fecha_apertura, caja_inicial, ventas_turno, monto_real, diferencia, usuario_id, observaciones) 
        VALUES (:apertura, :inicial, :ventas, :real, :diferencia, :usuario, :observaciones)
    ");
    
    $stmt->execute([
        ':apertura' => $data['fecha_apertura'] ?? date('Y-m-d H:i:s'),
        ':inicial' => floatval($data['caja_inicial'] ?? 0),
        ':ventas' => floatval($data['ventas_turno'] ?? 0),
        ':real' => floatval($data['monto_real'] ?? 0),
        ':diferencia' => floatval($data['diferencia'] ?? 0),
        ':usuario' => intval($data['usuario_id'] ?? 1),
        ':observaciones' => $data['observaciones'] ?? ''
    ]);
    
    echo json_encode([
        "success" => true, 
        "message" => "Cierre registrado correctamente",
        "id" => $pdo->lastInsertId()
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error de Base de Datos: " . $e->getMessage()]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>