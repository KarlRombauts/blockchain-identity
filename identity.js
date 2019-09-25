const SHA256 = require('crypto-js/sha256')
const MerkleTree = require('./merkleTree/Tree')

const cryptico = require('cryptico')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const EdDSA = require('elliptic').eddsa
var ec = new EdDSA('ed25519')

class Identity {
  constructor(wallet, data) {
    this.timestamp = Date.now()
    this.walletId = wallet.id
    this.verification = {}
    this.merkleRoot = this.createMerkleTree(data).root

    this.signature = {
      key: wallet.signPublicKey,
    }
    this.id = SHA256(
      this.walletId + this.timestamp + this.merkleRoot,
    ).toString()
  }

  createMerkleTree(data) {
    const dataArray = Object.keys(data).map(key => {
      const item = {}
      item[key] = data[key]
      return item
    })
    const leaves = dataArray.map(item =>
      SHA256(JSON.stringify(item)).toString(),
    )
    return new MerkleTree(leaves)
  }

  addVerification(verificationObject) {
    this.verification = verificationObject
  }

  checkVerification() {
    if (!this.verification.signedRoot) {
      console.log('Identity has not yet been verified')
    }
    const msg = SHA256(this.merkleRoot + this.verification.timestamp).toString()

    const verifiers = low(new FileSync(`verifiers/db.json`))
    const verifier = verifiers
      .get('verifiers')
      .find({ id: this.verification.verifierId })
      .value()

    const key = ec.keyFromPublic(verifier.signPublicKey, 'hex')
    const isValid = key.verify(msg, this.verification.signedRoot)
    if (isValid) {
      console.log(`Identity has been verified by ${verifier.name}`)
    } else {
      console.log('Identity verification has been tampered with')
    }
    return isValid
  }

  sign(signature) {
    this.signature.signedHash = signature
  }

  checkSignature() {
    const msg = SHA256(this.id).toString()
    const key = ec.keyFromPublic(this.signPublicKey, 'hex')
    const isValid = key.verify(msg, this.signature.signedHash)
    if (isValid) {
      console.log(`Identity has been signed by wallet owner`)
    } else {
      console.log('Identity signature has been tampered with')
    }
    return isValid
  }
}

module.exports = Identity
