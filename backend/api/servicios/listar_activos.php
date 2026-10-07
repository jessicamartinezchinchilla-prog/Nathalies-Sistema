<?php
require_once '../../config/db.php';

// Configurar headers para JSON
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

// Desactivar output buffering para evitar caracteres extra
ob_clean();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    $stmt = $pdo->query("SELECT id, codigo, nombre, precio FROM servicios WHERE estado = 'Activo' ORDER BY nombre ASC");
    $servicios = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "servicios" => $servicios
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}

// Limpiar cualquier output adicional
exit();
?>