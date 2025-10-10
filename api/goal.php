<?php
// goal.php

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

header('Content-Type: application/json');

require 'config.php';

$demoUserId = 1;
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM weekly_goals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$demoUserId]);
    $goal = $stmt->fetch();

    echo json_encode($goal ? ['goal' => (int)$goal['goal']] : null);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['goal'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid payload']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO weekly_goals (user_id, goal) VALUES (?, ?)");
    $stmt->execute([$demoUserId, $data['goal']]);

    echo json_encode(['success' => true]);
}
?>