<?php
// 1. ENCABEZADOS CORS (Obligatorios para que React pueda conectar)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Manejar la petición de prueba del navegador (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    require_once '../../config/db.php';

    // 2. AQUÍ ESTÁ EL CAMBIO: Agregamos 'codigo' al SELECT
    $stmt = $pdo->query("
        SELECT id, codigo, nombre, contacto, telefono, email, estado, created_at 
        FROM proveedores 
        ORDER BY nombre ASC
    ");
    
    echo json_encode([
        "success" => true, 
        "proveedores" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al consultar proveedores: " . $e->getMessage()]);
}
?>