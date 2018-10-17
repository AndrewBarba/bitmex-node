const axios = require('axios')
const https = require('https')
const querystring = require('querystring')
const helpers = require('./helpers')

class RestClient {

  /**
   * @constructor
   * @param {String} options.apiKey
   * @param {String} options.apiSecret
   * @param {Boolean} [options.testnet=false]
   * @param {Boolean} [options.maxRetries=10]
   * @param {Boolean} [options.keepAlive=true]
   */
  constructor({ apiKey, apiSecret, testnet = false, maxRetries = 10, keepAlive = true } = {}) {
    if (!apiKey) throw new Error('apiKey is required')
    if (!apiSecret) throw new Error('apiSecret is required')
    this._apiKey = apiKey
    this._apiSecret = apiSecret
    this._testnet = testnet
    this._maxRetries = maxRetries
    this._client = axios.create({
      baseURL: testnet ? 'https://testnet.bitmex.com/api/v1' : 'https://www.bitmex.com/api/v1',
      httpsAgent: new https.Agent({ keepAlive })
    })
  }

  /*-------------------------------------------------------------------------*
   * Public
   *-------------------------------------------------------------------------*/



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
    let url = String(path)
    if (params) url += `?${querystring.stringify(params)}`

    let body = data ? JSON.stringify(body) : ''

    let headers = {
      'content-type': 'application/json',
      'accept': 'application/json',
      'api-expires': expires,
      'api-key': this._apiKey,
      'api-signature': helpers.requestSignature(this._apiSecret, { method, url, expires, body })
    }

    let res = await this._client.request({ method, url, headers, validateStatus: null })

    // Handle retries
    if (res.status === 503) {
      if (attempt > this._maxRetries) throw res
      await backoffDelay(attempt)
      return this.request(method, path, { params, data, expires, attempt: attempt + 1 })
    }

    if (res.status >= 400) {
      throw res
    }

    return res.data
  }
}

function backoffDelay(attempt = 1) {
  return new Promise(resolve => {
    setTimeout(resolve, 500 * attempt)
  })
}

module.exports = RestClient
