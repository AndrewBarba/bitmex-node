class OrderBook {
  constructor(data = []) {
    this._partial(data)
  }

  get length() {
    return Object.keys(this._book.Buy).length + Object.keys(this._book.Sell).length
  }

  buys() {
    const rows = Object.values(this._book.Buy)
    return this._sorted(rows)
  }

  sells() {
    const rows = Object.values(this._book.Sell)
    return this._sorted(rows)
  }

  bid(tick = 0) {
    const buys = this.buys()
    return buys[tick]
  }

  ask(tick = 0) {
    const sells = this.sells()
    return sells[sells.length - 1 - tick]
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

  microPrice(tick = 0) {
    const bid = this.bid(tick)
    const ask = this.ask(tick)
    const price = (bid.size * ask.price + ask.size * bid.price) / (bid.size + ask.size)
    return price
  }

  apply({ action, data }) {
    switch (action) {
      case 'partial':
        return this._partial(data)
      case 'insert':
        return this._insert(data)
      case 'update':
        return this._update(data)
      case 'delete':
        return this._delete(data)
    }
  }

  _partial(data) {
    this._book = { Buy: {}, Sell: {} }
    this._insert(data)
  }

  _insert(data) {
    for (const row of data) {
      this._book[row.side][row.id] = row
    }
  }

  _update(data) {
    for (const row of data) {
      const oldRow = this._book[row.side][row.id] || {}
      this._book[row.side][row.id] = { ...oldRow, ...row }
    }
  }

  _delete(data) {
    for (const row of data) {
      delete this._book[row.side][row.id]
    }
  }

  _sorted(book) {
    return book.sort((a, b) => a.id - b.id)
  }
}

module.exports = OrderBook
