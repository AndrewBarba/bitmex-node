const { API_KEY, API_SECRET } = process.env
const should = require('should')
const { RestClient } = require('../src')
const client = new RestClient({ apiKey: API_KEY, apiSecret: API_SECRET })

describe('bitmex-node', () => {
  describe('rest', () => {
    it('should list orders', async () => {
      let results = await client.getOrder()
      should.exist(results)
      results.length.should.equal(0)
    })
  })
})
