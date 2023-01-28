class HTMLHelper {
    /**
     * Return an HTML node base on headers and rows.
     * Optionally header bg color and color can be provided, along with the table border width
     * @param {Array} headers ex: ['Header 1', 'Header 2']
     * @param {Array} rows ex: [{header1: 'one', header2: 'two'}, {header1: 'three', header2: 'four'}]
     * @param {String} headerBackgroundColor ex: #fff
     * @param {String} headerColor ex: #fff
     * @param {String} tableBorderWidth ex: '1'
     */
    HTMLNodeFromHeadersAndRows ({ headers, rows, headerBackgroundColor, headerColor, tableBorderWidth }) {
        const table = document.createElement('table')
        const thead = document.createElement('thead')
        const tbody = document.createElement('tbody')
        const headerRow = document.createElement('tr')
        // loop through headers
        for (let i = 0; i < headers.length; i++) {
            const cell = document.createElement('td')
            cell.style.backgroundColor = headerBackgroundColor
            cell.style.color = headerColor
            const headerBold = document.createElement('strong')
            const cellText = document.createTextNode(`${headers[i].text}`)
            headerBold.appendChild(cellText) // add header text to td/cell element
            cell.appendChild(headerBold)
            headerRow.appendChild(cell) // add td element to tr element
        }
        thead.appendChild(headerRow) // append the row to the thead element
        table.appendChild(thead) // append the thead to the table element
        // loop through rows
        for (let i = 0; i < rows.length; i++) {
            const bodyRow = document.createElement('tr')
            for (const j in rows[i]) {
                if (Array.isArray(rows[i][j]) || typeof rows[i][j] === 'object') continue
                const itemText = rows[i][j]
                const cell = document.createElement('td')
                const cellText = document.createTextNode(itemText)
                cell.appendChild(cellText)
                bodyRow.appendChild(cell)
            }
            tbody.appendChild(bodyRow)
        }
        table.appendChild(tbody)
        table.setAttribute('border', tableBorderWidth || '1')
        return table
    }

    async waitForElement (selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector))
            }
            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector))
                    observer.disconnect()
                }
            })
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            })
        })
    }
}

export default new HTMLHelper()
