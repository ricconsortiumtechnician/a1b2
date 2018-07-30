const errors = require('../model/errors');

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
     * @param [rank]
     * @returns {Promise<User>}
     */
    async findOrCreateUser(robloxId, rank) {
        rank = rank !== undefined ? rank : await roblox.lib.getRankInGroup(process.env.GROUP_ID, robloxId);

        if (isNaN(rank)) throw new errors.invalidArgument("idNotFound");
        if (rank === 0) throw new errors.invalidArgument("notInGroup");
        if (getRank('Private') === rank || rank >= getRank('Second Lieutenant')) throw new errors.invalidArgument("invalidRank");

        let user = await userDao.findById(robloxId);

        if (user === undefined) {
            user = new User(robloxId, 0, rank, true, '');
            userDao.create(user);
        } else{
            // Set merit to 0 and update rank if the rank in the database isn't the same as on roblox
            if(user.rank !== rank){
                user.rank = rank;
                user.points = 0;
            }
        }

        return user;
    }

    /**
     *
     * @param user {User}
     * @param amount {int}
     * @returns {boolean} true if the user was promoted otherwise false.
     */
    addPoints(user, amount) {
        const rankData = getRankData(user.rank);
        user.points += amount;

        if (user.points < rankData.nextRank.requiredPoints) {
            userDao.update(user);
            return false;
        }

        user.points = 0;
        roblox.changeRank(user, rankData.nextRank.rankInGroup);
        user.rank = rankData.nextRank.rankInGroup;
        userDao.update(user);

        return true;
    }

    deductPoints(user, amount){
        const rankData = getRankData(user.rank);

        user.points -= amount;

        if(user.points >= 0){
            userDao.update(user);
            return false;
        }

        user.points = 0;

        if (getRank("Private First Class") === rankData.curRank.rankInGroup) {
            userDao.update(user);
            throw new errors.invalidArgument('belowZero');
        }

        roblox.changeRank(user, rankData.prevRank.rankInGroup);
        user.rank = rankData.prevRank.rankInGroup;
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
