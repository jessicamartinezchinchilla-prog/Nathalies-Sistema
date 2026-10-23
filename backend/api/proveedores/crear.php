<?php
// 1. Forzar a PHP a mostrar errores (para depurar)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 2. CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['nombre'])) {
    http_response_code(400);
    echo json_encode(["error" => "El nombre del servicio es obligatorio"]);
    exit();
}

try {
    // 3. Conexión a la base de datos
    require_once '../../config/db.php';
    
    // Generar código
    $stmt = $pdo->query("SELECT MAX(id) as max_id FROM servicios");
    $max = $stmt->fetch();
    $nuevo_id = ($max['max_id'] ?? 0) + 1;
    $codigo = 'SERV-' . str_pad($nuevo_id, 3, '0', STR_PAD_LEFT);
    
    // 4. Insertar (Ajusta 'descripcion' o 'costo_estimado' si tu tabla no tiene esas columnas)
    $sql = "INSERT INTO servicios (codigo, nombre, precio, estado, created_at)
            VALUES (:codigo, :nombre, :precio, 'Activo', NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':codigo' => $codigo,
        ':nombre' => trim($data['nombre']),
        ':precio' => floatval($data['precio'] ?? 0)
    ]);
    
    echo json_encode([
        "success" => true,
        "message" => "Servicio registrado correctamente",
        "codigo" => $codigo
    ]);
    exit();
    
} catch(PDOException $e) {
    http_response_code(500);
    // Aquí es donde veremos el error real si algo falla
    echo json_encode(["error" => "ERROR DE BASE DE DATOS: " . $e->getMessage()]);
    exit();
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "ERROR GENERAL: " . $e->getMessage()]);
    exit();
}
?>