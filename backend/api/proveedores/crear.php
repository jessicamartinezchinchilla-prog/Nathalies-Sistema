<?php
// HEADERS CORS DIRECTOS (Para asegurar que siempre se envíen)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['nombre'])) {
    http_response_code(400);
    echo json_encode(["error" => "El nombre es obligatorio"]);
    exit();
}

if (empty($data['telefono'])) {
    http_response_code(400);
    echo json_encode(["error" => "El teléfono es obligatorio"]);
    exit();
}

if (!preg_match('/^\d{8}$/', $data['telefono'])) {
    http_response_code(400);
    echo json_encode(["error" => "El teléfono debe tener exactamente 8 números"]);
    exit();
}

if (empty($data['email'])) {
    http_response_code(400);
    echo json_encode(["error" => "El correo es obligatorio"]);
    exit();
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "El correo debe tener un formato válido (ej: algo@correo.com)"]);
    exit();
}

try {
    // Aquí sí usamos require_once para la base de datos
    require_once '../../config/db.php';
    
    $stmt = $pdo->query("SELECT MAX(id) as max_id FROM proveedores");
    $max = $stmt->fetch();
    $nuevo_id = ($max['max_id'] ?? 0) + 1;
    $codigo = 'PROV-' . str_pad($nuevo_id, 3, '0', STR_PAD_LEFT);
    
    // CAMBIO IMPORTANTE: Usar 'contacto' en lugar de 'direccion'
    $stmt = $pdo->prepare("
        INSERT INTO proveedores (codigo, nombre, contacto, telefono, email, estado, created_at)
        VALUES (:codigo, :nombre, :contacto, :telefono, :email, 'Activo', NOW())
    ");
    
    $stmt->execute([
        ':codigo' => $codigo,
        ':nombre' => trim($data['nombre']),
        ':contacto' => trim($data['direccion'] ?? ''), // Usamos 'direccion' del frontend pero lo guardamos en 'contacto'
        ':telefono' => trim($data['telefono']),
        ':email' => trim($data['email'])
    ]);
    
    echo json_encode([
        "success" => true,
        "message" => "Proveedor registrado correctamente",
        "codigo" => $codigo
    ]);
    exit();
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar: " . $e->getMessage()]);
    exit();
}
?>