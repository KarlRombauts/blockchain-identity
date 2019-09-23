const Leaf = require('./Leaf')
const Node = require('./Node')
const SHA256 = require('crypto-js/sha256')

class MerkleTree {
  constructor(leaves) {
    this.leaves = leaves.map(leaf => new Leaf(leaf))
    this.treeRoot = this.constructTree()
  }

  get root() {
    return this.treeRoot.hash
  }

  get numOfLevels() {
    return Math.ceil(Math.log(this.leaves.length) / Math.log(2)) + 1
  }

  constructTree() {
    const levels = [this.leaves]
    for (let l = 1; l < this.numOfLevels; l++) {
      const currentLevel = []
      const previousLevel = levels[l - 1]
      for (let i = 0; i < Math.ceil(previousLevel.length / 2); i++) {
        const left = previousLevel[2 * i]
        const right = previousLevel[2 * i + 1]
        currentLevel.push(new Node(left, right))
      }
      levels.push(currentLevel)
    }
    return levels[levels.length - 1][0]
  }

  getProof(data) {
    const proof = []
    let node = this.leaves.find(
      leaf => leaf.hash === SHA256(data.toString()).toString(),
    )

    while (node.parent !== null) {
      if (node.sibling !== undefined) {
        proof.push(node.sibling)
      }
      node = node.parent
    }
    return proof
  }

  static validate(data, proof, root) {
    const hashedData = SHA256(data.toString()).toString()
    const recreatedRoot = proof.reduce(
      (carry, node) => SHA256(node.hash + carry).toString(),
      hashedData,
    )
    return root === recreatedRoot
  }
}

module.exports = MerkleTree
