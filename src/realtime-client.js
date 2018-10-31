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
    this._closeInterval = null
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
    this._socket.on('error', () => this.emit('error'))
    this._socket.on('close', this._onClose.bind(this))
    this._socket.on('pong', this._onPong.bind(this))
    this._socket.on('message', this._onMessage.bind(this))
  }

  /**
   * @method disconnect
   * @param {Number} code
   */
  disconnect(code = 1000) {
    clearInterval(this._pingInterval)
    if (this.readyState === 1) {
      this._socket.close(code)
      this._socket = null
    } else {
      this.emit('close', code)
    }
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

    if (message.table && message.filter)
      this.emit(`message.table.${message.table}:${message.filter.symbol}`, message)

    if (message.table && message.data.length)
      this.emit(`message.table.${message.table}:${message.data[0].symbol}`, message)

    if (message.error)
      this.emit(`message.error`, message)

    if (message.request)
      this.emit(`message.request.${message.request.op}`, message)
  }

  /**
   * @private
   * @method _onClose
   * @param {String} data
   */
  _onClose(code) {
    clearInterval(this._pingInterval)
    this._socket = null
    this.emit('close', code)
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
        if (partial && msg.action !== 'partial') {
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
   * @method unsubscribe
   * @param {String} table
   * @param {Function} callback
   * @return {Promise}
   */
  async unsubscribe(table, callback) {
    this.removeListener(table, callback)
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
    clearInterval(this._closeInterval)
    this._pingInterval = setInterval(this._firePing.bind(this), 5000)
  }

  /**
   * @private
   * @method _firePing
   */
  _firePing() {
    this._socket.ping()
    this._closeInterval = setInterval(() => this.disconnect(1001), 15000)
  }

  /**
   * @private
   * @method _onPong
   */
  _onPong() {
    clearInterval(this._closeInterval)
  }
}

module.exports = RealtimeClient
