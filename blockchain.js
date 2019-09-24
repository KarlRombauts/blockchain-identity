const SHA256 = require('crypto-js/sha256')
const BigHex = require('./BigHex')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({ chain: [] }).write()

class Block {
  constructor(index, previousHash, data) {
    this.index = index
    this.timestamp = Date.now()
    this.nonce = 0
    this.previousHash = previousHash
    this.data = data
  }

  hash() {
    const blockString = JSON.stringify(this)
    return SHA256(blockString).toString()
  }

  mine(target) {
    while (!this.validateHash(target)) {
      this.nonce++
    }
    console.log(this.hash())
  }

  validateHash(target) {
    return BigHex.lessThanOrEqual(this.hash(), target)
  }
}

class Blockchain {
  constructor(chain) {
    this.difficulty = '02FFF'
    this.chain = chain
    this.chain.forEach(block => Object.setPrototypeOf(block, Block.prototype))
    if (this.chain.length === 0) {
      this.addGenesisBlock()
    }
  }
  setDifficulty(difficulty) {
    isValid = /[0-9A-Fa-F]{6}/.test(difficulty)
    if (!isValid) {
      throw new Error('Difficulty must be a 6 digit hex number')
    }
    this.difficulty = difficulty
  }

  get hashTarget() {
    const leadingZeros = '0'.repeat(parseInt(this.difficulty.slice(0, 2), 16))
    const trailingZeros = '0'.repeat(
      64 - (leadingZeros.length + this.difficulty.length - 2),
    )
    const target = leadingZeros + this.difficulty.slice(2) + trailingZeros
    return target
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1]
  }

  add(data) {
    const block = new Block(this.chain.length, this.lastBlock.hash(), data)
    block.mine(this.hashTarget)
    this.chain.push(block)
    db.write()
  }

  addGenesisBlock() {
    const genesisBlock = new Block(0, 0, {})
    genesisBlock.mine(this.hashTarget)
    this.chain.push(genesisBlock)
    db.write()
  }

  validate() {
    let previousBlock = this.chain[0]
    for (let i = 0; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      if (currentBlock.previousHash !== previousBlock.hash()) {
        return false
      }
      if (!currentBlock.validateHash(this.hashTarget)) {
        return false
      }
    }
  }
}

blockchain = new Blockchain(db.get('chain').value())
blockchain.add({ phone: 123 })
blockchain.add({ phone: 345 })
blockchain.add({ phone: 354 })
console.log(blockchain.chain)
