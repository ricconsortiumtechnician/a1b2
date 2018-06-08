const User = require('../model/user');
const daoCommon = require('./common/daoCommon');

class UserDao {
    constructor() {
        this.common = new daoCommon();
    }

    findById(robloxId){
        const filter = {_id: robloxId};

        return this.common.findOne("users", filter).then(result => {
                if (result) {
                    return result;
                }
            }
        );
    }

    update(user){
        return this.common.update("users", user);
    }

    create(user){
        return this.common.insert("users", user);
    }
}

module.exports = new UserDao();