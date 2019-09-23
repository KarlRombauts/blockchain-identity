class Leaf {
  constructor(data) {
    this.hash = data
    this.parent = null
  }

  get sibling() {
    if (this.parent.left === this) {
      return this.parent.right
    }
    return this.parent.left
  }

  get root() {
    let node = this
    while (node.parent !== null) {
      node = node.parent
    }
    return node
  }

  get level() {
    let node = this
    let level = 0
    while (node.parent !== null) {
      node = node.parent
      level++
    }
    return level
  }
}

module.exports = Leaf
