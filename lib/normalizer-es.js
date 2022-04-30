const { flatMap, insertSeparators, wordIsNumberRelated, wordStartsWithNumber, isAWord, fetchNextWord, insertAndClean, transformNumberString } = require('./utilities')

module.exports = function normalize (text) {
    // separate words
    let a = [text]; // array with the whole string
    [' ', ',', '.'].forEach(separator => {
        a = flatMap(
        a.map(e => {
            return insertSeparators(e.split(separator), separator)
        })
        )
    })
    a = a.filter(e => e)
    for (let i = 0; i < a.length; i++) { // run through word list
        let nextWordIsNumberRelated = false
        const startIndex = i
        if (wordIsNumberRelated(a[i])) {
            const nextWord = fetchNextWord(a, i)
            if (!wordIsNumberRelated(a[nextWord])) {
                a = insertAndClean(a, startIndex, startIndex)
                continue // next word wasn't a number, insert and go on
            }
            while (a[i + 1] && (!isAWord(a[i + 1]) || a[i + 1].match(/y/i))) i++
            if (a[i + 1]) nextWordIsNumberRelated = wordIsNumberRelated(a[i + 1])
            while (nextWordIsNumberRelated) {
                i++
                const nextWordIndex = fetchNextWord(a, i)

                if (nextWordIndex && (wordIsNumberRelated(a[nextWordIndex]) || a[nextWordIndex].toLowerCase() === 'y')) {
                    i = nextWordIndex
                } else {
                    nextWordIsNumberRelated = false
                }
            }
            a = insertAndClean(a, startIndex, i)
            i = startIndex
        } else {
            while (a[i + 1] && !wordIsNumberRelated(a[i + 1])) i++
            a = insertAndClean(a, startIndex, i)
            i = startIndex
        }
    }
    let normalizedText = ''
    for (const phrase of a) {
        const singleWord = !phrase.trim().match(/ /)
        firstWord = phrase
        if (!singleWord) {
            const firstSpace = phrase.trim().match(/[,. ]/)
            const firstNonLetter = firstSpace.index
            firstWord = phrase.trim().slice(0, firstNonLetter)
        } else {
            while (firstWord[0] === ',' || firstWord[0] === '.' || firstWord[0] === ' ') firstWord = firstWord.slice(1)
            while (firstWord.slice(-1) === ',' || firstWord.slice(-1) === '.' || firstWord.slice(-1) === ' ') firstWord = firstWord.slice(0, firstWord.length - 1)
        }
        // console.log(firstWord)
        if (!wordIsNumberRelated(firstWord)) {
            if (!normalizedText || firstWord[0] === ' ' || normalizedText.slice(-1) === ' ') {
                normalizedText += phrase
            } else {
                normalizedText += ` ${phrase}`
            }
        } else {
            // transform and add string to normalizedText
            normalizedText += transformNumberString(phrase)
        }
    }
    return normalizedText.replace(/ +/g, ' ')
}