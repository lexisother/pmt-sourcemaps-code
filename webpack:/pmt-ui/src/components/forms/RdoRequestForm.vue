<template>
    <form class="rdo-request">
        <div class="row">
            <div class="col col-xs-12 col-sm-12 col-md-6 col-lg-6 no-gutters">
                <div class="form-field">
                    <PmtRadioGroup
                        ref="rdoType"
                        v-model="rdoType"
                        name="rdo-type"
                        :label="$t('forms.rdoRequest.rdoTypeField.label')"
                        :disabled="isSending()"
                        :options="rdoTypeRadioOptions"
                        :init-value="selectedOption"
                    />
                </div>
            </div>
        </div>
        <div
            ref="rangePickerContainer"
            class="row"
            :class="{'d-none': rdoType === 'single'}"
        >
            <div class="col col-xs-12">
                <div class="form-field">
                    <label class="required">{{ $t('forms.rdoRequest.dateFromField.label') }}</label>
                    <DatePicker
                        ref="rangePicker"
                        :options="datepickerOptions.multiple"
                        @on-select="updateFromDate($event)"
                    >
                        <template
                            v-if="parseInt(maxRdoDays)"
                            #info
                        >
                            <pmt-info
                                blue
                                info-style="padding: 7px;"
                            >
                                {{ $t('components.datepicker.range.maximumRangeSelectableRdo', [parseInt(maxRdoDays)]) }}
                            </pmt-info>
                        </template>
                    </DatePicker>
                </div>
            </div>
        </div>
        <div
            ref="singleDayPickerContainer"
            class="row"
            :class="{'d-none': rdoType === 'multi'}"
        >
            <div class="col col-lg-6 col-xs-12">
                <div class="form-field">
                    <label class="required">{{ $t('forms.rdoRequest.singleDateField.label') }}</label>
                    <DatePicker
                        ref="singleDayPicker"
                        :options="datepickerOptions.single"
                        @on-select="rdoSingleDay.date = $event.apiFormat()"
                    />
                </div>
            </div>
            <div class="col col-xs-12 col-lg-6 pa-2">
                <TimeRangePicker
                    :time="rdoSingleDay.time"
                    :allowed-hours-to="allowedHoursTo"
                    :allowed-minutes-to="allowedMinutesTo()"
                    :show-clock-icon="!IS_MOBILE"
                    :disabled="isSending()"
                    required
                    @time-set="setTimes($event)"
                />
            </div>
        </div>

        <div class="form-field pt-3">
            <PTextArea
                ref="reason"
                v-model="reason"
                name="reason"
                cy_id="reason"
                :label="$t('forms.rdoRequest.reasonField.label')"
                required
                :minlength="5"
                :maxlength="256"
                :disabled="isSending()"
            />
        </div>
        <PmtError :show="error !== '' && !IS_MOBILE">
            {{ error }}
        </PmtError>
        <div class="button-group">
            <PmtButton
                v-if="!isAccountActivation"
                ref="cancel"
                default
                icon="close"
                icon-size="15"
                @click="$emit('on-cancel')"
            >
                {{ $t('forms.rdoRequest.cancelBtn.label') }}
            </PmtButton>
            <PmtButton
                ref="save"
                primary
                icon="content-save"
                icon-size="15"
                type="submit"
                :disabled="!isFormFilled()"
                :loading="isSending()"
                :loading-text="'Sending'"
                @click="onSubmit"
            >
                {{ $t( 'forms.rdoRequest.submitBtn.label') }}
            </PmtButton>
        </div>
    </form>
</template>

<script>
import { required, minLength, requiredIf } from 'vuelidate/lib/validators'
import { mapGetters, mapActions } from 'vuex'
let errorTimer

