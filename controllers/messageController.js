const request = require('request-promise-native');
const _ = require('underscore');
const { sort_by_properties } = require('../helpers/sorters');
const pod = require('../helpers/datapods');
const { ContactError } = require('../errors/errors');
const { urlcompare } = require('../helpers/url_helpers')
const { URL } = require('url');

// Message list page
exports.message_list_page = function (req, res) {

    pod.getAllMessages(req.user.datapod, req.user.maker).then(messages => {
        res.render('messages/messagelist', {
            chatheads: messages
        });
    }).catch(err => {
        req.flash('error_msg', err.toString());
        console.error(err);
    });

}

// Chat page
exports.chat_page = function (req, res) {
    
    let contact = pod.getFullContact(req.user.datapod, req.user.maker, req.params.id);
    let messages = pod.getChat(req.user.datapod, req.user.maker, req.params.id);

    Promise.all([contact, messages]).then(([contact, msgs]) => {

        let messages = msgs.sort(sort_by_properties(new Map([["creation_date", "asc"]])));
        
        // Add correct date to each message
        messages.forEach(message => {
            let dat = new Date(message.creation_date);
            message.creation_date = dat.toDateString() + ' - ' + dat.getHours() + ':' + (dat.getMinutes() < 10 ? '0' : '') + dat.getMinutes();
        });

        // Render chat page
        res.render('messages/chat', {
            messages: messages,
            id: encodeURIComponent(req.params.id),
            firstname: contact.firstname,
            lastname: contact.lastname,
            image: contact.image,
            nickname: contact.nickname
        });
    }).catch((err) => {
        if (err instanceof ContactError) {
            req.flash('error_msg', err.text);
            res.redirect('/messages/');
        } else {
            req.flash('error_msg', err.toString());
            console.error(err);
        }
    });
}

// Process send message
exports.send_message = function (req, res) {
    if (req.body.message) {
        pod.sendMessage(req.user.datapod, req.user.maker, req.params.id, req.body.message).then(() => {
            res.redirect('/messages/' + encodeURIComponent(req.params.id));
        }).catch((err) => {
            req.flash('error_msg', err.toString());
        });

    } else {
        res.redirect('/messages/' + encodeURIComponent(req.params.id));
    }
}

// New chat page
exports.new_chat_page = function (req, res) {

    pod.getContacts(req.user.maker, req.user.datapod).then(contacts => {
        res.render('messages/new', {
            contacts: contacts // Pass contacts to handlebars
        });
    }).catch(err => {
        req.flash('error_msg', err.toString());
        console.error(err);
    });
}

// Process new chat
exports.new_chat = function (req, res) {
    res.redirect('/messages/' + encodeURIComponent(req.params.id));
}