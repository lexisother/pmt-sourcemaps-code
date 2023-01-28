const departmentHelper = {

    /**
     * Returns the border styling for a department.
     * @param color
     * @returns {string}
     */
    getBorderColor (color) {
        return `border-left: 5px solid ${(typeof color === 'undefined' ? '#FFF' : color)} !important`
    },
}

export default departmentHelper
