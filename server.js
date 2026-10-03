const express = require('express');
const twilio = require('twilio');
const app = express();

app.use(express.json());

// ================= TWILIO CONFIGURATION =================
const accountSid = 'AC3c35266c015dcdd882a62c9e1b08d525';
const authToken  = '70dc1ca5036deeef18c00ebded380fa1';
const client     = twilio(accountSid, authToken);

// Twilio Sandbox WhatsApp Number
const twilioNumber = 'whatsapp:+17372508034'; 

// ================= EMERGENCY CONTACTS =================
const emergencyContacts = [
    'whatsapp:+918448234755'
];

app.get('/', (req, res) => {
    res.status(200).send('🚀 Vamika Backend Server is Live & Running!');
});

// Webhook Endpoint
app.post('/send-alert', async (req, res) => {
    const { message, location } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message content is missing' });
    }

    const textPayload = location ? String(message) + "\n\n📍 " + String(location) : String(message);

    try {
        const dispatchPromises = emergencyContacts.map(contact => {
            return client.messages.create({
                body: textPayload,
                from: twilioNumber,
                to: contact
            });
        });

        await Promise.all(dispatchPromises);
        console.log('✅ Emergency alert dispatched successfully!');
        res.status(200).json({ status: 'Success', recipients: emergencyContacts.length });

    } catch (error) {
        console.error('❌ Error dispatching WhatsApp messages:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 VAMIKA Webhook active and listening on port ${PORT}`);
});