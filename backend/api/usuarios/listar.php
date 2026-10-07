<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

try {
    require_once '../../config/db.php';
    $stmt = $pdo->query("
        SELECT u.id, u.nombre, u.email, u.estado, u.created_at, r.nombre as rol 
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        ORDER BY u.id DESC
    ");
    echo json_encode(["success" => true, "usuarios" => $stmt->fetchAll()]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>