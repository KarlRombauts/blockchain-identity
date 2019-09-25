const Verifier = require('./Verifier')
const Wallet = require('./wallet')
const Blockchain = require('./blockchain/blockchain')

const blockchain = new Blockchain()
const myWallet = new Wallet()
const vicGov = new Verifier(
  'Australian Government Victoria',
  'Australia, Victoria',
  blockchain,
)

myWallet.addIdentity({
  phone: '0488300793',
  address: '23 Flowerdale Rd',
})

myWallet.sendForVerification(vicGov.id)

vicGov.verifyNext()

blockchain.add(blockchain.mempool.next())
blockchain.mempool.shift()

// setTimeout(() => {
//   myWallet.addIdentity({
//     phone: '9813 8025',
//     name: 'Karl Rombauts',
//   })
// }, 1000)

// setTimeout(() => {
//   myWallet.addIdentity({
//     name: null,
//   })
// }, 2000)
