import express from 'express';

const router = express.Router();

// This route exists to separate normal HTTP requests from WebSocket upgrades.
// Non-upgrade HTTP requests to /socket will receive a 426 (Upgrade Required).
router.get('/', (req, res) => {
    res.status(426).json({ message: 'This endpoint is reserved for WebSocket upgrades.' });
});

export default router;
