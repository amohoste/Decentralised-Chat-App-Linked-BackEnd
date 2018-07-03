exports.parseString = function(str) {
    return str.substring(str.indexOf('"')+1,str.lastIndexOf('"'))
}

exports.parseMail = function(str) {
    let ident = "mailto:";
    let index = str.indexOf(ident);
    if (index != -1) {
        return str.substring(index + ident.length);
    } else {
        return str;
    }
}

exports.parseGender = function(str) {
    let gender = module.exports.parseString(str);
    if (gender.toLowerCase() == 'man') {
        return 'male';
    } else if (gender.toLowerCase() == 'vrouw') {
        return 'female';
    } else {
        return gender;
    }
}

exports.parseDate = function(str) {
    return new Date(module.exports.parseString(str));
}