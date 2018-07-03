const express = require('express');
const router = express.Router();
var user_controller = require('../controllers/userController');
const { ensureAuthenticated } = require('../helpers/auth');

// Login page
router.get('/login', user_controller.login_page);

// Process login post
router.post('/login', user_controller.login);

// Register page
router.get('/register', user_controller.register_page);

// Process register post
router.post('/register', user_controller.register);

// Logout User
router.get('/logout', user_controller.logout);

// User profile page
router.get('/profile', ensureAuthenticated, user_controller.profile_page);

// Update user profile
router.post('/profile', ensureAuthenticated, user_controller.update_profile);

// User settings page
router.get('/settings', ensureAuthenticated, user_controller.settings_page);

// Update user datapod
router.post('/settings/datapod', ensureAuthenticated, user_controller.update_datapod);

// Update user password
router.post('/settings/password', ensureAuthenticated, user_controller.update_password);

module.exports = router;