<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['id']) || empty($data['nombre']) || !isset($data['categoria_id'])) {
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
    $stmtCheck = $pdo->prepare("SELECT id FROM servicios WHERE nombre = :nombre AND id != :id LIMIT 1");
    $stmtCheck->execute([':nombre' => $data['nombre'], ':id' => $data['id']]);
    if ($stmtCheck->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Ya existe otro servicio con ese nombre"]);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE servicios 
        SET nombre = :nombre, categoria_id = :categoria_id,
            precio = :precio, costo_estimado = :costo_estimado, 
            descripcion = :descripcion, estado = :estado
        WHERE id = :id
    ");
    
    $stmt->execute([
        ':id' => $data['id'],
        ':nombre' => $data['nombre'],
        ':categoria_id' => intval($data['categoria_id']),
        ':precio' => $data['precio'],
        ':costo_estimado' => $data['costo_estimado'],
        ':descripcion' => $data['descripcion'],
        ':estado' => $data['estado']
    ]);
    
    echo json_encode(["success" => true, "message" => "Servicio actualizado exitosamente"]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al actualizar: " . $e->getMessage()]);
}
?>