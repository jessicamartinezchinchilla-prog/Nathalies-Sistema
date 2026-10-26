<?php
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Correo y contraseña son requeridos"]);
    exit();
}

try {
    // Asegurar que la columna 'permisos' exista en 'roles'
    $cols = $pdo->query("DESCRIBE roles")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('permisos', $cols)) {
        $pdo->exec("ALTER TABLE roles ADD COLUMN permisos TEXT NULL AFTER descripcion");
    }

    $stmt = $pdo->prepare("
        SELECT u.id, u.nombre, u.email, u.password, u.rol_id, u.estado, r.nombre as rol, r.permisos
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.email = :email
    ");
    $stmt->execute([':email' => $data['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(["error" => "Credenciales inválidas"]);
        exit();
    }

    if ($user['estado'] !== 'Activo') {
        http_response_code(403);
        echo json_encode(["error" => "Cuenta inactiva. Contacta al administrador."]);
        exit();
    }

    $defaultPermisos = [
        'Administrador' => [
            'dashboard', 'nueva-venta', 'historial-ventas',
            'productos', 'insumos', 'servicios',
            'compras', 'proveedores', 'cuentas-pagar',
            'gastos', 'contabilidad', 'reportes',
            'usuarios', 'configuracion'
        ],
        'Contador' => [
            'dashboard', 'historial-ventas',
            'compras', 'proveedores', 'cuentas-pagar',
            'gastos', 'contabilidad', 'reportes'
        ],
        'Cajero' => [
            'nueva-venta', 'historial-ventas',
            'productos', 'insumos', 'servicios'
        ]
    ];

    if (!empty($user['permisos'])) {
        $decoded = json_decode($user['permisos'], true);
        $user['permisos'] = is_array($decoded) ? $decoded : ($defaultPermisos[$user['rol']] ?? []);
    } else {
        $user['permisos'] = $defaultPermisos[$user['rol']] ?? ['nueva-venta', 'historial-ventas'];
    }

    unset($user['password']);

    echo json_encode([
        "success" => true,
        "user" => $user,
        "usuario" => $user,
        "message" => "Bienvenido, " . $user['nombre']
    ]);
    exit();

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error del servidor: " . $e->getMessage()]);
    exit();
}
?>
