<template>
    <VCard
        v-if="localShift"
        ref="formContainer"
        elevation="0"
        class="shift-popover"
    >
        <ShiftPopoverHeader
            ref="shiftPopoverHeader"
            :lent-in="isLentIn"
            :lent-out="isLentOut"
            :shift="localShift"
            :selected-employee="selectedEmployee"
            :read-only="readOnly"
            :saving="saving"
            @cancel="cancel"
        />
        <VCardText
            v-if="!localShift.readOnly && !readOnly && !weekIsClosed"
            ref="formContent"
            class="py-0"
        >
            <EmploymentInfo
                v-if="isStandard"
                :employee="employee"
            />
            <Chip
                v-if="savingError"
                error
                outline
                :text="savingError"
            />
            <div
                v-if="showMainRadioButtons"
                class="form-field pb-3"
            >
                <PmtRadioGroup
                    ref="shiftType"
                    v-model="shiftType"
                    name="shift-type"
                    inline
                    outline
                    :options="eventTypeRadioOptions"
                    :init-value="shiftType"
                    :disabled="saving"
                />
            </div>
            <template v-if="shiftType === 'productive' && employee">
                <ProductiveShift
                    ref="productiveShift"
                    :shift="localShift"
                    :original-shift="original"
                    :is-new-from-grid="isNewFromGrid"
                    :is-new-from-topbar="isNewFromTopbar"
                    :selected-employee="selectedEmployee"
                    :selected-department="selectedDepartment"
                    :selected-store="selectedStore"
                    :over-the-night="overTheNight"
                    :has-wab-warning="hasWabWarning"
                    :from-top-bar="fromTopBar"
                    :employee="employee"
                    :saving="saving"
                    :has-expanded-availability="hasExpandedAvailability"
                    @update="update($event)"
                    @update-indirect-hours="updateIndirectHours($event)"
                    @update-department="updateDepartment($event)"
                    @update-employee="updateEmployee($event)"
                    @update-store="updateStore($event)"
                    @update-remark="updateRemark($event)"
                    @cancel="cancel"
                    @enter="checkRestrictionsAndSave()"
                    @toggle:availability="$emit('toggle:availability')"
                    @break-blur="updateBreak($event)"
                    @another-employee="showEmployeesSelector = true"
                />
            </template>
            <template v-else-if="employee">
                <div
                    v-if="isNew && isNewFromGrid && !isDayView && CAN_ADD_NON_PRODUCTIVES_WITH_TIMES"
                    class="form-field pb-3"
                >
                    <!-- Show only when creating from topbar -->
                    <PmtRadioGroup
                        ref="nonProductiveShiftType"
                        v-model="nonProductiveType"
                        name="non-productive-shift-type"
                        inline
                        :options="nonProductiveTypeRadioOptions"
                        :init-value="nonProductiveType"
                        @input="selectShiftType($event)"
                    />
                </div>
                <ProductiveShift
                    ref="nonProductiveShift"
                    :shift="localShift"
                    :original-shift="original"
                    :is-new-from-grid="isNewFromGrid"
                    :is-new-from-topbar="isNewFromTopbar"
                    :selected-employee="selectedEmployee"
                    :selected-bookable-hour-type="selectedBookableHourType"
                    :selected-bookable-hour-foreign-type="selectedBookableHourForeignType"
                    :over-the-night="overTheNight"
                    is-non-productive
                    :non-productive-type="nonProductiveType"
                    :from-top-bar="fromTopBar"
                    :employee="employee"
                    :saving="saving"
                    @update="update($event)"
                    @update-employee="updateEmployee($event)"
                    @update-bookable-hour-type="updateBookableHourType($event)"
                    @update-bookable-hour-foreign-type="updateBookableHourForeignType($event)"
                    @cancel="cancel"
                    @enter="checkRestrictionsAndSave()"
                    @another-employee="showEmployeesSelector = true"
                />
            </template>
            <ShiftPopoverModifiedBy :shift="localShift" />
        </VCardText>
        <VCardText
            v-else
            class="pl-5"
        >
            <ReadOnlyShiftDetails
                ref="readOnlyDetails"
                :selected-department="selectedDepartment"
                :selected-store="selectedStore"
                :show-duration="localShift.nonProductive"
                :shift="localShift"
                :bookable-hour="bookableHourTypes[original.type]"
                :bookable-hour-foreign-type="bookableHourForeignTypes[original.foreign_type]"
            />
        </VCardText>
        <VCardActions
            v-if="!localShift.readOnly && !readOnly && !weekIsClosed"
            ref="formActions"
            class="actions"
        >
            <div class="actions-content">
                <PmtButton
                    ref="cancelBtn"
                    default
                    outline
                    tab-index="0"
                    :disabled="saving"
                    cy_id="cancel-shift-btn"
                    @click="cancel"
                >
                    {{ $t("ui.singles.cancel") }}
                </PmtButton>
                <PmtButton
                    ref="saveBtn"
                    primary
                    tab-index="0"
                    :loading="saving"
                    :disabled="!canSave"
                    cy_id="save-shift-btn"
                    @click="checkRestrictionsAndSave()"
                >
                    {{ $t("ui.singles.save") }}
                </PmtButton>
            </div>
            <ShiftConfirmationPopover
                v-if="shiftConfirmation"
                :show="shiftConfirmation"
                :text="confirmationText"
                :disable-override-confirm="!CAN_MANAGE_SUBSTITUTE_REQUESTS"
                @confirm="save({ rejectSubstitute: true }); closePopup()"
                @hide="cancel"
                @cancel="cancel"
            />
        </VCardActions>
        <AllEmployeesSelector
            only-select
            :employee="employee"
            :shift="showEmployeesSelector ? localShift : null"
            @select-employee="showEmployeesSelector = false; $refs.productiveShift.employeeSelected($event.newEmployee)"
            @close="showEmployeesSelector = false"
        />
    </VCard>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import schedulingHelper from '@/libraries/schedulingHelper'
