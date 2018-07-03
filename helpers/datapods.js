const request = require('request-promise-native');
const ldf = require('ldf-client');
const { executeQuery } = require('./executequery');
const parser = require('./parsers');
const { build_url, get_base_url } = require('./url_helpers');
const _ = require('underscore');
const { sort_by_properties } = require('./sorters');
const { URL } = require('url');
const { generateHash } = require('./randoms')
const urljoin = require('url-join');

exports.getOwner = function (datapod) {

    const fragmentsClient = new ldf.FragmentsClient(datapod);

    var query = `
    PREFIX : <${datapod}>
    PREFIX schema: <http://schema.org/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?maker WHERE
    {
        : foaf:maker ?maker .
    }
    `;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(result => {
        return result[0]['?maker'];
    });
}

exports.hasContact = function (datapod, me, contactlink) {
    const fragmentsClient = new ldf.FragmentsClient(datapod);

    const query = `
    PREFIX me: <${me}>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    ASK WHERE {
        me: foaf:knows <${contactlink}>
      }
    `;
    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(result => {
        return result[0];
    });
}

exports.getContacts = function (me, graph) {
    const fragmentsClient = new ldf.FragmentsClient(graph);

    const query = `
    PREFIX me: <${me}>
    PREFIX schema: <http://schema.org/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    
    SELECT DISTINCT ?person ?nickname ?givenName ?familyName ?image WHERE
    {
        GRAPH <${graph}> {
            me: foaf:knows ?person .
            ?person foaf:nick ?nickname.
        }
        ?person foaf:givenName ?givenName;
                foaf:familyName ?familyName .
        OPTIONAL{ ?person foaf:img ?image . }
        FILTER (lang(?givenName) = '')
        FILTER (lang(?familyName) = '')
    } ORDER BY ?givenName ?familyName
    `;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(results => {
        return results.map(res => {
            return {
                'firstname': parser.parseString(res['?givenName']),
                'lastname': parser.parseString(res['?familyName']),
                'nickname': parser.parseString(res['?nickname']),
                'id': encodeURIComponent(res['?person']),
                'image': res['?image']
            }
        });
    })
}

exports.addContact = function (graph, me, contact, nickname) {
    const query = `
    PREFIX me: <${me}>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    INSERT { 
        <${contact}> a foaf:Person;
	                 foaf:nick "${nickname}".
        me: foaf:knows <${contact}>.
    }
    `;

    let url = build_url({
        base: 'http://groep24.webdev.ilabt.imec.be:2004/sparql',
        endpoint: 'http://groep24.webdev.ilabt.imec.be:8890/sparql',
        graph: graph,
        query: query
    });

    return request({
        url: url,
        method: 'POST',
    });
}

exports.deleteContact = function(graph, me, contact) {
    const query = `
    PREFIX me: <${me}>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    DELETE FROM <${graph}> { 
        me: foaf:knows ?person .
        ?person a foaf:Person;
	    foaf:nick ?nick .
    } WHERE {
        ?person a foaf:Person;
	    foaf:nick ?nick .
        FILTER (?person=<${contact}>)
    }   
    `;

    let url = build_url({
        base: 'http://groep24.webdev.ilabt.imec.be:2004/sparql',
        endpoint: 'http://groep24.webdev.ilabt.imec.be:8890/sparql',
        graph: graph,
        query: query
    });

    return request({
        url: url,
        method: 'POST',
    });
}

exports.getContact = function(me, graph, contact) {
    const fragmentsClient = new ldf.FragmentsClient(graph)
    
    const query = `
    PREFIX me: <${me}>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?person ?nickname
    FROM <${graph}> WHERE {
        ?person a foaf:Person;
	            foaf:nick ?nickname .
        FILTER (?person=<${contact}>)
    } LIMIT 1
    `;

    ;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(results => {
        return results.map(res => {
            return {
                'reference': res['?person'],
                'nickname': parser.parseString(res['?nickname']),
                'id': encodeURIComponent(res['?person'])
            }
        })[0];
    })
}

exports.getFullContact = function(datapod, me, contact) {
    const fragmentsClient = new ldf.FragmentsClient(datapod)
    
    const query = `
    PREFIX me: <${me}>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?nickname ?givenName ?familyName ?image WHERE {
        FILTER (lang(?givenName) = '')
        FILTER (lang(?familyName) = '')
        ?person a foaf:Person;
                foaf:nick ?nickname;
                foaf:givenName ?givenName;
                foaf:familyName ?familyName .
        OPTIONAL{ ?person foaf:img ?image . }
        FILTER (?person=<${contact}>)
    } LIMIT 1
    `;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(results => {
        return results.map(res => {
            return {
                'firstname': parser.parseString(res['?givenName']),
                'lastname': parser.parseString(res['?familyName']),
                'nickname': parser.parseString(res['?nickname']),
                'image': res['?image'],
            }
        })[0];
    })
}

