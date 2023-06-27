import { ComponentSettings, MCEvent } from '@managed-components/types'

const USER_DATA: Record<string, { hashed?: boolean }> = {
  email: { hashed: true },
  phone_number: { hashed: true },
  external_id: { hashed: true }
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
  const eventId = String(Math.round(Math.random() * 100000000000000000))

  const body: { [k: string]: any } = {
    event:
      (eventType === 'pageview' ? 'ViewContent' : payload.ev) ||
      event.name ||
      event.type,
    event_id: eventId,
    timestamp: new Date(client.timestamp! * 1000).toISOString(),
    context: {
      page: {
        url: client.url.href,
      },
      ...(!settings.hideClientIP && {
        user_agent: client.userAgent,
        ip: client.ip,
      }),
      user: {},
      ad: {},
    },
    properties: {},
  }
  delete payload.ev

  return body
}

export const getRequestBody = async (
  eventType: string,
  event: MCEvent,
  settings: ComponentSettings
) => {
  let payload
  if (eventType === 'ecommerce') {
    payload = event.payload.ecommerce
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
        const hashedValue = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        if (key === 'email' || key === 'phone_number') {
            body.context.user[`sha256_${key}`] = hashedValue
        } else {
            body.context.user[key] = hashedValue
        }
      } else {
          body.context.user[key] = value
      }
      delete payload[key]
    }
  }

  if (ttclid) {
    body.context.ad = {
      callback: ttclid,
    }
  }

  return body
}
