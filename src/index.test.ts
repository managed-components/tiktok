import { MCEvent } from '@managed-components/types'
import { getRequestBody } from './track'
import { vi, describe, it, expect } from 'vitest'
import { getEcommerceRequestBody } from './ecommerce'

describe('Reports correctly to TikTok Events API 2.0', () => {
  it('pageview generates a compliant payload', async () => {
    const expectedResult = {
      event: 'ViewContent',
      user: {
        user_agent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        ip: '::1',
        ttclid: 'test-ttclid',
      },
      page: {
        url: 'http://localhost:1337/',
        referrer: 'https://google.com',
      },
      ad: {
        callback: 'test-ttclid',
      },
      properties: {},
      limited_data_use: undefined,
    }

    const settings = {}

    const mockMCEvent = {
      payload: {
        ldu: undefined,
      },
      client: {
        emitter: 'browser',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        language: 'en-GB,en-US;q=0.9,en;q=0.8',
        referer: 'https://google.com',
        ip: '::1',
        title: 'My Website',
        timestamp: 1692890759111,
        url: new URL('http://localhost:1337/'),
        get: vi.fn().mockReturnValue('test-ttclid'),
      },
      type: 'pageview',
    } as unknown as MCEvent

    const result = await getRequestBody(mockMCEvent.type, mockMCEvent, settings)
    delete (result as Record<string, unknown>).event_time
    delete (result as Record<string, unknown>).event_id
    expect(result).toEqual(expectedResult)
  })
  it('event generates a compliant payload', async () => {
    const expectedResult = {
      event: 'SubmitForm',
      user: {
        user_agent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        ip: '::1',
        ttclid: 'test-ttclid',
      },
      page: {
        url: 'http://localhost:1337/',
        referrer: 'https://google.com',
      },
      ad: {
        callback: 'test-ttclid',
      },
      properties: {},
      limited_data_use: undefined,
    }

    const settings = {}

    const mockMCEvent = {
      payload: {
        ldu: undefined,
        ev: 'SubmitForm',
      },
      client: {
        emitter: 'browser',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        language: 'en-GB,en-US;q=0.9,en;q=0.8',
        referer: 'https://google.com',
        ip: '::1',
        title: 'My Website',
        timestamp: 1692890759111,
        url: new URL('http://localhost:1337/'),
        get: vi.fn().mockReturnValue('test-ttclid'),
      },
      type: 'event',
    } as unknown as MCEvent

    const result = await getRequestBody(mockMCEvent.type, mockMCEvent, settings)
    delete (result as Record<string, unknown>).event_time
    delete (result as Record<string, unknown>).event_id
    expect(result).toEqual(expectedResult)
  })
  it('custom-event generates a compliant payload', async () => {
    const expectedResult = {
      event: 'custom-event',
      user: {
        user_agent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        ip: '::1',
        ttclid: 'test-ttclid',
      },
      page: {
        url: 'http://localhost:1337/',
        referrer: 'https://google.com',
      },
      ad: {
        callback: 'test-ttclid',
      },
      properties: {},
      limited_data_use: undefined,
    }

    const settings = {}

    const mockMCEvent = {
      payload: {
        ldu: undefined,
        ev: 'custom-event',
      },
      client: {
        emitter: 'browser',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        language: 'en-GB,en-US;q=0.9,en;q=0.8',
        referer: 'https://google.com',
        ip: '::1',
        title: 'My Website',
        timestamp: 1692890759111,
        url: new URL('http://localhost:1337/'),
        get: vi.fn().mockReturnValue('test-ttclid'),
      },
      type: 'custom-event',
    } as unknown as MCEvent

    const result = await getRequestBody(mockMCEvent.type, mockMCEvent, settings)
    delete (result as Record<string, unknown>).event_time
    delete (result as Record<string, unknown>).event_id
    expect(result).toEqual(expectedResult)
  })
  it('ecommerce generates a compliant payload', async () => {
    const expectedResult = {
      event: 'AddToCart',
      user: {
        user_agent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        ip: '::1',
        ttclid: 'test-ttclid',
      },
      page: {
        url: 'http://localhost:1337/',
        referrer: 'https://google.com',
      },
      ad: {
        callback: 'test-ttclid',
      },
      properties: {
        value: 14.99,
        currency: 'usd',
        contents: [
          {
            price: 14.99,
            quantity: 1,
            content_id: '2671033',
            content_category: 'T-shirts',
            content_name: 'V-neck T-shirt',
            brand: 'Cool Brand',
          },
        ],
        order_id: undefined,
      },
      limited_data_use: undefined,
    }

    const settings = {}

    const mockMCEvent = {
      name: 'Product Added',
      type: 'ecommerce',
      payload: {
        ecommerce: {
          product_id: '999555321',
          sku: '2671033',
          category: 'T-shirts',
          name: 'V-neck T-shirt',
          brand: 'Cool Brand',
          variant: 'White',
          price: 14.99,
          currency: 'usd',
          quantity: 1,
          coupon: 'SUMMER-SALE',
          position: 2,
        },
        name: 'Product Added',
      },
      ldu: undefined,
      client: {
        emitter: 'browser',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        language: 'en-GB,en-US;q=0.9,en;q=0.8',
        referer: 'https://google.com',
        ip: '::1',
        title: 'My Website',
        timestamp: 1692890759111,
        url: new URL('http://localhost:1337/'),
        get: vi.fn().mockReturnValue('test-ttclid'),
      },
    } as unknown as MCEvent

    const result = await getEcommerceRequestBody(mockMCEvent, settings)
    delete (result as Record<string, unknown>).event_time
    delete (result as Record<string, unknown>).event_id
    expect(result).toEqual(expectedResult)
  })
})
