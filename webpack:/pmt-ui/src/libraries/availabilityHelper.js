import timeBlockHelper from './timeBlockHelper'
import moment from 'moment'
import language from '../config/language'

const availabilityHelper = {

    /**
     * Maps the given API response of availability entries into
     * time block objects.
     *
     * @param {array} apiResponse
     * @param {array} week
     * @returns {array}
     */
    mapApiAvailabilityEntries(apiResponse, week) {
        return apiResponse.map(apiItem => {
            return timeBlockHelper.getTimeBlock(apiItem, week)
        })
    },

    /**
     * Maps the given API response of availability weeksets into
     * weekset objects.
     *
     * @param {array} apiResponse
     * @returns {array}
     */
    mapApiAvailabilityWeeksets(apiResponse) {
        return apiResponse.map(item => {
            const obj = {
                id: item.id,
                account_id: item.account_id,
                store_id: item.store_id,
                status: item.status,
                weekset_name: item.weekset_name,
                start_date: moment(item.start_date).toDate(),
                end_date: item.end_date ? moment(item.end_date).toDate() : null,
                create_date: moment(item.created.datetime).toDate(),
                created: item.created,
                last_modified: item.last_modified,
                status_changed: item.status_changed,
                employee_comment: item.employee_comment,
                manager_comment: item.manager_comment,
                availabilities: [],
            }

            if (item.availabilities.length) {
                obj.availabilities = this.mapApiAvailabilityEntries(item.availabilities, { nr: moment(obj.start_date).isoWeek(), year: moment(obj.start_date).isoWeekYear() })
            }

            return obj
        })
    },

    /**
     * Returns name for a week set.
     * It already as a name and ignoreCurrentName is set to false, returns current set name.
     * If not, returns a string based on start date of the set.
     *
     * @param {object} set
     * @param {boolean} ignoreCurrentName
     *
     * @returns {string}
     */
    getWeekSetName(set, ignoreCurrentName = false) {
        return !ignoreCurrentName && set.weekset_name
            ? set.weekset_name
            : language.t('sidePanels.availabilityWeeklyDetails.newWeeksetTitle', [moment(set.start_date).isoWeek(), moment(set.start_date).isoWeekYear()])
    },

    /**
     * Changes the blocks, start date and name for the set that is being changed for a single week.
     *
     * @param {Object} set
     * @param {Object} changedBlock
     *
     * @returns {*}
     */
    processPayloadForOneTimeSet(set, changedBlock) {
        // Set the start date for one-week set based on the changed block's date.
        set.start_date = moment(changedBlock.date).startOf('isoWeek').apiFormat()
        set.weekset_name = availabilityHelper.getWeekSetName(set, true)

        // Make the change for the edited/deleted block, the rest are kept the same.
        const availabilities = []
        for (let i = 0; i < set.availabilities.length; i++) {
            let availability = set.availabilities[i]
            if (parseInt(availability.id) === parseInt(changedBlock.id)) {
                if (changedBlock.deleted) {
                    continue
                }
                availability = changedBlock
            }
            availabilities.push(timeBlockHelper.formatAvailabilityForApi(availability))
        }
        set.availabilities = availabilities

        return set
    },

    availabilityIcon(availability) {
        let icon = 'school'
        let color = 'text-error'
        const type = availability.type
        if (type === 'sport') {
            icon = 'soccer'
        } else if (type === 'other') {
            icon = 'cancel'
        } else if (type === 'agreed') {
            icon = 'lock'
            color = 'text-success'
        } else if (type === 'preferred') {
            icon = 'check'
            color = 'text-success'
        }
        return { icon, color }
    },
}

export default availabilityHelper
