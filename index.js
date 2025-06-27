require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const CHECK_INTERVAL_MINUTES = 1;

const youtubeChannels = [
  { name: 'CAKE REMIXER X2', channelId: 'UCt7DlBKS018jXzgbKb7kH2Q' },
  { name: 'CHAMP REMIX', channelId: 'UC_J5mFi8imGhUON6dGqSm1g' },
  { name: 'แอดมินท้ายสวนปาล์ม', channelId: 'UCuJSCeqCc7C20j1R5JYLRTQ' }
];

const LAST_VIDEO_PATH = './latest.json';
let lastVideoIds = {};

// 📁 โหลดค่าที่เคยบันทึกไว้ก่อนหน้า
if (fs.existsSync(LAST_VIDEO_PATH)) {
  lastVideoIds = JSON.parse(fs.readFileSync(LAST_VIDEO_PATH, 'utf8'));
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  setInterval(async () => {
    for (const channel of youtubeChannels) {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;

      try {
        const feed = await parser.parseURL(feedUrl);
        const latest = feed.items[0];
        if (!latest) continue;

        // 🔍 ตรวจว่าเคยแจ้งแล้วหรือยัง
        if (lastVideoIds[channel.channelId] === latest.id) continue;

        // 💾 อัปเดตและบันทึกไฟล์
        lastVideoIds[channel.channelId] = latest.id;
        fs.writeFileSync(LAST_VIDEO_PATH, JSON.stringify(lastVideoIds, null, 2));

        const discordChannel = await client.channels.fetch(DISCORD_CHANNEL_ID);
        await discordChannel.send(
          `📢 **${channel.name}** มีวิดีโอใหม่! @everyone\n**${latest.title}**\n${latest.link}`
        );

        console.log(`✅ แจ้งเตือนวิดีโอจาก ${channel.name}: ${latest.title}`);
      } catch (error) {
        console.error(`❌ Error จากช่อง ${channel.name}:`, error.message);
      }
    }
  }, CHECK_INTERVAL_MINUTES * 60 * 1000);
});

client.login(DISCORD_TOKEN);
