class ContactError extends Error {
    constructor(text, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ContactError);
        }

        // Custom debugging information
        this.text = text;
    }
}

class FormError extends Error {
    constructor(errorlist, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FormError);
        }

        // Custom debugging information
        this.errorlist = errorlist;
    }
}

class UserError extends Error {
    constructor(text, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UserError);
        }

        // Custom debugging information
        this.text = text;
    }
}

module.exports = {
    ContactError: ContactError,
    FormError: FormError,
    UserError: UserError
}