exports.updateContact = function(graph, me, old, contact, nickname) {
    
    const query = `
    PREFIX me: <${me}>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    MODIFY <${graph}>
    DELETE { 
        me: foaf:knows <${old}> .
        <${old}> foaf:nick ?nick;
                 a foaf:Person .
    } 
    INSERT {
        me: foaf:knows <${contact}> .
        <${contact}> foaf:nick "${nickname}";
                     a foaf:Person .
    } WHERE {
        <${old}> foaf:nick ?nick .
    }   
    `;

    let url = build_url({
        base: 'http://groep24.webdev.ilabt.imec.be:2004/sparql',
        endpoint: 'http://groep24.webdev.ilabt.imec.be:8890/sparql',
        graph: graph,
        query: query
    });

    return request({
        url: url,
        method: 'POST',
    });
}

exports.verifyDatapod = function(datapod) {
    return module.exports.getOwner(datapod).then(maker => {
            return;
    });
}

exports.verifyContact = function(datapod, contact) {
    const fragmentsClient = new ldf.FragmentsClient(datapod);

    var query = `
    PREFIX contact: <${contact}>
    PREFIX schema: <http://schema.org/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?givenName WHERE
    {
        contact: foaf:givenName ?givenName .
    }
    `;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(result => {
        if (result.length > 0 && result[0]['?givenName'] != null) {
            return;
        } else {
            throw(new Error("Url doesn't point to a valid datapod"));
        }
    });
}

exports.getOwnerInfo = function(datapod, me) {
    const fragmentsClient = new ldf.FragmentsClient(datapod);

    var query = `
    PREFIX me: <${me}>
    PREFIX schema: <http://schema.org/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?givenName ?familyName ?gender ?phone ?mail ?image WHERE
    {
        me: foaf:givenName ?givenName;
            foaf:familyName ?familyName .
        OPTIONAL{ me: foaf:gender ?gender . }
        OPTIONAL{ me: foaf:phone ?phone . }
        OPTIONAL{ me: foaf:mbox ?mail . }
        OPTIONAL{ me: foaf:img ?image . }
        FILTER (lang(?givenName) = '')
        FILTER (lang(?familyName) = '')
        FILTER (lang(?gender) = '')
    } LIMIT 1
    `;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(result => {
        return result.map(res => {
            return {
                'firstname': parser.parseString(res['?givenName']),
                'lastname': parser.parseString(res['?familyName']),
                'phone': res['?phone'] ? parser.parseString(res['?phone']) : null,
                'gender': res['?gender'] ? parser.parseGender(res['?gender']) : null,
                'email': res['?mail'] ? parser.parseString(res['?mail']) : null,
                'image': res['?image']
            }
        })[0];
    });
}

exports.updateOwnerInfo = function(graph, me, ownerInfo) {

    const query = `
    PREFIX me: <${me}>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    MODIFY <${graph}>
    DELETE { 
        me: foaf:givenName ?givenName;
            foaf:familyName ?familyName;
            foaf:gender ?gender;
            foaf:phone ?phone;
            foaf:mbox ?mail;
            foaf:img ?image .
    } 
    INSERT {
        me: foaf:givenName "${ownerInfo.givenName}";
            foaf:familyName "${ownerInfo.familyName}" .
        ${ownerInfo.gender != '' ? 'me: foaf:gender "' + ownerInfo.gender + '" .' : "" }
        ${ownerInfo.phone != '' ? 'me: foaf:phone "' + ownerInfo.phone + '" .' : "" }
        ${ownerInfo.mail != '' ? 'me: foaf:mbox "' + ownerInfo.mail + '" .' : "" }
        ${ownerInfo.image != '' ? 'me: foaf:img <' + ownerInfo.image + '> .' : "" }
    } WHERE {
        me: foaf:givenName ?givenName;
            foaf:familyName ?familyName.
        OPTIONAL{ me: foaf:gender ?gender . }
        OPTIONAL{ me: foaf:phone ?phone . }
        OPTIONAL{ me: foaf:mbox ?mail . }
        OPTIONAL{ me: foaf:img ?image . }
    }   
    `;

    let url = build_url({
        base: 'http://groep24.webdev.ilabt.imec.be:2004/sparql',
        endpoint: 'http://groep24.webdev.ilabt.imec.be:8890/sparql',
        graph: graph,
        query: query
    });

    return request({
        url: url,
        method: 'POST',
    });
}

