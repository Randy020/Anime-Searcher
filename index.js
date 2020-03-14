const Trace =  require('./modules/trace'),
      embed = require('./modules/embed'),
      Mongodb = require('./modules/mongo'),
      config = require('./config.json'),
      db = new Mongodb(config.mongodb_uri)
      Discord = require('discord.js'),
      fs = require('fs'),
      client = new Discord.Client(),
      traceMoe = new Trace(config.traceMoe_token),
      urlCheck = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png)/i, // url check regexp
      reactions = ['⬅️', '➡️'],
      modules = {},
      guildSettings = {}

let workChannels = []

client.on('ready',async()=>{
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Working with: ${client.guilds.cache.size} guilds`)
    try {
        fs.readdir('./modules/commands/',(err,files)=>{
        files.map(file=>{
            if(file.split('.')[1] !== 'js') return
            modules[config.prefix + file.split('.')[0]] = require(`./modules/commands/${file}`);
            console.log(`${file} was successfully loaded!`);
          })
        })
        let request = await db.getData()
        workChannels = request.map(e=>{
            if(!e || !e.settings || !e.settings.workChannel) return
            return e.settings.workChannel
        })

        } catch(e) {
            console.log(e);
        }
    })
client.on('message',async(msg)=>{
        try{
            let message = msg.content.toLocaleLowerCase();
            let cmd = message.split(' ')[0]
            if(Object.keys(modules).includes(cmd)){
                msg.channel.startTyping();
                modules[Object.keys(modules)[Object.keys(modules).indexOf(cmd)]].run(client,msg,config,db);
                setTimeout(()=>{
                    msg.channel.stopTyping();
                },5000)
            }

            if(!workChannels.length || !workChannels.includes(msg.channel.id)) return

            let attachments = msg.attachments.size ? msg.attachments.first().url : undefined
            if(urlCheck.test(msg.content) || urlCheck.test(attachments)) {
                msg.channel.startTyping();
                let base64 = await traceMoe.getImageBase64(attachments ? attachments : msg.content);
                let result = await traceMoe.search(base64);
                let ans = await msg.channel.send({embed: embed(result.docs,0,msg)});
                msg.channel.stopTyping()
                reactions.map(async(symb)=>{ await ans.react(symb) })
                const filter = (reaction, user) => {
                    return reactions.includes(reaction.emoji.name) && user.id == msg.author.id;
                };
                const collector = ans.createReactionCollector(filter, { time: 60000 });
                let resultIndex = 0;
                collector.on('collect', r =>{
                    if(r.emoji.name == '➡️') {
                        resultIndex++;
                    } else {
                        resultIndex--;
                        if(resultIndex <= 0) currentIndex = 0;
                    }
                    ans.edit({embed: embed(result.docs,resultIndex % result.docs.length, msg)}) 
                    });
                collector.on('end', async(collected) => { await ans.react('🐧') } ); 
            }
        } catch(err) {
            console.log(err)
        }                
    
})
client.login(config.bot_token)