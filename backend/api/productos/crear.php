<?php
// 1. ENCABEZADOS CORS (Obligatorios para que React pueda enviar datos)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Manejar la petición de prueba del navegador (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. VERIFICAR QUE SEA UNA PETICIÓN POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

// 3. LEER DATOS DEL FRONTEND
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data)) {
    http_response_code(400);
    echo json_encode(["error" => "No se recibieron datos"]);
    exit();
}

// Validar campos obligatorios
if (empty($data['nombre']) || empty($data['codigo'])) {
    http_response_code(400);
    echo json_encode(["error" => "El nombre y el código son obligatorios"]);
    exit();
}

try {
    // 4. CONEXIÓN A LA BASE DE DATOS
    require_once '../../config/db.php';

    // 5. PREPARAR LA CONSULTA SQL (Usando las columnas exactas de tu tabla)
    $sql = "INSERT INTO productos (
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
            ) VALUES (
                :codigo, 
                :nombre, 
                :categoria, 
                :precio_venta, 
                :costo, 
                :stock, 
                :stock_minimo, 
                :estado,
                NOW(),
                NOW()
            )";

    $stmt = $pdo->prepare($sql);
    
    // 6. EJECUTAR CON LOS DATOS (con valores por defecto seguros)
    $stmt->execute([
        ':codigo' => trim($data['codigo']),
        ':nombre' => trim($data['nombre']),
        ':categoria' => trim($data['categoria'] ?? 'General'),
        ':precio_venta' => floatval($data['precio_venta'] ?? 0),
        ':costo' => floatval($data['costo'] ?? 0),
        ':stock' => intval($data['stock'] ?? 0),
        ':stock_minimo' => intval($data['stock_minimo'] ?? 5),
        ':estado' => trim($data['estado'] ?? 'Activo')
    ]);

    // 7. RESPUESTA EXITOSA
    echo json_encode([
        "success" => true,
        "message" => "Producto registrado correctamente",
        "id" => $pdo->lastInsertId()
    ]);
    exit();

} catch (PDOException $e) {
    // Si hay un error de SQL, nos dirá EXACTAMENTE cuál es (ej. columna desconocida)
    http_response_code(500);
    echo json_encode([
        "error" => "Error de Base de Datos: " . $e->getMessage()
    ]);
    exit();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Error del Servidor: " . $e->getMessage()
    ]);
    exit();
}
?>