exports.getAllMessages = function(datapod, me) {
    const fragmentsClient = new ldf.FragmentsClient(datapod);

    var query = `
    PREFIX schema: <http://schema.org/>
	PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?sender ?recipient ?date ?text WHERE
    {
        ?message a schema:Message;
                 schema:sender ?sender;
	         schema:recipient ?recipient;
	         schema:dateSent ?date;
	         schema:Text ?text.
        FILTER(?sender=<${me}> || ?recipient=<${me}>)
    }
    `;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(result => {
        let me_url = new URL(me).toString();

        // Parse message fields
        let messages = result.map(res => {
            return {
                'sender': res['?sender'],
                'recipient': res['?recipient'],
                'date': parser.parseDate(res['?date']),
                'text': parser.parseString(res['?text']),
                'received': new URL(res['?sender']).toString() === me_url ? false : true
            }
        });

        // Sort messages
        messages = messages.sort(sort_by_properties(new Map([["date", "desc"]])));

        // Get unique messages based on other person
        return _.uniq(messages, false, a => { 
            return !a.received ? new URL(a.recipient).toString() : new URL(a.sender).toString()
        });
    }).then(messages => {
        let contacts = messages.map(message => !message.received ? module.exports.getContactInfo(message.recipient, fragmentsClient) : module.exports.getContactInfo(message.sender, fragmentsClient))

        return Promise.all(contacts).then((contacts) => {
            return clean(contacts.map((contact, index) => {
                if (contact) {
                    return {
                        'lastmessage': (messages[index].received ? contact.firstname + ' ' + contact.lastname + ': ' : 'You: ') + messages[index].text,
                        'firstname': contact.firstname,
                        'lastname': contact.lastname,
                        'id': messages[index].received ? encodeURIComponent(messages[index].sender) : encodeURIComponent(messages[index].recipient),
                        'image': contact.image,
                        'time': messages[index].date.getHours() + ':' + (messages[index].date.getMinutes() < 10 ? '0' : '') + messages[index].date.getMinutes()
                    }
                }
            }));
        });
    });
}

exports.getContactInfo = function(contact, fragmentsClient) {
    var query = `
    PREFIX schema: <http://schema.org/>
	PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?givenName ?familyName ?image WHERE
    {
        <${contact}> foaf:givenName ?givenName;
                     foaf:familyName ?familyName .
        OPTIONAL{ <${contact}> foaf:img ?image . }
    } LIMIT 1
    `;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(result => {
        return result.map(res => {
            return {
                'firstname': parser.parseString(res['?givenName']),
                'lastname': parser.parseString(res['?familyName']),
                'image': res['?image']
            }
        })[0];
    });
}

exports.getChat = function(datapod, me, contact) {
    
    const fragmentsClient = new ldf.FragmentsClient(datapod);

    var query = `
    PREFIX schema: <http://schema.org/>
	PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?date ?text ?sender WHERE
    {
        ?message a schema:Message;
                 schema:sender ?sender;
	         schema:recipient ?recipient;
	         schema:dateSent ?date;
	         schema:Text ?text.
        FILTER((?sender=<${me}> && ?recipient=<${contact}>) || (?recipient=<${me}> && ?sender=<${contact}>))
    }
    `;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(result => {
        let me_url = new URL(me).toString();

        // Parse message fields
        return result.map(res => {
            return {
                'creation_date': parser.parseDate(res['?date']),
                'content': parser.parseString(res['?text']),
                'received': new URL(res['?sender']).toString() === me_url ? false : true
            }
        }).sort(sort_by_properties(new Map([["creation_date", "asc"]])));
    });

}

exports.sendMessage = function(datapod, me, contact, message) {

    let url = urljoin(get_base_url(me) + 'messages', generateHash());
    const msg = createMessage(url, me, contact, message);
    
    const c = module.exports.getDatapod(contact).then(pod => {
        return addMessage(url, pod);
    });

    const m = addMessage(url, datapod);

    return Promise.all([msg, c, m]).then(() => {
        return;
    });
    
}

exports.getDatapod = function(datapod, owner) {
    const fragmentsClient = new ldf.FragmentsClient(datapod);

    var query = `
	PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT DISTINCT ?datapod WHERE {
        <${owner}> foaf:made ?datapod
     }
    `;

    return executeQuery(new ldf.SparqlIterator(query, { fragmentsClient: fragmentsClient })).then(result => {
        // Parse message fields
        return result[0]['?datapod'];
    });
}

function createMessage(url, me, contact, message) {
    const query = `
    PREFIX this: <${url}>
    PREFIX schema: <http://schema.org/>

    INSERT {
        this: a schema:Message;
            schema:sender <${me}>;
            schema:recipient <${contact}>;
            schema:dateSent "${new Date(Date.now()).toJSON()}";
            schema:Text "${message}".
    }
    `;

    let req = build_url({
        base: 'http://groep24.webdev.ilabt.imec.be:2004/sparql',
        endpoint: 'http://groep24.webdev.ilabt.imec.be:8890/sparql',
        graph: url,
        query: query
    });

    return request({
        url: req,
        method: 'POST',
    });
}

function addMessage(url, pod) {
    const query = `
    PREFIX schema: <http://schema.org/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    INSERT {
        <${url}> a schema:Message.
    }
    `;

    let req = build_url({
        base: 'http://groep24.webdev.ilabt.imec.be:2004/sparql',
        endpoint: 'http://groep24.webdev.ilabt.imec.be:8890/sparql',
        graph: pod,
        query: query
    });

    return request({
        url: req,
        method: 'POST',
    });
}

function clean(arr) {
    let temp = [];
    for(let i of arr)
        i && temp.push(i); // copy each non-empty value to the 'temp' array

    return temp;
}