export default {
    name: 'RdoRequestForm',
    components: {
        TimeRangePicker: () => import('@/components/ui/form/TimeRangePicker.vue'),
        DatePicker: () => import('@/components/ui/pickers/DatePicker'),
    },
    data () {
        return {
            dateFormat: 'ddd D MMM YYYY',
            error: '',
            sendingForm: false,
            rdoTypeRadioOptions: [
                {
                    label: this.$t('forms.rdoRequest.rdoTypeOptions.oneOrMoreDays'),
                    value: 'multi',
                },
                {
                    label: this.$t('forms.rdoRequest.rdoTypeOptions.timeBlockAtDate'),
                    value: 'single',
                },
            ],
            rdoType: '',
            selectedOption: 'multi',
            rdoDates: {},
            rdoSingleDay: {
                date: '',
                time: {
                    from: '00:00',
                    to: '23:45',
                },
            },
            reason: '',
            multiple: true,
            minDate: this.$moment().apiFormat(),
        }
    },
    computed: {
        ...mapGetters('locale', {
            locale: 'getLocale',
        }),
        ...mapGetters('auth', {
            canYou: 'canYou',
            minRdoDate: 'minRdoDate',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        datepickerOptions () {
            return {
                multiple: {
                    id: 'multiple-rdo-requests-datepicker',
                    selectedDate: this.$moment(this.rdoDates.from),
                    minDate: this.$moment(this.minDate),
                    isRangePicker: true,
                    maxRangeDays: parseInt(this.maxRdoDays),
                    emitSelectOnMounted: false,
                    updateRangeOnFirstSelection: false,
                    showDistinctiveRangeText: true,
                    minDateMessage: this.minRdoMessage,
                    maxDateMessage: this.maxRdoMessage,
                    initialRangeSelection: 'day',
                    closeOnReset: false,
                    mode: 'day',
                    disabled: this.isSending(),
                    activator: {
                        default: true,
                        outline: true,
                        showIcon: true,
                        block: true,
                        noMargin: true,
                    },
                },
                single: {
                    id: 'single-rdo-requests-datepicker',
                    selectedDate: this.$moment(this.rdoSingleDay.date),
                    minDate: this.$moment(this.minDate),
                    emitSelectOnMounted: true,
                    minDateMessage: this.minRdoMessage,
                    maxDateMessage: this.maxRdoMessage,
                    mode: 'day',
                    disabled: this.isSending(),
                    activator: {
                        default: true,
                        outline: true,
                        showIcon: true,
                        block: true,
                        noMargin: true,
                    },
                },
            }
        },
        allowedHoursTo () {
            let from = this.rdoSingleDay.time.from.toString()
            if (parseInt(from.split(':')[1]) === 45) {
                from = this.$moment().setTime(from).add(15, 'minutes').shortTime()
            }
            const range = this.$moment().timeRange(from, '23:45', 60, 'minutes')
            const result = []
            range.forEach(item => {
                result.push(parseInt(item))
            })
            return result
        },
        minRdoMessage () {
            return this.$t('forms.rdoRequest.messages.minDate', [this.minRdoDateTo])
        },
        maxRdoMessage () {
            return this.maxRdoDateTo !== '' ? this.$t('forms.rdoRequest.messages.maxDate', [this.maxRdoDateTo]) : ''
        },
        minRdoDateTo () {
            return this.$moment(this.rdoDates.from).apiFormat()
        },

        /**
         * Calculate the maximum "to" date that can be selected once start date date is selected.
         * It is calculated based on "request_max_days" the user is allowed to select.
         *
         * If no start date is selected, it default to 1 year in the future.
         * @returns {*}
         */
        maxRdoDateTo () {
            const minRdoDateIsPast = this.$moment(this.rdoDates.from).isBefore(this.minDate, 'day')
            let baseMinDate = this.rdoDates.from
            if (minRdoDateIsPast) {
                baseMinDate = this.minDate
            }

            if (this.$refs.rangePicker && this.maxRdoDays > 0) {
                // Subtract 1 day from maxRdoDays in order to include the current day
                return this.$moment(baseMinDate).add(this.maxRdoDays - 1, 'days').apiFormat()
            }

            // Set it to one year in the future if start date is not selected to avoid greying out the future dates.
            return this.$moment(baseMinDate).add(1, 'year').apiFormat()
        },
        maxRdoDays () {
            return this.canYou('planning', 'request_max_days') || 0 // should this take in account the status of the current schedule final/draft?
        },
        isAccountActivation () {
            return this.$route.name === 'activate-account-finalize'
        },
    },
    watch: {
        rdoDates: {
            handler () {
                const from = this.$moment(this.rdoDates.from)
                const to = this.$moment(this.rdoDates.to)
                if ((to.diff(from, 'days') > parseInt(this.maxRdoDays)) && parseInt(this.maxRdoDays) > 0) {
                    // reset the to date to be no more than max days in permissions
                    if (this.$refs.singleDayPicker) this.$refs.singleDayPicker.setDateAsSelected(from.add(this.maxRdoDays - 1, 'days'))
                }
            },
            deep: true,
        },
    },
    validations: {
        rdoSingleDay: {
            time: {
                from: {
                    required: requiredIf(function () {
                        return this.rdoType === 'single'
                    }),
                },
                to: {
                    required: requiredIf(function () {
                        return this.rdoType === 'single'
                    }),
                },
            },
        },
        reason: {
            required,
            minLength: minLength(5),
        },
    },
    created () {
        this.minDate = this.minRdoDate
        this.rdoSingleDay.date = this.minRdoDate
        this.rdoDates.from = this.minRdoDate
        this.rdoDates.to = this.minRdoDate
    },
    methods: {
        ...mapActions('rdoRequests', ['sendRdoRequest']),
        setTimes (event) {
            this.rdoSingleDay.time.from = event.from
            if (this.rdoSingleDay.time.to < event.from) {
                this.rdoSingleDay.time.to = this.$moment().setTime(event.from).add(1, 'hours').shortTime()
            } else {
                this.rdoSingleDay.time.to = event.to
            }
        },
        updateFromDate (event) {
            // checking if isValid is present in the object
            // isValid is a moment function and here we want {from, to} object
            // this is handled more elegant in the datepicker refactor
            if (event.from && !event.isValid) {
                this.rdoDates.from = event.from.apiFormat()
                this.rdoDates.to = event.to.apiFormat()
            }
        },
        updateToDate (event) {
            this.rdoDates.to = event.apiFormat()
        },
        updateSingleDay (event) {
            this.rdoSingleDay.date = event.apiFormat()
        },
        isSending () {
            return this.sendingForm
        },
        isFormFilled () {
            return !this.$v.$invalid
        },
        showError (error) {
            this.error = error
            errorTimer = setTimeout(() => {
                this.error = ''
            }, 5000)
        },
        clearError () {
            clearTimeout(errorTimer)
            this.error = ''
        },
        onSubmit () {
            if (this.isSending() || !this.isFormFilled()) {
                return
            }
            this.clearError()
            this.sendingForm = true
            const payload = {
                reason: this.reason,
                cache: this.$route.name === 'my-requests',
            }
            if (this.rdoType === 'single') {
                payload.date_from = this.rdoSingleDay.date
                payload.time_from = this.rdoSingleDay.time.from
                payload.time_to = this.rdoSingleDay.time.to
            } else {
                payload.date_from = this.rdoDates.from
                payload.date_to = this.rdoDates.to
            }
            this.sendRdoRequest(payload).then(result => {
                this.$emit('after-send', result)
                this.$emit(`after-send-${this.rdoType}`, result)
                this.sendingForm = false
            }).catch(error => {
                this.handleError(error)
            })
        },
        handleError (error) {
            this.sendingForm = false
            this.$emit('after-send-error', error.message)
            this.showError(error.message)
        },
        allowedMinutesTo () {
            const start = this.$moment(this.rdoSingleDay.time.from, 'HH:mm')
            const end = this.$moment(this.rdoSingleDay.time.to, 'HH:mm')
            if (end.hours() === 23) {
                return [15, 30, 45, 59]
            }
            if (start.hours() === end.hours() && start.hours() === 23) {
                if (start.minutes() === 0) {
                    return [15, 30, 45, 59]
                }
                if (start.minutes() === 15) {
                    return [30, 45, 59]
                }
                if (start.minutes() === 30) {
                    return [45, 59]
                }
                if (start.minutes() === 45) {
                    return [59]
                }
            }
            if (start.hours() === end.hours()) {
                if (start.minutes() === 0) {
                    return [15, 30, 45]
                }
                if (start.minutes() === 15) {
                    return [30, 45]
                }
                if (start.minutes() === 30) {
                    return [45]
                }
                if (start.minutes() === 45) {
                    this.rdoSingleDay.time.to = this.$moment(this.rdoSingleDay.time.to, 'HH:mm').add(15, 'minutes').shortTime()
                    return [0, 15, 30, 45]
                }
            }
            return [0, 15, 30, 45]
        },
    },
}
</script>