import PlanningEmployee from '@/libraries/planningEmployee'
import PlanningShift from '@/libraries/planningShift'
import ProductiveShift from '@/pages/planning/scheduling/components/popovers/ProductiveShift.vue'
import ReadOnlyShiftDetails from '@/pages/planning/scheduling/components/ReadOnlyShiftDetails.vue'
import ShiftPopoverHeader from '@/pages/planning/scheduling/components/popovers/ShiftPopoverHeader'
import ShiftPopoverModifiedBy from '@/pages/planning/scheduling/components/popovers/ShiftPopoverModifiedBy'
export default {
    name: 'ShiftPopover',
    components: {
        ProductiveShift,
        ReadOnlyShiftDetails,
        ShiftPopoverHeader,
        ShiftPopoverModifiedBy,
        AllEmployeesSelector: () => import('@/pages/planning/scheduling/components/AllEmployeesSelector'),
        ShiftConfirmationPopover: () => import('@/pages/planning/scheduling/components/popovers/ShiftConfirmationPopover'),
        EmploymentInfo: () => import('@/pages/planning/scheduling/components/EmploymentInfo'),
    },
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            required: true,
        },
        employee: {
            type: PlanningEmployee,
            required: true,
        },
        /** Indicates if the non-productive tab is selected by default */
        addsIndirectTask: {
            type: Boolean,
            default: false,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
        fromTopBar: {
            type: Boolean,
            default: false,
        },
        hasExpandedAvailability: Boolean,
        isNewFromTopbar: Boolean,
    },
    data () {
        return {
            shiftType: 'productive',
            nonProductiveType: 'start-end-times',
            error: '',
            overlappingFrom: false,
            overlappingTo: false,
            original: {},
            selectedEmployee: {},
            selectedBookableHourType: {},
            selectedBookableHourForeignType: {},
            selectedDepartment: {},
            selectedStore: {},
            shiftConfirmation: false,
            isNewFromGrid: false,
            originalIndirectHours: [],
            savingError: '',
            hasWabWarning: false,
            localShift: null,
            showEmployeesSelector: false,
        }
    },
    computed: {
        indirectHours () {
            if (this.employee.notAssigned) return []
            return this.localShift.indirect_hours.filter(h => !h.toDelete)
        },
        overTheNight () {
            const shiftsIsOvernight = this.localShift && this.$moment(this.localShift.end_datetime).isAfter(this.$moment(this.localShift.start_datetime), 'day')
            return shiftsIsOvernight && this.CAN_ADD_OVERNIGHT_SHIFTS
        },
        isNew () {
            return this.localShift?.isNew
        },
        isLentIn () {
            return this.localShift?.store_id !== this.currentStore.id
        },
        isLentOut () {
            return this.localShift?.exchange_store_id && this.localShift?.store_id === this.currentStore.id
        },
        confirmationText () {
            if (this.shiftPendingSubstituteRequest(this.localShift)) {
                return this.$t('pages.scheduling.substituteRequests.overrideExisting')
            }
            // add other confirmation messages and rules here
            return ''
        },
        /**
         * Options list for main form radio "tabular" structure
         * @return {Array}
         */
        eventTypeRadioOptions () {
            return [
                {
                    label: this.baseTranslate('shiftPopover.productiveHours'),
                    value: 'productive',
                },
                {
                    label: this.baseTranslate('shiftPopover.nonProductiveHours'),
                    value: 'non-productive',
                },
            ]
        },
        /**
         * Options list for non-productive form radio
         * @return {Array}
         */
        nonProductiveTypeRadioOptions () {
            return [
                {
                    label: this.baseTranslate('shiftPopover.startEndTimes'),
                    value: 'start-end-times',
                },
                {
                    label: this.baseTranslate('shiftPopover.duration'),
                    value: 'duration',
                },
            ]
        },
        showMainRadioButtons () {
            const hasIndirectHours = this.indirectHours.length
            const isDuration = this.CAN_ADD_NON_PRODUCTIVES_WITH_TIMES && this.nonProductiveType === 'duration'
            const showMainRadioInForm = this.CAN_ADD_NON_PRODUCTIVES_WITH_TIMES || !this.isNewFromGrid || (this.isNewFromGrid && !this.isDayView)
            return !hasIndirectHours && this.CAN_EDIT_NON_PRODUCTIVE && !this.isLentOut && this.isNew && showMainRadioInForm && !isDuration && !this.localShift.notAssigned
        },
        hasOverlaps () {
            if (this.localShift.nonProductive) return false
            return this.shiftOverlaps(this.localShift).before || this.shiftOverlaps(this.localShift).after
        },
        hasShiftChanges () {
            const hasChanges = this.isShiftModified(this.shiftModifiedPayload)
            return hasChanges
        },
        validIndirectHours () {
            if (!this.originalIndirectHours.length && !this.localShift.indirect_hours.length) return false
            const exceedShiftHours = this.indirectHoursExceedShift(this.employee, this.localShift)
            const countChanges = this.hasIndirectHoursCountChanges(this.localShift, this.originalIndirectHours)
            const contentChanges = this.hasIndirectHoursChanges(this.localShift, this.originalIndirectHours)
            return !exceedShiftHours && (countChanges || contentChanges)
        },
        canSave () {
            if (this.validIndirectHours) {
                return !this.hasOverlaps
            }
            return this.hasShiftChanges && !this.indirectHoursExceedShift(this.employee, this.localShift) && !this.hasOverlaps
        },
        shiftModifiedPayload () {
            return {
                shift: this.localShift,
                backupShift: this.original,
                selectedEmployee: this.selectedEmployee,
                selectedDepartment: this.selectedDepartment,
                selectedStore: this.selectedStore,
                isNewFromGrid: this.isNewFromGrid,
            }
        },
        /**
         * Checks if current shift is saving (API calls are made for it)
         */
        saving () {
            if (!this.savingShiftId) return false
            return this.savingShiftId === this.localShift.guid
        },
    },
    watch: {
        shiftType: {
            handler (newVal) {
                this.localShift.nonProductive = newVal === 'non-productive'
                if (this.isNew) {
                    const from = this.$moment(this.localShift.start_datetime)
                    const to = this.$moment(this.localShift.end_datetime)
                    const suggestedBreaks = !this.localShift.nonProductive ? [this.BREAK_SUGGESTION(from, to, this.selectedEmployee.age)] : [{ duration: '00:00' }]
                    const { breaks, duration } = schedulingHelper.updateShiftBreaksAndDuration(this.localShift, suggestedBreaks)
                    this.localShift.breaks = breaks
                    this.localShift.duration = duration
                    this.update(this.localShift)
                } else {
                    this.update(this.localShift)
                }
            },
        },
        nonProductiveType: {
            handler (newVal) {
                if (this.isNew) {
                    const { duration } = schedulingHelper.updateShiftBreaksAndDuration(this.localShift, [])
                    this.update({
                        ...this.localShift,
                        duration,
                    })
                }
            },
        },
    },
    created () {
        this.localShift = { ...this.shift }
        this.original = new PlanningShift({ ...this.shift })
    },
    async mounted () {
        if (this.localShift.nonProductive) {
            this.shiftType = 'non-productive'
            this.nonProductiveType = 'duration'
            this.selectedBookableHourType = this.bookableHourTypes[this.localShift.type] || {}
            this.selectedBookableHourForeignType = this.bookableHourForeignTypes[this.localShift.foreign_type] || {}
        }
        // event was created from the grid actions and not topbar
        this.isNewFromGrid = true
        // if we do have an event prop passed in, then we update local data props based on the selected event
        if (!this.employee.notAssigned) {
            this.selectedEmployee = this.employee
        }
        this.setSelectedStoreAndDepartment()
        this.setInitialBreak()
        if (!this.isStandard) {
            this.originalIndirectHours = JSON.parse(JSON.stringify(this.indirectHours))
        }
        this.setWabWarning()
        if (this.CAN_ADD_NON_PRODUCTIVES_WITH_TIMES) {
            this.nonProductiveType = 'start-end-times'
        } else {
            this.nonProductiveType = 'duration'
        }
    },
    beforeDestroy () {
        this.cancel()
    },
    methods: {
        selectShiftType (shiftType) {
            if (shiftType === 'start-end-times' && this.selectedBookableHourType.type === 'F') {
                // reset selected bookable hour type when F in non productive with start time
                // this is not allowed
                this.selectedBookableHourType = {}
                this.selectedBookableHourForeignType = {}
            }
        },
        setWabWarning () {
            this.hasWabWarning = this.employeeTimesHaveWabWarning(this.employee, {
                from: this.localShift.start_datetime,
                to: this.localShift.end_datetime,
            })
            this.HIDE_SNACKBAR()
        },
        /**
         * Updates the local selected department and shift vuex data
         * @emits update-department
         * @param event: Shift
         */
        updateDepartment (event) {
            this.selectedDepartment = event
            this.update({
                ...this.localShift,
                department_id: this.selectedDepartment.department_id,
            })
        },
        /**
         * Updates local selected store and shift vuex data
         * @emits update-store
         * @param event: Shift
         */
        updateStore (event) {
            const changes = {}
            this.localShift.lentOut = !!event.store_name
            this.localShift.exchange_store_id = event.store_id
            this.localShift.type = !event.store_name ? this.shiftTypes.NORMAL : this.shiftTypes.EXCHANGE
            this.selectedStore = event.store_name ? event : this.shiftStore(this.localShift)
            if (event.store_name) {
                this.localShift.department_id = this.original.department_id
            }
            this.setSelectedStoreAndDepartment()
            this.update({
                ...this.localShift,
                ...changes,
            })
        },
        /**
         * Updates local selected employee and shift vuex data
         * @emits update-employee
         * @param event: Object
         */
        updateEmployee (event) {
            this.selectedEmployee = event
            this.$emit('update-employee', event)
            this.update({
                ...this.localShift,
                account_id: this.selectedEmployee.account_id,
            })
        },
        /**
         * Updates local selected bookable hour type and shift vuex data
         * @emits update-bookable-hour-type
         * @param event: Object
         */
        updateBookableHourType (event) {
            this.selectedBookableHourType = event
            this.$emit('update-bookable-hour-type', event)
            const foreigType = this.selectedBookableHourType.foreign_options.find(t => t.is_default)?.foreign_type || event.foreign_options[0]?.foreign_type || ''
            this.localShift.type = event.type
            this.localShift.foreig_type = foreigType
            this.update(this.localShift)
        },
        /**
         * Updates local selected bookable hour foreign type and shift vuex data
         * @emits update-bookable-hour-foreign-type
         * @param event: Object
         */
        updateBookableHourForeignType (event) {
            this.selectedBookableHourForeignType = event
            this.$emit('update-bookable-hour-foreign-type', event)
            this.localShift.foreig_type = event.foreig_type
            this.update(this.localShift)
        },
        updateRemark (event) {
            this.update({
                ...this.localShift,
                remark: event,
            })
        },
        updateIndirectHours (shift) {
            this.localShift.indirect_hours = shift.indirect_hours.filter(s => !s.toDelete)
            this.updateShiftObject(this.localShift)
        },
        /**
         * Closes the form
         * @emits close
         */
        closePopup () {
            this.$emit('close', this.localShift)
        },
        /**
         * Called when the form data is changed
         * @emits update
         * @param shift: Shift
         */
        async update (shift) {
            shift.overlaps = this.setShiftOverlaps(shift)
            this.updateShiftObject(shift)
            this.setWabWarning()
        },
        async updateBreak (breakDuration) {
            this.localShift.breaks = [{ duration: breakDuration }]
            const { duration } = schedulingHelper.updateShiftBreaksAndDuration(this.localShift, this.localShift.breaks)
            this.localShift.duration = duration
            this.$emit('break-blur', { breakDuration, duration })
        },
        /**
         * This resets the modified shift to the original when shift is not new
         * @emits update
         */
        async resetToOriginal () {
            if (!this.isNew) {
                this.updateShiftObject(this.original)
            }
        },
        updateShiftObject (shift) {
            if (!shift) return
            if (!this.isStandard) {
                shift.instances.forEach(instance => {
                    if (instance.shift_id === shift.shift_id) {
                        instance.start_datetime = shift.start_datetime
                        instance.end_datetime = shift.end_datetime
                        instance.duration = shift.duration
                        instance.breaks = shift.breaks
                    }
                })
            }
            this.localShift = shift
            this.employee.updateShift(shift)
            this.$emit('update', shift)
        },
        /**
         * This cancels the changes:
         * - resets to original
         * - removes invalid indirect hours
         * - removes the added shift when new
         * - closes the form
         * - emits cancel
         * @emits cancel
         */
        cancel () {
            if (this.localShift.readOnly || this.weekIsClosed) {
                this.$emit('cancel', this.localShift)
                this.closePopup()
                return
            }
            if (!this.saving) {
                const noBookableHourSelected = Boolean(this.localShift.nonProductive && ~Object.keys(this.selectedBookableHourType).length)
                if (this.isShiftModified(this.shiftModifiedPayload) || noBookableHourSelected) {
                    this.resetToOriginal()
                }
                this.employee.removeNewShift(this.isStandard)
                this.resetHours()
            }
            this.$emit('cancel', this.localShift)
            this.closePopup()
        },

        resetHours () {
            if (this.isStandard) return
            this.localShift.indirect_hours = this.originalIndirectHours
            this.employee.updateShift(this.localShift)
            this.$emit('update', this.localShift)
        },

        /**
         * Checks restrictions before saving and saves
         * - checks for substitute requests
         * - saves the shift info
         * - saves the indirect tasks added
         */
        async checkRestrictionsAndSave () {
            if (!this.canSave) return
            if (this.shiftPendingSubstituteRequest(this.localShift)) {
                this.shiftConfirmation = true
            } else {
                if (this.hasShiftChanges && !this.indirectHoursExceedShift(this.employee, this.localShift)) {
                    this.save()
                } else if (this.validIndirectHours) {
                    this.saveIndirectHours()
                }
                this.closePopup()
            }
            return true
        },
        /**
         * Called when save button is clicked
         * @emits save
         * @returns Boolean
         */
        async save ({ rejectSubstitute = false } = {}) {
            if (this.employee.notAssigned && this.selectedEmployee.account_id) {
                this.employee.removeShift(this.localShift)
                this.selectedEmployee.addShift(this.localShift)
            }
            const result = await this.saveFromForm({
                shift: this.localShift,
                backupShift: this.original,
                employee: this.employee,
                newEmployee: this.selectedEmployee,
                rejectSubstitute,
                originalIndirectHours: this.originalIndirectHours,
            }, this.isNewFromTopbar)
            if (result.error) {
                if (this.employee.notAssigned && this.selectedEmployee.account_id) {
                    this.selectedEmployee.removeShift(this.localShift)
                    this.employee.removeShift(this.localShift)
                }
            } else {
                if (this.employee.notAssigned && this.selectedEmployee.account_id) {
                    this.selectedEmployee.updateShift(result)
                } else {
                    if (!this.isNewFromTopbar) {
                        this.employee.removeShift(this.localShift)
                        this.employee.addShift(result)
                    }
                }
            }
        },

        async saveIndirectHours () {
            this.saveAllIndirectHours({
                shift: this.localShift,
                employee: this.employee,
                originalIndirectHours: this.originalIndirectHours,
            })
        },

        async setSelectedStoreAndDepartment () {
            const set = async (store) => {
                const currentStoreNumber = this.currentStore.storeNumber ? this.currentStore.storeNumber.toString() : ''
                this.selectedStore = store || {
                    ...this.currentStore,
                    store_name: this.currentStore.name,
                    retail_store_number: currentStoreNumber,
                }
                const eventDepartments = this.isLentOut ? this.selectedStore.departments || [] : this.departments
                this.selectedDepartment = eventDepartments.find(d => d.department_id === this.localShift.department_id) || schedulingHelper.unknownDepartment()
            }
            if (this.isStandard) {
                let checkStoreGroupsDate = this.$moment(this.localShift.start_datetime)
                if (checkStoreGroupsDate.isBefore(this.$moment(), 'week')) {
                    checkStoreGroupsDate = this.$moment()
                }
                const existingStores = this.EXCHANGE_STORES(checkStoreGroupsDate)
                if (!existingStores.length) {
                    const result = await this.getStoreGroups(checkStoreGroupsDate)
                    const store = result.exchangeStores.find(s => s.store_id === (this.localShift.exchange_store_id || this.localShift.store_id))
                    set(store)
                } else {
                    const store = existingStores.find(s => s.store_id === (this.localShift.exchange_store_id || this.localShift.store_id))
                    await set(store)
                }
            } else {
                const store = this.shiftStore(this.localShift)
                if (store) {
                    await set(store)
                } else {
                    await set({
                        departments: this.currentEmployeeDepartments,
                        retail_store_number: this.currentStore.storeNumber,
                        store_group: {},
                        store_id: this.currentStore.id,
                        store_name: this.currentStore.name,
                        store_slug: this.currentStore.slug,
                    })
                }
            }
        },

        setInitialBreak () {
            if (this.localShift.isNew && (!this.localShift.breaks || !this.localShift.breaks.length || (this.localShift.breaks.length && this.localShift.breaks[0].duration === '00:00'))) {
                const from = this.$moment(this.localShift.start_datetime)
                const to = this.$moment(this.localShift.end_datetime)
                const newBreakSuggestion = [this.BREAK_SUGGESTION(from, to, this.employee.age) || this.localShift.breaks[0]]
                this.original.breaks = [...newBreakSuggestion]
                const { breaks, duration } = schedulingHelper.updateShiftBreaksAndDuration(this.localShift, newBreakSuggestion)
                this.update({
                    ...this.localShift,
                    breaks,
                    duration,
                })
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import './styling/scheduling-grid-form.scss';
</style>
