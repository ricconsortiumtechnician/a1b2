if (process.env.ENV === "production") {
    /**
     * @type {Array}
     */
    exports.ranks = require('./testRanks');
} else {
    /**
     * @type {Array}
     */
    exports.ranks = require('./ranks');
}