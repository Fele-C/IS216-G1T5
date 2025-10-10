<?php
// activities.php

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

header('Content-Type: application/json');

require 'config.php';

$demoUserId = 1; // demo user
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'week') {
        // All activities this week
        $stmt = $pdo->prepare("
            SELECT id, activity, date, duration 
            FROM activities 
            WHERE user_id = ? AND YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)
            ORDER BY date DESC
        ");
        $stmt->execute([$demoUserId]);
        echo json_encode($stmt->fetchAll());

    } elseif ($action === 'latest') {
        // Latest 5 activities
        $stmt = $pdo->prepare("
            SELECT id, activity, date, duration 
            FROM activities 
            WHERE user_id = ? 
            ORDER BY date DESC 
            LIMIT 5
        ");
        $stmt->execute([$demoUserId]);
        echo json_encode($stmt->fetchAll());

    } elseif ($action === 'top') {
        // Top 5 most frequent activities
        $stmt = $pdo->prepare("
            SELECT activity, COUNT(*) as count 
            FROM activities 
            WHERE user_id = ? 
            GROUP BY activity 
            ORDER BY count DESC 
            LIMIT 5
        ");
        $stmt->execute([$demoUserId]);
        echo json_encode($stmt->fetchAll());

    } else {
        echo json_encode(['error' => 'Invalid action']);
    }

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['activity'], $data['date'], $data['duration'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid payload']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO activities (user_id, activity, date, duration) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$demoUserId, $data['activity'], $data['date'], $data['duration']]);

    // Return the inserted activity in the same format the frontend expects
    $insertedId = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT id, activity, date, duration FROM activities WHERE id = ?");
    $stmt->execute([$insertedId]);
    $newActivity = $stmt->fetch();

    echo json_encode(['success' => true, 'activity' => $newActivity]);
}
?>