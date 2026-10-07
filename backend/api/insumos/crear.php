<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['codigo']) || empty($data['nombre']) || !isset($data['categoria_id']) || !isset($data['costo_unitario'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan campos obligatorios"]);
    exit();
}

if ($data['costo_unitario'] < 0 || $data['stock'] < 0 || $data['stock_minimo'] < 0) {
    http_response_code(400);
    echo json_encode(["error" => "Los valores numéricos no pueden ser negativos"]);
    exit();
}

try {
    // Verificar nombre único
    $stmtCheck = $pdo->prepare("SELECT id FROM insumos WHERE nombre = :nombre LIMIT 1");
    $stmtCheck->execute([':nombre' => $data['nombre']]);
    if ($stmtCheck->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Ya existe un insumo con ese nombre"]);
        exit();
    }

    $stmt = $pdo->prepare("
        INSERT INTO insumos (codigo, nombre, categoria_id, stock, stock_minimo, costo_unitario, estado)
        VALUES (:codigo, :nombre, :categoria_id, :stock, :stock_minimo, :costo_unitario, :estado)
    ");
    
    $stmt->execute([
        ':codigo' => $data['codigo'],
        ':nombre' => $data['nombre'],
        ':categoria_id' => intval($data['categoria_id']),
        ':stock' => $data['stock'] ?? 0,
        ':stock_minimo' => $data['stock_minimo'] ?? 0,
        ':costo_unitario' => $data['costo_unitario'],
        ':estado' => $data['estado'] ?? 'Activo'
    ]);
    
    echo json_encode([
        "success" => true,
        "message" => "Insumo creado exitosamente",
        "id" => $pdo->lastInsertId()
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al crear insumo: " . $e->getMessage()]);
}
?>