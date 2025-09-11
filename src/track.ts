import { ComponentSettings, MCEvent } from '@managed-components/types'

// sourced from https://ads.tiktok.com/help/article/about-parameters?lang=en
const USER_DATA: Record<string, { hashed?: boolean }> = {
  email: { hashed: true },
  phone: { hashed: true },
  phone_number: { hashed: true },
  external_id: { hashed: true },
  ttp: { hashed: false },
  ttclid: { hashed: false },
  locale: { hashed: false },
  content_type: { hashed: false },
  quantity: { hashed: false },
  description: { hashed: false },
  content_ids: { hashed: false },
  currency: { hashed: false },
  price: { hashed: false },
  value: { hashed: false },
  search_string: { hashed: false },
  contents: { hashed: false },
  delivery_category: { hashed: false },
  content_name: { hashed: false },
  content_category: { hashed: false },
  status: { hashed: false },
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

  const body: { [k: string]: any } = {
    event:
      (eventType === 'pageview' ? 'ViewContent' : payload.ev) ||
      payload.cev ||
      event.name ||
      event.type,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    user: {
      ...(!settings.hideClientIP && {
        user_agent: client.userAgent,
        ip: client.ip,
      }),
    },
    page: {
      url: client.url.href,
      referrer: client.referer || '',
    },
    properties: {},
    limited_data_use: payload.ldu,
  }
  delete payload.ev

  return body
}

export const getRequestBody = async (
  eventType: string,
  event: MCEvent,
  settings: ComponentSettings
) => {
  const payload = event.payload
  const ttclid = getTtclid(event)
  const body = getBaseRequestBody(eventType, event, settings)

  if (ttclid) {
    payload.ttclid = ttclid
  }
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
      body.user[key] = value
      // backward compatibility for 'phone_number' (from event api v1)
      if (body.user.phone_number) {
        body.user.phone = body.user.phone_number
        delete body.user.phone_number
      }
      delete payload[key]
    }
  }

  return body
}
