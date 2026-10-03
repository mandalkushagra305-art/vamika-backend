const express = require('express');
const twilio = require('twilio');
const app = express();

app.use(express.json());

// ================= TWILIO CONFIGURATION =================
// Replace these placeholders with your actual Twilio Account credentials
const accountSid = 'AC3c35266c015dcdd882a62c9e1b08d525';
const authToken  = '70dc1ca5036deeef18c00ebded380fa1';
const client     = twilio(accountSid, authToken);

// Your Twilio Sandbox WhatsApp Number
const twilioNumber = 'whatsapp:+17372508034'; 

// ================= EMERGENCY CONTACTS =================
// Add all emergency recipient numbers here in international format (+91...)
const emergencyContacts = [
    'whatsapp:+918448234755',
    'whatsapp:+919560124333'
];

// Root endpoint for browser status check
app.get('/', (req, res) => {
    res.status(200).send('🚀 Vamika Backend Server is Live & Running!');
});

// =======================================================
// Webhook Endpoint triggered by ESP32
app.post('/send-alert', async (req, res) => {
    const { message, location } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message content is missing' });
    }

    const fullPayload = location ? `${message}\n\n📍 ${location}` : message;

    try {
        // Broadcast WhatsApp messages concurrently to all contacts in the array
        const dispatchPromises = emergencyContacts.map(contact => {
            return client.messages.create({
                from: twilioNumber,
                to: contact,
                body: fullPayload
            });
        });

        await Promise.all(dispatchPromises);
        console.log('✅ Emergency alert dispatched to ALL WhatsApp contacts!');
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