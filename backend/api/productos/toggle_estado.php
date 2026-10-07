<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "ID requerido"]);
    exit();
}

try {
    // Obtener estado actual
    $stmt = $pdo->prepare("SELECT estado FROM productos WHERE id = :id");
    $stmt->execute([':id' => $data['id']]);
    $producto = $stmt->fetch();
    
    if (!$producto) {
        http_response_code(404);
        echo json_encode(["error" => "Producto no encontrado"]);
        exit();
    }
    
    $nuevoEstado = $producto['estado'] === 'Activo' ? 'Inactivo' : 'Activo';
    
    $stmt = $pdo->prepare("UPDATE productos SET estado = :estado WHERE id = :id");
    $stmt->execute([':estado' => $nuevoEstado, ':id' => $data['id']]);
    
    echo json_encode([
        "success" => true, 
        "message" => "Estado actualizado",
        "nuevo_estado" => $nuevoEstado
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>