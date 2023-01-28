const scrollHelper = {

    /**
     * Returns weather the provided HTML element is visible on the page
     *
     * @param {HTMLElement} elem Ex: document.getElementById('some-id');
     * @returns {Boolean}
     */
    isInViewport (elem) {
        if (elem) {
            const bounding = elem.getBoundingClientRect()
            return (
                bounding.top >= 0 &&
                bounding.left >= 0 &&
                bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
            )
        }
        return false
    },

}

export default scrollHelper
