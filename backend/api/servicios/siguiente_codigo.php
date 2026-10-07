<?php
require_once '../../config/db.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$categoriaId = intval($_GET['categoria_id'] ?? 0);

if ($categoriaId <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Categoría no válida"]);
    exit();
}

// Mapeo de IDs de categorías a prefijos
$prefijos = [
    10 => 'SRV-UNAS',   // Uñas
    11 => 'SRV-PEST',   // Pestañas
    12 => 'SRV-CEJAS',  // Cejas
    13 => 'SRV-PELO',   // Pelo
];

if (!isset($prefijos[$categoriaId])) {
    http_response_code(400);
    echo json_encode(["error" => "Categoría no encontrada"]);
    exit();
}

$prefijo = $prefijos[$categoriaId];

try {
    $stmt = $pdo->prepare("
        SELECT codigo FROM servicios 
        WHERE codigo LIKE :prefijo 
        ORDER BY codigo DESC 
        LIMIT 1
    ");
    $stmt->execute([':prefijo' => $prefijo . '-%']);
    $ultimo = $stmt->fetch();
    
    if ($ultimo) {
        // Extraer número del último código (ej: SRV-UNAS-003 → 003)
        $partes = explode('-', $ultimo['codigo']);
        $numero = intval(end($partes)) + 1;
    } else {
        $numero = 1;
    }
    
    $nuevoCodigo = $prefijo . '-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    
    echo json_encode([
        "success" => true,
        "codigo" => $nuevoCodigo
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>