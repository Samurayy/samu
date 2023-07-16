const Discord = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: Discord.Events.ClientReady,
  
  execute: async(client) => {
    if(config.deleteDatabase) {
      db.deleteAll()
      console.error(`Prime Partner'in tüm verileri silindi.`);
    }
    
    console.log(`${client.user.tag} Aktif!`);
    console.log(`${client.guilds.cache.size} Sunucu!`)
    
    
        const activitys = [
      `${client.guilds.cache.size} Sunucu`,
      `🎄 Mutlu Yıllar`,
      `${client.guilds.cache.size} Sunucu`,
      '🎄 Mutlu Yıllar'
  ]
  setInterval(() => {
    const islev = Math.floor(Math.random() * (activitys.length - 1))
    client.user.setActivity(activitys[islev])
  }, 16000)

  }
};
