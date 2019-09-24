const num1 = '0FFFFFFFFFFF'
const num2 = '100000000000'

class BigHex {
  static normalise(num1, num2) {
    if (num1.length === num2) {
      return [num1, num2]
    }
    const leadingZeros = '0'.repeat(Math.abs(num1.length - num2.length))
    if (num1.length < num2.length) {
      return [leadingZeros + num1, num2]
    } else {
      return [num1, leadingZeros + num2]
    }
  }

  static lessThanOrEqual(num1, num2) {
    const numbers = this.normalise(num1, num2)
    for (let i = 0; i < numbers[0].length; i++) {
      const num1Digit = parseInt(numbers[0][i], 16)
      const num2Digit = parseInt(numbers[1][i], 16)
      if (num1Digit === num2Digit) {
        continue
      } else {
        return num1Digit < num2Digit
      }
    }
    return true
  }
}

module.exports = BigHex
