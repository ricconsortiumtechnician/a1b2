const User = require('../model/user');
const daoCommon = require('./common/daoCommon');

const common = new daoCommon();

class UserDao {
    constructor() {
        this.common = new daoCommon();
    }

    findById(robloxId){
        const filter = {_id: robloxId};

        return findBy(filter);
    }

    findByCode(code){
        const filter = {verificationCode: code};

        return findBy(filter);
    }

    update(user){
        return common.update("users", user);
    }

    create(user){
        let result = common.insert("users", user);
        return result;
    }
}

function findBy(filter){
    return common.findOne("users", filter)
        .then(result =>{
            if(result) return result;

            return null;
        });
}

module.exports = new UserDao();