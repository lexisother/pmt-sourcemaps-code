class BrowserHelper {
    navigator = {
        header: [window.navigator.platform, window.navigator.userAgent, window.navigator.appVersion, window.navigator.vendor, window.opera],
        dataos: [
            { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
            { name: 'Windows', value: 'Win', version: 'NT' },
            { name: 'iPhone', value: 'iPhone', version: 'OS' },
            { name: 'iPad', value: 'iPad', version: 'OS' },
            { name: 'Kindle', value: 'Silk', version: 'Silk' },
            { name: 'Android', value: 'Android', version: 'Android' },
            { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
            { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
            { name: 'Macintosh', value: 'Mac', version: 'OS X' },
            { name: 'Linux', value: 'Linux', version: 'rv' },
            { name: 'Palm', value: 'Palm', version: 'PalmOS' },
        ],
        databrowser: [
            { name: 'Edge', value: 'Edg', version: 'Edg' },
            { name: 'Opera', value: 'OPR', version: 'OPR' },
            { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
            { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
            { name: 'Safari', value: 'Safari', version: 'Version' },
            { name: 'Internet Explorer', value: 'Trident', version: 'Trident' },
            { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
            { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' },
        ],
        matchItem (string, data) {
            let i = 0
            let j = 0
            let regex
            let regexv
            let match
            let matches
            let version
            for (i = 0; i < data.length; i += 1) {
                regex = new RegExp(data[i].value, 'i')
                match = regex.test(string)
                if (match) {
                    regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i')
                    matches = string.match(regexv)
                    version = ''
                    if (matches) { if (matches[1]) { matches = matches[1] } }
                    if (matches) {
                        matches = matches.split(/[._]+/)
                        for (j = 0; j < matches.length; j += 1) {
                            if (j === 0) {
                                version += matches[j] + '.'
                            } else {
                                version += matches[j]
                            }
                        }
                    } else {
                        version = '0'
                    }
                    return {
                        name: data[i].name,
                        version: parseFloat(version),
                    }
                }
            }
            return { name: 'unknown', version: 0 }
        },
    }

    browser_info () {
        const agent = this.navigator.header.join(' ')
        const os = this.navigator.matchItem(agent, this.navigator.dataos)
        const browser = this.navigator.matchItem(agent, this.navigator.databrowser)
        return {
            os_name: `${os.name} ${os.version}`,
            browser_name: this.isInternetExplorer() ? 'Internet Explorer' : browser.name,
            browser_version: this.isInternetExplorer(true) || browser.version,
            screen_resolution: window.screen.width * window.devicePixelRatio + 'x' + window.screen.height * window.devicePixelRatio,
        }
    }

    /**
     * Returns true if the current browser is Internext Explorer.
     * @param {Boolean} val Wheater to return the IE version
     * @returns {Boolean or Number}
     */
    isInternetExplorer (val) {
        const ua = window.navigator.userAgent
        const msie9 = ua.indexOf('MSIE 9')
        const msie10 = ua.indexOf('MSIE 10')
        const trident = ua.indexOf('Trident/7')
        if (msie9 > 0) {
            // IE 9 or older
            return val ? 9 : true
        }

        if (msie10 > 0) {
            // IE 10 or older
            return val ? 10 : true
        }

        if (trident > 0) {
            // IE 11
            return val ? 11 : true
        }

        // other browser
        return false
    }

    isIE9OrLower () {
        return this.isInternetExplorer() && this.isInternetExplorer(true) < 10
    }

    iOS9OrLower () {
        const userOS = this.browser_info()
        return (userOS.os_name === 'iPhone' || userOS.os_name === 'iPad' || userOS.os_name === 'Macintosh') && userOS.version < 10
    }

    isInViewPort (elem) {
        // Check if element is visible on the screen
        // Get element's bounding
        const bounding = elem.getBoundingClientRect()
        // Check if it's out of the viewport on each side
        const out = {}
        out.top = bounding.top < 0 // some part is hidden on top
        out.left = bounding.left < 0 // some part is hidden on left
        out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight) // some part is hidden on bottom
        out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth) // some part is hidden on right
        out.any = out.top || out.left || out.bottom || out.right // partialy visible on any side
        out.all = out.top && out.left && out.bottom && out.right // entirely hidden from view
        return out
    }

    /**
     * Display an image in the console.
     * @param  {string} url The url of the image.
     * @param  {int} scale Scale factor on the image
     * @return {null}
     */
    consoleImage (url, scale) {
        scale = scale || 0.8
        const img = new Image()
        const getBox = function (width, height) {
            return {
                string: '+',
                style: `font-size: 1px; padding: ${Math.floor(height / 2)}px ${Math.floor(width / 2)}px; line-height: ${height}px;`,
            }
        }
        img.onload = function () {
            const dim = getBox(this.width * scale, this.height * scale)
            console.log('%c' + dim.string, dim.style + 'background: url(' + url + '); background-size: ' + (this.width * scale) + 'px ' + (this.height * scale) + 'px; color: transparent;')
        }
        img.src = url
    }

    sideScroll (element, direction, speed, distance, step) {
        let scrollAmount = 0
        const slideTimer = setInterval(() => {
            if (direction === 'left') {
                element.scrollLeft -= step
            } else {
                element.scrollLeft += step
            }
            scrollAmount += step
            if (scrollAmount >= distance) {
                window.clearInterval(slideTimer)
            }
        }, speed)
    }
}

export default new BrowserHelper()
