const SHA256 = require('crypto-js/sha256')
const Identity = require('./identity')
const Verifier = require('./Verifier')
const cryptico = require('cryptico')
const EdDSA = require('elliptic').eddsa

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

var ec = new EdDSA('ed25519')
class Wallet {
  constructor() {
    const nonces = this.generateKeys()
    this.id = SHA256(this.signPublicKey).toString()
    this.db = low(new FileSync(`wallets/private/${this.id}.json`))
    this.db.defaults({ versions: [] }).write()
    this.db.set('signNonce', nonces.signNonce).write()
    this.db.set('encryptNonce', nonces.encryptNonce).write()
    this.db.set('id', this.id).write()
  }

  addIdentity(data) {
    const previousData = this.db
      .get('versions')
      .last()
      .value()

    if (previousData) {
      const allData = { ...previousData.data, ...data }
      data = Object.keys(allData).reduce((carry, key) => {
        if (allData[key] !== null) {
          carry[key] = allData[key]
        }
        return carry
      }, {})
    }

    const identity = new Identity(this, data)

    const signSecretKey = ec.keyFromSecret(this.db.get('signNonce'))
    const msg = SHA256(identity.id).toString()
    const signature = signSecretKey.sign(msg).toHex()
    identity.sign(signature)

    this.saveDataLocally(identity, data)
    return identity
  }

  saveDataLocally(identity, data) {
    this.db
      .get('versions')
      .push({
        identity: identity,
        data: data,
      })
      .write()
  }

  generateKeys() {
    const encryptNonce = SHA256(
      Date.now() + '' + Math.random() + this.id,
    ).toString()
    const signNonce = SHA256(
      Date.now() + '' + Math.random() + this.id,
    ).toString()
    const encryptSecretKey = cryptico.generateRSAKey(encryptNonce, 1024)
    const signSecretKey = ec.keyFromSecret(signNonce)
    this.encryptPublicKey = cryptico.publicKeyString(encryptSecretKey)
    this.signPublicKey = signSecretKey.getPublic('hex')
    return { signNonce, encryptNonce }
  }

  sendForVerification(verifierId) {
    const verifier = Verifier.getDataFromId(verifierId)
    const message = this.db
      .get('versions')
      .last()
      .value()

    const encryptedData = cryptico.encrypt(
      JSON.stringify(message.data),
      verifier.value().encryptPublicKey,
    )

    message.data = encryptedData.cipher

    verifier.value().pool.push(message)
    verifier.write()
  }
}

module.exports = Wallet
