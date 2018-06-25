const util = require('util');

const errors = require('../../model/errors');

const res = require('../../resources/strings/common');

exports.argumentsError = (cmd) => {
    throw new errors.tooFewArguments(util.format(res.errors.argumentsError.message, cmd.help.usage));
};

/**
 * Removes the colons from a string
 * @param str {string}
 * @returns {string} The string given without colons
 */
exports.removeColons = (str) => {
    if (str !== undefined) {
        if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
            str = str.slice(1, str.length - 1);
        }
    }

    return str;
};