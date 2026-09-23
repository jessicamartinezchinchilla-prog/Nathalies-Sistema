<?php
require_once '../../config/db.php';

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

// Obtener datos del frontend
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Validar que no estén vacíos
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email y contraseña son requeridos"]);
    exit();
}

try {
    // Buscar usuario en la base de datos
    $stmt = $pdo->prepare("
        SELECT u.id, u.nombre, u.email, u.password, u.estado, u.rol_id, r.nombre as rol_nombre
        FROM usuarios u
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE u.email = :email
    ");
    
    $stmt->execute(['email' => $email]);
    $usuario = $stmt->fetch();

    // Verificar si existe y la contraseña es correcta
    if ($usuario && password_verify($password, $usuario['password'])) {
        
        // Verificar que esté activo
        if ($usuario['estado'] === 'Inactivo') {
            http_response_code(403);
            echo json_encode(["error" => "Usuario inactivo. Contacta al administrador."]);
            exit();
        }

        // Login exitoso - devolver datos del usuario (sin la contraseña)
        unset($usuario['password']);
        
        echo json_encode([
            "success" => true,
            "mensaje" => "Login exitoso",
            "usuario" => $usuario
        ]);
        
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Correo o contraseña incorrectos"]);
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error del servidor: " . $e->getMessage()]);
}
?>