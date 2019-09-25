const SHA256 = require('crypto-js/sha256')
const cryptico = require('cryptico')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')
const EdDSA = require('elliptic').eddsa

const ec = new EdDSA('ed25519')
const verifiersDB = low(new FileSync(`verifiers/db.json`))
verifiersDB.defaults({ verifiers: [] }).write()

class Verifier {
  constructor(name, location, verifierID) {
    this.name = location
    this.location = location
    this.id = SHA256(name + location).toString()

    this.connectDatabase()
    const existingRecord = verifiersDB
      .get('verifiers')
      .find({ id: this.id })
      .value()

    if (existingRecord === undefined) {
      const nonces = this.generateKeys()
      this.private.set('encryptNonce', nonces.encryptNonce).write()
      this.private.set('signNonce', nonces.signNonce).write()
      verifiersDB
        .get('verifiers')
        .push({
          id: this.id,
          encryptPublicKey: this.encryptPublicKey,
          signPublicKey: this.signPublicKey,
          timestamp: Date.now(),
          pool: [],
        })
        .write()
    } else {
      this.encryptPublicKey = existingRecord.encryptPubKey
      this.signPublicKey = existingRecord.signPublicKey
    }
  }
  verifyIdentity(identity) {
    // some checks for identity
    const root = identity.merkleRoot
    const timestamp = Date.now()

    const msg = SHA256(root + timestamp).toString()
    // console.log(msg)
    const nonce = this.private.get('signNonce').value()
    const signKey = ec.keyFromSecret(nonce)
    const signedRoot = signKey.sign(msg).toHex()
    identity.addVerification({
      signedRoot: signedRoot,
      verifierId: this.id,
      timestamp: timestamp,
    })
  }
  connectDatabase() {
    this.pool = low(new FileSync(`verifiers/pool/${this.id}.json`))
    this.private = low(new FileSync(`verifiers/private/${this.id}.json`))
    this.pool.defaults({ publicKey: null, identities: [] }).write()
  }

  generateKeys() {
    const encryptNonce = SHA256(
      Date.now() + '' + Math.random() + this.id,
    ).toString()
    const signNonce = SHA256(
      Date.now() + '' + Math.random() + this.id,
    ).toString()

    const encryptSecretKey = cryptico
      .generateRSAKey(encryptNonce, 1024)
      .toJSON()
    const signSecretKey = ec.keyFromSecret(signNonce)

    this.encryptPublicKey = cryptico.publicKeyString(encryptSecretKey)
    this.signPublicKey = signSecretKey.getPublic('hex')

    return { signNonce, encryptNonce }
  }
}

module.exports = Verifier
