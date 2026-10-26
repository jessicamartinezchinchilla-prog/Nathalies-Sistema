<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['id']) || empty($data['nombre']) || empty($data['email']) || empty($data['rol_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan campos obligatorios"]);
    exit();
}

try {
    $id = intval($data['id']);
    $nombre = trim($data['nombre']);
    $email = trim($data['email']);
    $rol_id = intval($data['rol_id']);
    $estado = $data['estado'] ?? 'Activo';

    // Verificar si el correo pertenece a otro usuario
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email AND id != :id");
    $stmt->execute([':email' => $email, ':id' => $id]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "El correo electrónico ya está en uso por otro usuario"]);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE usuarios
        SET nombre = :nombre, email = :email, rol_id = :rol_id, estado = :estado
        WHERE id = :id
    ");
    $stmt->execute([
        ':nombre' => $nombre,
        ':email' => $email,
        ':rol_id' => $rol_id,
        ':estado' => $estado,
        ':id' => $id
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Usuario actualizado correctamente"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al actualizar usuario: " . $e->getMessage()]);
}
?>
