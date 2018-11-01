# bitmex-node

[![wercker status](https://app.wercker.com/status/feb7e7d87d5a4a29ea9c04b4a1350a44/s/master "wercker status")](https://app.wercker.com/project/byKey/feb7e7d87d5a4a29ea9c04b4a1350a44)

> *Warning:* This is still in development and the API may change before the official 1.0.0 release.

A full-featured Bitmex API client for Node.js

- [x] Realtime and Rest clients
- [x] 100% unit-test coverage
- [x] Heavily documented
- [x] Promise based with async/await

## Initialize Client

#### Combined

```javascript
const Bitmex = require('bitmex-node')

let bitmex = new Bitmex({
  apiKey: '12345',
  apiSecret: 'abcde'
})

bitmex.rest.request(...)

bitmex.realtime.on('message', () => {})
```

#### Seperately

```javascript
const bitmex = require('bitmex-node')

let restClient = new bitmex.RestClient({
  apiKey: '12345',
  apiSecret: 'abcde'
})

let realtimeClient = new bitmex.RealtimeClient({
  apiKey: '12345',
  apiSecret: 'abcde'
})
```
