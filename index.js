const CLIENT_KEY = 'ODQwMTE5MzIxOTAzODkwNDUy.YJTkFw.WNxGmNXxZly407dN3SjrzAVOktg';
const DEV_KEY = 'ODQyOTM2MzgzNzU1NTE3OTY0.YJ8jrg.5qacWCrJpJXHMAYGlbTe_kqzF3E'
const { Client, Intents, MessageEmbed, ClientUser, Message } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const {attachIsImage, ban} = require('./lib.js')
const {store} = require('./db.js')

const channelID = '840477001545941022' //'724648797300457532' //

const banuser = {
  "362965490513215498": true, //me
  "696000898568028170": true,
  "269700566169550850": true,
  "706814151028113438": true,
  "692678251193303040": true,
  "317283391982534666": true
  }

const getUserFromMention = (mention) => {
	// The id is the first and only match found by the RegEx.
	const matches = mention.match(/^<@!?(\d+)>$/);

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) return;

	// However, the first element in the matches array will be the entire mention, not just the ID,
	// so use index 1.
	const id = matches[1];

	return client.users.cache.get(id);
}

client.on('ready', () => {
// channel.send(message)



console.log('ok..')
  client.user.setPresence({
      status: "online",  //You can show online, idle....
      activity: {
          name: "users all over the place",  //The message shown
          type: "WATCHING" //PLAYING: WATCHING: LISTENING: STREAMING:
      }
  });
});

