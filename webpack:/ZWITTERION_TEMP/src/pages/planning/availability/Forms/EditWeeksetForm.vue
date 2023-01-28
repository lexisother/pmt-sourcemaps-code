<template>
    <div>
        <form
            v-if="weekset"
            autocomplete="off"
            :class="{'loading-form': checkingWeekset}"
        >
            <span
                v-if="error"
                class="text-warning"
            >{{ error }}</span>
            <div v-if="weeksetEmployee && $route.meta.manager">
                <label>{{ $t('entities.common.employee') }}: </label>
                <chip
                    :text="titleUsername"
                    block
                    default
                />
            </div>
            <div v-if="!isNew">
                <label for="">Status: </label>
                <weekset-status
                    :status-name="$t('entities.weekset.status.' + weeksetForm.status)"
                    :status="weeksetForm.status"
                />
            </div>
            <div
                v-if="originalStartDate"
                class="form-field"
            >
                <label>{{ $t('entities.common.original') + ' ' + $t('entities.common.startDate') }}</label>
                <DatePicker
                    ref="datePickerOriginal"
                    :options="datepickers.original"
                >
                    <template #selected-date-text="{ date }">
                        <div>{{ selectedDateFormat(date) }}</div>
                    </template>
                </DatePicker>
            </div>
            <div
                v-if="weeksetForm.start_date"
                class="form-field"
            >
                <label>{{ $t('entities.common.startDate') }}</label>
                <DatePicker
                    ref="datePicker"
                    :options="datepickers.edit"
                    @on-select="updateWeeksetStartDate($event)"
                >
                    <template #selected-date-text="{ date }">
                        <div>{{ selectedDateFormat(date) }}</div>
                    </template>
                </DatePicker>
                <chip
                    v-if="localWeekFinalized"
                    :text="$t('pages.mySchedule.weekFinalized')"
                    :icon-tooltip="$t('sidePanels.availabilityWeeklyDetails.sections.weekFinalizedMessage')"
                    error
                    simple
                    outline
                    icon="help-circle-outline"
                />
                <chip
                    v-if="(existingPendingWeekset && isNew)"
                    :text="$t('sidePanels.availabilityWeeklyDetails.sections.existingPendingSetOnDate')"
                    error
                    outline
                    simple
                />
            </div>

            <div class="form-field">
                <PTextArea
                    v-if="!$route.meta.manager || isCurrentUser"
                    ref="employeeRemark"
                    v-model="weeksetForm.employee_comment"
                    name="employee-remark"
                    :label="$t( 'forms.availabilityWeeklyEntry.remarkField.label' )"
                    no-placeholder
                    :disabled="$route.meta.manager && !isCurrentUser"
                />
                <span v-else-if="isEdit">
                    <label for="remark">{{ $t( 'forms.availabilityWeeklyEntry.remarkField.label' ) }}</label>
                    <div>{{ weeksetForm.employee_comment || '-' }}</div>
                </span>
            </div>
            <div class="form-field">
                <PTextArea
                    v-if="$route.meta.manager"
                    ref="managerRemark"
                    v-model="weeksetForm.manager_comment"
                    name="manager-remark"
                    :label="$t( 'forms.availabilityWeeklyEntry.remarkManagerField.label' )"
                    no-placeholder
                />
                <span v-else>
                    <label for="remark">{{ $t( 'forms.availabilityWeeklyEntry.remarkManagerField.label' ) }}</label>
                    <div>{{ weeksetForm.manager_comment || '-' }}</div>
                </span>
            </div>
            <div
                v-if="canEditOthersAvailabilities"
                class="form-field"
            >
                <changed-by
                    v-if="weekset.last_modified"
                    show-modified
                    show-prefix
                    :account_id="weekset.last_modified.account_id"
                    :modified_date="weekset.last_modified.datetime"
                />
                <changed-by
                    v-if="weekset.created"
                    show-created
                    show-prefix
                    :account_id="weekset.created.account_id"
                    :modified_date="weekset.created.datetime"
                />
            </div>
            <div class="form-field">
                <popover-button
                    ref="saveBtn"
                    primary
                    medium
                    :is-open="confirmSaveEmptyWeekset"
                    icon="content-save"
                    :disabled="rejecting || saving || savingApproving || (existingPendingWeekset && isNew) || checkingWeekset"
                    :loading="saving"
                    cy_id="BtnSave"
                    :text="$t('sidePanels.availabilityWeeklyDetails.sections.save')"
                    @click="saveClick()"
                    @hide="confirmSaveEmptyWeekset = false;"
                >
                    <template slot="popover-content">
                        <p v-if="confirmSaveEmptyWeekset">
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.emptyWeeksetDetected') }}
                        </p>
                        <pmt-button
                            v-if="confirmSaveEmptyWeekset"
                            primary
                            outline
                            custom-class="tooltip-target b1"
                            @click="saveWeekset()"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.yes') }}
                        </pmt-button>
                        <pmt-button
                            normal
                            custom-class="tooltip-target b1"
                            @click="confirmSaveEmptyWeekset = false"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.no') }}
                        </pmt-button>
                    </template>
                </popover-button>
                <popover-button
                    v-if="canEditOthersAvailabilities && !$route.params.activation"
                    ref="saveAndApproveBtn"
                    :is-open="confirmAlreadyApprovedSet || confirmSaveApproveEmptyWeekset"
                    success
                    medium
                    outline
                    icon="done"
                    :disabled="rejecting || saving || savingApproving || (existingPendingWeekset && isNew) || checkingWeekset"
                    :loading="savingApproving"
                    cy_id="BtnSaveAndApprove"
                    :text="$t('sidePanels.availabilityWeeklyDetails.sections.saveApprove')"
                    @click="saveApproveClick()"
                    @hide="confirmAlreadyApprovedSet = false; confirmSaveApproveEmptyWeekset = false"
                >
                    <!-- Check for already approved weeksets -->
                    <template
                        v-if="!confirmSaveApproveEmptyWeekset"
                        slot="popover-content"
                    >
                        <p v-if="confirmAlreadyApprovedSet">
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.alreadyApprovedWeeksetDetected') }}
                        </p>
                        <pmt-button
                            v-if="confirmAlreadyApprovedSet"
                            danger
                            outline
                            custom-class="tooltip-target b1"
                            @click="availabilityTimeBlocks.length < 1 ? confirmSaveApproveEmptyWeekset = true : saveWeekset('approved')"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.yes') }}
                        </pmt-button>
                        <pmt-button
                            normal
                            custom-class="tooltip-target b1"
                            @click="confirmAlreadyApprovedSet = false"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.no') }}
                        </pmt-button>
                    </template>
                    <!-- Check for empty weeksets, this is also done if the week does (not) have an approved weekset already -->
                    <template
                        v-else
                        slot="popover-content"
                    >
                        <p v-if="confirmSaveApproveEmptyWeekset">
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.emptyWeeksetDetected') }}
                        </p>
                        <pmt-button
                            v-if="confirmSaveApproveEmptyWeekset"
                            success
                            outline
                            custom-class="tooltip-target b1"
                            @click="saveWeekset('approved')"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.yes') }}
                        </pmt-button>
                        <pmt-button
                            normal
                            custom-class="tooltip-target b1"
                            @click="confirmSaveApproveEmptyWeekset = false"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.no') }}
                        </pmt-button>
                    </template>
                </popover-button>
                <popover-button
                    v-if="!isNew && weekset.status != 'rejected'"
                    ref="rejectBtn"
                    :is-open="showReject"
                    danger
                    outline
                    medium
                    icon="close"
                    :disabled="rejecting || saving || savingApproving || checkingWeekset"
                    :loading="rejecting"
                    cy_id="BtnReject"
                    :text="$t(`sidePanels.availabilityWeeklyOverview.actions.${isManager ? 'reject' : 'revoke'}`)"
                    @click="showReject = true"
                    @hide="showReject = false"
                >
                    <template slot="popover-content">
                        <p>
                            <alert-outline
                                :size="18"
                                class="text-error"
                            /> {{ $t('sidePanels.availabilityWeeklyOverview.rejectQuestion') }}
                        </p>
                        <label for="text">{{ $t('sidePanels.availabilityWeeklyOverview.rejectLabel') }}</label><small style="color: pink">*</small>
                        <PInput
                            v-model="weeksetForm.manager_comment"
                            @input="error = ''"
                        />
                        <span
                            v-if="error"
                            class="text-warning"
                        >{{ error }}</span>
                        <br>
                        <pmt-button
                            v-if="weeksetForm.manager_comment !== null && weeksetForm.manager_comment !== undefined"
                            danger
                            outline
                            custom-class="tooltip-target b1"
                            :disabled="weeksetForm.manager_comment.length < 5 || rejecting"
                            @click="saveWeekset('rejected')"
                        >
                            {{ $t('sidePanels.availabilityWeeklyOverview.actions.reject') }}
                        </pmt-button>
                        <pmt-button
                            normal
                            custom-class="tooltip-target b1"
                            @click="showReject = false; weeksetForm.manager_comment = ''"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.cancel') }}
                        </pmt-button>
                    </template>
                </popover-button>
            </div>
        </form>
        <round-spinner
            v-if="checkingWeekset"
            :loading="true"
            block
            :loading-text="$t('sidePanels.availabilityWeeklyDetails.checkingWeeksetDetails')"
            absolute
        />
        <br>
        <pmt-info
            v-if="hasApprovedWeeksets && !(existingPendingWeekset && isNew) && !checkingWeekset"
            ref="alreadyapprovedAvailabilitiesInfo"
            gray
        >
            {{ $t('sidePanels.availabilityWeeklyOverview.hasApprovedSet') }}
        </pmt-info>
        <pmt-info
            v-if="!availabilityTimeBlocks.length"
            ref="noAvailabilitiesInfo"
            gray
        >
            <h4>{{ $t('sidePanels.availabilityWeeklyDetails.emptyWeekset.label') }}</h4>
            {{ $t('sidePanels.availabilityWeeklyDetails.emptyWeekset.body') }}
        </pmt-info>
        <weekset-changes
            ref="weeksetChanges"
            :changes="weeksetChanges"
        />
    </div>
