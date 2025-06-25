require('dotenv').config();

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

const lastVideoIds = {};

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // 🧪 ส่งแจ้งเตือนล่าสุดทันทีรอบแรก เพื่อทดสอบ
  //   for (const channel of youtubeChannels) {
  //     try {
  //       const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
  //       const feed = await parser.parseURL(feedUrl);
  //       const latest = feed.items[0];
  //       if (!latest) continue;

  //       lastVideoIds[channel.channelId] = latest.id;

  //       const discordChannel = await client.channels.fetch(DISCORD_CHANNEL_ID);
  //       await discordChannel.send(
  //         `🧪 ทดสอบแจ้งเตือน: **${channel.name}**\n**${latest.title}**\n${latest.link}`
  //       );
  //       console.log(`🧪 แจ้งเตือนทดสอบจาก ${channel.name}: ${latest.title}`);
  //     } catch (err) {
  //       console.error(`❌ Error ขณะทดสอบจาก ${channel.name}:`, err.message);
  //     }
  //   }

  // 🔁 เริ่มระบบตรวจวิดีโอใหม่ทุก X นาที
  setInterval(async () => {
    for (const channel of youtubeChannels) {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;

      try {
        const feed = await parser.parseURL(feedUrl);
        const latest = feed.items[0];
        if (!latest) continue;

        if (latest.id !== lastVideoIds[channel.channelId]) {
          lastVideoIds[channel.channelId] = latest.id;

          const discordChannel = await client.channels.fetch(DISCORD_CHANNEL_ID);
          await discordChannel.send(
            `📢 **${channel.name}** มีวิดีโอใหม่! @everyone\n**${latest.title}**\n${latest.link}`
          );

          console.log(`✅ แจ้งเตือนวิดีโอจาก ${channel.name}: ${latest.title}`);
        }

      } catch (error) {
        console.error(`❌ Error จากช่อง ${channel.name}:`, error.message);
      }
    }
  }, CHECK_INTERVAL_MINUTES * 60 * 1000);
});

client.login(DISCORD_TOKEN);