client.on('message', msg => {
  const [first, second, third, ...rest] = msg.content.split(' ')
  if (!msg.guild) return;
  // -------------------------------------------------------------- channel id
  const channel = client.channels.cache.find(channel => channel.id === channelID)
// ||||||||||||||||||||||||||| capture data |||||||||||||||||||||||||||||||||||||||

  // if any attachment
  if (msg.attachments.size > 0) {

  // if attachment images -------------------------------- replace with guild id
    if (msg.attachments.every(attachIsImage) && client.guilds.id !== 'guild_id'){
      msg.client.users.fetch(msg.author.id).then(user => {
        store.dispatch({type:'addImageURL', avatarURL: user.avatarURL()})
        const data = {
          messageId: msg.id,
          name: msg.author.username,
          guildId: msg.guild.id,
          guildName: msg.guild.name,
          userId: msg.author.id,
          serverId: msg.guild.id,
          userImage: user.avatarURL(),
          channelId: msg.channel.id,
          text: msg.content || 'No text image',
          reviewed: false,
          attachments: msg.attachments.map(attachment => {
            return attachment.url
          })[0]
        }
        

        store.dispatch({type:'addFile', value: data})
        
        
        const exampleEmbed = new MessageEmbed()
        .setColor('#0099ff')
        // get sender user profile image
        .setTitle(data.userId)
        .setThumbnail(data.userImage)
        .addFields(
          // get sender name
          { name: 'Guild Name', value: data.guildName },
          { name: 'Guild ID', value: data.guildId },
          { name: 'Message ID', value: data.messageId },
          { name: 'Reporter Name', value: data.name },
          { name: '\u200B', value: '\u200B' },
          // get sender text
          { name: 'Scammer Id', value: data.text },
          { name: 'Guide', value: `React to ✅ to ban the scammer or using .ban command \n React to ❌ to delete this embed`, inline: true },
        )
        .setImage(data.attachments)
        .setTimestamp()
        .setFooter('Report bot by: Sagara', 'https://github.com/eiyu');

        channel.send(exampleEmbed).then(async embedMessage => {
          await embedMessage.react('✅');
          await embedMessage.react('❌');
        });
        channel.send(`Scammer id: ${data.text} \n Channel id: ${data.channelId}`)

        return;
      })

      return;
    }
  } 

  if(msg.content.startsWith('.help')) {

    const helpEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('welcome to help')
    .setDescription(`
      This is help page \n
      .list - display unreviewed message \n
      .view <message id> - display embed message \n
      .ban <userid> <guildid> - ban user id from server \n
      .wipe <userid> - ban user id (all server)
    `)
    .setFooter('Report bot by: Sagara', 'https://github.com/eiyu');
    msg.channel.send(helpEmbed);

  }
  
  if(msg.content.startsWith('.list')) {
    
    const st = store.getState().value
    const data = Object.keys(st).filter(v => {
      return !st[v].reviewed
    })
    
    const list = data.map(v => `- ${v} \n`);
    const helpEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('List of Unreviewed')
    .setDescription(list.length == 0 ? 'No unreviewed image' : list)
    .setFooter('Report bot by: Sagara', 'https://github.com/eiyu');
    msg.channel.send(helpEmbed);
    return;
  }

  if(msg.content.startsWith('.view') && !second) {
    if(msg.channel.id != channelID) {
      msg.channel.send(`Sorry, you don't have permission to this command`)
      return;
    } 

    msg.channel.send(`Please type the Message ID`)
    return;
  }
  if(msg.content.startsWith('.view') && second) {
    if(msg.channel.id != channelID) {
      msg.channel.send(`Sorry, you don't have permission to this command`)
      return 
    }
    const st = store.getState().value
    if(!st.hasOwnProperty(second)) {
      msg.channel.send(`Sorry, can't find this ${second} message ID / invalid message ID`)
      return
    }
    if(st[second].reviewed) {
      msg.channel.send(`This message ID has been reviewed`)
      return
    }

    const data = st[second]
    const exampleEmbed = new MessageEmbed()
    .setColor('#0099ff')
    // get sender user profile image
    .setTitle(data.userId)
    .setThumbnail(data.userImage)
    .addFields(
      // get sender name
      { name: 'Guild Name', value: data.guildName },
      { name: 'Guild ID', value: data.guildId },
      { name: 'Message ID', value: data.messageId },
      { name: 'Reporter Name', value: data.name },
      { name: '\u200B', value: '\u200B' },
      // get sender text
      { name: 'Scammer Id', value: data.text },
      { name: 'Guide', value: `React to ✅ to ban the scammer or using .ban command \n React to ❌ to delete this embed`, inline: true },
    )
    .setImage(data.attachments)
    .setTimestamp()
    .setFooter('Report bot by: Sagara', 'https://github.com/eiyu');

      msg.channel.send(exampleEmbed).then(async embedMessage => {
        await embedMessage.react('✅');
        await embedMessage.react('❌');
      });

      msg.channel.send(`User id: ${data.userId} \n Channel id: ${data.channelId}`)
  }

  if(msg.content.startsWith('.wipe')) {
    // user who can ban
    
    if(msg.channel.id != channelID && !banuser.hasOwnProperty(msg.client.user.id)) {
      msg.channel.send(`Sorry, you don't have permission to this command`)
      return 
    }
    
    if(second && banuser.hasOwnProperty(msg.author.id)) {
      
    const guildIds = client.guilds.cache.map(g => {
      return g.id
    })
    const guildsP = guildIds.map(id => {
      return client.guilds.fetch(id)
    })
    const guilds = Promise.all(guildsP).then(guild => {
      guild.forEach(g => {
        
        g.client.users.fetch(second).then( usr => {
          g.members.ban(usr)
          msg.channel.send(`User ${usr.username} has been banned from ${g.name}`)
        })
      })
    }).catch(err => {
      console.log(err)})
    }
  }

  if(msg.content.startsWith('.ban')) {
    // user who can ban
    // console.log(banuser.hasOwnProperty(msg.client.user.id), 'ban')
    if(msg.channel.id != channelID && !banuser.hasOwnProperty(msg.client.user.id)) {
      // console.log('shit')
      msg.channel.send(`Sorry, you don't have permission to this command`)
      return 
    }
    
    if(second && third && banuser.hasOwnProperty(msg.author.id)) {
      client.guilds.fetch(third).then(guild => {
        guild.client.users.fetch(second).then(user => {
          
        const member = guild.members.resolve(user)
        
          guild.members.ban(user)
          msg.channel.send(`User ${user.username} has been banned from ${guild.name}`)
          return;

        }).catch(err => {
          msg.channel.send(`Oops.. make sure to type user-id and guild-id correctly`)
          console.log(err)
        })                                              
      }).catch(err => {
        msg.channel.send(`Oops.. make sure to type user-id and guild-id correctly`)
        console.log(err)
      })
    }
  }
  
});



client.on('messageReactionAdd', (reaction, user) => {
  const id = reaction.message.embeds[0].fields[2].value
  // scammerId
  const scammerid = reaction.message.embeds[0].fields[5].value
  const guildId = reaction.message.embeds[0].fields[1].value
  // console.log(client.user.bot)
  
  // console.log(!banuser.hasOwnProperty(user.id))
  if(!user.bot && reaction.emoji.name === '✅' && banuser.hasOwnProperty(user.id) ) {
      // ban / kick
      // console.log('meep')
      
      client.guilds.fetch(guildId).then(guild => {
        guild.client.users.fetch(scammerid).then(scm => {
          
        guild.members.ban(scm)
        client.channels.cache.get(channelID).send(`User ${scm.username} has been banned from ${guild.name}`)

        })                                                
      })
      let next = store.getState().value
      // mutation
      next[id]['reviewed'] = true;
      store.dispatch({type: 'reviewed', value: next})
    }
    

    // add more flag like id if want to be safe
  if(!user.bot && reaction.emoji.name === '❌' ) {
    reaction.message.delete();
    return;
  }

});

client.login(CLIENT_KEY);