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
    $stmt = $pdo->prepare("SELECT estado FROM insumos WHERE id = :id");
    $stmt->execute([':id' => $data['id']]);
    $insumo = $stmt->fetch();
    
    if (!$insumo) {
        http_response_code(404);
        echo json_encode(["error" => "Insumo no encontrado"]);
        exit();
    }
    
    $nuevoEstado = $insumo['estado'] === 'Activo' ? 'Inactivo' : 'Activo';
    
    $stmt = $pdo->prepare("UPDATE insumos SET estado = :estado WHERE id = :id");
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