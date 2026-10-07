<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit();
}

$data = json_decode(file_get_contents("php://input"), true);

try {
    require_once '../../config/db.php';
    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    
    $pdo->prepare("UPDATE usuarios SET password = :password WHERE id = :id")
        ->execute([':password' => $hash, ':id' => $data['id']]);
        
    echo json_encode(["success" => true, "message" => "Contraseña actualizada"]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>