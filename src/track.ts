import { ComponentSettings, MCEvent } from '@managed-components/types'

const USER_DATA: Record<string, { hashed?: boolean }> = {
  email: { hashed: true },
  phone_number: { hashed: true },
  external_id: { hashed: true },
  ttp: { hashed: false },
}

const getTtclid = (event: MCEvent) => {
  const { client } = event
  let ttclid = client.get('ttclid') || ''

  if (client.url.searchParams?.get('ttclid')) {
    ttclid = client.url.searchParams.get('ttclid') ?? ''
    client.set('ttclid', ttclid)
  }
  return ttclid
}

const getBaseRequestBody = (
  eventType: string,
  event: MCEvent,
  settings: ComponentSettings
) => {
  const { client, payload } = event
  const eventId =
    payload.event_id || String(Math.round(Math.random() * 100000000000000000))

  // Events API 2.0
  // https://business-api.tiktok.com/portal/docs?id=1771100865818625

  const body: { [k: string]: any } = {
    data: [
      {
        event:
          (eventType === 'pageview' ? 'Pageview' : payload.ev) ||
          event.name ||
          event.type,
        event_time: new Date(client.timestamp! * 1000).toISOString(), // number. The time that the event took place. Use unix timestamp. Example: 1697783008.
        event_id: eventId, // event_id. A unique ID for the event for deduplication. Example: "Z1A2R3A4Z5".
        user: {
          ...(!settings.hideClientIP && {
            user_agent: client.userAgent, // string. Non-hashed user agent from the user’s device. Example: "Chrome/91.0.4472.124".
            ip: client.ip, // string. Non-hashed public IP address of the browser.
          }),
        },
        page: {
          url: client.url.href, // string. The page URL where the event took place. Example: "http://demo.mywebsite.com/purchase"
          referrer: client.url.referrer, // string. The URL of the referrer page. Example: "http://demo.mywebsite.com/home".
        },
        properties: {},
      },
    ],
  }

  delete payload.ev

  return body
}

export const getRequestBody = async (
  eventType: string,
  event: MCEvent,
  settings: ComponentSettings
) => {
  // an array containing built-in fields that must be kept up to date!
  const builtInFields = [
    'ev',
    'email',
    'phone_number',
    'external_id',
    'event_id',
  ]

  let payload
  if (eventType === 'ecommerce') {
    payload = event.payload.ecommerce
    delete event.payload.ecommerce
    for (const [key, value] of Object.entries(event.payload)) {
      if (!builtInFields.includes(key)) {
        payload[key] = value
      }
    }
  } else {
    payload = event.payload
  }
  const ttclid = getTtclid(event)
  const body = getBaseRequestBody(eventType, event, settings)

  // appending hashed user data
  const encoder = new TextEncoder()
  for (const [key, options] of Object.entries(USER_DATA)) {
    let value = payload[key]
    if (value) {
      if (options.hashed) {
        const data = encoder.encode(value.trim().toLowerCase())
        const digest = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(digest))
        value = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      }
      body.data.user[key] = value
      delete payload[key]
    }
  }
  // sending custom fields inside body.properties
  for (const [key, value] of Object.entries(payload)) {
    if (!builtInFields.includes(key)) {
      body.properties[key] = value
    }
  }

  const ttpFromCookie = event.client.get('_ttp')
  if (!body.data.user.ttp && ttpFromCookie) {
    body.data.user.ttp = ttpFromCookie
  }

  if (ttclid) {
    body.data.user = ttclid
  }

  return body
}
