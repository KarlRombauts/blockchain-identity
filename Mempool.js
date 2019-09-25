const cryptico = require('cryptico')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Identity = require('./identity')

class Mempool {
  constructor() {
    this.db = low(new FileSync(`mempool/db.json`))
    this.db.defaults({ pool: [] }).write()
  }

  add(identity) {
    Object.setPrototypeOf(identity, Identity.prototype)
    if (!identity.checkSignature()) {
      return false
    }
    if (!identity.checkVerification()) {
      return false
    }
    this.db
      .get('pool')
      .push(identity)
      .write()

    return true
  }
  next() {
    return this.db
      .get('pool')
      .first()
      .value()
  }
  shift() {
    this.db
      .get('pool')
      .shift()
      .write()
  }
}

module.exports = Mempool
