class ObjectHelper {
    compareTimeFrom = (a, b) => {
        return this.compare(a, b, 'timeFrom')
    }

    compareStartTime = (a, b) => {
        return this.compare(a, b, 'startTime')
    }

    compareName = (a, b) => {
        return this.compare(a, b, 'name')
    }

    objectSize (object) {
        return Object.size(object)
    }

    /**
     * Filters and array of objects or simple value array
     * @param {Array} arr
     * @param {String} key
     * @returns Array
     */
    getUniqueListByKey (arr, key = undefined) {
        return [...new Map(arr.map(item => [key ? item[key] : item, item])).values()]
    }

    sortByKey (array, key, asc = true) {
        return array.sort(function (a, b) {
            let x = a[key]
            let y = b[key]

            if (typeof x === 'string') {
                x = ('' + x).toLowerCase()
            }
            if (typeof y === 'string') {
                y = ('' + y).toLowerCase()
            }
            if (asc) {
                return ((x < y) ? -1 : ((x > y) ? 1 : 0))
            } else {
                return ((y < x) ? -1 : ((y > x) ? 1 : 0))
            }
        })
    }

    /**
     * Filters an array of objects on a search string and returns an array with found needles displayed strong
     *
     * @returns {Array}
     */

    filterOnSearchString (completeList, searchString, fields, minSearchStringLength = 0) {
        let filteredList = []

        if (searchString && searchString.length >= minSearchStringLength) {
            const needle = searchString.toString().toLowerCase()

            completeList.forEach(item => {
                let count = 0
                fields.forEach(field => {
                    if (item[field] && item[field].toString().toLowerCase().includes(needle)) {
                        count++
                    }
                })
                if (count > 0) {
                    filteredList.push(item)
                }
            })
        } else {
            filteredList = completeList
        }

        return filteredList
    }

    compare (a, b, field) {
        const startA = a[field]
        const startB = b[field]
        let comparison = 0
        if (startA > startB) {
            comparison = 1
        } else if (startA < startB) {
            comparison = -1
        }
        return comparison
    }
}

Object.size = function (obj) {
    if (!obj) return 0
    let size = 0; let key
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++
    }
    return size
}

export default new ObjectHelper()
