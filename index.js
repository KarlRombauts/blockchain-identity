const Verifier = require('./Verifier')
const Wallet = require('./wallet')
const Blockchain = require('./blockchain/blockchain')

const blockchain = new Blockchain()
const karlWallet = new Wallet()
const jasonWallet = new Wallet()
const vicGov = new Verifier(
  'Australian Government Victoria',
  'Australia, Victoria',
  blockchain,
)

karlWallet.addIdentity({
  phone: '0488300793',
  address: '23 Flowerdale Rd',
})

karlWallet.addIdentity({
  name: 'Karl Rombauts',
})

karlWallet.share(['phone', 'name'])

// jasonWallet.addIdentity({
//   name: 'jason',
//   jobTitle: 'Developer',
// })

// karlWallet.sendForVerification(vicGov.id)
// jasonWallet.sendForVerification(vicGov.id)

// vicGov.verifyNext()
// vicGov.verifyNext()

// blockchain.add(blockchain.mempool.next())
// blockchain.mempool.shift()

// blockchain.add(blockchain.mempool.next())
// blockchain.mempool.shift()
