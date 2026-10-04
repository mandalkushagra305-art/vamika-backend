const express = require('express');
const app = express();

app.use(express.json());

// ================= META CLOUD API CONFIGURATION =================
// Cooldown ke baad milne wale credentials yahan daalein ya Render Environment Variables me set karein:
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'PASTE_YOUR_TEMPORARY_ACCESS_TOKEN_HERE';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || 'PASTE_YOUR_PHONE_NUMBER_ID_HERE';

// Emergency Contact Numbers (Country code ke saath, e.g., 918448234755)
const emergencyContacts = [
    '918448234755'
];

app.get('/', (req, res) => {
    res.status(200).send('🚀 Vamika Backend Server is Live & Running!');
});

// Webhook Endpoint for Emergency Alert
app.post('/send-alert', async (req, res) => {
    const { message, location } = req.body;

    const alertText = message || '🚨 EMERGENCY ALERT TRIGGERED!';
    const fullMessage = location ? `${alertText}\n📍 Location: ${location}` : alertText;

    try {
        const dispatchPromises = emergencyContacts.map(async (recipientNumber) => {
            const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

            const payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: recipientNumber,
                type: 'text',
                text: { preview_url: false, body: fullMessage }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('Meta API Response Error:', data);
                throw new Error(data.error?.message || 'Meta API Request Failed');
            }
            return data;
        });

        await Promise.all(dispatchPromises);
        console.log('✅ Emergency alert dispatched successfully via Meta Cloud API!');
        res.status(200).json({ status: 'Success', recipients: emergencyContacts.length });

    } catch (error) {
        console.error('❌ Error dispatching WhatsApp messages:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 VAMIKA Webhook active and listening on port ${PORT}`);
});
