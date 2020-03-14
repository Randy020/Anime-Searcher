const mongoClient = require("mongodb").MongoClient;

class DB {
    constructor(mongoURI){
        this.mongoURI = mongoURI;
    }
    getData(guildID){
        return new Promise(async(resolve,reject)=>{
            let client = await mongoClient.connect(this.mongoURI,{ useUnifiedTopology: true })
            .catch(err => { console.log(err); });
            if(!client) return;
            try {
                let db = client.db('weebSearcher');
                let collection = db.collection('Guilds');
                if(!guildID) {
                let res = await collection.find({}).toArray();
                resolve(res);
                } else {
                let res = await collection.findOne({id: guildID})
                resolve(res);  
            }
            } catch(err) {
                console.log(err);
            } finally {
                client.close();
            }
        })
    }
    async createGuild(guildID){
        return new Promise(async (resolve,reject)=>{
            let client = await mongoClient.connect(this.mongoURI,{ useUnifiedTopology: true })
            .catch(err => { console.log(err); });
            if(!client) return;
            try {
                let db = client.db('weebSearcher');
                let collection = db.collection('Guilds');
                let GuildExists = await collection.findOne({id: guildID});
                if (GuildExists != null) return resolve()
                let guild = {
                    id: guildID,
                    settings: {
                        workChannel: null
                    }
                }
                await collection.insertOne(guild);
                resolve();
            } catch(err) {
                console.log(err);
            } finally {
                client.close();
            }  
        })
    }

    async setGuildLog(guildID,channelID){
        let client = await mongoClient.connect(this.mongoURI,{ useUnifiedTopology: true })
            .catch(err => { console.log(err); });
        if(!client) return;
        try {
            let db = client.db('weebSearcher');
            let collection = db.collection('Guilds');
            await collection.findOneAndUpdate(
                {id: guildID},
                {$set:{['settings.workChannel']: channelID }
            });
        } catch(err) {
            console.log(err);
        } finally {
            client.close();
        }
    }
}
module.exports = DB