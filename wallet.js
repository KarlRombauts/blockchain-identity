const Identity = require('./identity')
const cryptico = require('cryptico')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')

class Wallet {
  constructor() {
    const nonce = Date.now() + '' + Math.random() * Math.pow(10, 18)
    this.key = cryptico.generateRSAKey(nonce, 1024).toJSON()
    this.pubKey = cryptico.publicKeyString(this.key)
    this.id = cryptico.publicKeyID(this.pubKey)

    const adapter = new FileSync(`wallets/${this.id}.json`)
    this.db = low(adapter)
    this.db.defaults({ key: {}, versions: [] }).write()
  }

  addIdentity(data) {
    const previousData = this.db
      .get('versions')
      .last()
      .value()

    const allData = { ...previousData, ...data }
    const newData = Object.keys(allData).reduce((carry, key) => {
      if (allData[key] !== null) {
        carry[key] = allData[key]
      }
      return carry
    }, {})
    console.log(newData)
    const identity = new Identity(this, newData)
    this.saveDataLocally(newData)
  }

  saveDataLocally(data) {
    this.db
      .get('versions')
      .push(data)
      .write()
  }
}

const myWallet = new Wallet()

myWallet.addIdentity({
  phone: '0488300793',
  address: '23 Flowerdale Rd',
})

setTimeout(() => {
  myWallet.addIdentity({
    phone: '9813 8025',
    name: 'Karl Rombauts',
  })
}, 1000)

setTimeout(() => {
  myWallet.addIdentity({
    name: null,
  })
}, 2000)
// const id1 = new Identity(
//   wallet1,
//   {},
//   {
//     phone: '0488300793',
//     address: '23 Flowerdale Rd',
//   },
//   1,
// )

// const id1v2 = new Identity(
//   wallet1,
//   {
//     phone: '0488300793',
//     address: '23 Flowerdale Rd',
//   },
//   {
//     phone: '9813 8025',
//     address: '23 Flowerdale Rd',
//   },
//   2,
// )

// const id2 = new Identity(
//   wallet2,
//   {
//     name: 'Karl Rombauts',
//     address: '9 Degraves St',
//   },
//   3,
// )
