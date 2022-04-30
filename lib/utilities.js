const { unitDictionary, tenthsDictionary, hundredsDictionary, magnitudeDictionary } = require('./dictionaries')

function flatMap(array) {
    let a = []
    array.forEach(e => {
        a = a.concat(e)
    })
    return a
}

function insertSeparators(array, separator) {
    const newArray = []
    let i = 1
    for (i; i < array.length; i++) {
        newArray.push(array[i - 1])
        newArray.push(separator)
    }

    newArray.push(array[i - 1])
    return newArray
}

function wordIsNumberRelated(word) {
    if (!word) return false
    for (const number in unitDictionary) { // check for units
        if (wordIsNumber(word, number)) return true
    }
    for (const number in tenthsDictionary) { // check for units
        if (wordIsNumber(word, number)) return true
    }
    for (const number in hundredsDictionary) { // check for hundreds
        if (wordIsNumber(word, number)) return true
    }
    for (const number in magnitudeDictionary) { // check for hundreds
        if (wordIsNumber(word, number)) return true
    }
    return false
}

const fetchNextWord = (list, index) => {
    let nextWordExists = true
    // console.log('looking for words')
    while (nextWordExists) {
        if (!isAWord(list[index + 1])) {
            nextWordExists = list[index + 2]
            index++
        }
        else return index + 1
    }
    return false
}

const insertAndClean = (list, startIndex, endIndex) => {
    const prev = []
    const post = []
    const actual = []
    for (let i = 0; i < list.length; i++) {
        if (i < startIndex) prev.push(list[i])
        else if (i > endIndex) post.push(list[i])
        else actual.push(list[i])
    }
    return [...prev, actual.join(''), ...post]
}

const transformNumberString = phrase => {
    console.log('transforming string ', phrase)
    // divide in unit-magnitudes pairs
    // calculate each pair
    // add the results!
    const separateResults = []
    let i = 0
    const symbollessPhrase = phrase.replace(/[,.!?]/g, '')
    const words = symbollessPhrase.split(' ').filter(e => e)
    for (const word of words) {
        if (word === 'y') continue
        if (!separateResults[i]) separateResults[i] = []
        let typeOfWord = ''
        for (const number in unitDictionary) if (wordStartsWithNumber(word, number)) typeOfWord = 'cardinal'
        for (const number in tenthsDictionary) if (wordStartsWithNumber(word, number)) typeOfWord = 'cardinal'
        for (const number in hundredsDictionary) if (wordStartsWithNumber(word, number)) typeOfWord = 'cardinal'
        if (typeOfWord) {// cardinal
            const value = fetchNumberValue(word, unitDictionary) || fetchNumberValue(word, tenthsDictionary) || fetchNumberValue(word, hundredsDictionary)
            separateResults[i].push({word, value, typeOfWord})
            continue
        } else {// magnitude
            const value = fetchNumberValue(word, magnitudeDictionary)
            typeOfWord = 'magnitude'
            separateResults[i].push({word, value, typeOfWord})
            i++
        }
    }
    let calculation = 0
    for (const strings of separateResults) {
        console.log('separate Resultss : ', strings)
        let lastCardinal = null
        let number = 0
        let magnitude = 1
        for (const string of strings) {
            console.log(`log 10 of last number: ${Math.floor(Math.log10(lastCardinal))}`)
            if (Math.floor(Math.log10(lastCardinal)) === Math.floor(Math.log10(string.value))) { // two equal magnitude numbers, probably repetition of separate numbers
                calculation = number + ' '
                number = 0
            }
            // find number value
            if (string.typeOfWord === 'cardinal' && string.value) {
                number += string.value
                lastCardinal = string.value
            } else if (string.typeOfWord === 'magnitude') {
                const value = fetchNumberValue(string.word, magnitudeDictionary)
                if (value) magnitude = value
            }
            // console.log(calculation)
            // console.log(number * magnitude)
        }
        if (magnitude !== 1) number = Math.max(number, 1) // for implicit magnitudes
        calculation += number * magnitude
    }
    return calculation
}

const fetchNumberValue = (word, dictionary) => {
    for (const number in dictionary) if (wordIsNumber(word, number)) return dictionary[number]
}

const wordStartsWithNumber = (word, number) => number.toLowerCase() === word.slice(0, number.length).toLowerCase()

const wordIsNumber = (word, number) => word.toLowerCase() === number.toLowerCase()

const isAWord = word => word && !!word.match(/[a-z]/i)

module.exports = {
    flatMap,
    insertSeparators,
    wordIsNumberRelated,
    wordStartsWithNumber,
    isAWord,
    fetchNextWord,
    insertAndClean,
    wordIsNumber,
    transformNumberString
}