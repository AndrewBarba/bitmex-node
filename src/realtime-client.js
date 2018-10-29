const EventEmitter = require('events')
const WebSocket = require('ws')
const helpers = require('./helpers')

class RealtimeClient extends EventEmitter {

  /**
   * @constructor
   * @param {String} [options.apiKey]
   * @param {String} [options.apiSecret]
   * @param {Boolean} [options.testnet=false]
   */
  constructor({ apiKey, apiSecret, testnet = false } = {}) {
    super()
    this._apiKey = apiKey
    this._apiSecret = apiSecret
    this._testnet = testnet
    this._pingInterval = null
    this.connect()
  }

  /**
   * @param {Number} readyState
   */
  get readyState() {
    if (!this._socket) return -1
    return this._socket.readyState
  }

  /**
   * @param {Boolean} isReady
   */
  get isReady() {
    return this.readyState === 1
  }

  /**
   * @method connect
   */
  connect() {
    let url = this._testnet ? 'wss://testnet.bitmex.com/realtime' : 'wss://www.bitmex.com/realtime'
    let headers = {}

    if (this._apiKey) {
      let method = 'GET'
      let url = '/realtime'
      let expires = helpers.time()
      headers['api-key'] = this._apiKey
      headers['api-expires'] = expires
      headers['api-signature'] = helpers.requestSignature(this._apiSecret, { method, url, expires })
    }

    this._socket = new WebSocket(url, null, { headers })
    this._socket.on('open', () => this.emit('open'))
    this._socket.on('close', () => this.emit('close'))
    this._socket.on('error', () => this.emit('error'))
    this._socket.on('message', text => this._onMessage(text))
  }

  /**
   * @method disconnect
   */
  disconnect() {
    clearInterval(this._pingInterval)
    this._socket.close()
    this._socket = null
  }

  /**
   * @private
   * @method _onMessage
   * @param {String} data
   */
  _onMessage(text) {
    let message
    try {
      message = JSON.parse(text)
    } catch(error) {
      return this.emit('message.error', { error })
    }

    this._touchPingInterval()

    this.emit('message', message)

    if (message.subscribe)
      this.emit(`message.subscribe.${message.subscribe}`, message)

    if (message.table)
      this.emit(`message.table.${message.table}`, message)

    if (message.table && message.data[0] && message.data[0].symbol)
      this.emit(`message.table.${message.table}:${message.data[0].symbol}`, message)

    if (message.error)
      this.emit(`message.error`, message)

    if (message.request)
      this.emit(`message.request.${message.request.op}`, message)
  }

  /**
   * @method subscribe
   * @param {String} table
   * @param {Function} callback
   * @return {Promise}
   */
  async subscribe(table, callback) {
    let promise = new Promise((resolve, reject) => {
      let partial = false

      this.once(`message.subscribe.${table}`, msg => {
        if (!msg.success) reject(msg)
      })

      this.on(`message.table.${table}`, msg => {
        if (partial) {
          return callback(msg)
        } else if (msg.action === 'partial') {
          partial = true
          return resolve(msg)
        }
      })
    })

    await this.request('subscribe', table)

    return promise
  }

  /**
   * @method request
   * @param {String} op
   * @param {Array|String} [args]
   * @return {Promise}
   */
  request(op, args = []) {
    return new Promise((resolve, reject) => {
      let data = JSON.stringify({ op, args })
      this._socket.send(data, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  /**
   * @private
   * @method _touchPingInterval
   */
  _touchPingInterval() {
    clearInterval(this._pingInterval)
    this._pingInterval = setInterval(() => this._socket.ping(), 5000)
  }
}

module.exports = RealtimeClient
