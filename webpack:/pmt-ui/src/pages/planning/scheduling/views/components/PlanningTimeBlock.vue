<template>
    <button
        v-if="localShift"
        :id="`shift_${localShift.shift_id}`"
        :key="updated"
        ref="planningTimeBlock"
        :active="showMenu"
        :class="localShiftClass"
        :style="localShiftStyle"
        :data-account-id="localShift.account_id"
        :data-shift-guid="localShift.guid"
        :data-shift-id="localShift.shift_id"
        :data-start-date-time="localShift.start_datetime"
        :data-end-date-time="localShift.end_datetime"
        :data-non-productive="localShift.nonProductive"
        :data-department-id="localShift.department_id"
        :data-group-department-id="groupDepartmentId"
        tabindex="-1"
        @contextmenu="onContextMenu"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @dblclick="setActive"
        @keyup.enter="setActive"
        @mousedown="onTimeblockClick"
    >
        <div
            v-if="COPIED_SHIFT ? COPIED_SHIFT.guid === localShift.guid : false"
            class="animated-border"
        />
        <div
            v-if="isDragging"
            class="drag-label"
        >
            <span>{{ selectedGridAccount().name }}</span>
            <template v-if="!isDayView">
                <TransferRight :size="12" />
                <span>{{ dragToDay?.format(isStandard ? 'dddd' : 'dddd, DD MMM') }}</span>
            </template>
        </div>
        <div class="shift-container">
            <ShiftLeftSide
                v-if="!localShift.nonProductive"
                :shift="localShift"
            />
            <div class="shift-content">
                <VProgressLinear
                    v-if="isSaving"
                    ref="loadingIndicator"
                    :active="isSaving"
                    :indeterminate="isSaving"
                    absolute
                    top
                    height="2"
                    style="background-color: white;"
                />
                <div class="top-content">
                    <template v-if="showInlineEditElements && !isStandard">
                        <ShiftDepartmentSelector
                            v-if="!localShift.nonProductive"
                            ref="departmentField"
                            :selected-department="selectedDepartment"
                            :selected-store="shiftStore(localShift)"
                            :shift="localShift"
                            :disabled="isSaving"
                            hide-label
                            @item-selected="departmentSelected"
                        >
                            <template #activator="{ on, value }">
                                <div
                                    class="department-selector"
                                    :class="{active: value}"
                                    v-on="on"
                                >
                                    <span>{{ selectedDepartment.department_shortname }}</span>
                                    <component
                                        :is="value ? 'chevron-up' : 'chevron-down'"
                                        :size="13"
                                    />
                                </div>
                            </template>
                        </ShiftDepartmentSelector>
                        <ShiftBookableHourTypeSelector
                            v-else
                            ref="bookableHourField"
                            :selected-bookable-hour-type="bookableHourTypes[localShift.type]"
                            :shift="localShift"
                            :disabled="isSaving"
                            hide-label
                            :show-clear="false"
                            class="d-inline-block"
                            @item-selected="hourTypeSelected"
                        >
                            <template #activator="{ on, value }">
                                <div
                                    class="department-selector"
                                    :class="{active: value}"
                                    v-on="on"
                                >
                                    <span>{{ hourTypeLabel }}</span>
                                    <component
                                        :is="value ? 'chevron-up' : 'chevron-down'"
                                        :size="13"
                                    />
                                </div>
                            </template>
                        </ShiftBookableHourTypeSelector>
                    </template>
                    <template v-else>
                        <div
                            v-if="!localShift.nonProductive"
                            ref="departmentPlaceholder"
                            class="department-select-shadow"
                        >
                            <div class="time-block-label">
                                {{ shiftDepartment(localShift).department_shortname }}
                            </div>
                            <ChevronDown
                                v-if="!localShift.readOnly && !readOnly && !isStandard"
                                :size="13"
                            />
                        </div>
                        <div
                            v-else
                            ref="bookableHourPlaceholder"
                            class="hour-type-select-shadow"
                        >
                            <div class="time-block-label">
                                {{ hourTypeLabel }}
                            </div>
                            <ChevronDown
                                v-if="!localShift.readOnly && !readOnly"
                                :size="13"
                            />
                        </div>
                    </template>
                    <ShiftIcons
                        ref="shiftIcons"
                        :employee="employee"
                        :shift="localShift"
                        :outside-departments-filter="shiftIsOutsideDepartmentsFilter(localShift)"
                        :read-only="readOnly"
                        class="icons"
                    />
                </div>
                <div
                    v-if="showInlineEditElements"
                    class="bottom-content"
                >
                    <ShiftFormInputs
                        ref="formInputs"
                        :key="updated"
                        :shift="localShift"
                        :employee="employee"
                        :saving="isSaving"
                        :backup-shift="backupShift"
                        :for-block="true"
                        :has-menu="showMenu"
                        :disabled="readOnly || localShift.readOnly || localShift.lentIn"
                        @block-update="blockUpdate"
                        @update="softUpdate"
                        @cancel="cancel()"
                    />
                </div>
                <div
                    v-else
                    class="bottom-content"
                >
                    <template v-if="!localShift.nonProductive">
                        <div class="shadow-input">
                            {{ initialTimes.from }}
                        </div>
                        <div>-</div>
                        <div class="shadow-input">
                            {{ initialTimes.to }}
                        </div>
                        <template v-if="initialTimes.break">
                            <div>|</div>
                            <div class="shadow-input">
                                {{ initialTimes.break }}
                            </div>
                        </template>
                    </template>
                    <template v-else>
                        <div class="shadow-input non-productive">
                            {{ localShift.duration }}
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <PlanningTimeblockModals
            :shift="localShift"
            :employee="employee"
            :show-menu="showMenu"
            :show-availability="showAvailability"
            :shift-confirmation="shiftConfirmation"
            :hovered="hovered"
            :show-context-menu="showContextMenu"
            :show-assess-substitute-requests="showAssessSubstituteRequests"
            :show-swap-employee-menu="showSwapEmployeeMenu"
            @update="softUpdate"
            @toggle:shift-form="showMenu = $event"
            @toggle:availability="$emit('toggle:availability', employee)"
            @toggle:context-menu="showContextMenu = $event"
            @toggle:context-menu-edit="contextMenuEdit($event)"
            @toggle:assess-substitute-requests="showAssessSubstituteRequests = $event; showContextMenu = null"
            @toggle:swap-employee-menu="showSwapEmployeeMenu = $event"
            @confirm-overwrite="confirmOverwrite({ rejectSubstitute: true })"
            @cancel-overwrite="cancelOverwrite()"
            @break-blur="breakBlur($event)"
        />
    </button>
