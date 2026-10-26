<?php
require_once '../../config/db.php';

try {
    // Asegurar que la columna 'permisos' exista en la tabla 'roles'
    $cols = $pdo->query("DESCRIBE roles")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('permisos', $cols)) {
        $pdo->exec("ALTER TABLE roles ADD COLUMN permisos TEXT NULL AFTER descripcion");
    }

    // Permisos por defecto según cada rol
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

    $stmt = $pdo->query("
        SELECT r.id, r.nombre, r.descripcion, r.permisos, COUNT(u.id) as total_usuarios
        FROM roles r
        LEFT JOIN usuarios u ON u.rol_id = r.id
        GROUP BY r.id, r.nombre, r.descripcion, r.permisos
        ORDER BY r.id ASC
    ");
    $roles = $stmt->fetchAll();

    foreach ($roles as &$rol) {
        if (empty($rol['permisos'])) {
            $perms = $defaultPermisos[$rol['nombre']] ?? ['nueva-venta', 'historial-ventas'];
            $jsonPerms = json_encode($perms);
            $upd = $pdo->prepare("UPDATE roles SET permisos = :permisos WHERE id = :id");
            $upd->execute([':permisos' => $jsonPerms, ':id' => $rol['id']]);
            $rol['permisos'] = $perms;
        } else {
            $decoded = json_decode($rol['permisos'], true);
            $rol['permisos'] = is_array($decoded) ? $decoded : ($defaultPermisos[$rol['nombre']] ?? []);
        }
        $rol['total_usuarios'] = intval($rol['total_usuarios']);
    }

    echo json_encode([
        "success" => true,
        "roles" => $roles
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al listar roles: " . $e->getMessage()]);
}
?>
