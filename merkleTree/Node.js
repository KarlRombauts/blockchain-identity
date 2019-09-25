const Leaf = require('./Leaf')
const SHA256 = require('crypto-js/sha256')

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
    const rightData = right ? right.hash : ''
    return SHA256(leftData + rightData).toString()
  }
}

module.exports = Node
