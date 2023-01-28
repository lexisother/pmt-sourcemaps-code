class ApiError {
    /**
     * Create new API error instance.
     *
     * @param {Exception} error
     * @param {string} message
     */
    constructor (code, message, info) {
        this.code = code
        this.message = message
        this.info = info
    }
}

export default ApiError
