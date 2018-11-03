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

  get bidPrice() {
    return this._buys[0].price
  }

  get askPrice() {
    return this._sells[this._sells.length - 1].price
  }

  bidSize(start = 0, end = start + 1) {
    if (end <= start) throw new Error(`Invalid range: [${start}, ${end})`)
    return this.buys.slice(start, end).reduce((a, b) => a + b.size, 0)
  }

  askSize(start = 0, end = start + 1) {
    if (end <= start) throw new Error(`Invalid range: [${start}, ${end})`)
    let n = this.sells.length
    return this.sells.slice(n - end, n - start).reduce((a, b) => a + b.size, 0)
  }

  apply({ action, data }) {
    let buyUpdates = data.filter(item => item.side === 'Buy')
    this._buys = helpers.apply(action, this._buys, buyUpdates)

    let sellUpdates = data.filter(item => item.side === 'Sell')
    this._sells = helpers.apply(action, this._sells, sellUpdates)
  }
}

module.exports = OrderBook
