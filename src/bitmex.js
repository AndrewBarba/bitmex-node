const RestClient = require('./rest-client')
const RealtimeClient = require('./realtime-client')
const helpers = require('./helpers')

class Bitmex {

  /**
   * @static
   * @param {RestClient} RestClient
   */
  static get RestClient() {
    return RestClient
  }

  /**
   * @static
   * @param {RealtimeClient} RealtimeClient
   */
  static get RealtimeClient() {
    return RealtimeClient
  }

  /**
   * @constructor
   */
  constructor() {
    this._rest = new RestClient(...arguments)
    this._realtime = new RealtimeClient(...arguments)
    this._deadManInterval = null
  }

  /**
   * @param {RestClient} rest
   */
  get rest() {
    return this._rest
  }

  /**
   * @param {RealtimeClient} realtime
   */
  get realtime() {
    return this._realtime
  }

  /**
   * @param {Helpers} helpers
   */
  get helpers() {
    return helpers
  }

  /**
   * @method startDeadMansSwitch
   * @param {Number} [timeout=60000]
   * @return {Promise}
   */
  startDeadMansSwitch(timeout = 60000) {
    let interval = (timeout / 4)
    let deadManRequest = () => this.rest.cancelOrdersAfter({ timeout })
    this._deadManInterval = setInterval(deadManRequest, interval)
    return deadManRequest()
  }

  /**
   * @method stopDeadMansSwitch
   * @param {Boolean} [keepOrders=false]
   * @return {Promise}
   */
  async stopDeadMansSwitch(keepOrders = false) {
    clearInterval(this._deadManInterval)
    this._deadManInterval = null
    if (keepOrders) {
      await this.rest.cancelOrdersAfter({ timeout: 0 })
    }
  }
}

module.exports = Bitmex
