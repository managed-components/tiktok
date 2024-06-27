import { ComponentSettings, MCEvent } from '@managed-components/types'

const USER_DATA: Record<string, { hashed?: boolean }> = {
  email: { hashed: true },
  phone: { hashed: true },
  external_id: { hashed: true },
  ttp: { hashed: false },
  ttclid: { hashed: false },
  locale: { hashed: false },
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
    event_time: new Date(client.timestamp! * 1000).toISOString(),
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
    ad: {},
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
  // an array containing built-in fields that must be kept up to date!
  const builtInFields = [
    'ev',
    'cev',
    'email',
    'phone',
    'external_id',
    'event_id',
    'ldu',
    'name',
  ]

  let payload
  if (eventType === 'ecommerce') {
    payload = event.payload
    delete payload.ecommerce
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

  if (ttclid) {
    payload.ttclid = ttclid
    body.ad = {
      callback: ttclid,
    }
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
      delete payload[key]
    }
  }
  // sending custom fields inside body.properties
  for (const [key, value] of Object.entries(payload)) {
    if (!builtInFields.includes(key)) {
      body.properties[key] = value
    }
  }

  return body
}
