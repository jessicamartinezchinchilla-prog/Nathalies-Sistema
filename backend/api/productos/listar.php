<?php
require_once '../../config/db.php';

// Permitir solo método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    // Consultar todos los productos activos
    $stmt = $pdo->prepare("
        SELECT 
            id,
            codigo,
            nombre,
            categoria,
            precio_venta,
            costo,
            stock,
            stock_minimo,
            estado,
            created_at,
            updated_at
        FROM productos
        ORDER BY nombre ASC
    ");
    
    $stmt->execute();
    $productos = $stmt->fetchAll();
    
    // Devolver los productos en formato JSON
    echo json_encode([
        "success" => true,
        "productos" => $productos,
        "total" => count($productos)
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Error al consultar productos: " . $e->getMessage()
    ]);
}
?>