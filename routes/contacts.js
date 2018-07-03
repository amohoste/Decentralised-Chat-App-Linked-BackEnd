const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');

var contact_controller = require('../controllers/contactController');

// Contact list page
router.get('/', ensureAuthenticated, contact_controller.contact_list_page);

// Add contact page
router.get('/add', ensureAuthenticated, contact_controller.add_contact_page);

// Process add contact
router.post('/add', ensureAuthenticated, contact_controller.add_contact);

// Edit contact page
router.get('/edit/:id', ensureAuthenticated, contact_controller.edit_contact_page);

// Process edit contact
router.put('/:id', ensureAuthenticated, contact_controller.update_contact);

// Process delete contact
router.delete('/:id', ensureAuthenticated, contact_controller.delete_contact);

// Contact info page
router.get('/:id', ensureAuthenticated, contact_controller.contact_info_page);

module.exports = router;