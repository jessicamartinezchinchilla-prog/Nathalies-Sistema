<?php
// 1. ENCABEZADOS CORS (¡ESTO ES LO QUE FALTABA Y CAUSABA EL ERROR DE CONEXIÓN!)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Manejar la petición de prueba del navegador (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. TU LÓGICA ORIGINAL (Intacta y funcionando)
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['codigo']) || empty($data['nombre']) || !isset($data['categoria_id']) || !isset($data['precio'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan campos obligatorios"]);
    exit();
}

// Corrección segura: verificar que costo_estimado exista antes de compararlo
$costo = $data['costo_estimado'] ?? 0;
if ($data['precio'] < 0 || $costo < 0) {
    http_response_code(400);
    echo json_encode(["error" => "Los valores numéricos no pueden ser negativos"]);
    exit();
}

try {
    $stmtCheck = $pdo->prepare("SELECT id FROM servicios WHERE nombre = :nombre LIMIT 1");
    $stmtCheck->execute([':nombre' => $data['nombre']]);
    if ($stmtCheck->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Ya existe un servicio con ese nombre"]);
        exit();
    }

    $stmt = $pdo->prepare("
        INSERT INTO servicios (codigo, nombre, categoria_id, precio, costo_estimado, descripcion, estado)
        VALUES (:codigo, :nombre, :categoria_id, :precio, :costo_estimado, :descripcion, :estado)
    ");
    
    $stmt->execute([
        ':codigo' => $data['codigo'],
        ':nombre' => $data['nombre'],
        ':categoria_id' => intval($data['categoria_id']),
        ':precio' => floatval($data['precio']),
        ':costo_estimado' => floatval($costo),
        ':descripcion' => $data['descripcion'] ?? '',
        ':estado' => $data['estado'] ?? 'Activo'
    ]);
    
    echo json_encode([
        "success" => true,
        "message" => "Servicio creado exitosamente",
        "id" => $pdo->lastInsertId()
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al crear servicio: " . $e->getMessage()]);
}
?>