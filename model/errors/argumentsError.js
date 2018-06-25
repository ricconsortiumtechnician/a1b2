module.exports = function argumentsError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = 'Error parsing arguments!';
    this.message = message;
};

require('util').inherits(module.exports, Error);