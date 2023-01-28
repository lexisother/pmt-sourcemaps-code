import pmtApi from '../libraries/pmtApi'
import moment from 'moment'

class StoreService {
    result = []

    /**
     * Returns a list of active stores the current user has access to.
     *
     * @param payload
     *
     * @returns {Promise}
     */
    getActiveStores (payload) {
        payload = payload || {}
        payload.active = 1

        return this.getAllStores(payload)
    }

    /**
     * Returns a list of stores the current user has access to.
     *
     * @param payload
     *
     * @returns {*}
     */
    getAllStores (payload) {
        payload = payload || {}
        if (!payload.page) {
            this.result = []
        }

        return pmtApi.get(`/stores?${Object.keys(payload).map(key => key + '=' + payload[key]).join('&')}`, { data: { set403SnackBar: false } })
            .then((response) => {
                this.result = this.result.concat(response.data.result)
                if (response.data.metaData && response.data.metaData.pagination.next) {
                    // Fetch next page.
                    payload.page = response.data.metaData.pagination.next
                    return this.getAllStores(payload)
                } else {
                    return this.result.map(item => {
                        document.documentElement.style.setProperty('--customer-primary-background-color', item.background_color)
                        document.documentElement.style.setProperty('--customer-secondary-background-color', item.background_color_secondary)
                        document.documentElement.style.setProperty('--customer-primary-color', item.color)
                        document.documentElement.style.setProperty('--customer-secondary-color', item.color_secondary)
                        document.documentElement.style.setProperty('--customer-active-color', item.color_secondary_active)

                        return this.processCurrentStore(item)
                    })
                }
            }).catch(error => {
                if (error.code === 'general.forbidden') {
                    return []
                }

                throw error
            })
    }

    /**
     * Processed current store - as received from /stores or /sitemap calls.
     *
     * @param item
     */
    processCurrentStore (item) {
        const store = {
            id: item.store_id,
            name: item.store_name,
            environmentId: item.layout_id,
            orgName: item.store_name_for_organisation,
            slug: item.store_slug,
            city: item.city,
            storeNumber: item.retail_store_number,
            theme: {
                primaryBackgroundColor: item.background_color,
                secondaryBackgroundColor: item.background_color_secondary,
                primaryColor: item.color,
                secondaryColor: item.color_secondary,
                activeItemColor: item.color_secondary_active,
                bgColor: item.background_color,
                fontColor: item.color,
                logo: item.logo,
                favicon: item.favicon,
            },
            // PLEASE READ THIS
            // merging the whole item also, to handle un-necessary mapping for the store object.
            // all above props will remain for now to not cause breaking changes.
            //
            //
            // For Frontend DEVs:
            // PLEASE DO NOT MAP api responses only if ABSOLUTELY necessary!
            //
            // Any change in the response should be done in backend (exceptions may apply)
            // Exceptions from this rule should be handled in the component or,
            // if a global change is needed to the api response,
            // in the VUEX mutation where the state is updated.
            // ...item // removed the item as it is harder to fix the failing tests then to just put the necessary props only
            banner_heading1: item.banner_heading1,
            banner_heading2: item.banner_heading2,
            html_page_title: item.html_page_title,
        }
        if (item.store_availability) {
            store.openingTimes = mapOpeningTimes(item.store_availability)
        }

        return store
    }

    getStoresFromStoreGroups (ids) {
        return pmtApi.get(`/stores?active=true&store_group_id=${ids}`)
            .then((response) => {
                return response.data.result
            })
    }

    /**
     * Returns the store departments.
     *
     * @param {Date} date
     * @returns {Promise}
     */
    getDepartments (date) {
        if (typeof date === 'undefined') {
            date = new Date()
        }

        return pmtApi.get('/departments', {
            params: {
                date: moment(date).format('YYYY-MM-DD'),
            },
        })
            .then((response) => {
                const result = response.data.result
                const departments = {}

                for (const n in result) {
                    const department = result[n]

                    departments[department.department_id] = department.department_name
                }

                return departments
            })
    }

    /**
     * Get roles for given payload.
     *
     * @param payload
     *
     * @returns {Promise<*>}
     */
    getRoles (payload) {
        return pmtApi.get('/roles', { params: payload })
            .then((response) => {
                return response.data.result
            })
    }

    /**
     * Gets a store's business times
     * @param {Object} params
     */
    getStoreBusinessTimes (id, params) {
        return pmtApi.get(`/stores/${id}/times`, { params }).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    /**
     * Returns weeks status data for current store, filtered based on payload.
     *
     * @param payload
     * @returns {Promise<T | void>}
     */
    getWeekStatuses (payload) {
        return pmtApi.get('/weekStatus', { params: payload }).then((response) => {
            return response.data.result
        }).catch(err => {
            throw err
        })
    }

    /**
     * Initiates recalculation of shifts
     *
     * @param payload
     * @returns {Promise | void>}
     */
    recalculate (payload) {
        return pmtApi.post('recalculate', { module: payload.module }, { system: true, v3: true, store: payload.forStore }).then(() => {
            return true
        }).catch((error) => {
            throw error
        })
    }
}

/**
 * Maps the given raw API response with stores to an object array.
 *
 * @param {Array} openingTimeItems
 * @returns {Array}
 */
function mapOpeningTimes (openingTimeItems) {
    return openingTimeItems.map(item => {
        return {
            weekday: item.week_day,
            closed: item.closed,
            businessTimes: {
                from: item.business_from_time,
                to: item.business_to_time,
            },
            publicTimes: {
                from: item.opening_from_time,
                to: item.opening_to_time,
            },
        }
    })
}

export default new StoreService()
