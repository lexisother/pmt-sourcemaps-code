const stringHelper = {
    lightenDarkenColor (colorCode, amount) {
        let usePound = false

        if (colorCode[0] === '#') {
            colorCode = colorCode.slice(1)
            usePound = true
        }

        const num = parseInt(colorCode, 16)

        let r = (num >> 16) + amount

        if (r > 255) {
            r = 255
        } else if (r < 0) {
            r = 0
        }

        let b = ((num >> 8) & 0x00FF) + amount

        if (b > 255) {
            b = 255
        } else if (b < 0) {
            b = 0
        }

        let g = (num & 0x0000FF) + amount

        if (g > 255) {
            g = 255
        } else if (g < 0) {
            g = 0
        }

        return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
    },
    /**
     * @param {string} string
     * @returns {string}
     */
    capitalize (string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    },
    /**
     * @param {string} string
     * @param {array} find
     * @param {array} replace
     */
    replaceArray (string, find, replace) {
        let replaceString = string

        for (let i = 0; i < find.length; i++) {
            const regex = new RegExp(find[i], 'g')

            replaceString = replaceString.replace(regex, replace[i])
        }

        return replaceString
    },
    /**
     * @param {String} str
     * @param {Object} obj
     * @returns {Boolean}
     * Can return nested value if called with getObjectNestedValue('deep.nested.value', obj)
     */
    getObjectNestedValue (str, obj) {
        if (!str) {
            return false
        }
        return str.split('.').reduce(function (o, p) {
            return o[p]
        }, obj)
    },
    /**
     * @param {string} targetProp The name of the property to return
     * @param {object} theObject the Object to make search against
     * @returns {object} Returns the value of the Property (Object, String, Array, Boolean)
     * Used below because one of the permissions(communication.chat.rights) is returning an Array
     */
    getObjectPropertyValue (targetProp, theObject) {
        if (typeof theObject === 'undefined' || typeof targetProp === 'undefined' || targetProp === '' || typeof targetProp !== 'string') {
            return false
        }
        if (theObject instanceof Array) {
            for (let i = 0; i < theObject.length; i++) {
                this.result = this.getObjectPropertyValue(targetProp, theObject[i])
            }
        } else {
            for (const prop in theObject) {
                if (prop === targetProp) {
                    this.result = theObject[prop]
                    break
                }
                if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                    this.result = this.getObjectPropertyValue(targetProp, theObject[prop])
                }
            }
        }
        return typeof this.result !== 'undefined' ? this.result : false
    },
    /**
     * @param {string} string
     * @returns {string}
     */
    camelCase (str) {
        if (!str) return
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index === 0 ? letter.toLowerCase() : letter.toUpperCase()
            // eslint-disable-next-line no-useless-escape
        }).replace(/\s+|\-+/g, '')
    },

    camelCaseHyphenString (str) {
        if (str) {
            return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() })
        }
    },

    /**
     * Returns a camel cased string
     * ex:
     * camelize('string_value', '_') => stringValue
     * camelize('string-value', '-') => stringValue
     * camelize('string value', ' ') => stringValue
     * @param String str
     * @param String char
     */
    camelize (str, char) {
        const arr = str.split(char)
        const capital = arr.map((item, index) => index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item.toLowerCase())
        return capital.join('')
    },
    camelToSnakeCase (inputString) {
        if (!inputString) return
        return inputString.split('').map((character) => {
            if (character === character.toUpperCase()) {
                return '_' + character.toLowerCase()
            } else {
                return character
            }
        }).join('')
    },
    sanityHTML (html) {
        const txt = document.createElement('textarea')
        txt.innerHTML = html
        return txt.value
    },

    /**
     * Used for escaping vulnerable code
     *
     * @param {string} string
     * @returns {string}
     */
    escapeString (string) {
        const el = document.createElement('div')
        el.innerText = string
        return el.innerHTML
    },

    /**
     * Used if you want to shorten a string and make it appear like it has more to be read. Enter string and amount as parameters.
     *
     * @param {string} string //String you want to cut off
     * @param {number} amount //Amount of characters you want it to cut of at
     *
     * @returns {string}
     */
    textToElipsis (string, amount) {
        return (string !== '' && string.length > amount) ? string.substring(0, amount) + '...' : string
    },

    /**
     * @param {num} Object
     * @param {type} Object // type to return if num is not a number
     * @returns {type || number}
     */
    isNumber (num, type) {
        return !isNaN(num) ? num : type
    },

    isEven (num) {
        if (isNaN(num)) return
        return num % 2 === 0
    },

    /**
     * @returns {String} a new unique ID each time
     */
    newId () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 6 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(6)
        })
    },

    newIdShort () {
        return Math.floor(Math.random() * 123456)
    },

    groupBy (arr, key) {
        return arr.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x)
            return rv
        }, {})
    },

    /**
     * Removes white spaces from an html text.
     *
     * @param html
     * @returns {*}
     */
    removeWhiteSpaces (html) {
        return html.replace(/</g, '\n<')
            .replace(/>/g, '>\n')
            .replace(/\n\n/g, '\n')
            .replace(/^\n/g, '')
            .replace(/\n$/g, '')
            .replace(/\n/g, '')
    },

    /**
     * Gets first {options.limit} characters from an html text.
     *
     * @param html
     * @param options
     *
     * @returns { * }
     */
    trimHtml (html, options) {
        options = options || {}

        const limit = options.limit || 300
        const preserveTags = (typeof options.preserveTags !== 'undefined') ? options.preserveTags : true
        const wordBreak = (typeof options.wordBreak !== 'undefined') ? options.wordBreak : false
        const suffix = options.suffix !== undefined ? options.suffix : '...'
        const moreLink = options.moreLink || ''
        const includeClosingTags = (typeof options.includeClosingTags !== 'undefined') ? options.includeClosingTags : true

        const arr = html.replace(/</g, '\n<')
            .replace(/>/g, '>\n')
            .replace(/\n\n/g, '\n')
            .replace(/^\n/g, '')
            .replace(/\n$/g, '')
            .split('\n')

        let sum = 0
        let row; let cut; let add
        let tagMatch
        let tagName
        const tagStack = []
        let more = false

        for (let i = 0; i < arr.length; i++) {
            row = arr[i]
            // count multiple spaces as one character
            const rowCut = row.replace(/[ ]+/g, ' ')

            if (!row.length) {
                continue
            }

            if (row[0] !== '<') {
                if (sum >= limit) {
                    row = ''
                } else if ((sum + rowCut.length) >= limit) {
                    cut = limit - sum
                    if (row[cut - 1] === ' ') {
                        while (cut) {
                            cut -= 1
                            if (row[cut - 1] !== ' ') {
                                break
                            }
                        }
                    } else {
                        add = row.substring(cut).split('').indexOf(' ')

                        // break on half of word
                        if (!wordBreak) {
                            if (add !== -1) {
                                cut += add
                            } else {
                                cut = row.length
                            }
                        }
                    }

                    row = row.substring(0, cut) + suffix

                    if (moreLink) {
                        row += '<a href="' + moreLink + '" style="display:inline">»</a>'
                    }

                    sum = limit
                    more = true
                } else {
                    sum += rowCut.length
                }
            } else if (!preserveTags) {
                row = ''
            } else if (sum >= limit) {
                if (!includeClosingTags) {
                    row = ''
                } else {
                    tagMatch = row.match(/[a-zA-Z]+/)
                    tagName = tagMatch ? tagMatch[0] : ''
                    if (tagName) {
                        if (row.substring(0, 2) !== '</') {
                            tagStack.push(tagName)
                            row = ''
                        } else {
                            while (tagStack[tagStack.length - 1] !== tagName && tagStack.length) {
                                tagStack.pop()
                            }
                            if (tagStack.length) {
                                row = ''
                            }
                            tagStack.pop()
                        }
                    } else {
                        row = ''
                    }
                }
            }

            arr[i] = row
        }

        return {
            html: arr.join('\n').replace(/\n/g, ''),
            more: more,
        }
    },

    stringToBase64 (s) {
        return window.btoa(unescape(encodeURIComponent(s)))
    },

    /**
     * Gets a formatted string as expected by the API for year week.
     *
     * Examples:
     *  - year:2020 and week: 52 will result into 2020-52
     *  - year:2020 and week: 2 will result into 2020-02
     *
     * @param { Integer } year
     * @param { Integer } week
     *
     * @returns {string}
     */
    getYearWeekString (year, week) {
        return `${year}-${String(week).padStart(2, '0')}`
    },

    /**
     * Returns a random generated ID.
     *
     * @returns string
     */
    generateId () {
        const s4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        }
        return s4() + s4()
    },

    /**
     * Generates a random string
     * @param {Number} length
     * @returns String
     */
    randomToken (length) {
        // generate random string
        const rand = () => Math.random(0).toString(36).substr(2)
        // make the random generated string larger
        const token = (len) => (rand() + rand() + rand() + rand()).substr(0, len)
        // randomly make strings upper case or lowercase
        return token(length).split('').map((v) =>
            Math.round(Math.random()) ? v.toUpperCase() : v.toLowerCase(),
        ).join('')
    },

    /**
     * Validates a list og IP addresses
     * @param ipAddresses - comma sepparated string values
     * @returns Boolean
     */
    invalidIpAdresses (ipAddresses) {
        if (!ipAddresses) {
            return false
        }
        const ips = ipAddresses.split(',')
        for (let i = 0; i < ips.length; i++) {
            if (ips[i].trim() && ips[i].indexOf('/') > -1) {
                // check ip range
                const ipAndRange = ips[i].split('/')
                const ip = ipAndRange[0].trim()
                const range = ipAndRange[1].trim()
                if (ipAndRange.length > 2 || !/^[0-9]+$/.test(range)) {
                    // range is invalid if:
                    // - contains more than one '/'
                    // - contains anything other than numbers
                    return true
                }
                // for range check this https://www.calculator.net/ip-subnet-calculator.html
                if (!validIp(ip) || isNaN(parseInt(range)) || parseInt(range) < 24 || parseInt(range) > 32) {
                    return true
                }
            } else if (ips[i].trim() && !validIp(ips[i].trim())) {
                // check single ip
                return true
            }
        }
        return false
    },

    /**
     * Strips html tags from a string (basically created by above method)
     * @param String
     * @returns String
     */
    stripHtmlTags (string) {
        let output = ''
        if (string !== null && string !== undefined) {
            output = string.toString().replace(/(<([^>]+)>)/gi, '')
        }
        if (output.length && !isNaN(output)) {
            return Number(output)
        }
        return output
    },

    /**
     * Sums the elements of array of numbers
     * @param Array
     * @returns Number
     */
    sumArrayValues (arr) {
        return arr.reduce((a, b) => a + b, 0)
    },

    /**
     * Hilights part of string (as search needle)
     */
    highlight (string, needle) {
        if (!needle) {
            return string
        }
        if (!string) {
            return ''
        }
        return string.toString().replace(new RegExp(needle, 'gi'), match => {
            return '<span class="highlighted">' + match + '</span>'
        })
    },
}

function validIp (ip) {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipRegex.test(ip)
}

// eslint-disable-next-line no-extend-native
String.prototype.capitalize = function () {
    return stringHelper.capitalize(this)
}

// eslint-disable-next-line no-extend-native
String.prototype.replaceArray = function (find, replace) {
    return stringHelper.replaceArray(this, find, replace)
}

// eslint-disable-next-line no-extend-native
String.prototype.camelCase = function () {
    return stringHelper.camelCase(this)
}

export default stringHelper