</template>

<script>
import WeeksetChanges from './WeeksetChanges.vue'
import WeeksetStatus from '../SidePanels/Components/WeeksetStatus.vue'
import myScheduleService from '@/services/MyScheduleService'
import DatePicker from '@/components/ui/pickers/DatePicker'
import * as vuex from 'vuex'
import timeBlockHelper from '@/libraries/timeBlockHelper'
export default {
    name: 'EditWeeksetForm',
    components: {
        WeeksetChanges, WeeksetStatus, DatePicker,
    },
    props: {
        weekset: {
            type: Object,
            default: () => ({}),
        },
        weekFinalized: Boolean,
        weeksetEmployee: {
            type: Object,
            default: () => ({}),
        },
    },
    data () {
        return {
            originalAvailabilities: [],
            originalStartDate: '',
            weeksetForm: {},
            confirmClose: false,
            confirmSaveEmptyWeekset: false,
            confirmSaveApproveEmptyWeekset: false,
            confirmAlreadyApprovedSet: false,
            error: '',
            saving: false,
            savingApproving: false,
            localWeekFinalized: false,
            existingPendingWeekset: false,
            rejectRemark: '',
            rejecting: false,
            showReject: false,
            checkingWeekset: false,
            localSelectedDate: null,
        }
    },
    computed: {
        ...vuex.mapGetters('auth', [
            'canYou',
            'canEditOthersAvailabilities',
            'user',
        ]),
        ...vuex.mapState('availability', {
            availabilityTimeBlocks: 'availabilityTimeBlocks',
            weeksetChanges: 'weeksetChanges',
            availabilityEmployeeId: 'availabilityEmployeeId',
            newWeeksetWeekYear: 'newWeeksetWeekYear',
            weeksets: 'weeksets',
            editingWeekset: 'editingWeekset',
        }),
        datepickers () {
            const result = {
                edit: {
                    id: 'edit-weekset-datepicker',
                    selectedDate: this.$moment(JSON.parse(JSON.stringify(this.selectedDate))),
                    minDate: this.minDate,
                    mode: 'week',
                    portrait: true,
                    activator: {
                        block: true,
                        showIcon: true,
                        default: true,
                        outline: true,
                    },
                },
            }
            if (this.originalStartDate) {
                result.original = {
                    id: 'original-weekset-date',
                    selectedDate: this.originalStartDate,
                    disabled: true,
                    activator: {
                        block: true,
                        showIcon: true,
                        default: true,
                        outline: true,
                    },
                }
            }
            return result
        },
        isEdit () {
            return this.$route.name && this.$route.name.includes('edit-weekset')
        },
        isNew () {
            return this.$route.name && this.$route.name.includes('create-weekset')
        },
        isCurrentUser () {
            return parseInt(this.weekset.account_id) === parseInt(this.user.accountId)
        },
        isEmployee () {
            return !this.canEditOthersAvailabilities
        },
        isManager () {
            return this.canEditOthersAvailabilities
        },
        minDate () {
            if (this.isEmployee) {
                return this.$moment(this.canYou('planning', 'new_weekset_min_date')).startOf('isoWeek')
            }
            return this.$moment().startOf('isoWeek')
        },
        selectedDate () {
            const dateParams = this.isNew ? this.newWeeksetWeekYear : { week: this.$moment(this.weeksetForm.start_date).isoWeek(), year: this.$moment(this.weeksetForm.start_date).isoWeekYear() }
            const routeDate = this.$moment().fromWeekAndYear(dateParams.week, dateParams.year).startOf('isoWeek')
            if (this.isEmployee) {
                // for employee return first possible week
                const newStartDate = this.isNew ? routeDate : this.originalStartDate
                const isAfter = newStartDate.isAfter(this.minDate, 'day')
                if (isAfter) {
                    // is navigation date is after the minDate, return it
                    return newStartDate.apiFormat()
                } else {
                    // return the min date
                    return this.minDate.apiFormat()
                }
            }
            // managers date
            const weeksetDate = this.$moment(this.weeksetForm.start_date).startOf('isoWeek')
            const managerFirstPossibleDate = weeksetDate.isAfter(this.$moment().startOf('isoWeek'), 'isoWeek') ? weeksetDate.apiFormat() : this.$moment().startOf('isoWeek').apiFormat()
            if (this.weekFinalized) {
                if (routeDate.isAfter(managerFirstPossibleDate, 'isoWeek')) {
                    // for create route we provide also the date in the route params.
                    // If the original availability date is greater than the first possible week
                    // return the navigation date
                    return routeDate.apiFormat()
                } else {
                    // for manager return current week
                    return weeksetDate.isAfter(this.$moment().startOf('isoWeek'), 'isoWeek') ? weeksetDate.apiFormat() : this.$moment().startOf('isoWeek').apiFormat()
                }
            } else {
                return weeksetDate.apiFormat()
            }
        },
        titleUsername () {
            return this.weeksetEmployee.name
        },
        weeksetName () {
            const date = this.localSelectedDate || this.$moment(this.selectedDate)
            return this.$t('sidePanels.availabilityWeeklyDetails.newWeeksetTitle', [date.isoWeek(), date.isoWeekYear()])
        },
        hasApprovedWeeksets () {
            const startDate = this.weekset.start_date
            const found = this.weeksets.filter(element => {
                return element.status === 'approved' && this.$moment(element.start_date).isSame(startDate, 'day')
            })
            return found.length > 0
        },
        selectedDateFormat () {
            return date => {
                return [
                    date.format('dddd, DD MMMM'),
                    `(${this.$t('ui.singles.week')} ${date.format('w YYYY')})`,
                ].join(' ')
            }
        },
    },
    async mounted () {
        if (this.isNew) {
            this.weeksetForm = this.weekset // reactivity is needed in case the weekeset is new
            this.weeksetForm.start_date = this.minDate.apiFormat()
            this.weeksetForm.weekset_name = this.weeksetName
            this.weeksetForm.employee_comment = ''
            this.weeksetForm.manager_comment = ''
        } else {
            if (this.availabilityTimeBlocks) {
                this.originalAvailabilities = JSON.parse(JSON.stringify(this.availabilityTimeBlocks))
            }
            this.originalStartDate = this.$moment(JSON.parse(JSON.stringify(this.weekset.start_date)))
            this.weeksetForm = JSON.parse(JSON.stringify({
                ...this.weekset,
                manager_comment: this.weekset.manager_comment || '',
            })) // no reactivity is needed for this one
            // If the week is finalized and the current weekset date is before the minimum weeksetdate, minimum weekset date is set as selected.
            if (this.weekFinalized && this.originalStartDate.isBefore(this.minDate, 'isoWeek') && this.isEmployee) {
                this.localSelectedDate = this.minDate
                this.setError(this.$t('sidePanels.availabilityWeeklyDetails.weeksetStartDateChanged', [this.originalStartDate.shortDayFormat(), this.minDate.shortDayFormat()]))
            }
        }
        await this.getWeeksets(this.weekset.account_id)
    },
    beforeDestroy () {
        if (this.weeksetChanges.length) {
            this.restoreAllAvailabilities({ availabilities: this.originalAvailabilities, weeksetId: this.editingWeekset.id })
        }
    },
    methods: {
        ...vuex.mapActions('availability', {
            saveExistingWeekset: 'saveExistingWeekset',
            createWeekset: 'createWeekset',
            getWeeksets: 'getWeeksets',
        }),
        ...vuex.mapMutations('availability', {
            restoreAllAvailabilities: 'restoreAllAvailabilities',
            updateEditingWeeksetStartDate: 'updateEditingWeeksetStartDate',
            updateEmployeesWeeksetStatus: 'updateEmployeesWeeksetStatus',
            updateEmployeeWeeksetStartDate: 'updateEmployeeWeeksetStartDate',
        }),
        ...vuex.mapActions('availability', ['getWeeksetByDate']),
        ...vuex.mapMutations({
            SET_SNACKBAR: 'SET_SNACKBAR',
        }),
        async updateWeeksetStartDate (event) {
            this.localSelectedDate = event
            if (this.isEdit) {
                this.weeksetForm.start_date = event
            }
            this.checkingWeekset = true
            await this.getWeeksetOfWeek(event)
            this.updateEditingWeeksetStartDate(event)
            this.checkingWeekset = false
        },

        weeksetSavedSuccessfully (availabilities, status) {
            this.restoreAllAvailabilities({ availabilities, weeksetId: this.editingWeekset.id })
            this.$emit('save', status)
        },
        saveClick () {
            const hasAvailabilities = this.availabilityTimeBlocks.length
            if (!hasAvailabilities) {
                this.confirmSaveEmptyWeekset = true
            } else {
                this.saveWeekset()
            }
        },
        saveApproveClick () {
            // First check if weekset already has an approved set for the same week
            if (this.hasApprovedWeeksets) {
                this.confirmAlreadyApprovedSet = true
            } else {
                // If that is false check for empty weeksets
                const hasAvailabilities = this.availabilityTimeBlocks.length
                if (!hasAvailabilities) {
                    this.confirmSaveApproveEmptyWeekset = true
                } else {
                    this.saveWeekset('approved')
                }
            }
        },
        saveWeekset (status) {
            this.confirmAlreadyApprovedSet = false
            this.confirmSaveApproveEmptyWeekset = false
            this.confirmSaveEmptyWeekset = false
            this.showReject = false
            if (typeof status === 'string' && status === 'approved') {
                this.savingApproving = true
            } else if (typeof status === 'string' && status === 'rejected') {
                this.rejecting = true
            } else {
                this.saving = true
            }
            const message = this.$t('sidePanels.availabilityWeeklyDetails.sections.saved')
            const statusString = typeof status === 'string' && status !== '' ? status : 'pending'
            const payload = {
                weekset_name: this.weeksetName,
                employee_comment: this.weeksetForm.employee_comment,
                manager_comment: this.weeksetForm.manager_comment,
                status: statusString,
            }
            if (status !== 'rejected') {
                payload.start_date = this.$moment(this.editingWeekset.start_date).startOf('isoWeek').apiFormat()
            }
            if (this.availabilityTimeBlocks.length) {
                payload.availabilities = this.availabilityTimeBlocks.map(availability => {
                    return timeBlockHelper.formatAvailabilityForApi(availability)
                })
            } else if (!this.isNew && this.availabilityTimeBlocks.length === 0) {
                payload.availabilities = []
            }
            if (!this.isNew) {
                payload.id = this.weekset.id
            } else {
                payload.account_id = this.$route.params.account_id
            }
            // actual API call
            const api = this.isNew ? 'createWeekset' : 'saveExistingWeekset'
            this[api](payload).then(result => {
                this.SET_SNACKBAR({ message, success: true })
                this.weeksetSavedSuccessfully(result.availabilities, statusString)
                this.updateEmployeesWeeksetStatus({
                    id: result.id,
                    status: result.status,
                    employee_comment: this.weeksetForm.employee_comment,
                    manager_comment: this.weeksetForm.manager_comment,
                })
                if (!this.isNew) {
                    this.updateEmployeeWeeksetStartDate(result)
                }
                this.savingApproving = this.saving = this.rejecting = false
            }).catch(error => {
                this.setError(error.message)
                this.savingApproving = this.saving = this.rejecting = false
            })
        },
        cancel (confirm) {
            if (this.weeksetChanges.length && confirm) {
                this.confirmClose = true
            } else {
                this.confirmClose = false
                this.$emit('cancel')
                this.updateEditingWeeksetStartDate(this.originalStartDate)
                this.restoreAllAvailabilities({ availabilities: this.originalAvailabilities, weeksetId: this.editingWeekset.id })
            }
        },
        async getFinalizedWeek (date) {
            if (this.isNew || this.isEdit) {
                await myScheduleService.getActiveWeeks({
                    week: date.isoWeek(),
                    year: date.isoWeekYear(),
                    accountId: this.isNew ? this.$route.params.account_id : this.availabilityEmployeeId || this.weekset.account_id,
                }).then(data => {
                    this.localWeekFinalized = data.week_finalized
                }).catch(error => {
                    this.setError(error.message)
                })
            }
        },
        async getWeeksetOfWeek (date) {
            const accountId = this.isNew ? this.$route.params.account_id : this.availabilityEmployeeId || this.weekset.account_id
            if (!this.weeksets.length) {
                await this.getWeeksets(accountId)
            }
            const hasPending = this.weeksets.find(element => {
                return element.status === 'pending' && this.$moment(element.start_date).isSame(date, 'day')
            })
            if (hasPending) {
                this.localWeekFinalized = false
                this.existingPendingWeekset = true
            } else {
                this.existingPendingWeekset = false
                await this.getFinalizedWeek(date)
            }
        },
        setError (errorMessage) {
            this.error = errorMessage
            setTimeout(() => {
                this.error = ''
            }, 5000)
        },
    },
}
</script>
<style lang="scss" scoped>
    .loading-form {
        opacity: 0.7;
        pointer-events: none
    }
</style>
