module.exports = {
    command: 'setchannel',
    description: "set bot's work channel to search",
    run: async(client,msg,config,db)=>{
        if(!msg.member.hasPermission('KICK_MEMBERS') && msg.author.id != config.author) return msg.channel.send(`${msg.author}, You don't have permission to use this command!`);
        let chn = msg.content.split(' ')[1]
        if(!chn || chn.length < 21) return msg.channel.send(`Error, command example: **${config.prefix}setchannel** ${msg.channel}`)
        chn = chn.match(/[0-9]/gi).join('');
        await db.createGuild(msg.guild.id)
        if(msg.guild.channels.cache.find(ch=>ch.id == chn)) {
            db.setGuildLog(msg.guild.id,chn);
            client.emit('newChannel',chn)
            msg.channel.send(`(づ￣ ³￣)づ <#${chn}> now can be used to search anime source! ฅ^•ﻌ•^ฅ`);
         } else {
             msg.channel.send('(╯°□°）╯︵ ┻━┻ The mentioned channel does not exist! (╥﹏╥)')
         }  
    }
}