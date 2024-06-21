import { ComponentSettings, Manager } from '@managed-components/types'
import { getEcommerceRequestBody } from './ecommerce'
import { getRequestBody } from './track'

const sendEvent = async (
  payload: any,
  manager: Manager,
  settings: ComponentSettings
) => {
  const tiktokEndpoint =
    'https://business-api.tiktok.com/open_api/v1.3/pixel/track/'

  const requestBody = {
    event_source: 'web',
    event_source_id: payload.properties.pixelCode || settings.pixelCode,
    ...payload,
    ...(settings.testKey && {
      test_event_code: settings.testKey,
    }),
  }

  manager.fetch(tiktokEndpoint, {
    method: 'POST',
    headers: {
      'Access-Token': payload.properties.accessToken || settings.accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
}

export default async function (manager: Manager, settings: ComponentSettings) {
  manager.addEventListener('event', async event => {
    const request = await getRequestBody('event', event, settings)
    sendEvent(request, manager, settings)
  })

  manager.addEventListener('pageview', async event => {
    const request = await getRequestBody('pageview', event, settings)
    sendEvent(request, manager, settings)
  })

  manager.addEventListener('ecommerce', async event => {
    const request = await getEcommerceRequestBody(event, settings)
    sendEvent(request, manager, settings)
  })
}
