var assert = require('assert')
var base58check = require('./base58check')
var ecdsa = require('./ecdsa')
var networks = require('./networks')
var secureRandom = require('secure-random')

var BigInteger = require('bigi')
var ECPubKey = require('./ecpubkey')

var ecurve = require('ecurve')
var curve = ecurve.getCurveByName('secp256k1')

<<<<<<< HEAD
var BigInteger = require('bigi')
var ECPointFp = require('./ec').ECPointFp
=======
function ECKey(d, compressed) {
  assert(d.signum() > 0, 'Private key must be greater than 0')
  assert(d.compareTo(curve.params.n) < 0, 'Private key must be less than the curve order')
>>>>>>> ad9a73a81b68499fe2dc07bd30c1c546e81f504a

  var Q = curve.params.G.multiply(d)

  this.d = d
  this.pub = new ECPubKey(Q, compressed)
}

// Static constructors
ECKey.fromWIF = function(string) {
  var payload = base58check.decode(string)
  var compressed = false

  // Ignore the version byte
  payload = payload.slice(1)

  if (payload.length === 33) {
    assert.strictEqual(payload[32], 0x01, 'Invalid compression flag')

    // Truncate the compression flag
    payload = payload.slice(0, -1)
    compressed = true
  }

  assert.equal(payload.length, 32, 'Invalid WIF payload length')

  var d = BigInteger.fromBuffer(payload)
  return new ECKey(d, compressed)
}

ECKey.makeRandom = function(compressed, rng) {
  rng = rng || secureRandom

  var buffer = new Buffer(rng(32))
  var d = BigInteger.fromBuffer(buffer)
  d = d.mod(curve.params.n)

  return new ECKey(d, compressed)
}

// Export functions
ECKey.prototype.toWIF = function(network) {
  network = network || networks.bitcoin

  var bufferLen = this.pub.compressed ? 34 : 33
  var buffer = new Buffer(bufferLen)

  buffer.writeUInt8(network.wif, 0)
  this.d.toBuffer(32).copy(buffer, 1)

  if (this.pub.compressed) {
    buffer.writeUInt8(0x01, 33)
  }

  return base58check.encode(buffer)
}

// Operations
ECKey.prototype.sign = function(hash) {
  return ecdsa.sign(curve, hash, this.d)
}

module.exports = ECKey
