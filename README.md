# TikTok Managed Component

Find out more about Managed Components [here](https://blog.cloudflare.com/zaraz-open-source-managed-components-and-webcm/) for inspiration and motivation details.

[![Released under the Apache license.](https://img.shields.io/badge/license-apache-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 🚀 Quickstart local dev environment

1. Make sure you're running node version >=17.
2. Install dependencies with `npm i`
3. Run unit test watcher with `npm run test:dev`

## ⚙️ Tool Settings

> Settings are used to configure the tool in a Component Manager config file

### Pixel Code `string` _required_

`pixelCode` is a long number that identifies your Facebook Ads account.

### API Access Token _required_

`accessToken` is a string used to authenticate when sending server side events in your name. You can obtain it [following the information here](https://ads.tiktok.com/marketing_api/docs?id=1727537566862337n).

### Test Event Code

`testKey` is used to test your app or web browser events using test events tool [Learn more](https://ads.tiktok.com/marketing_api/docs?id=1727537566862337)

## 🧱 Fields Description

> Fields are properties that can/must be sent with certain events

### Tiktok Standard Event Name `string` _required_

`ev` can be \"ContentView\", \"PlaceAnOrder\", \"Add to Cart\" one of [the standard Tiktok events](https://ads.tiktok.com/marketing_api/docs?id=1727541103358977).

### Custom Event Name `string` _required_

`cev` can be any custom event name. Do not use sensitive words in the name of Custom Events. [Learn more](https://business-api.tiktok.com/portal/docs?id=1771101303285761).

### Email `string`

`email` user email. Automatically hashed.

### Phone `string`

`phone` remove symbols, letters, and any leading zeros. Phone numbers must include a country code to be used for matching (e.g., the number 1 must precede a phone number in the United States). Always include the country code as part of your customers' phone numbers, even if all of your data is from the same country. Automatically hashed.

### Limited Data Use `string`

`ldu` can be `true` or `false`. If set to 'true', TikTok will recognize this parameter as a request for limited data processing, and will limit its processing activities accordingly if the event shared occurred in an eligible location. [Learn more](https://business-api.tiktok.com/portal/docs?id=1771101204435970).

### External ID `string`

`external_id` IDs that represent any unique identifier on the advertiser's side, such as loyalty membership IDs, user IDs, and external cookie IDs. Automatically hashed.

### TikTok Pixel Cookie ID `string`

`ttp` can be `_ttp` Cookie value. If you also use Pixel SDK and have enabled cookies, Pixel SDK automatically saves a unique identifier in the \_ttp cookie. The value of \_ttp is used to match website visitor events with TikTok ads. You can extract the value of \_ttp and attach the value here. [Learn more](https://business-api.tiktok.com/portal/docs?id=1771101303285761).
