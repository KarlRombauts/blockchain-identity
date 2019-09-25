const SHA256 = require('crypto-js/sha256')
const cryptico = require('cryptico')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')
const EdDSA = require('elliptic').eddsa
const blockchain = require('./blockchain/blockchain')

const ec = new EdDSA('ed25519')
const verifiersDB = low(new FileSync(`verifiers/db.json`))
verifiersDB.defaults({ verifiers: [] }).write()

class Verifier {
  constructor(name, location, blockchain) {
    this.name = name
    this.location = location
    this.id = SHA256(name + location).toString()
    this.blockchain = blockchain

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
          name: this.name,
          location: this.location,
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
    const timestamp = Date.now()
    const msg = SHA256(identity.merkleRoot + timestamp).toString()
    const signNonce = this.private.get('signNonce').value()
    const signSecretKey = ec.keyFromSecret(signNonce)
    const signedRoot = signSecretKey.sign(msg).toHex()

    identity.verification = {
      signedRoot: signedRoot,
      verifierId: this.id,
      timestamp: timestamp,
    }

    return identity
  }
  verifyNext() {
    const { data, identity, verifierData } = this.getFirstFromPool()
    console.log(data)

    const verifiedIdentity = this.verifyIdentity(identity)

    verifierData.write()
    console.log(blockchain)
    this.blockchain.mempool.add(verifiedIdentity)
  }

  getFirstFromPool() {
    const verifierData = this.getData()

    const pool = verifierData.value().pool
    const message = pool.shift()

    const encryptNonce = this.private.get('encryptNonce').value()
    const encryptSecretKey = cryptico.generateRSAKey(encryptNonce, 1024)
    const decryptedData = cryptico.decrypt(message.data, encryptSecretKey)

    const data = JSON.parse(decryptedData.plaintext)
    return { data, identity: message.identity, verifierData }
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

  getData() {
    return Verifier.getDataFromId(this.id)
  }

  static getDataFromId(id) {
    return verifiersDB.get('verifiers').find({ id: id })
  }
}

module.exports = Verifier
