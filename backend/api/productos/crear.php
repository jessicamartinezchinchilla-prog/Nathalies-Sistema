<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['codigo']) || empty($data['nombre']) || !isset($data['precio_venta']) || !isset($data['costo'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan campos obligatorios"]);
    exit();
}

// Validar que no haya números negativos
if ($data['precio_venta'] < 0 || $data['costo'] < 0 || $data['stock'] < 0 || $data['stock_minimo'] < 0) {
    http_response_code(400);
    echo json_encode(["error" => "Los valores numéricos no pueden ser negativos"]);
    exit();
}

try {
    // Verificar que el nombre no exista ya
    $stmtCheck = $pdo->prepare("SELECT id FROM productos WHERE nombre = :nombre LIMIT 1");
    $stmtCheck->execute([':nombre' => $data['nombre']]);
    if ($stmtCheck->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Ya existe un producto con ese nombre"]);
        exit();
    }

    $stmt = $pdo->prepare("
        INSERT INTO productos (codigo, nombre, categoria, precio_venta, costo, stock, stock_minimo, estado)
        VALUES (:codigo, :nombre, :categoria, :precio_venta, :costo, :stock, :stock_minimo, :estado)
    ");
    
    $stmt->execute([
        ':codigo' => $data['codigo'],
        ':nombre' => $data['nombre'],
        ':categoria' => $data['categoria'] ?? 'Otro',
        ':precio_venta' => $data['precio_venta'],
        ':costo' => $data['costo'],
        ':stock' => $data['stock'] ?? 0,
        ':stock_minimo' => $data['stock_minimo'] ?? 0,
        ':estado' => $data['estado'] ?? 'Activo'
    ]);
    
    echo json_encode([
        "success" => true,
        "message" => "Producto creado exitosamente",
        "id" => $pdo->lastInsertId()
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al crear producto: " . $e->getMessage()]);
}
?>