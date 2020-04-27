const { API_KEY, API_SECRET } = process.env
const should = require('should')
const { RestClient } = require('../src')
let client = null

describe('bitmex-node', () => {
  describe.only('rest', () => {
    beforeEach(() => {
      client = new RestClient({
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        testnet: true
      })
    })

    it('should list orders', async () => {
      const results = await client.getOrder()
      should.exist(results)
      results.length.should.be.above(-1)
    })

    it('should get positions', async () => {
      const filter = JSON.stringify({ symbol: 'XBTUSD' })
      const results = await client.getPosition({ filter })
      should.exist(results)
      results.length.should.be.above(-1)
    })

    it('should get bucketed trades', async () => {
      const results = await client.getTradesBucketed({
        symbol: 'XBTUSD',
        binSize: '1m',
        count: 100,
        reverse: true
      })
      should.exist(results)
      results.length.should.be.above(-1)
    })

    it('should delete all orders', async () => {
      const results = await client.deleteAllOrders()
      should.exist(results)
    })
  })
})
