const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { inviteGenerateLimiter } = require('../middleware/rateLimiter');
const inviteController = require('../controllers/inviteController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(auth);
router.use(adminAuth);

// Invite management
router.post('/invites/generate', inviteGenerateLimiter, inviteController.generate);
router.post('/invites/generate-bulk', inviteGenerateLimiter, inviteController.generateBulk);
router.get('/invites', inviteController.list);
router.get('/invites/stats', inviteController.stats);
router.patch('/invites/:id/revoke', inviteController.revoke);
router.delete('/invites/:id', inviteController.remove);

module.exports = router;
