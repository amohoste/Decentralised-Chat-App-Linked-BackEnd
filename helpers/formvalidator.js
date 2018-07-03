// Help function to validate forms on based on given checks
exports.validate = (req, res, checks) => {
    return new Promise((resolve, reject) => {

        // Check if all fields are filled
        let errors = [];

        for (let i = 0; i < checks.length; i++) {
            if (!checks[i][0]) { // Add error if field isn't filled
                errors.push({ text: checks[i][1] });
            }
        }

        if (errors.length != 0) {
            reject(errors);
        } else {
            resolve();
        }
    });
};