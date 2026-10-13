<?php
require_once 'config/db.php';

echo "<h2>🔍 Diagnóstico de la tabla de proveedores</h2>";
echo "<p>Base de datos conectada: <strong>" . $dbname . "</strong></p>";

try {
    // 1. Verificar si la tabla existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'proveedores'");
    if ($stmt->rowCount() == 0) {
        echo "<p style='color:red'>❌ La tabla 'proveedores' NO existe en esta base de datos.</p>";
        echo "<p>Tablas disponibles: ";
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo "<strong>" . implode(", ", $tables) . "</strong></p>";
        echo "<p>💡 <em>Nota: Si tu tabla se llama 'proveedor' (en singular), avísame para cambiar el código.</em></p>";
        exit;
    }
    
    echo "<p style='color:green'>✅ La tabla 'proveedores' SÍ existe.</p>";

    // 2. Verificar qué columnas tiene actualmente
    $cols = $pdo->query("DESCRIBE proveedores")->fetchAll(PDO::FETCH_COLUMN);
    echo "<p>Columnas actuales: <strong>" . implode(", ", $cols) . "</strong></p>";

    // 3. Agregar la columna 'codigo' si no existe
    if (!in_array('codigo', $cols)) {
        echo "<p>⚠️ La columna 'codigo' no existe. Intentando agregarla...</p>";
        $pdo->exec("ALTER TABLE proveedores ADD COLUMN codigo VARCHAR(20) AFTER id");
        echo "<p style='color:green; font-weight:bold;'>✅ ¡Columna 'codigo' agregada exitosamente!</p>";
        
        // Verificar de nuevo para confirmar
        $cols = $pdo->query("DESCRIBE proveedores")->fetchAll(PDO::FETCH_COLUMN);
        echo "<p>Nuevas columnas: <strong>" . implode(", ", $cols) . "</strong></p>";
    } else {
        echo "<p style='color:green; font-weight:bold;'>✅ La columna 'codigo' YA existe.</p>";
        echo "<p>Si sigue fallando, es posible que el archivo <code>crear.php</code> esté apuntando a otra base de datos o haya un error de tipeo.</p>";
    }

} catch (PDOException $e) {
    echo "<p style='color:red; font-weight:bold;'>❌ Error de base de datos: " . $e->getMessage() . "</p>";
}
?>