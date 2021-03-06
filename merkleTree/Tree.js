const Leaf = require('./Leaf')
const Node = require('./Node')
const SHA256 = require('crypto-js/sha256')
const MultiDArray = require('../MultiDArray')
const BigHex = require('../BigHex')

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
    if (!Array.isArray(data)) {
      data = [data]
    }
    const leaves = data.map(dataItem => {
      return this.leaves.find(leaf => leaf.hash === SHA256(dataItem).toString())
    })

    const proof = []
    leaves.forEach((leaf, index) => {
      const subProof = [[data[index]]]
      let node = leaf
      const proofIndex = MultiDArray.indexOf(proof, leaf.hash)
      if (proofIndex !== -1) {
        MultiDArray.set(proof, proofIndex, [data[index]])
        return
      }

      while (node.parent !== null) {
        if (node.sibling !== undefined) {
          subProof.push(node.sibling.hash)
        }

        const proofIndex = MultiDArray.indexOf(proof, node.parent.hash)
        if (proofIndex !== -1) {
          if (subProof.length === 1 && subProof[0].length === 1) {
            subProof[0] = subProof[0][0]
          }
          MultiDArray.set(proof, proofIndex, subProof)
          break
        }
        node = node.parent
      }
      if (proof.length === 0) {
        proof.push(...subProof)
      }
    })

    return proof
  }

  static validate(proof, root) {
    return root === this.calculateRoot(proof)
  }

  static calculateRoot(proof) {
    return proof.reduce((carry, node, index) => {
      if (Array.isArray(node)) {
        if (node.length === 1) {
          if (index === 0) {
            return SHA256(node[0]).toString()
          } else {
            return SHA256(
              BigHex.add(SHA256(node[0]).toString(), carry),
            ).toString()
          }
        }
        return SHA256(
          BigHex.add(MerkleTree.calculateRoot(node), carry),
        ).toString()
      }
      return SHA256(BigHex.add(node, carry)).toString()
    }, '0')
  }
  static getDataFromProof(proof) {
    return proof.flat(Infinity).filter(item => {
      return !typeof item === 'string' || !/[0-9a-fA-F]{64}/.test(item)
    })
  }
}

module.exports = MerkleTree
// const data = ['A', 'B', 'C', 'D', 'E', 'F'].map(item => SHA256(item).toString())
// // console.log(data)

// const merkleTree = new MerkleTree(data)
// console.log(merkleTree)

// const proof = merkleTree.getProof(['E', 'F'])
// console.log(proof)
// console.log('\nhash', merkleTree.root + '\n')

// console.log('proof', MerkleTree.calculateRoot(proof))
// console.log('valid', MerkleTree.validate(proof, merkleTree.root))
// MerkleTree.getDataFromProof(proof)
