import { ComponentSettings, MCEvent } from '@managed-components/types'
import { getRequestBody } from './track'

/**
 * Mapping the standard MC ecommerce API to TikTok event names
 */
const EVENT_NAMES_MAP: { [k: string]: string } = {
  'Order Completed': 'CompletePayment',
  'Product Added': 'AddToCart',
  'Products Searched': 'Search',
  'Checkout Started': 'InitiateCheckout',
  'Payment Info Entered': 'AddPaymentInfo',
  'Product Added to Wishlist': 'AddToWishlist',
  'Product Viewed': 'ViewContent',
}

const getContents = (payload: any) => {
  const products = payload.products || [{}]

  return products.map((p: any) => {
    return {
      price: p.price || payload.price,
      quantity: p.quantity || 1,
      content_id: p.sku || p.product_id || payload.sku || payload.product_id,
      content_category: p.category || payload.category,
      content_name: p.name || payload.name,
      brand: p.brand || payload.brand,
    }
  })
}

const getValue = (payload: any) =>
  payload.revenue || payload.total || payload.value || payload.price

const mapEcommerceData = (event: MCEvent) => {
  const { payload } = event
  const data = payload.ecommerce

  const properties: { [k: string]: any } = {}

  properties.value = getValue(data)
  properties.currency = data.currency

  properties.contents = getContents(data)
  if (properties.contents?.content_id) {
    properties.content_type = 'product'
  }
  if (event.name === 'Products Searched') {
    properties.query = data.query
  }
  properties.order_id = payload.order_id
  return properties
}

export const getEcommerceRequestBody = async (
  event: MCEvent,
  settings: ComponentSettings
) => {
  const ecommerceData = mapEcommerceData(event)
  delete event.payload.ecommerce.products
  const request = await getRequestBody('ecommerce', event, settings)

  request.event = EVENT_NAMES_MAP[event.name || '']
  delete request.properties.eventName

  request.properties = { ...request.properties, ...ecommerceData }

  return request
}
