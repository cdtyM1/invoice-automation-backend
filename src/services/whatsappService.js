export async function sendWhatsApp({ phone, message }) {
  try {
    if (!phone || !message || !process.env.FONNTE_TOKEN) {
      console.warn('WhatsApp not sent: missing phone, message, or token');
      return { ok: false, error: 'Missing WhatsApp configuration' };
    }

    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': process.env.FONNTE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: phone,
        message
      })
    });

    const data = await res.json();

    if (data.status) {
      console.log(`✓ WhatsApp sent to ${phone}`);
    }

    return { ok: true, data };
  } catch (error) {
    console.error('WhatsApp error:', error.message);
    return { ok: false, error: error.message };
  }
}
