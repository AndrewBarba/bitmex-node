class OrderBook {

  constructor(data = []) {
    this._book = _sorted(data)
  }

  get length() {
    return this._book.length
  }

  buys() {
    return this._book.filter(item => item.side === 'Buy')
  }

  sells() {
    return this._book.filter(item => item.side === 'Sell')
  }

  bid(tick = 0) {
    let buys = this.buys()
    return buys[tick]
  }

  ask(tick = 0) {
    let sells = this.sells()
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
    let bid = this.bid(tick)
    let ask = this.ask(tick)
    let price = ((bid.size * ask.price) + (ask.size * bid.price)) / (bid.size + ask.size)
    return price
  }

  apply({ action, data }) {
    switch (action) {
    case 'partial':
      return _partial.call(this, data)
    case 'insert':
      return _insert.call(this, data)
    case 'update':
      return _update.call(this, data)
    case 'delete':
      return _delete.call(this, data)
    }
  }
}

function _partial(data) {
  this._book = _sorted(data)
}

function _insert(data) {
  let book = [...this._book, ...data]
  this._book = _sorted(book)
}

function _update(data) {
  let book = this._book.map(item => {
    for (let newItem of data) {
      if (newItem.id !== item.id) continue
      return { ...item, ...newItem }
    }
    return item
  })
  this._book = _sorted(book)
}

function _delete(data) {
  let book = this._book.filter(item => {
    for (let newItem of data) {
      if (newItem.id === item.id) return false
    }
    return true
  })
  this._book = _sorted(book)
}

function _sorted(book) {
  return book.sort((a, b) => a.id - b.id)
}

module.exports = OrderBook
