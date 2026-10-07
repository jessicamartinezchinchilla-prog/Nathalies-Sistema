<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
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

try {
    require_once '../../config/db.php';
    
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['descripcion']) || !isset($data['categoria_id']) || !isset($data['monto']) || empty($data['metodo_pago'])) {
        http_response_code(400);
        echo json_encode(["error" => "Faltan campos obligatorios"]);
        exit();
    }

    // Generar código automático
    $stmt = $pdo->query("SELECT codigo FROM gastos ORDER BY id DESC LIMIT 1");
    $ultimo = $stmt->fetch();
    $numero = $ultimo ? intval(substr($ultimo['codigo'], 4)) + 1 : 1;
    $codigo = 'GAS-' . str_pad($numero, 4, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO gastos (codigo, fecha, descripcion, categoria_id, monto, metodo_pago, usuario_id, estado)
        VALUES (:codigo, :fecha, :descripcion, :categoria_id, :monto, :metodo_pago, :usuario_id, 'Activo')
    ");
    
    $stmt->execute([
        ':codigo' => $codigo,
        ':fecha' => $data['fecha'] ?? date('Y-m-d'),
        ':descripcion' => $data['descripcion'],
        ':categoria_id' => intval($data['categoria_id']),
        ':monto' => floatval($data['monto']),
        ':metodo_pago' => $data['metodo_pago'],
        ':usuario_id' => $data['usuario_id'] ?? 1
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Gasto registrado",
        "codigo" => $codigo
    ]);
    exit();

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
    exit();
}
?>