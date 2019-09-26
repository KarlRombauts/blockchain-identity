class MultiDArray {
  static indexOf(array, searchItem, currentIndex = []) {
    if (Array.isArray(array)) {
      for (let i = 0; i < array.length; i++) {
        if (Array.isArray(array[i])) {
          currentIndex.push(i)
          const index = MultiDArray.indexOf(array[i], searchItem, currentIndex)
          if (index !== -1) {
            return index
          } else {
            currentIndex.pop()
          }
        } else if (array[i] === searchItem) {
          currentIndex.push(i)
          return currentIndex
        }
      }
    } else if (array == searchItem) {
      currentIndex.push(i)
      return currentIndex
    }
    return -1
  }

  static set(array, indexes, value) {
    if (!Array.isArray(indexes)) {
      indexes = [indexes]
    }
    const subArray = indexes
      .slice(0, indexes.length - 1)
      .reduce((subArray, index) => {
        return subArray[index]
      }, array)

    subArray[indexes[indexes.length - 1]] = value
    return array
  }
}

module.exports = MultiDArray
