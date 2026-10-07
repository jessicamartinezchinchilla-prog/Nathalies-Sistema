<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit();
}

$data = json_decode(file_get_contents("php://input"), true);

try {
    require_once '../../config/db.php';
    
    $stmt = $pdo->prepare("SELECT estado FROM usuarios WHERE id = :id");
    $stmt->execute([':id' => $data['id']]);
    $user = $stmt->fetch();
    
    $nuevoEstado = $user['estado'] === 'Activo' ? 'Inactivo' : 'Activo';
    
    $pdo->prepare("UPDATE usuarios SET estado = :estado WHERE id = :id")
        ->execute([':estado' => $nuevoEstado, ':id' => $data['id']]);
        
    echo json_encode(["success" => true, "nuevo_estado" => $nuevoEstado]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>