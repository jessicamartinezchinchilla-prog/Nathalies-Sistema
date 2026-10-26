<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['id']) || !isset($data['permisos']) || !is_array($data['permisos'])) {
    http_response_code(400);
    echo json_encode(["error" => "Datos de rol y permisos incompletos"]);
    exit();
}

try {
    // Asegurar que exista la columna permisos
    $cols = $pdo->query("DESCRIBE roles")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('permisos', $cols)) {
        $pdo->exec("ALTER TABLE roles ADD COLUMN permisos TEXT NULL AFTER descripcion");
    }

    $id = intval($data['id']);
    $permisos = array_values(array_unique($data['permisos']));

    // Garantizar que el Administrador (id = 1) nunca pierda acceso a Usuarios y Roles
    if ($id === 1 && !in_array('usuarios', $permisos)) {
        $permisos[] = 'usuarios';
    }

    $descripcion = isset($data['descripcion']) ? trim($data['descripcion']) : null;

    if ($descripcion !== null) {
        $stmt = $pdo->prepare("UPDATE roles SET permisos = :permisos, descripcion = :descripcion WHERE id = :id");
        $stmt->execute([
            ':permisos' => json_encode($permisos),
            ':descripcion' => $descripcion,
            ':id' => $id
        ]);
    } else {
        $stmt = $pdo->prepare("UPDATE roles SET permisos = :permisos WHERE id = :id");
        $stmt->execute([
            ':permisos' => json_encode($permisos),
            ':id' => $id
        ]);
    }

    echo json_encode([
        "success" => true,
        "message" => "Permisos del rol actualizados correctamente",
        "permisos" => $permisos
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar permisos: " . $e->getMessage()]);
}
?>
