const roblox = require('../businesslogic/roblox');

const userDao = require('../datastorage/userDao');
const User = require('../model/user');

/**
 * @type{Array}
 */
const ranks = require('../resources').ranks;

class UserManager {
    /**
     *
     * @param robloxId {int}
     * @returns {Promise<void>}
     */
    async findOrCreateUser(robloxId) {
        let user = await userDao.findById(robloxId);

        if (user === undefined) {
            let rank = await roblox.lib.getRankInGroup(process.env.GROUP_ID, robloxId);

            if (isNaN(rank)) throw "idNotFound";
            if (rank === 0) throw "notInGroup";
            if (getRank('Private') === rank || rank >= getRank('Second Lieutenant')) throw "invalidRank";

            user = new User(robloxId, 0, rank, true, '');
            userDao.create(user);
        }

        return user;
    }

    addPoints(user, amount) {
        const rankData = getRankData(user.rank);
        user.points += amount;

        if (user.points < rankData.nextRank.requiredPoints) {
            userDao.update(user);
            return false;
        }

        user.points = 0;
        user.rank = rankData.nextRank.rankInGroup;
        roblox.lib.promote(process.env.GROUP_ID, user._id);
        userDao.update(user);

        return true;
    }
}

module.exports = new UserManager();

function getRankData(rank) {
    let currentRank = ranks.find((val) => val.rankInGroup === rank);

    return {
        prevRank: ranks[ranks.indexOf(currentRank) - 1],
        curRank: currentRank,
        nextRank: ranks[ranks.indexOf(currentRank) + 1]
    }
}

function getRank(rankName) {
    return ranks.find((val) => val.name === rankName).rankInGroup;
}
