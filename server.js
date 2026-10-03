const express = require('express');
const app = express();

app.use(express.json());

// ================= TWILIO CONFIGURATION =================
const accountSid = 'AC3c35266c015dcdd882a62c9e1b08d525';
const authToken  = '70dc1ca5036deeef18c00ebded380fa1';
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
    try {
        const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

        const dispatchPromises = emergencyContacts.map(async (contact) => {
            const formData = new URLSearchParams();
            formData.append('From', twilioNumber);
            formData.append('To', contact);
            // Twilio Sandbox ka pre-approved default template ID
            formData.append('ContentSid', 'HXb5b62575e6e4ff6129ad7c8efe1f983e'); 

            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });

            const responseData = await response.json();
            if (!response.ok) {
                console.error('Twilio Direct API Response Error:', responseData);
                throw new Error(responseData.message || 'Twilio Request Failed');
            }
            return responseData;
        });

        await Promise.all(dispatchPromises);
        console.log('✅ Emergency alert dispatched successfully via Template!');
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