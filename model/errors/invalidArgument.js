module.exports = function invalidArgument(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = 'invalid argument!';
    this.message = message;
};

require('util').inherits(module.exports, Error);