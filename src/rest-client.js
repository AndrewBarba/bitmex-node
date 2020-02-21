const { HttpsAgent } = require('agentkeepalive')
const { stringify } = require('querystring')
const got = require('got')
const helpers = require('./helpers')

class RestClient {
  /**
   * @constructor
   * @param {String} [options.apiKey]
   * @param {String} [options.apiSecret]
   * @param {Boolean} [options.testnet=false]
   * @param {String} [options.version=v1]
   * @param {Boolean} [options.maxRetries=10]
   * @param {Boolean} [options.keepAlive=true]
   */
  constructor({ apiKey, apiSecret, testnet = false, version = 'v1', maxRetries = 10, keepAlive = true } = {}) {
    this._apiKey = apiKey
    this._apiSecret = apiSecret
    this._testnet = testnet
    this._maxRetries = maxRetries
    this._version = version
    this._client = got.extend({
      agent: new HttpsAgent({ keepAlive }),
      prefixUrl: testnet 
        ? `https://testnet.bitmex.com/api/${version}` 
        : `https://www.bitmex.com/api/${version}`,
      timeout: 5 * 1000
    })
  }

  /**
   * @param {Helpers} helpers
   */
  get helpers() {
    return helpers
  }

  /*-------------------------------------------------------------------------*
   * Orders
   *-------------------------------------------------------------------------*/

  getOrder(params) {
    return this.request('get', 'order', { params })
  }

  createOrder(data) {
    return this.request('post', 'order', { data })
  }

  createOrderBulk(data) {
    return this.request('post', 'order/bulk', { data })
  }

  updateOrder(data) {
    return this.request('put', 'order', { data })
  }

  updateOrderBulk(data) {
    return this.request('put', 'order/bulk', { data })
  }

  deleteOrder(data) {
    return this.request('delete', 'order', { data })
  }

  deleteAllOrders(data) {
    return this.request('delete', 'order/all', { data })
  }

  cancelOrdersAfter(data) {
    return this.request('post', 'order/cancelAllAfter', { data })
  }

  closePosition(data) {
    return this.request('post', 'order/closePosition', { data })
  }

  /*-------------------------------------------------------------------------*
   * Position
   *-------------------------------------------------------------------------*/

  getPosition(params) {
    return this.request('get', 'position', { params })
  }

  /*-------------------------------------------------------------------------*
   * Trade
   *-------------------------------------------------------------------------*/

  getTradesBucketed(params) {
    return this.request('get', 'trade/bucketed', { params })
  }

  /*-------------------------------------------------------------------------*
   * Private
   *-------------------------------------------------------------------------*/

  /**
   * @private
   * @method request
   * @param {String} method
   * @param {String} url
   * @param {Object} [options.data]
   * @param {Object} [options.params]
   */
  async request(method, path, { params, data, attempt = 1, expires = helpers.time() } = {}) {
    const url = params ? `${path}?${stringify(params)}` : path
    const body = data ? JSON.stringify(data) : undefined
    const headers = {
      'content-type': 'application/json',
      'accept': 'application/json',
      'api-expires': expires
    }

    if (this._apiKey) {
      headers['api-key'] = this._apiKey
      headers['api-signature'] = helpers.requestSignature(this._apiSecret, {
        method,
        url: `/api/${this._version}/${url}`,
        expires,
        body
      })
    }

    const res = await this._client[method](url, {
      headers,
      body,
      responseType: 'json',
      throwHttpErrors: false
    })

    // Handle retries
    if (res.statusCode === 503) {
      if (attempt > this._maxRetries) throw res
      await backoffDelay(attempt)
      return this.request(method, path, { params, data, expires, attempt: attempt + 1 })
    }

    if (res.statusCode >= 400) {
      throw res.body.error
    }

    return res.body
  }
}

function backoffDelay(attempt = 1) {
  return new Promise(resolve => {
    setTimeout(resolve, 500 * attempt)
  })
}

module.exports = RestClient
