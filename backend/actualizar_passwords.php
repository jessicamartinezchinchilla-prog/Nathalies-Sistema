<?php
require_once 'config/db.php';

// Actualizamos las contraseñas de los usuarios 1 y 2 con hashes seguros
$usuarios = [
    [1, 'jessi123'], // ID 1: Jessica
    [2, 'nicol123']  // ID 2: Nicole
];

foreach ($usuarios as $u) {
    $hash = password_hash($u[1], PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE usuarios SET password = ? WHERE id = ?");
    $stmt->execute([$hash, $u[0]]);
    echo "✅ Contraseña actualizada para el usuario ID: {$u[0]}<br>";
}

echo "<br><strong>¡Listo! Ahora BORRA este archivo por seguridad.</strong>";
?>