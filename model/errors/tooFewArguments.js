module.exports = function tooFewArguments(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = 'too few arguments!';
    this.message = message;
};

require('util').inherits(module.exports, Error);