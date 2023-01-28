import { mapGetters, mapState } from 'vuex'
import timeBlockHelper from '@/libraries/timeBlockHelper'
export default {
    computed: {
        ...mapGetters('auth', {
            user: 'user',
            canEditOthersAvailabilities: 'canEditOthersAvailabilities',
            hasWeeksetInActivationFlow: 'hasWeeksetInActivationFlow',
            canUseTimePicker: 'canUseTimePicker',
        }),
        ...mapGetters('locale', { locale: 'getLocale' }),
        ...mapGetters('stores', {
            storeDayBusinessTimes: 'storeDayBusinessTimes',
        }),
        ...mapState('availability', {
            timeBlockTypes: state => state.timeBlockTypes,
            allAvailabilities: state => state.availabilityTimeBlocks,
            availabilityEmployeeId: state => state.availabilityEmployeeId,
            editingWeekset: state => state.editingWeekset,
            newTimeBlockPosition: state => state.newTimeBlockPosition,
            availabilityPopoverVisible: state => state.availabilityPopoverVisible,
        }),
        ...mapGetters('availability', {
            timeBlock: 'activeTimeBlock',
            getPopoverPosition: 'getPopoverPosition',
            getTimeBlocksForDate: 'getTimeBlocksForDate',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        businessTimes () {
            return this.storeDayBusinessTimes(this.$moment(this.timeBlock.date), this.isInsideEditableWeekset)
        },
        showModifiedField () {
            if (this.timeBlock.last_modified && this.timeBlock.last_modified.account_id) {
                return !this.$moment(this.timeBlock.created.datetime).isSame(this.$moment(this.timeBlock.last_modified.datetime), 'minute')
            }
        },
        typeModel: {
            get () {
                return {
                    label: this.$t('components.timeBlock.types.' + this.timeBlock.type) + this.schoolHelper(this.timeBlock.type),
                    key: this.timeBlock.type,
                    disabled: false,
                    hidden: false,
                }
            },
            set (type) {
                this.timeBlock.type = type.key
            },
        },
        travelBeforeModel: {
            get () {
                return {
                    key: this.timeBlock.travel.before,
                    label: this.timeBlock.travel.before,
                }
            },
            set (newValue) {
                this.timeBlock.travel.before = newValue.key
            },
        },
        travelAfterModel: {
            get () {
                return {
                    key: this.timeBlock.travel.after,
                    label: this.timeBlock.travel.after,
                }
            },
            set (newValue) {
                this.timeBlock.travel.after = newValue.key
            },
        },
        allowedHoursFrom () {
            const rangeStart = this.isSchoolTypeSelected ? this.$cfg.school.minStartTime : this.businessTimes.from
            const schoolMax = this.$moment().setTime(this.$cfg.school.maxEndTime).add(-1, 'hour').shortTime()
            const businessMax = this.$moment().setTime(this.businessTimes.to).add(-1, 'hour').shortTime()
            const rangeEnd = this.isSchoolTypeSelected ? schoolMax : businessMax
            const hoursRange = this.$moment().timeRange(rangeStart, rangeEnd, 15, 'minutes')
            const hours = []
            hoursRange.forEach(item => {
                const checkHour = this.$moment().setTime(item).hours()
                if (!this.ocupiedHours().includes(checkHour) && !hours.includes(checkHour)) {
                    hours.push(checkHour)
                }
            })
            return hours
        },
        allowedMinutesFrom () {
            const isSameHour = parseInt(this.timeBlock.timeTo) === parseInt(this.timeBlock.timeFrom)
            const allowedMinutes = [0, 15, 30, 45]
            const occupiedMinutes = isSameHour ? this.ocupiedMinutes(this.timeBlock.timeFrom) : []
            let minutes = []
            allowedMinutes.forEach(minute => {
                if (!occupiedMinutes.includes(minute)) {
                    minutes.push(minute)
                }
            })
            if (typeof this.timeBlockBefore !== 'undefined') {
                const nextTimeBlockStartMinutes = parseInt(this.timeBlockBefore.split(':')[1])
                if (nextTimeBlockStartMinutes === 0) {
                    minutes = [0, 15, 30, 45]
                }
                if (nextTimeBlockStartMinutes === 15) {
                    minutes = [15, 30, 45]
                }
                if (nextTimeBlockStartMinutes === 30) {
                    minutes = [30, 45]
                }
                if (nextTimeBlockStartMinutes === 45) {
                    minutes = [45]
                }
            }
            return minutes
        },
        allowedHoursTo () {
            // add 15 minutes to the start time if the minutes are 45 in order to not allow start time hour to be selectable
            const rangeStart = this.$moment().timeObject(this.timeBlock.timeFrom).minutes === 45
                ? this.$moment(this.timeBlock.timeFrom, 'HH:mm').add(15, 'minutes').format('HH:mm')
                : this.timeBlock.timeFrom
            let rangeEnd = this.isSchoolTypeSelected ? this.$cfg.school.maxEndTime : this.businessTimes.to
            // if it has a timeblock after, make the range end at that time
            if (this.timeBlockAfter) {
                rangeEnd = this.timeBlockAfter
            }
            const hoursRange = this.$moment().timeRange(rangeStart, rangeEnd, 15, 'minutes')
            const hours = []
            hoursRange.forEach(item => {
                const checkHour = this.$moment().setTime(item).hours()
                if (!hours.includes(checkHour)) {
                    hours.push(checkHour)
                }
            })
            return hours
        },
        allowedMinutesTo () {
            if (this.timeBlock.timeTo === this.businessTimes.to) {
                return [0]
            }
            const hourTo = parseInt(this.timeBlock.timeTo.split(':')[0])
            const isSameHour = parseInt(this.timeBlock.timeTo) === parseInt(this.timeBlock.timeFrom)
            const allowedMinutes = [0, 15, 30, 45]
            let occupiedMinutes = isSameHour ? this.ocupiedMinutes(this.timeBlock.timeFrom) : []
            let minutes = []
            if (this.isSchoolTypeSelected && hourTo === 19) {
                occupiedMinutes = [15, 30, 45]
            }
            allowedMinutes.forEach(minute => {
                if (!occupiedMinutes.includes(minute)) {
                    minutes.push(minute)
                }
            })

            /**
             * If there is a timeblock after and its hour is the same as current timeTo hour
             * construct the minutes array based on the timeblock after minutes
             */
            if (this.timeBlockAfter && parseInt(this.timeBlockAfter.split(':')[0]) === hourTo) {
                const nextTimeBlockStartMinutes = parseInt(this.timeBlockAfter.split(':')[1])
                if (nextTimeBlockStartMinutes === 0) {
                    minutes = [0]
                }
                if (nextTimeBlockStartMinutes === 15) {
                    minutes = [0, 15]
                }
                if (nextTimeBlockStartMinutes === 30) {
                    minutes = [0, 15, 30]
                }
                if (nextTimeBlockStartMinutes === 45) {
                    minutes = [0, 15, 30, 45]
                }
            }

            if (isSameHour || parseInt(this.timeBlock.timeTo.split(':')[1]) === 59) {
                const index = minutes.indexOf(0)
                if (index > -1) {
                    minutes.splice(index, 1)
                }
            }
            /**
             * Add the minutes 59 to the array when the 23 hour is selected
             * for the timeTo
             */
            if (parseInt(this.timeBlock.timeTo) === 23) {
                minutes.push(59)
            }
            return minutes
        },
        timeBlockBefore () {
            const timeblockItems = this.getTimeBlocksForDate(this.timeBlock.date)
            return timeBlockHelper.timeBlockBefore(this.timeBlock, timeblockItems, this.$moment, this.isInsideEditableWeekset, this.businessTimes)
        },
        timeBlockAfter () {
            const timeblockItems = this.getTimeBlocksForDate(this.timeBlock.date)
            return timeBlockHelper.timeBlockAfter(this.timeBlock, timeblockItems, this.$moment, this.isInsideEditableWeekset, this.businessTimes)
        },
        weekend () {
            return this.$cfg.school.days.indexOf(this.$moment(this.timeBlock.date).clone().locale('en').format('dddd')) === -1
        },
        schoolHelper () {
            return type => {
                let schoolHelper = ''
                if (type === 'school' && this.checkDisabledAvailabilityType(type)) {
                    schoolHelper = this.$t('forms.availabilityEntry.school.notBeforeSevenShort', [this.$cfg.school.minStartTime, this.$cfg.school.maxEndTime])
                    if (this.weekend) {
                        schoolHelper = this.$t('forms.availabilityEntry.school.notAllowedOnWeekends')
                    }
                }
                return schoolHelper
            }
        },
        typeOptions () {
            return this.timeBlockTypes.map(type => {
                return {
                    label: this.$t('components.timeBlock.types.' + type) + this.schoolHelper(type),
                    key: type,
                    disabled: this.checkDisabledAvailabilityType(type),
                    hidden: this.isTypeHidden(type),
                    simple: true,
                }
            })
        },
        /**
         * Gets the values for travel before times dropdown
         * The values are calculated base on the time to of
         * the previous timeblock in increments of 15 minutes
         * If there is not timeblock before the values will be
         * increments of 15 minutes for up to 3 hours
         */
        travelOptionsBefore () {
            let range
            const before = typeof this.timeBlockBefore !== 'undefined' ? this.timeBlockBefore.toString() : '00:00'
            if (before !== '00:00') {
                range = this.$moment().timeRange(this.$moment(before, 'HH:mm').add(15, 'minutes').format('HH:mm'), this.timeBlock.timeFrom, 15, 'minutes')
            } else {
                range = this.$moment().timeRange('00:00', '03:00', 15, 'minutes')
            }
            const arr = []
            const start = this.$moment('00:00', 'HH:mm')

            range.forEach(item => {
                if (arr.length < 12 && before < this.timeBlock.timeFrom) {
                    arr.push(start.add(15, 'minutes').format('HH:mm'))
                }
            })
            if (arr.length > 0) {
                arr.unshift('00:00')
            } else {
                this.timeBlock.travel.before = '00:00'
            }
            return arr.map(time => {
                return {
                    label: time,
                    key: time,
                    disabled: false,
                    hidden: false,
                    simple: true,
                }
            })
        },
        /**
         * Gets the values for travel after times dropdown
         * The values are calculated base on the time from of
         * the next timeblock in increments of 15 minutes
         * If there is not timeblock before the values will be
         * increments of 15 minutes for up to 3 hours
         */
        travelOptionsAfter () {
            let range = []
            const after = typeof this.timeBlockAfter !== 'undefined' ? this.timeBlockAfter.toString() : this.timeBlock.timeTo
            if (this.timeBlockAfter && after === this.timeBlock.timeTo) {
                this.timeBlock.travel.after = '00:00'
                return []
            } else if (after > this.timeBlock.timeTo) {
                range = this.$moment().timeRange(this.timeBlock.timeTo, this.$moment(after, 'HH:mm').add(-15, 'minutes').format('HH:mm'), 15, 'minutes')
            } else {
                range = this.$moment().timeRange('00:00', '03:00', 15, 'minutes')
            }
            const arr = []
            const start = this.$moment('00:00', 'HH:mm')
            range.forEach(item => {
                if (arr.length < 12) {
                    arr.push(start.add(15, 'minutes').format('HH:mm'))
                }
            })
            if (arr.length > 0) {
                arr.unshift('00:00')
            } else {
                this.timeBlock.travel.after = '00:00'
            }
            return arr.map(time => {
                return {
                    label: time,
                    key: time,
                    disabled: false,
                    hidden: false,
                    simple: true,
                }
            })
        },

        /**
         * Returns true if the availability block from a set can be edited:
         * - on create week set page and account activation
         * - on edit week set if set is not approved
         * - on view grids if user can edit others availabilities
         *
         * @returns {boolean}
         */
        isInsideEditableWeekset () {
            // All logic applies for blocks inside week sets.
            if (!this.timeBlock.repeat) {
                return false
            }
            if (['create-weekset', 'manager-create-weekset', 'activate-account-finalize'].includes(this.$route.name)) {
                return true
            }
            if ((['manager-edit-weekset', 'edit-weekset'].includes(this.$route.name)) && this.editingWeekset.status !== 'approved') {
                return true
            }
            return (['month-availability-accountid', 'week-availability-accountid', 'my-week-availability'].includes(this.$route.name)) && this.canEditOthersAvailabilities
        },

        /**
         * Returns true if the availability block from a set can be edited and the current form is in view mode.
         *
         * @returns {boolean}
         */
        isEditingSetInViewMode () {
            return this.isInsideEditableWeekset && (['month-availability-accountid', 'week-availability-accountid', 'my-week-availability'].includes(this.$route.name))
        },

        /**
         * A block is disabled if:
         * - it's inside a non-editable set or an editable set but not inside the view mode
         * - current form is disabled or is being sent
         * - if it's not editable and current user doesn't have "availability_others_edit" (for single blocks)
         * - if it's not editable and current block cannot be changed in current view (for recurring blocks)
         *
         * @returns {*|boolean}
         */
        isDisabled () {
            if (this.isInsideEditableWeekset) {
                return false
            }
            if (!this.canEditOthersAvailabilities && !this.timeBlock.editable) {
                return true
            }
            return this.disabled || this.sendingForm || !(this.timeBlock.repeat ? !this.canEditOthersAvailabilities : !this.isEditingSetInViewMode)
        },
        isSchoolTypeSelected () {
            return this.timeBlock.type === 'school'
        },
        selectedHours () {
            return this.$moment.duration(this.$moment(this.timeBlock.timeTo, 'HH:mm').diff(this.$moment(this.timeBlock.timeFrom, 'HH:mm'))).asHours()
        },
        lessonHours () {
            const start = this.$moment().setTime(this.timeBlock.timeFrom)
            const end = this.$moment().setTime(this.timeBlock.timeTo)
            const minutes = this.$moment.duration(end.diff(start)).asMinutes()
            return this.$moment.utc(this.$moment.duration({ minutes: minutes }).asMilliseconds()).format('HH:mm')
        },
        isTimePickerOpen () {
            return this.$refs.timeRangePicker && this.$refs.timeRangePicker.isRangeOpen
        },

        /**
         * Shows the time picker on mobile always and dektop if the permission allows it
         * @returns {Boolean}
         */
        showTimeRangePicker () {
            return this.IS_MOBILE || this.canUseTimePicker
        },

        /**
         * Shows the time input on dektop if the permission allows it
         * @returns {Boolean}
         */
        showTimeRangeInput () {
            return !this.IS_MOBILE && !this.canUseTimePicker
        },
    },
}
