import { store } from '../store'

/**
 * Service to handle the What's new Modal.
 */
class WhatsNewService {
    /**
     * Get the version based on meta data
     *
     * @returns {*}
     */
    version() {
        const $meta = document.querySelector('meta[name="' + 'pmt-version' + '"]')
        if (!$meta) {
            return null
        }

        return $meta.getAttribute('content') + (store.getters['auth/isUserEmployee'] ? '_EMPLOYEE' : '_MANAGER')
    }

    /**
     * Returns true if the What's new modal should be triggered based on "whatsNew" cookie values.
     *
     * @returns {boolean}
     */
    shouldOpenModal() {
        if (this.getDismissedForLater()) {
            return false
        }
        if (!window.$cookies.isKey('whatsNew')) {
            return true
        }
        // If the modal has not been closed manually, and version in cookie is not same as current version: Open modal
        return !window.$cookies.get('whatsNew').closedManually || window.$cookies.get('whatsNew').pmtVersion !== this.version()
    }

    /**
     * Saves to local storage the value for "dismissedForLater" - which tells us if user clicked on "read later" and modal
     * should be opened only after next login.
     *
     * @param value
     */
    setDismissedForLater(value) {
        localStorage.setItem('dismissedForLater', value)
    }

    /**
     * Returns the "dismissedForLater" value.
     *
     * @returns {string}
     */
    getDismissedForLater() {
        return localStorage.getItem('dismissedForLater')
    }
}

export default new WhatsNewService()
