const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');

var message_controller = require('../controllers/messageController');

// Message list page
router.get('/', ensureAuthenticated, message_controller.message_list_page);

// New chat page
router.get('/new', ensureAuthenticated, message_controller.new_chat_page);

// Process new chat
router.post('/new/:id', ensureAuthenticated, message_controller.new_chat);

// Chat page
router.get('/:id', ensureAuthenticated, message_controller.chat_page);

// Process send message
router.post('/:id', ensureAuthenticated, message_controller.send_message);

module.exports = router;