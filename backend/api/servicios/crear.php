<?php
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

if ($data['precio'] < 0 || $data['costo_estimado'] < 0) {
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
        ':precio' => $data['precio'],
        ':costo_estimado' => $data['costo_estimado'] ?? 0,
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