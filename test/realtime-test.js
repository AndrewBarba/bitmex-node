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

    it('should subscribe to margin updates', done => {
      client.subscribe('margin', result => {
        result.action.should.equal('partial')
        done()
      })
    })

    it('should close', done => {
      client.on('close', done)
      client.disconnect()
      should.not.exist(client._socket)
    })
  })
})
