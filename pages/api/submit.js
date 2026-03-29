export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook URL not configured' })
  }

  const { name, property, before, change, areas, nps, marketing, extra } = req.body

  const payload = {
    timestamp: new Date().toISOString(),
    name:       name      || '',
    property:   property  || '',
    before:     before    || '',
    change:     change    || '',
    areas:      Array.isArray(areas) ? areas.join(', ') : '',
    nps:        nps !== undefined ? String(nps) : '',
    marketing:  marketing || '',
    extra:      extra     || '',
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}`)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).json({ error: 'Failed to submit' })
  }
}
