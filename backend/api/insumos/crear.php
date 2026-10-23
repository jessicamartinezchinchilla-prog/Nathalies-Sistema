<?php
// 1. Forzar que los errores se muestren como JSON (para que React no se rompa)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 2. ENCABEZADOS CORS (Obligatorios)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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

// 3. Leer datos de forma segura
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["error" => "Datos JSON inválidos: " . json_last_error_msg()]);
    exit();
}

// 4. Validaciones flexibles (Evitamos fallos si falta un campo opcional)
$codigo = trim($data['codigo'] ?? '');
$nombre = trim($data['nombre'] ?? '');

if (empty($codigo) || empty($nombre)) {
    http_response_code(400);
    echo json_encode(["error" => "El código y el nombre son obligatorios"]);
    exit();
}

// Usamos ?? para dar valores por defecto y evitar errores de tipo
$costo_unitario = floatval($data['costo_unitario'] ?? $data['costo'] ?? 0);
$stock = intval($data['stock'] ?? 0);
$stock_minimo = intval($data['stock_minimo'] ?? 0);
$estado = trim($data['estado'] ?? 'Activo');

if ($costo_unitario < 0 || $stock < 0 || $stock_minimo < 0) {
    http_response_code(400);
    echo json_encode(["error" => "Los valores numéricos no pueden ser negativos"]);
    exit();
}

try {
    // 5. Conexión a la base de datos
    require_once '../../config/db.php';

    // Verificar nombre único (opcional pero recomendado)
    $stmtCheck = $pdo->prepare("SELECT id FROM insumos WHERE nombre = :nombre LIMIT 1");
    $stmtCheck->execute([':nombre' => $nombre]);
    if ($stmtCheck->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Ya existe un insumo con ese nombre"]);
        exit();
    }

    // 6. INSERTAR (Alineado EXACTAMENTE con las columnas que sabemos que funcionan en tu listar.php)
    // NOTA: Eliminamos 'categoria_id' de aquí porque en tu listar.php no se estaba usando, 
    // y suele ser la causa del "Error 500" silencioso si la tabla no lo tiene o viene null.
    $sql = "INSERT INTO insumos (codigo, nombre, stock, stock_minimo, costo_unitario, estado, created_at)
            VALUES (:codigo, :nombre, :stock, :stock_minimo, :costo_unitario, :estado, NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':codigo' => $codigo,
        ':nombre' => $nombre,
        ':stock' => $stock,
        ':stock_minimo' => $stock_minimo,
        ':costo_unitario' => $costo_unitario,
        ':estado' => $estado
    ]);
    
    echo json_encode([
        "success" => true,
        "message" => "Insumo creado exitosamente",
        "id" => $pdo->lastInsertId()
    ]);
    exit();
    
} catch(PDOException $e) {
    http_response_code(500);
    // Si falla, ahora sí verás el error real en la consola del navegador
    echo json_encode(["error" => "Error de Base de Datos: " . $e->getMessage()]);
    exit();
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error del Servidor: " . $e->getMessage()]);
    exit();
}
?>