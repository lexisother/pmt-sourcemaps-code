import Vue from 'vue'
import htmlHelper from '../../libraries/htmlHelper'
import stringHelper from '../../libraries/stringHelper'
import browserHelper from '../../libraries/browserHelper'
const actions = {
    SET_SCROLL_POSITION({ commit }) {
        window.addEventListener('scroll', commit('UPDATE_SCROLL_POSITION'))
    },
    /**
     *
     * @param {VUEX} context
     * @param {Object} cookie context of the cookie
     */
    async SET_COOKIE(context, { name, value, expiration = null, path = null, domain = null, secure = window.location.hostname !== 'localhost', samesite = window.location.hostname !== 'localhost' ? 'None' : false }) {
        await Vue.$cookies.set(name, value, expiration, path, domain, secure, samesite)
    },

    PRINT(context, payload) {
        const printHtml = document.getElementById(payload.elementId).outerHTML
        // Get all stylesheets HTML
        let stylesHtml = ''
        for (const node of [...document.querySelectorAll('link[rel="stylesheet"], style')]) {
            stylesHtml += node.outerHTML
        }
        const windowPrint = window.open(browserHelper.isInternetExplorer() ? '' : 'print', 'print', 'left=0,top=0,width=1200,height=800,toolbar=0,scrollbars=0,status=0')
        windowPrint.document.write(`<!DOCTYPE html>
                                    <html>
                                        <head>
                                            ${stylesHtml}
                                        </head>
                                        <body>
                                            ${printHtml}
                                        </body>
                                    </html>`)
        windowPrint.document.close()
        windowPrint.document.title = payload.title
        windowPrint.focus()
        windowPrint.print()
        setTimeout(() => {
            // firefox does not handles close() well => closes before document save
            if (navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
                windowPrint.close()
            }
            return true
        }, 500)
    },

    EXPORT_EXCEL(context, { headers, rows, title = 'PMT Data', useCustomerTheme = true }) {
        const uri = 'data:application/vnd.ms-excel;base64,'
        const template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
        const format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p]
            })
        }
        const tableOptions = {
            headers: headers,
            rows: rows,
            headerBackgroundColor: useCustomerTheme ? context.rootGetters['stores/currentStore'].theme.primaryBackgroundColor : false,
            headerColor: useCustomerTheme ? context.rootGetters['stores/currentStore'].theme.primaryColor : false,
        }
        const htmls = htmlHelper.HTMLNodeFromHeadersAndRows(tableOptions).outerHTML
        const ctx = {
            worksheet: title,
            table: htmls,
        }
        const link = document.createElement('a')
        link.download = title
        link.href = uri + stringHelper.stringToBase64(format(template, ctx))
        link.click()
    },
}

export default actions
