<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

try {
    require_once '../../config/db.php';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT id, nombre, categoria, valor_compra, fecha_compra FROM activos_fijos WHERE estado = 'Activo' ORDER BY fecha_compra DESC");
        echo json_encode(["success" => true, "activos" => $stmt->fetchAll()]);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("INSERT INTO activos_fijos (nombre, categoria, valor_compra, fecha_compra) VALUES (:nombre, :categoria, :valor, :fecha)");
        $stmt->execute([
            ':nombre' => $data['nombre'],
            ':categoria' => $data['categoria'],
            ':valor' => $data['valor_compra'],
            ':fecha' => $data['fecha_compra']
        ]);
        echo json_encode(["success" => true, "message" => "Activo registrado"]);
        exit();
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>