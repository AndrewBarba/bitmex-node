const { API_KEY, API_SECRET } = process.env
const should = require('should')
const { RealtimeClient } = require('../src')
const client = new RealtimeClient({ apiKey: API_KEY, apiSecret: API_SECRET })

describe('bitmex-node', () => {
  describe('realtime', () => {
    it('should connect and authenticate', done => {
      client.on('open', () => {
        client.readyState.should.equal(1)
        done()
      })
    })

    it('should subscribe to margin updates', async () => {
      let msg = await client.subscribe('margin', () => {})
      should.exist(msg)
      msg.action.should.equal('partial')
    })

    it('should subscribe to quote updates', async () => {
      let msg = await client.subscribe('quote:XBTUSD', () => {})
      should.exist(msg)
      msg.action.should.equal('partial')
    })

    it('should close', done => {
      client.on('close', done)
      client.disconnect()
      should.not.exist(client._socket)
    })
  })
})
