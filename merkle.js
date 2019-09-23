const Leaf = require('./merkleTree/Leaf')
const Node = require('./merkleTree/Node')
const MerkleTree = require('./merkleTree/Tree')
const SHA256 = require('crypto-js/sha256')

const leaves = [1, 2, 3, 4]
const hashedLeaves = leaves.map(leaf => {
  return SHA256(leaf.toString()).toString()
})

const tree = new MerkleTree(hashedLeaves)

const proof = tree.getProof(4)
console.log(MerkleTree.validate(4, proof, tree.root))

const leaf1 = new Leaf(1)
const leaf2 = new Leaf(2)
const leaf3 = new Leaf(3)
const leaf4 = new Leaf(4)
const leaf5 = new Leaf(5)
const leaf6 = new Leaf(6)
const leaf7 = new Leaf(7)
const leaf8 = new Leaf(8)

const node1 = new Node(leaf1, leaf2)
const node2 = new Node(leaf3, leaf4)
const node3 = new Node(leaf5, leaf6)
const node4 = new Node(leaf7, leaf8)

const node5 = new Node(node1, node2)
const node6 = new Node(node3, node4)

const node7 = new Node(node5, node6)
