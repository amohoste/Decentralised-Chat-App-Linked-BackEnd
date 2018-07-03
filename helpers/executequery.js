// Transforms triple-pattern-fragment query into promise
exports.executeQuery = function(iterator) {
    return new Promise((resolve, reject) => {
            
        let results = [];
        iterator.on('data', function (result) { results.push(result) });
        iterator.on('end', () => {
            resolve(results);
        });
        iterator.on('error', (err) => {
            reject(err);
        });
    })
}