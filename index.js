const Trace =  require('./modules/trace'),
      embed = require('./modules/embed'),
      Mongodb = require('./modules/mongo'),
      config = require('./config.json'),
      Discord = require('discord.js'),
      fs = require('fs'),
      DBL = require("dblapi.js"),
      db = new Mongodb(config.mongodb_uri),
      client = new Discord.Client(),
      dbl = new DBL(config.topgg_token, client)
      traceMoe = new Trace(config.traceMoe_token),
      urlCheck = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|png)/i, // url check regexp
      reactions = ['⬅️', '➡️'],
      modules = {},
      guildSettings = {}

let workChannels = []

dbl.on('posted', () => {
    console.log('Server count posted!');
})

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
    if(msg.author.bot) return
    let message = msg.content.toLocaleLowerCase();
    let cmd = message.split(' ')[0]
    if(Object.keys(modules).includes(cmd)){
        msg.channel.startTyping();
        modules[Object.keys(modules)[Object.keys(modules).indexOf(cmd)]].run(client,msg,config,db);
    }
}catch(err) {
    console.log(err)
} finally {
    msg.channel.stopTyping();
}
    if(!workChannels.length || !workChannels.includes(msg.channel.id)) return

    let attachments = msg.attachments.size ? msg.attachments.first().url : undefined
    if(urlCheck.test(msg.content) || urlCheck.test(attachments)) {
        try{
        msg.channel.startTyping();
        let base64 = await traceMoe.getImageBase64(attachments ? attachments : msg.content);
        let result = await traceMoe.search(base64);
        let ans = await msg.channel.send({embed: embed(result.docs,0,msg)});
        reactions.map(async(symb)=>{ await ans.react(symb) })
        const filter = (reaction, user) => {
            return reactions.includes(reaction.emoji.name) && user.id == msg.author.id;
        };
        const collector = ans.createReactionCollector(filter, { time: 120000 });
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
    } catch(err) {
        msg.channel.send({embed:{description:`Image doesn't exist (ง •̀_•́)ง`,color:0xff322b}});
    } finally {
        msg.channel.stopTyping();
    } 
    }              
    
})

client.on('newChannel',(newChannel,oldChannel)=>{ //Custom event
    if(oldChannel) delete workChannels[workChannels.indexOf(oldChannel)];
    workChannels.push(newChannel)
})

client.login(config.bot_token)