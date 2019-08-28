class DB {
    constructor(MongoClient, url, counterUsers) {
        this.MongoClient = MongoClient;
        this.url = url;
        this.dbName = "mydb";
    }
    NextCounterValue(sequenceName, callback = null) {
        this.MongoClient.connect(this.url, (err, db) => {
            if (err) throw err;
            let dbo = db.db(this.dbName);
            dbo.collection("counters").findAndModify({ "_id": sequenceName }, [['_id', 'asc']],
                { "$inc": { sequence_value: 1 } },
                { new: true },
                (err, doc) => {
                    db.close();
                    if (callback) {
                        if (doc.sequence_value == undefined) callback(doc.value.sequence_value);
                        else callback(doc.sequence_value);
                    }
                    if (doc.sequence_value == undefined) return doc.value.sequence_value;
                    return doc.sequence_value;
                });
        });
    }
    addElement(collectionName, counterColName, obj, callback) //journalusers, journaluserid
    {
        this.NextCounterValue(counterColName, (returnedId) => {
            obj.id = returnedId; //set id from counters collection
            this.MongoClient.connect(this.url, (err, db) => {
                if (err) throw err;
                let dbo = db.db(this.dbName);
                dbo.collection(collectionName).insertOne(obj, (err) => {
                    if (err) throw err;
                    console.log("1 document inserted");
                    db.close();
                    if(callback) callback();
                });
            });
        });
    }
    find(collectionName, query, callback)
    {
        this.MongoClient.connect(this.url, (err, db) => {
            if (err) throw err;
            let dbo = db.db(this.dbName);
            dbo.collection(collectionName).findOne(query, (err, result) => {
                if (err) throw err;
                db.close();
                if(callback) callback(result);
            });
        });
    }
    findAll(collectionName, query, callback)
    {
        this.MongoClient.connect(this.url, (err, db) => {
            if (err) throw err;
            let dbo = db.db(this.dbName);
            dbo.collection(collectionName).find(query).toArray((err, results) => {
                if(err) console.log(err);
                else callback(results);
            });
        });
    }
    exists(collectionName, query, callback)
    {
        return this.find(collectionName, query, callback) ? 1 : 0;
    }
}


module.exports = DB;