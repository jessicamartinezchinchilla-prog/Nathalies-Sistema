<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

try {
    require_once '../../config/db.php';
    
    $stmt = $pdo->query("SELECT clave, valor FROM configuracion_sistema");
    $config = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // Devuelve un array asociativo ['clave' => 'valor']
    
    echo json_encode([
        "success" => true,
        "config" => $config
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>