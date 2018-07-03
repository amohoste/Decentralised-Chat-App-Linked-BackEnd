// Source: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const N = 25;

exports.generateHash = function() {
    return Array.apply(null, Array(N)).map(function() { return alpha.charAt(Math.floor(Math.random() * alpha.length)); }).join('')
}