/**
 * Authentication API Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.put('/profile', authController.updateProfile);
router.put('/password', authController.changePassword);

module.exports = router;
