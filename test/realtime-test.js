/* eslint-disable no-async-promise-executor */
const { API_KEY, API_SECRET } = process.env
const should = require('should')
const { RealtimeClient } = require('../src')
let client = null

describe('bitmex-node', () => {
  describe('realtime', () => {
    beforeEach((done) => {
      client = new RealtimeClient({
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        testnet: true
      })
      client.on('open', done)
    })

    it('should subscribe to margin updates', async () => {
      let msg = await client.subscribe('margin', () => {})
      should.exist(msg)
      msg.action.should.equal('partial')
    })

    it('should subscribe to quote updates', async () => {
      await new Promise(async (resolve) => {
        let msg = await client.subscribe('quote:XBTUSD', (msg) => {
          msg.action.should.equal('insert')
          resolve()
        })
        should.exist(msg)
        msg.action.should.equal('partial')
      })
    })

    it('should subscribe to position updates', async () => {
      let msg = await client.subscribe('position:XBTUSD', () => {})
      should.exist(msg)
      msg.action.should.equal('partial')
    })

    it('should subscribe to order updates', async () => {
      let msg = await client.subscribe('order:XBTUSD', () => {})
      should.exist(msg)
      msg.action.should.equal('partial')
    })

    it('should subscribe to order book L2', async () => {
      await new Promise(async (done) => {
        let book = await client.orderBookL2('XBTUSD', (book) => {
          book.length.should.be.above(45)
          book.askPrice().should.be.above(book.bidPrice())
        })
        should.exist(book)
        book.buys().length.should.be.above(25)
        book.sells().length.should.be.above(25)
        done()
      })
    })

    it('should close', (done) => {
      client.on('close', (code) => {
        should.exist(code)
        code.should.equal(1000)
        done()
      })
      client.disconnect()
      should.not.exist(client._socket)
    })
  })
})
