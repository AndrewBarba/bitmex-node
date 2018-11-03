const crypto = require('crypto')

/**
 * @method requestSignature
 * @param {String} secret
 * @param {String} options.method
 * @param {String} options.url
 * @param {Number} options.expires
 * @param {String} [options.body]
 * @return {String}
 */
exports.requestSignature = (secret, { method, url, expires, body = '' }) => {
  let hmac = crypto.createHmac('sha256', secret)
  return hmac.update(`${method.toUpperCase()}${url}${expires}${body}`).digest('hex')
}

/**
 * @method time
 * @param {Number} [offset=60]
 * @return {Number}
 */
exports.time = (offset = 60) => {
  return parseInt(Date.now() / 1000) + offset
}

/**
 * @method apply
 * @param {String} action
 * @param {Array} existingData
 * @param {Array} newData
 * @return {Array}
 */
exports.apply = (action, existingData, newData) => {
  switch (action) {
  case 'partial': return newData
  case 'insert': return this.applyInsert(existingData, newData)
  case 'update': return this.applyUpdate(existingData, newData)
  case 'delete': return this.applyDelete(existingData, newData)
  default: throw new Error('Invalid action.')
  }
}

/**
 * @method applyInsert
 * @param {Array} existingData
 * @param {Array} newData
 * @return {Array}
 */
exports.applyInsert = (existingData, newData) => {
  let ei = 0; let ni = 0
  while (ei < existingData.length || ni < newData.length) {
    let eo = existingData[ei]
    let no = newData[ni]
    if ((!eo && no) || (eo && no && no.id < eo.id)) {
      existingData.splice(ei, 0, no)
      ni += 1
    } else {
      ei += 1
    }
  }
  return existingData
}

/**
 * @method applyUpdate
 * @param {Array} existingData
 * @param {Array} newData
 * @return {Array}
 */
exports.applyUpdate = (existingData, newData) => {
  let ei = 0; let ni = 0
  while (ei < existingData.length && ni < newData.length) {
    let eo = existingData[ei]
    let no = newData[ni]
    if (eo && no && no.id === eo.id) {
      existingData[ei] = { ...eo, ...no }
      ni += 1; ei += 1
    } else {
      ei += 1
    }
  }
  return existingData
}

/**
 * @method applyDelete
 * @param {Array} existingData
 * @param {Array} newData
 * @return {Array}
 */
exports.applyDelete = (existingData, newData) => {
  let ei = 0; let ni = 0
  while (ei < existingData.length && ni < newData.length) {
    let eo = existingData[ei]
    let no = newData[ni]
    if (eo && no && no.id === eo.id) {
      existingData.splice(ei, 1)
      ni += 1; ei += 1
    } else {
      ei += 1
    }
  }
  return existingData
}
