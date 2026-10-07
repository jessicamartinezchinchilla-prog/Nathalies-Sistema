<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

try {
    require_once '../../config/db.php';
    $data = json_decode(file_get_contents("php://input"), true);

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO configuracion_sistema (clave, valor) 
        VALUES (:clave, :valor) 
        ON DUPLICATE KEY UPDATE valor = :valor
    ");

    foreach ($data as $clave => $valor) {
        $stmt->execute([
            ':clave' => $clave,
            ':valor' => $valor
        ]);
    }

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Configuración guardada exitosamente"]);

} catch(Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $e->getMessage()]);
}
?>