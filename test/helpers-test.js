require('should')
const helpers = require('../src/helpers')

describe('bitmex-node', () => {
  describe('helpers', () => {

    describe('#applyInsert', () => {
      it('should insert 1 new item', () => {
        let data = []
        let newData = [{ id: 1 }]
        let result = helpers.applyInsert(data, newData)
        result.length.should.equal(1)
      })
      it('should insert 2 new items', () => {
        let data = [{ id: 1 }, { id: 4 }]
        let newData = [{ id: 2 }, { id: 5 }]
        let result = helpers.applyInsert(data, newData)
        result.length.should.equal(4)
        result[0].id.should.equal(1)
        result[1].id.should.equal(2)
        result[2].id.should.equal(4)
        result[3].id.should.equal(5)
      })
    })

    describe('#applyUpdate', () => {
      it('should update no items', () => {
        let result = helpers.applyUpdate([], [], ['id'])
        result.length.should.equal(0)
      })
      it('should update 2 items', () => {
        let data = [{ id: 0, val: 0 }, { id: 1, val: 0 }, { id: 2, val: 0 }, { id: 4, val: 0 }, { id: 5, val: 0 }]
        let newData = [{ id: 1, val: 1 }, { id: 4, val: 1 }]
        let result = helpers.applyUpdate(data, newData, ['id'])
        result.length.should.equal(5)
        result[1].val.should.equal(1)
        result[3].val.should.equal(1)
      })
    })

    describe('#applyDelete', () => {
      it('should delete no items', () => {
        let result = helpers.applyDelete([], [], ['id'])
        result.length.should.equal(0)
      })
      it('should delete 2 items', () => {
        let data = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 4 }, { id: 5 }]
        let newData = [{ id: 1 }, { id: 4 }]
        let result = helpers.applyDelete(data, newData, ['id'])
        result.length.should.equal(3)
        result[0].id.should.equal(0)
        result[1].id.should.equal(2)
        result[2].id.should.equal(5)
      })
      it('should delete 2 items at beginning', () => {
        let data = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 4 }, { id: 5 }]
        let newData = [{ id: 0 }, { id: 1 }]
        let result = helpers.applyDelete(data, newData, ['id'])
        result.length.should.equal(3)
        result[0].id.should.equal(2)
        result[1].id.should.equal(4)
        result[2].id.should.equal(5)
      })
    })

  })
})
