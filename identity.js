const SHA256 = require('crypto-js/sha256')
const MerkleTree = require('./merkleTree/Tree')

const cryptico = require('cryptico')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')

const test = false

class Identity {
  constructor(wallet, data, blockID) {
    this.publicKey = wallet.pubKey
    this.id = cryptico.publicKeyID(this.publicKey)
    this.verification = {}
    this.merkleRoot = this.createMerkleTree(data).root
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

  checkVerification() {
    this.verification.signature
    this.merkleRoot
    this.
  }
}

module.exports = Identity
