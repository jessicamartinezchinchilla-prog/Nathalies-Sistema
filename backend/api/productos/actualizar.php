<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['id']) || empty($data['nombre'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan campos obligatorios"]);
    exit();
}

if ($data['precio_venta'] < 0 || $data['costo'] < 0 || $data['stock'] < 0 || $data['stock_minimo'] < 0) {
    http_response_code(400);
    echo json_encode(["error" => "Los valores numéricos no pueden ser negativos"]);
    exit();
}

try {
    // Verificar que el nombre no exista en OTRO producto
    $stmtCheck = $pdo->prepare("SELECT id FROM productos WHERE nombre = :nombre AND id != :id LIMIT 1");
    $stmtCheck->execute([':nombre' => $data['nombre'], ':id' => $data['id']]);
    if ($stmtCheck->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Ya existe otro producto con ese nombre"]);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE productos 
        SET nombre = :nombre, categoria = :categoria, precio_venta = :precio_venta, 
            costo = :costo, stock = :stock, stock_minimo = :stock_minimo, estado = :estado
        WHERE id = :id
    ");
    
    $stmt->execute([
        ':id' => $data['id'],
        ':nombre' => $data['nombre'],
        ':categoria' => $data['categoria'],
        ':precio_venta' => $data['precio_venta'],
        ':costo' => $data['costo'],
        ':stock' => $data['stock'],
        ':stock_minimo' => $data['stock_minimo'],
        ':estado' => $data['estado']
    ]);
    
    echo json_encode(["success" => true, "message" => "Producto actualizado exitosamente"]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al actualizar: " . $e->getMessage()]);
}
?>