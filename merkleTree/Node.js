const Leaf = require('./Leaf')
const SHA256 = require('crypto-js/sha256')
const BigHex = require('../BigHex')

class Node extends Leaf {
  constructor(left, right) {
    super(null)
    this.hash = this.createHash(left, right)
    left.parent = this
    this.left = left
    this.right = right

    if (right) {
      right.parent = this
    }
  }

  get children() {
    return [this.left, this.right]
  }

  createHash(left, right) {
    const leftData = left.hash
    const rightData = right ? right.hash : '0'

    return SHA256(BigHex.add(leftData, rightData)).toString()
  }
}

module.exports = Node
