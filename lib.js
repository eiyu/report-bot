const getExtension = (url) => {
  const extension = url.split('.').pop();
  return extension;
};

const attachIsImage = (msgAttach) => {
  const url = msgAttach.url;
  const ext = getExtension(url);
  
  const imagesExtension = {
    png: url.indexOf(ext, url.length - ext.length /*or 3*/) !== -1,
    jpg: url.indexOf(ext, url.length - ext.length /*or 3*/) !== -1,
    jpeg: url.indexOf(ext, url.length - ext.length /*or 3*/) !== -1,
    webp: url.indexOf(ext, url.length - ext.length /*or 3*/) !== -1
  };
  
  return imagesExtension[ext];
};


const ban = (message) => (type) => {
    // If the message content starts with "!kick"
    if (message.content.startsWith('!kick') || type === 'auto') {
      // Assuming we mention someone in the message, this will return the user
      // Read more about mentions over at https://discord.js.org/#/docs/main/master/class/MessageMentions
      const user = message.mentions.users.first();
      // If we have a user mentioned
      if (user) {
        // Now we get the member from the user
        const member = message.guild.members.resolve(user);
        // If the member is in the guild
        if (member) {
          /**
           * Kick the member
           * Make sure you run this on a member, not a user!
           * There are big differences between a user and a member
           */
          member
            .kick('Optional reason that will display in the audit logs')
            .then(() => {
              // We let the message author know we were able to kick the person
              message.channel.send(`Successfully kicked ${user.tag}`);
            })
            .catch(err => {
              // An error happened
              // This is generally due to the bot not being able to kick the member,
              // either due to missing permissions or role hierarchy
              message.channel.send('I was unable to kick the member');
              // Log the error
              console.error(err);
            });
        } else {
          // The mentioned user isn't in this guild
          message.channel.send("That's weird I can't ban this member, ");
        }
        // Otherwise, if no user was mentioned
      } else {
        message.channel.send("You didn't mention the user to kick!");
      }
    }
    return;
}




module.exports = {attachIsImage, ban};
