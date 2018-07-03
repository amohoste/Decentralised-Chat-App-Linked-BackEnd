// Handlebars helper function to select given html <select> element
// Source: https://stackoverflow.com/questions/13046401/how-to-set-selected-select-option-in-handlebars-template
exports.select = function (selected, options) {
    return options.fn(this).replace(
        new RegExp(' value=\"' + selected + '\"'),
        '$& selected="selected"');
}