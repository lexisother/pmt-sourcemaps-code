class NavigatorHelper {
    copyElementText (elementId) {
        if (document.selection) { // IE
            const range = document.body.createTextRange()
            range.moveToElementText(document.getElementById(elementId))
            range.select()
            document.execCommand('copy')
            // remove text selection
            document.selection.empty()
        } else if (window.getSelection) {
            const range = document.createRange()
            if (range && range.selectNode) {
                range.selectNode(document.getElementById(elementId))
                window.getSelection().removeAllRanges()
                window.getSelection().addRange(range)
                document.execCommand('copy')
                // remove text selection
                window.getSelection().empty()
                window.getSelection().removeAllRanges()
            }
        }
    }
}

export default new NavigatorHelper()
