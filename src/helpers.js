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
  const hmac = crypto.createHmac('sha256', secret)
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
