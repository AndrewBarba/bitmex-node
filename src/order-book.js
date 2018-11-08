const helpers = require('./helpers')

class OrderBook {

  constructor(data = []) {
    this._buys = data.filter(item => item.side === 'Buy')
    this._sells = data.filter(item => item.side === 'Sell')
  }

  get buys() {
    return this._buys
  }

  get sells() {
    return this._sells
  }

  bid(tick = 0) {
    return this._buys[tick]
  }

  ask(tick = 0) {
    return this._sells[this._sells.length - 1 - tick]
  }

  bidPrice(tick = 0) {
    return this.bid(tick).price
  }

  askPrice(tick = 0) {
    return this.ask(tick).price
  }

  bidSize(tick = 0) {
    return this.bid(tick).size
  }

  askSize(tick = 0) {
    return this.ask(tick).size
  }

  apply({ action, data }) {
    let buyUpdates = data.filter(item => item.side === 'Buy')
    this._buys = helpers.apply(action, this._buys, buyUpdates)

    let sellUpdates = data.filter(item => item.side === 'Sell')
    this._sells = helpers.apply(action, this._sells, sellUpdates)
  }
}

module.exports = OrderBook
