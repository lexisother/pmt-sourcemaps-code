import { mapMutations, mapActions } from 'vuex'
import timeBlockHelper from '@/libraries/timeBlockHelper'
export default {
    methods: {
        ...mapMutations('availability', {
            closePopover: 'closePopover',
            availabilityFormReset: 'availabilityFormReset',
            deleteSingleLocalAvailability: 'deleteSingleLocalAvailability',
            createSingleLocalAvailability: 'createSingleLocalAvailability',
            updateSingleLocalAvailability: 'updateSingleLocalAvailability',
            resetEditingTimeblockType: 'resetEditingTimeblockType',
            updateActiveTimeBlockTimes: 'updateActiveTimeBlockTimes',
        }),
        ...mapActions('availability', {
            submitAvailabilityForm: 'submitAvailabilityForm',
            deleteAvailabilityEntry: 'deleteAvailabilityEntry',
            saveOneTimeChangeInSet: 'saveOneTimeChangeInSet',
        }),
        async updateTimeTo (event) {
            if (this.isSchoolTypeSelected && this.$moment().setTime(event).add(1, 'hour').shortTime() > this.$cfg.school.maxEndTime) {
                this.showError(this.$t('forms.availabilityEntry.school.notAfterNineteen', [this.$cfg.school.maxEndTime]))
                this.timeBlock.timeTo = this.$cfg.school.maxEndTime
            } else {
                // only change time to if it's smaller than time from and does not have other timeblock in between
                const blockRange = this.$moment().timeRange(this.timeBlock.timeFrom, this.timeBlock.timeTo, 15, 'minutes')
                let hasTimeBlocksOnRange = false
                for (let i = 0; i < blockRange.length; i++) {
                    if (this.hasTimeBlocks(blockRange[i])) {
                        hasTimeBlocksOnRange = true
                        break
                    }
                }
                if (this.timeBlock.timeFrom >= this.timeBlock.timeTo || hasTimeBlocksOnRange) {
                    const allowedMinutesTo = this.allowedMinutesTo
                    const minutesToAdd = allowedMinutesTo.length ? allowedMinutesTo[allowedMinutesTo.length - 1] - 15 : 60
                    this.timeBlock.timeTo = await this.$moment().setTime(event).add(minutesToAdd, 'minutes').shortTime()
                }
                if (hasTimeBlocksOnRange) {
                    this.overlapping = true
                }
            }
        },

        /**
             * Sets the times upon event emited from the time picker
             * @param {String} what
             * @param {String} event (time string)
             */
        async setPickerTime (what, event) {
            switch (what) {
                case 'hour-from':
                    this.timeBlock.timeFrom = event
                    await this.updateTimeTo(event)
                    return true
                case 'minute-from':
                    this.timeBlock.timeFrom = event
                    await this.updateTimeTo(event)
                    return true
                case 'hour-to':
                    if (this.timeBlockAfter && this.timeBlockAfter < event) {
                    // this is for when the minutes of the event exceed the timeblock after
                    // in this case we set timeTo to the timeblockafter time, thus reseting the validation
                        this.timeBlock.timeTo = this.timeBlockAfter
                    } else {
                        this.timeBlock.timeTo = event
                        if (event <= this.timeBlock.timeFrom) {
                            this.timeBlock.timeTo = this.$moment().setTime(this.timeBlock.timeFrom).add(15, 'minutes').shortTime()
                        }
                        if (event === '00:00' || event === '00:59') {
                            this.timeBlock.timeTo = '23:59'
                        }
                    }

                    return true
                case 'minute-to':
                    this.timeBlock.timeTo = event
                    if (event <= this.timeBlock.timeFrom) {
                        this.timeBlock.timeTo = this.$moment().setTime(this.timeBlock.timeFrom).add(15, 'minutes').shortTime()
                        this.showError(this.$t('forms.availabilityEntry.validationMsg.notShorterThanFiveteenMinutes'))
                    }
                    return true
            }
        },

        /**
         * Disable "agreed" option for single events for employees.
         *
         * @param type
         * @returns {*}
         */
        isTypeHidden (type) {
            // in a weekset anyone can add/edit anything.
            if (this.isInsideEditableWeekset) {
                return false
            }
            if (this.user.accountId === this.availabilityEmployeeId && type === 'agreed') { return true };
            return false
        },
        userWantsToDeleteClick () {
            if (this.$cfg.specialAvailabilityRoutes.includes(this.$route.name)) {
                this.deleteTimeblock()
                return
            }
            this.userWantsToDelete = true
        },
        checkDisabledAvailabilityType (type) {
            const startsBeforeSeven = this.$moment().setTime(this.timeBlock.timeFrom).isBefore(this.$moment().setTime(this.$cfg.school.minStartTime), 'minute')
            const endsAfterSevenPm = this.$moment().setTime(this.timeBlock.timeTo).isAfter(this.$moment().setTime(this.$cfg.school.maxEndTime), 'minute')
            const startsAfterFive = this.$moment().setTime(this.timeBlock.timeFrom).isAfter(this.$moment().setTime(this.$cfg.school.maxEndTime), 'minute')
            if ((this.weekend || startsBeforeSeven || startsAfterFive || endsAfterSevenPm) && type === 'school') {
                return true
            }
            if (this.isInsideEditableWeekset) {
                return false
            }
            if (this.isTypeHidden(type)) { return true };
            return false
        },
        ocupiedMinutes (hour) {
            const timeblockItems = this.getTimeBlocksForDate(this.timeBlock.date)
            return timeBlockHelper.ocupiedMinutesForHour(hour, timeblockItems, this.$moment, this.isInsideEditableWeekset)
        },
        ocupiedHours () {
            const timeblockItems = this.getTimeBlocksForDate(this.timeBlock.date)
            return timeBlockHelper.ocupiedHours(timeblockItems, this.$moment, this.isInsideEditableWeekset)
        },
        ocupiedTimes () {
            const timeblockItems = this.getTimeBlocksForDate(this.timeBlock.date)
            return timeBlockHelper.ocupiedTimes(timeblockItems, this.$moment, this.isInsideEditableWeekset)
        },
        hasTimeBlocks (time) {
            return this.ocupiedTimes().includes(time)
        },
        updateTimeBlockTimes (time) {
            // add one minute to the times that start at 0.
            if (this.hasTimeBlocks(time.from.split(':')[1] === '00' ? this.$moment().setTime(time.from).add(1, 'minutes').format('HH:mm') : time.from) || this.hasTimeBlocks(time.to)) {
                this.overlapping = true
                this.error = this.$t('forms.availabilityEntry.validationMsg.timesOverlap', [this.timeBlock.timeTo])
            } else {
                this.updateActiveTimeBlockTimes(time)
                this.overlapping = false
                this.error = ''
            }
        },
        closeForm (payload) {
            // Editing blocks on month view doesn't require any extra actions.
            if (this.isEditingSetInViewMode && this.$route.name === 'month-availability-accountid') {
                this.closePopover()
                this.$emit('closed')

                return
            }
            if (payload.saved || payload.deleted) {
                this.$emit('modified')
            }
            this.availabilityFormReset(payload)
            this.closePopover()
            this.$emit('closed')
        },
        deleteTimeblock () {
            const mode = this.$route.meta.mode
            // If it's in view mode, save the changes of the block right away by calling the API.
            if (this.isEditingSetInViewMode) {
                this.sendingForm = true
                this.timeBlock.deleted = true
                this.saveOneTimeChangeInSet({ time_block: this.timeBlock, mode: mode })
                    .then(() => {
                        if (!(mode === 'month' && this.isInsideEditableWeekset)) {
                            this.deleteSingleLocalAvailability({ id: this.timeBlock.id, changeHistory: this.isInsideEditableWeekset })
                        }
                        this.closeForm({ saved: false, deleted: true, deletedTimeBlock: this.timeBlock })
                    })
                    .finally(() => {
                        this.sendingForm = false
                    })
            } else {
                this.deleteSingleLocalAvailability({ id: this.timeBlock.id, changeHistory: this.isInsideEditableWeekset })
                this.closeForm({ saved: false, deleted: true, deletedTimeBlock: this.timeBlock })
            }
        },
        deleteActiveTimeBlock () {
            if (this.sendingForm) {
                return
            }
            if (!this.isInsideEditableWeekset) {
                this.sendingForm = true
                this.isDeleting = true
                this.deleteAvailabilityEntry({
                    availabilityId: this.timeBlock.id,
                    date: this.$moment(this.timeBlock.date),
                }).then(() => {
                    this.deleteTimeblock()
                    this.sendingForm = false
                    this.isDeleting = false
                }).catch((error) => {
                    this.showError(error.message)
                    this.sendingForm = false
                    this.isDeleting = false
                })
            } else {
                this.deleteTimeblock()
            }
        },

        /**
         * Actions performed when saving a single availability block or a block inside a set.
         *
         * @param event
         */
        onSubmit (event) {
            const editedHtmlBlock = this.$route.name === 'month-availability-accountid'
                ? document.querySelectorAll(`[data-unique-id='${timeBlockHelper.getUniqueIdForBlock(this.timeBlock)}']`)[0]
                : document.querySelectorAll(`[data-id='${this.timeBlock.id}']`)[0]
            if ((!this.sendingForm) && (!this.isInsideEditableWeekset || (this.$route.params.activation && !this.hasWeeksetInActivationFlow))) {
                this.clearError()
                this.sendingForm = true
                this.timeBlock.date = this.$moment(this.timeBlock.date)
                this.submitAvailabilityForm({
                    timeBlock: this.timeBlock,
                    duration: this.lessonHours,
                }).then(result => {
                    this.sendingForm = false
                    editedHtmlBlock.className += ' animated ' + this.animations[result.action]
                    this.closeForm({ saved: true, newTimeBlock: result.newTimeBlock })
                }).catch((error) => {
                    this.showError(error.message)
                    this.sendingForm = false
                })
            } else if (this.isInsideEditableWeekset) {
                // If it's in view mode, save the changes of the block right away by calling the API.
                if (this.isEditingSetInViewMode) {
                    const mode = this.$route.meta.mode
                    this.saveOneTimeChangeInSet({ time_block: this.timeBlock, mode: mode }).then(() => {
                        editedHtmlBlock.className += ' animated ' + this.animations.update
                    }).catch(() => {})
                } else if (this.timeBlock.id === 0) {
                    this.timeBlock.new = true
                    this.createSingleLocalAvailability(this.timeBlock)
                } else {
                    this.updateSingleLocalAvailability(this.timeBlock)
                }
                this.closeForm({ saved: true, newTimeBlock: this.timeBlock, oldTimeBlock: this.entry, isWeekset: this.isInsideEditableWeekset })
            }
        },
        async setType (type) {
            await this.$refs.typeField.setAsActiveMenuItem(type.toLowerCase())
        },
        showError (error) {
            this.error = error
            this.errorTimer = setTimeout(() => { this.error = '' }, 5000)
        },
        clearError () {
            clearTimeout(this.errorTimer)
            this.error = ''
        },
    },
}
