const request = require('request-promise-native');
const { sort_by_properties } = require('../helpers/sorters');
const formvalidator = require('../helpers/formvalidator');
const { FormError } = require('../errors/errors');
const pod = require('../helpers/datapods');
const urljoin = require('url-join');
const { urlcompare } = require('../helpers/url_helpers');
const ldf = require('ldf-client');
const { executeQuery } = require('../helpers/executequery');
const parser = require('../helpers/parsers');

// Contact list page
exports.contact_list_page = function (req, res) {

    pod.getContacts(req.user.maker, req.user.datapod).then(contacts => {
        res.render('contacts/index', {
            contacts: contacts // Pass contacts to handlebars
        });
    }).catch(err => {
        req.flash('error_msg', err.toString());
        console.error(err);
    });
}

// Add contact page
exports.add_contact_page = function (req, res) {
    res.render('contacts/add');
}

// Process add contact
exports.add_contact = function (req, res) {

    validateContactForm(req, res).then(() => {
        return pod.verifyContact(req.user.datapod, req.body.reference);
    }).then(() => {
        return pod.hasContact(req.user.datapod, req.user.maker, req.body.reference);
    }).then(hascontact => {
        if (hascontact) {
            throw(new Error("Contact already exists"));
        } else {
            return pod.addContact(req.user.datapod, req.user.maker, req.body.reference, req.body.nickname);
        }
    }).then(() => {
        req.flash('success_msg', 'Contact added'); // Flash success message
        res.redirect('/contacts');
    }).catch((err) => {
        let args = {reference: req.body.reference, nickname: req.body.nickname};
        handleFormErrors(err, args);
        res.render('contacts/add', args);
    });

}

// Edit contact page
exports.edit_contact_page = function (req, res) {

    pod.getContact(req.user.maker, req.user.datapod, decodeURIComponent(req.params.id)).then(contact => {
        res.render('contacts/edit', contact);
    }).catch((err) => {
        req.flash('error_msg', err.toString());
        console.error(err);
    });
}

// Process edit contact
exports.update_contact = function (req, res) {

    return pod.verifyContact(req.user.datapod, req.body.reference).then(() => {
        return pod.updateContact(req.user.datapod, req.user.maker, req.params.id, req.body.reference, req.body.nickname);
    }).then(() => {
        req.flash('success_msg', 'Contact updated'); // Flash success message
        res.redirect('/contacts');
    }).catch((err) => {
        let args = {reference: req.body.reference, nickname: req.body.nickname, id: req.params.id };
        handleFormErrors(err, args);
        res.render('contacts/edit', args);
    });
}
// Process delete contact
exports.delete_contact = function (req, res) {

    pod.deleteContact(req.user.datapod, req.user.maker, decodeURIComponent(req.params.id)).then(() => {
        req.flash('success_msg', 'Contact removed'); // Flash success message
        res.redirect('/contacts');
    }).catch((err) => {
        req.flash('error_msg', err.toString());
        console.error(err);
    });
}

// Contact info page
exports.contact_info_page = function (req, res) {

    pod.getFullContact(req.user.datapod, req.user.maker, decodeURIComponent(req.params.id)).then(contact => {
        res.render('contacts/info', contact);
    }).catch(err => {
        req.flash('error_msg', err.toString());
        console.error(err);
    });

}

/* ------------------------- *
 *     Helper functions      *
 * ------------------------- */  

// Checks if all form fields are filled in and are correct
function validateContactForm(req, res) {
    return formvalidator.validate(req, res, [
        [!urlcompare(req.body.reference, req.user.datapod), 'You can\'t add yourself as a contact.'],
        [req.body.nickname, 'Please fill in a nickname'],
        [req.body.reference, 'Please fill in a data pod url']
    ]).catch((errorlist) => Promise.reject(new FormError(errorlist)));
}

function handleFormErrors(err, args) {
    if (err instanceof FormError) {
        args["errors"] = err.errorlist;
    } else if (err instanceof Error) {
        let text = err.toString().includes("UnsupportedQueryError") ? 'Url doesn\'t point to a valid contact pod' : err.toString();
        args["errors"] = [{ text: text }];
    } else {
        req.flash('error_msg', err.toString());
        console.error(err);
    }
}