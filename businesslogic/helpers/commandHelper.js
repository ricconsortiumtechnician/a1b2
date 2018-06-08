const util = require('util');

const res = require('../../resources/strings/common');

exports.tooFewArguments = (cmd) => {
    throw {
        type: res.errors.tooFewArguments.type,
        message: util.format(res.errors.tooFewArguments.message, cmd.help.usage)
    };
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