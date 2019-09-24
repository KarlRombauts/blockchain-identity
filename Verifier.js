const cryptico = require('cryptico')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')

class Verifier {
  constructor(name, location, verifierID) {
    this.name = location
    this.location = location

    this.key = cryptico.generateRSAKey(name + location, 1024).toJSON()
    this.pubKey = cryptico.publicKeyString(this.key)
    this.id = cryptico.publicKeyID(this.pubKey)

    const adapter = new FileSync(`verifiers/${this.id}.json`)
    this.db = low(adapter)
    this.db.defaults({ identities: [] }).write()
  }
  verifyIdentity(identity) {
    // some checks for identity
    identity.addVerification()
  }
}
