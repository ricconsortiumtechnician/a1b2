class User {
    /**
     *
     * @param robloxId {number}
     * @param points {number}
     * @param rank {number}
     * @param canProgress {boolean}
     * @param verificationCode {string}
     * @param [pointsLogs=[]]{Array}
     */
    constructor(robloxId, points, rank, canProgress, verificationCode, pointsLogs) {
        this._id = robloxId;
        this.points = points;
        this.rank = rank;
        this.canProgress = canProgress;
        this.discordId = null;
        this.verificationCode = verificationCode;
        if (pointsLogs === undefined){
            this.pointsLogs = [];
        } else{
            this.pointsLogs = pointsLogs;
        }
    }
}

module.exports = User;