</template>

<script>
import schedulingHelper from '@/libraries/schedulingHelper'
import htmlHelper from '@/libraries/htmlHelper'
import ShiftIcons from '@/pages/planning/scheduling/components/ShiftIcons.vue'
import ShiftFormInputs from '@/pages/planning/scheduling/components/popovers/ShiftFormInputs.vue'
import ShiftLeftSide from '@/pages/planning/scheduling/components/ShiftLeftSide.vue'
import ShiftDepartmentSelector from '@/pages/planning/scheduling/components/popovers/ShiftDepartmentSelector.vue'
import ShiftBookableHourTypeSelector from '@/pages/planning/scheduling/components/popovers/ShiftBookableHourTypeSelector.vue'
import PlanningTimeBlockInteract from '@/pages/planning/scheduling/views/components/PlanningTimeBlockInteract'
import PlanningTimeblockModals from '@/pages/planning/scheduling/views/components/PlanningTimeblockModals'
export default {
    name: 'PlanningTimeBlock',
    components: {
        ShiftIcons,
        ShiftFormInputs,
        ShiftLeftSide,
        ShiftDepartmentSelector,
        ShiftBookableHourTypeSelector,
        PlanningTimeblockModals,
    },
    mixins: [PlanningTimeBlockInteract],
    props: {
        isActive: Boolean,
        isRowSelected: Boolean,
        shift: {
            type: Object,
            required: true,
        },
        employee: {
            type: Object,
            required: true,
        },
        timeBoxWidth: {
            type: Number,
            default: 50,
        },
        timeIntervalStep: {
            type: Number,
            default: 60,
        },
        groupDepartmentId: {
            type: Number,
            default: null,
        },
        isSaving: Boolean,
        readOnly: Boolean,
        showAvailability: Boolean,
        hasContextMenu: Boolean,
    },
    data () {
        return {
            localStyle: {},
            updated: 0,
            hovered: false,
            backupShift: null,
            initialTimes: {},
            shiftConfirmation: {
                show: false,
                event: undefined, // mouse event copy used to confirm drag and resize actions in certain scenarios (like substitute requests)
                text: '',
            },
            saved: false,
            localShift: null,
            dragToDay: null,
            showMenu: false,
            showContextMenu: null,
            showSwapEmployeeMenu: false,
            showAssessSubstituteRequests: false,
        }
    },
    computed: {
        showInlineEditElements () {
            if (this.isDragging || this.isResizing) return false
            if (this.employee.notAssigned) return true
            if (this.showMenu) return false
            if (this.localShift.readOnly || this.readOnly) return false
            if (this.localShift.lentIn) return false
            return this.isRowSelected || this.hovered
        },
        shiftPopoverWidth () {
            if (this.localShift.readOnly) return 345
            if (this.localShift.nonProductive) {
                if (this.localShift.isNew) {
                    return 370
                }
                return 300
            }
            return 435
        },
        selectedDepartment () {
            const depFilter = (d) => {
                return d.department_id === this.localShift.department_id
            }
            const unknown = () => {
                return schedulingHelper.unknownDepartment()
            }
            if (this.localShift.exchange_store_id) {
                const store = this.shiftExchangeStore(this.localShift)
                return (store.departments || []).find(depFilter) || unknown()
            }
            return this.departments.find(depFilter) || unknown()
        },
        hourTypeLabel () {
            if (this.localShift.type === 'G') return '...'
            return this.bookableHourTypes[this.localShift.type]?.[this.isDayView ? 'type' : 'local_description']
        },

        localShiftStyle () {
            if (!this.isDayView) return this.localShift.style
            const dayViewNonProductive = this.isDayView && this.localShift.nonProductive
            const result = {
                ...this.localShift.style,
                position: 'absolute',
                top: '6px',
                zIndex: 3,
                '--shift-height': '45px',
            }
            if (dayViewNonProductive || this.localShift.notAssigned) {
                result.position = 'relative'
            }
            if (this.localShift.notAssigned) {
                result.top = 0
            } else if (dayViewNonProductive) {
                result.top = '2px'
                result['--shift-width'] = '100%'
                result['--shift-height'] = '36px'
            }
            return result
        },
        localShiftClass () {
            const outsideFilters = this.shiftIsOutsideDepartmentsFilter(this.localShift) || this.shiftOutsideDepartmentGroup(this.localShift, this.groupDepartmentId)
            return {
                'planning-shift': true,
                active: this.showMenu,
                'day-shift': this.isDayView,
                exchange: this.localShift.exchange_store_id || this.localShift.lentIn,
                'not-assigned': this.localShift.notAssigned,
                'non-productive': !this.isStandard && this.localShift.nonProductive,
                'non-productive-simple': this.localShift.nonProductiveSimple,
                'new-shift': this.localShift.isNew,
                'read-only': this.readOnly || this.localShift.readOnly,
                'has-overlaps': this.localShift.overlaps?.distinctOverlapsCount > 0,
                'outside-department-filter': outsideFilters,
                'lent-in': this.localShift.lentIn,
                saving: this.isSaving,
                blocking: Boolean(this.hasBlockingNotifications()),
            }
        },
        savePayload () {
            return {
                shift: this.localShift,
                backupShift: this.backupShift,
                employee: this.employee,
            }
        },
    },
    watch: {
        isSaving (newVal, oldVal) {
            if (oldVal && !newVal) {
                this.updated++
                this.resetBlockCoordinates()
                this.setInitialTimes()
            }
        },
        shift: {
            handler (newVal) {
                if (this.showMenu) return
                const differentId = newVal.shift_id !== this.localShift.shift_id
                const differentReadOnly = newVal.readOnly !== this.localShift.readOnly
                const differentStartTime = newVal.start_datetime !== this.localShift.start_datetime
                const differentEndTime = newVal.end_datetime !== this.localShift.end_datetime
                if (differentId || differentReadOnly || (!this.showMenu && (differentStartTime || differentEndTime))) {
                    this.localShift = newVal
                    this.backupShift = { ...this.localShift }
                    this.updated++
                }
                this.resetBlockCoordinates()
                this.setInitialTimes()
            },
            deep: true,
        },
        SELECTED_DATE: {
            handler () {
                this.resetBlockCoordinates()
                this.setInitialTimes()
            },
        },
        isDayView () {
            this.resetBlockCoordinates()
            this.setInitialTimes()
            this.resetInteractable()
        },
        async timeBoxWidth (val) {
            if (!this.isDayView) {
                setTimeout(() => {
                    this.resetInteractable()
                }, 350)
                return
            }
            this.resetBlockCoordinates(val)
        },
        'layoutScroll.top': {
            handler (newVal, oldVal) {
                if (Math.abs(newVal - oldVal) > 50) {
                    this.showMenu = false
                    this.hovered = null
                }
            },
        },
        hasContextMenu: {
            handler (newVal, oldVal) {
                if (!newVal && oldVal) {
                    this.showContextMenu = null
                }
            },
        },
    },
    created () {
        this.localShift = { ...this.shift }
        this.backupShift = { ...this.localShift }
        this.setInitialTimes()
    },
    mounted () {
        this.setActiveIfNew()
        this.resetBlockCoordinates()
        if (this.shift.fromKeyboard) {
            const shiftFromInput = this.$el.querySelector(`#shift-${this.employee.account_id}-block--time-from-input`)
            if (shiftFromInput) {
                shiftFromInput.focus()
            }
        }
    },
    methods: {
        variableToHexcode (variable) {
            return getComputedStyle(document.body).getPropertyValue(variable).trim()
        },

        async shiftColor () {
            const grey = this.variableToHexcode('--grey-80')
            if (this.localShift.lentIn || this.localShift.exchange_store_id || this.localShift.nonProductive) return grey
            const department = this.departmentById(this.localShift.department_id)
            return department?.color || this.department?.department_color || grey
        },

        async transparent (color, amount) {
            return this.$helpers.transparentize(color, amount)
        },

        async resetBlockCoordinates (val = this.timeBoxWidth) {
            await this.$nextTick()
            const color = await this.shiftColor()
            const contrastColor = this.$helpers.getContrastColorFromHex(color, this.variableToHexcode('--grey-140'))
            const nonProductiveBackground = await this.transparent(this.variableToHexcode('--grey-100'), 10)
            if (this.isDayView && !this.localShift.nonProductive) {
                const from = this.$moment(this.localShift.start_datetime)
                const to = this.$moment(this.localShift.end_datetime)
                const left = this.timeBlockLeftPosition({ from, timeBoxWidth: val })
                const width = this.timeBlockWidth({ from, to, timeBoxWidth: val })
                this.$el.style.setProperty('--shift-left-position', left + 'px')
                this.$el.style.setProperty('--shift-width', width + 'px')
            }
            const secondary = await this.transparent(color, 7)
            const ternary = await this.transparent(color, 10)
            const border = await this.transparent(color, 35)
            this.$el.style.setProperty('--department-color', color)
            this.$el.style.setProperty('--secondary-department-color', secondary)
            this.$el.style.setProperty('--ternary-department-color', ternary)
            this.$el.style.setProperty('--text-color', this.localShift.lentIn || this.localShift.lentOut || this.localShift.nonProductive ? 'white' : contrastColor)
            this.$el.style.setProperty('--non-productive-background-color', nonProductiveBackground)
            this.$el.style.setProperty('--shift-border', border)
        },
        setInitialTimes () {
            const from = this.$moment(this.localShift.start_datetime).shortTime()
            const end = this.$moment(this.localShift.end_datetime)
            const to = !this.localShift.nonProductive && end.shortTime() === '00:00' ? '23:59' : end.shortTime()
            const breakTime = this.localShift.breaks.length ? this.localShift.breaks[0].duration : ''
            this.initialTimes = { from, to, break: breakTime }
        },
        pendingRequestsBlockingNotifications () {
            return this.weekSchedulingNotifications.filter(n => n.reference === 'RM.2' && n.type === 'blocking')
        },

        pendingSSRBlockingNotifications () {
            if (!this.shiftPendingSubstituteRequest(this.localShift)) return false
            return this.pendingRequestsBlockingNotifications().find(n => {
                return n.extra_data.pendingSubstituteRequests.includes(this.employee.account_id)
            })
        },

        pendingRDOBlockingNotifications () {
            if (!this.localShift.overlaps?.rdo?.pending) return false
            return this.pendingRequestsBlockingNotifications().find(n => {
                return n.extra_data.pendingRdoRequests.includes(this.employee.account_id)
            })
        },

        overlapBusinessTimesBlockingNotifications () {
            if (!this.localShift?.overlaps?.businessTimes?.from && !this.localShift?.overlaps?.businessTimes?.to) return false
            return this.weekSchedulingNotifications.find(n => {
                const businessTimesRule = n.reference === 'rm40' && n.type === 'blocking'
                return businessTimesRule && n.ids.includes(this.employee.account_id)
            })
        },
        hasBlockingNotifications () {
            if (this.localShift.lentIn || this.localShift.nonProductive) return false
            return (
                this.pendingSSRBlockingNotifications() ||
                this.pendingRDOBlockingNotifications() ||
                this.overlapBusinessTimesBlockingNotifications()
            )
        },

        async departmentSelected (event, force) {
            if (event.department_id !== this.localShift.department_id) {
                if (!force && this.shiftPendingSubstituteRequest(this.localShift) && !this.isActive) {
                    this.shiftConfirmation = {
                        show: true,
                        event,
                        shift: this.localShift,
                        forDepartmentChange: true,
                        text: this.$t('pages.scheduling.substituteRequests.overrideExisting'),
                    }
                    return
                }
                this.localShift.department_id = event.department_id
                this.employee.updateShift(this.localShift)
                this.resetBlockCoordinates()
                this.updated++
                this.saveShift(this.savePayload)
                this.resetInteractable()
            }
        },

        async hourTypeSelected (event) {
            if (this.localShift.type !== event.type) {
                const foreigType = event.foreign_options.find(t => t.is_default)?.foreign_type || event.foreign_options[0]?.foreign_type || ''
                this.localShift.type = event.type
                this.localShift.foreign_type = foreigType
                const result = await this.saveShift(this.savePayload).catch(() => {
                    this.localShift = { ...this.backupShift }
                })
                this.localShift = result
                this.resetInteractable()
            }
        },

        async onContextMenu (event) {
            event.preventDefault()
            if (this.employee.readOnly) return
            if (!this.isCheckHours && !this.isStandardShifts) {
                if (this.localShift && !this.localShift.nonProductive && this.CAN_READ_PLANNABLE_EMPLOYEES) {
                    this.getPlannableEmployees(this.localShift)
                }
            }
            this.$emit('contextmenu:shift', this.localShift.guid)
            this.showContextMenu = event
        },

        onMouseEnter (event) {
            if (this.isDragging || this.isResizing) return
            this.hovered = event
        },

        onMouseLeave (event) {
            this.hovered = null
        },

        async setActive (event) {
            const ssr = this.shiftPendingSubstituteRequest(this.localShift)
            if (ssr) {
                this.showAssessSubstituteRequests = true
                return
            }
            this.showMenu = true
        },

        async setActiveIfNew () {
            if (this.localShift.isNew && !this.isSaving && !this.localShift.fromKeyboard) {
                const activate = async () => {
                    await this.setActive(null)
                }
                if (this.localShift.copied) {
                    const { before, after, during } = this.shiftOverlaps(this.localShift)
                    if (before || after || during) {
                        // open the form if pasted shift overlaps another shift
                        await activate()
                    } else {
                        // save the shift without opening the form
                        this.blockUpdate(this.localShift, true)
                    }
                    // do not open the form for pasted shifts
                    return
                }
                activate()
            } else {
                if (this.localShift.isNew && this.localShift.fromKeyboard) {
                    const shiftFromInput = await htmlHelper.waitForElement(`#shift-${this.localShift.guid}-block--time-from-input`)
                    shiftFromInput.focus()
                    this.localShift.fromKeyboard = false
                }
            }
        },

        async blockUpdate (event, force) {
            if (!force && this.shiftPendingSubstituteRequest(this.localShift) && !this.isActive) {
                this.shiftConfirmation = {
                    show: true,
                    event,
                    shift: this.localShift,
                    text: this.$t('pages.scheduling.substituteRequests.overrideExisting'),
                }
                return
            }
            this.localShift = event
            this.localShift.copied = false
            const result = await this.saveShift(this.savePayload)
            if (result.error) {
                this.employee.updateShift(this.backupShift)
            } else {
                if (this.localShift.isNew) {
                    this.employee.removeShift(this.localShift)
                    this.employee.addShift(result)
                } else {
                    this.employee.updateShift(result)
                }
            }
            this.setInitialTimes()
            this.resetInteractable()
        },

        softUpdate (shift) {
            this.localShift = shift
            this.setShiftOverlapsShift(this.localShift)
            this.localShift.overlaps = this.setShiftOverlaps(this.localShift)
            this.resetBlockCoordinates()
            this.setInitialTimes()
            this.employee.updateShift(this.localShift)
        },

        async setShiftOverlapsShift (event) {
            if (!this.isDayView) return
            const setOverlap = (event, overlap) => {
                if (!event.overlaps) {
                    event.overlaps = { shift: overlap }
                } else {
                    event.overlaps.shift = overlap
                }
            }
            if (this.localShift.nonProductive) {
                setOverlap(event, false)
            }
            const overlaps = schedulingHelper.shiftHasOverlap(this.$el)
            setOverlap(event, overlaps)
            return event
        },

        async cancel () {
            if (this.localShift.isNew) {
                this.employee.removeShift(this.localShift)
            } else {
                this.localShift = this.backupShift
                this.$el.focus()
                this.updated++
                this.localShift.overlaps = this.setShiftOverlaps(this.localShift)
                this.resetBlockCoordinates()
                this.setInitialTimes()
            }
        },

        setInitialShiftDisplayTimes () {
            this.initialTimes.from = this.$moment(this.localShift.start_datetime).shortTime()
            this.initialTimes.to = this.$moment(this.localShift.end_datetime).shortTime()
            this.initialTimes.break = ''
            if (this.localShift.breaks) {
                this.initialTimes.break = this.localShift.break.length ? this.localShift.breaks[0].duration : ''
            }
            this.SET_SAVING_SHIFT_ERROR(this.localShift)
        },

        cancelOverwrite () {
            this.cancel()
            this.shiftConfirmation = { show: false }
            this.isResizing = false
            this.isDragging = false
        },

        async confirmOverwrite ({ rejectSubstitute = true } = {}) {
            if (rejectSubstitute) {
                let ssrError = false
                await this.saveSubstituteRequest({
                    request: this.shiftPendingSubstituteRequest(this.localShift),
                    shift: this.localShift,
                    status: 'rejected',
                    rejecting: true,
                    employee: this.employee,
                }).catch(err => {
                    this.SET_SNACKBAR({ message: err.message, error: true })
                    this.cancelOverwrite()
                    ssrError = true
                })
                if (ssrError) return
            }
            const action = this.isResizing ? 'resized' : 'dragged'
            if (action === 'resized') {
                this.confirmResize(this.shiftConfirmation.event)
            } else if (action === 'dragged') {
                this.handleDragged(this.shiftConfirmation.event)
            } else if (this.shiftConfirmation.forDepartmentChange) {
                this.departmentSelected(this.shiftConfirmation.event, true)
            } else {
                this.blockUpdate(this.shiftConfirmation.event, true)
            }
            this.shiftConfirmation = { show: false }
        },

        setShiftWarningSnackbar (from, to) {
            if (this.isStandard || this.localShift.nonProductive || this.readOnly || this.localShift.readOnly) return
            if (this.showMenu) {
                this.HIDE_SNACKBAR()
                return
            }
            if (!from || !to) {
                from = this.$moment(this.localShift.start_datetime)
                to = this.$moment(this.localShift.end_datetime)
            }
            const wabWarning = this.employeeTimesHaveWabWarning(this.employee, { from, to })
            if (wabWarning) {
                this.SET_SNACKBAR({ warning: true, message: this.$t('pages.scheduling.warnings.extraPayout') })
            } else {
                this.HIDE_SNACKBAR()
            }
        },

        async updateLocalShiftInstance (shift) {
            if (shift.instances) {
                await shift.instances.forEach(instance => {
                    if (instance.shift_id === shift.shift_id) {
                        instance.start_datetime = shift.start_datetime
                        instance.end_datetime = shift.end_datetime
                        instance.duration = shift.duration
                        instance.breaks = shift.breaks
                    }
                })
            }
            return shift
        },

        onTimeblockClick (event) {
            this.setShiftWarningSnackbar()
        },

        /**
         * Called by the Context Menu => edit shift option
         */
        contextMenuEdit ({ indirectTasks }) {
            this.localShift.editIndirectTasks = indirectTasks
            this.showMenu = true
        },

        breakBlur ({ breakDuration, duration }) {
            this.localShift.breaks[0].duration = breakDuration
            this.localShift.duration = duration
            this.setInitialTimes()
        },
    },
}
</script>

<style lang="scss" scoped>
@import './PlanningTimeBlock.scss';
</style>
