import fetch from 'node-fetch';

// Function to handle incoming webhook events
export const handleWebhook = (req, res) => {
    const event = req.body;

    // Process the event based on its type
    switch (event.type) {
        case 'payment.success':
            // Handle successful payment
            console.log('Payment was successful:', event.data);
            break;
        case 'payment.failed':
            // Handle failed payment
            console.log('Payment failed:', event.data);
            break;
        // Add more event types as needed
        default:
            console.log('Unhandled event type:', event.type);
    }

    // Respond to the webhook request
    res.status(200).send('Webhook received');
};

// Trigger Webhook Util
export const triggerWebhook = async (url, payload) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (error) {
    console.error('Webhook POST failed:', error.message);
    return false;
  }
};
