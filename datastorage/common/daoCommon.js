const url = process.env.DB_URL;
const mongoClient = require('mongodb').MongoClient;

class Common {
    findOne(collection, filter){
        return new Promise(function (resolve, reject){
            mongoClient.connect(url, function (err, db) {
                if (err) reject(err);

                const dbo = db.db("test");
                dbo.collection(collection).findOne(filter, function (err, result) {
                    if (err) {
                        reject(
                            err
                        );
                    } else {
                        resolve(result);
                    }

                    db.close();
                });
            });
        })
    }

    update(collection, obj) {
        return new Promise(function (resolve, reject) {
            mongoClient.connect(url, function (err, db) {
                if (err) reject(err);

                const dbo = db.db("test");
                dbo.collection(collection).updateOne({ _id: obj._id }, { $set: obj }, function (err, result) {
                    if (err) {
                        reject(
                            err
                        );
                    }
                    db.close();
                });
            });
        });
    }

    insert(collection, obj){
        return new Promise(function (resolve, reject) {
            mongoClient.connect(url, function (err, db) {
                if (err) reject(err);

                const dbo = db.db("test");
                dbo.collection(collection).insertOne(obj, function (err, result) {
                    if (err) {
                        reject(
                            err
                        );
                    }
                    db.close();
                });
            });
        });
    }
}

module.exports = Common;