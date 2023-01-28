<template>
    <LazyLoad
        ref="lazyLoad"
        :key="`${isDayView}_${settings.compactView}_${sortingKey}`"
        v-click-outside="resetCellSelection"
        :min-height="minRowHeight"
        unrender
        :lazy="!SHOW_SENT_SCHEDULES || (!loading.sentSchedules && !loading.sentDayRemarks)"
        :class="rowClasses"
        :data-account-name="employee.name"
        :data-account-id="employee.account_id"
        :data-account-age="employee.age"
        :data-departments="employee.departments.map(d => `${d.department_name}_${d.department_shortname}_${d.department_id}`).join(',')"
        :data-group-department-id="groupDepartmentId"
        :data-group-account-index="rowIndex"
        :data-account-index="rowIndex"
        @mousedown="$emit('click:row')"
        @tab="$emit('click:row')"
        @contextmenu="$emit('click:row')"
        @mouseenter="$emit('mouseenter:row', $event)"
        @mouseleave="$emit('mouseleave:row', $event)"
        @mouseover="onMouseOver($event)"
    >
        <template #placeholder>
            <div class="left-side" />
            <div class="center center-fake">
                <template v-if="isStandardShifts">
                    <div class="standard-row">
                        <div class="day-time-cell" />
                        <div class="day-time-cell" />
                        <div class="day-time-cell" />
                        <div class="day-time-cell" />
                        <div class="day-time-cell" />
                        <div class="day-time-cell" />
                        <div class="day-time-cell" />
                        <div class="totals-container" />
                        <div class="standard-shifts-frequency" />
                    </div>
                </template>
            </div>
            <div
                v-if="settings.employeeTotals && !isStandardShifts"
                class="right-side"
            />
        </template>
        <template #default>
            <div
                ref="leftSide"
                class="left-side"
            >
                <EmployeeDetails
                    :employee="employee"
                    :is-row-selected="isRowSelected"
                    @toggle:availability="$emit('toggle:availability', employee)"
                    @toggle:remarks="$emit('toggle:remarks', employee)"
                />
            </div>
            <div
                ref="center"
                class="center"
            >
                <!-- STANDARD SHIFTS -->
                <template v-if="isStandardShifts">
                    <div
                        v-for="(frequencyRow, frequencyRowIndex) in employee.frequencyRows"
                        :key="`${frequencyRowIndex}_shifts_${frequencyRowKey === frequencyRowIndex}`"
                        class="standard-row"
                        :class="{ 'selected-row': SELECTED_STANDARD_SHIFTS_ROW === frequencyRow.id }"
                        @mousedown="SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(frequencyRow.id)"
                        @contextmenu="SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(frequencyRow.id)"
                    >
                        <div
                            v-for="(day, dayTimeIndex) in frequencyRow.from.toCalendarArray('week')"
                            :id="rowDayCellId(day)"
                            ref="dayTimeCell"
                            :key="standardShiftsKey(frequencyRow, frequencyRowIndex, dayTimeIndex)"
                            class="day-time-cell"
                            :class="cellClass(dayTimeIndex)"
                            :data-row-index="rowIndex"
                            :data-cell-account-id="employee.account_id"
                            :data-date="day.apiFormat()"
                            :data-date-time="day.longApiFormat()"
                            :data-frequency-row-id="frequencyRow.id"
                            @mouseenter="setHoveredCell(dayTimeIndex, $event)"
                            @mouseleave="setHoveredCell(null, $event)"
                        >
                            <template v-for="(shift, shiftIndex) in frequencyRow.shifts.filter(s => $moment(s.start_datetime).apiFormat() === day.apiFormat())">
                                <PlanningTimeBlock
                                    :key="`${shiftIndex}_${rowIndex}_${frequencyRowIndex}`"
                                    :shift="shift"
                                    :employee="employee"
                                    :time-box-width="timeBoxWidth"
                                    :time-interval-step="60"
                                    :group-department-id="groupDepartmentId"
                                    :is-row-selected="isRowSelected"
                                    :is-saving="savingShiftId === shift.guid"
                                    :has-context-menu="currentContextMenu === shift.guid"
                                    @contextmenu:shift="$emit('contextmenu:shift', $event)"
                                    @update="updateShift($event)"
                                    @dragging="isDragging = $event"
                                />
                            </template>
                            <template v-if="!isDayView && isRowSelected && !isDragging">
                                <PlanningEmployeeAddNewButton
                                    :day="day"
                                    :day-time-index="dayTimeIndex"
                                    :employee="employee"
                                    :has-active-add-new="hasActiveAddNew"
                                    :big="showAddNewBig(day, frequencyRow)"
                                    :small="showAddNewSmall(day, frequencyRow)"
                                    @contextmenu="$emit('contextmenu:cell', $event)"
                                    @add-shift="newStandardShiftOnTime(day, frequencyRow)"
                                />
                            </template>
                        </div>
                        <EmployeeTotals
                            :key="`${frequencyRowIndex}_totals`"
                            :employee="employee"
                            :row-index="rowIndex"
                            :is-row-selected="isRowSelected"
                            :frequency-row="frequencyRow"
                        />
                        <EmployeeStandardShiftsFrequency
                            :key="`${frequencyRowIndex}_frequency`"
                            :employee="employee"
                            :frequency-row="frequencyRow"
                            @updated="frequencyRowKey = frequencyRowIndex"
                        />
                    </div>
                    <template v-if="CAN_READ_STANDARD_REMARKS">
                        <div
                            v-for="(frequencyRow, frequencyRowIndex) in employee.frequencyRowsRemarks"
                            :key="`${frequencyRowIndex}_remarks`"
                            class="standard-row"
                            :class="{ 'selected-row': SELECTED_STANDARD_SHIFTS_ROW === frequencyRow.id }"
                            @mousedown="SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(frequencyRow.id)"
                            @contextmenu="SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(frequencyRow.id)"
                        >
                            <div
                                v-for="dayTimeIndex in columns"
                                :id="rowDayCellId(dayTimeRange[dayTimeIndex])"
                                ref="dayTimeCell"
                                :key="`${rowIndex}_${frequencyRowIndex}_${dayTimeIndex}_${remarksKey}_remarks`"
                                :class="{'day-time-cell remark': true, 'first': dayTimeIndex === 0}"
                                :data-row-index="rowIndex"
                                :data-cell-account-id="employee.account_id"
                                :data-date="dayTimeRange[dayTimeIndex].apiFormat()"
                                :data-date-time="dayTimeRange[dayTimeIndex].longApiFormat()"
                                @mouseenter="setHoveredCell(dayTimeIndex, $event)"
                                @mouseleave="setHoveredCell(null, $event)"
                            >
                                <EmployeeStandardDayRemark
                                    :day-remark="frequencyRow.remark.days[dayTimeRange[dayTimeIndex].isoWeekday() - 1]"
                                    :standard-remark="frequencyRow"
                                    :read-only="frequencyRow.remark.readOnly"
                                    :employee="employee"
                                    @saved="remarksKey++"
                                />
                            </div>
                            <div
                                :key="`${frequencyRowIndex}_totals`"
                                class="totals-container"
                            />
                            <EmployeeStandardShiftsFrequency
                                :key="`${frequencyRowIndex}_frequency`"
                                :employee="employee"
                                is-remarks
                                :frequency-row="frequencyRow"
                                @updated="frequencyRowKey = frequencyRowIndex"
                            />
                        </div>
                    </template>
                </template>
                <!-- NOT ASSIGNED SHIFTS -->
                <template v-else-if="isDayView && employee.notAssigned">
                    <template v-if="dayShifts(SELECTED_DATE).length">
                        <template v-for="(shift, shiftIndex) in dayShifts(SELECTED_DATE)">
                            <div
                                v-for="dayTimeIndex in columns"
                                :id="rowDayCellId(SELECTED_DATE)"
                                ref="dayTimeCell"
                                :key="`${shiftIndex}_${dayTimeIndex}_${shiftsKey(dayTimeIndex)}`"
                                class="day-time-cell"
                                :class="cellClass(dayTimeIndex)"
                                :data-row-index="rowIndex"
                                :data-cell-account-id="employee.account_id"
                                :data-date="SELECTED_DATE.apiFormat()"
                                :data-date-time="SELECTED_DATE.longApiFormat()"
                                :data-time-index="dayTimeIndex"
                            >
                                <template v-if="dayTimeIndex === 0">
                                    <PlanningTimeBlock
                                        :key="`${shiftIndex}_${rowIndex}`"
                                        :shift="shift"
                                        :employee="employee"
                                        :time-box-width="timeBoxWidth"
                                        :time-interval-step="60"
                                        :group-department-id="groupDepartmentId"
                                        :is-row-selected="isRowSelected"
                                        :is-saving="savingShiftId === shift.guid"
                                        :show-availability="showAvailability"
                                        :has-context-menu="currentContextMenu === shift.guid"
                                        @contextmenu:shift="$emit('contextmenu:shift', $event)"
                                        @update="updateShift($event)"
                                        @dragging="isDragging = $event"
                                        @toggle:availability="$emit('toggle:availability', $event)"
                                    />
                                </template>
                            </div>
                        </template>
                    </template>
                    <template v-else>
                        <div
                            v-for="dayTimeIndex in columns"
                            :id="rowDayCellId(SELECTED_DATE)"
                            ref="dayTimeCell"
                            :key="`${dayTimeIndex}`"
                            class="day-time-cell"
                            :class="cellClass(dayTimeIndex)"
                            :data-row-index="rowIndex"
                            :data-cell-account-id="employee.account_id"
                            :data-date="SELECTED_DATE.apiFormat()"
                            :data-date-time="SELECTED_DATE.longApiFormat()"
                            :data-time-index="dayTimeIndex"
                        />
                    </template>
                </template>
                <!-- ASSIGNED SHIFTS -->
                <template v-else>
                    <div
                        v-for="dayTimeIndex in columns"
                        :id="rowDayCellId(dayTimeRange[dayTimeIndex])"
                        ref="dayTimeCell"
                        :key="`${dayTimeIndex}_${shiftsKey(dayTimeIndex)}`"
                        class="day-time-cell"
                        :class="cellClass(dayTimeIndex)"
                        :data-row-index="rowIndex"
                        :data-cell-account-id="employee.account_id"
                        :data-date="dayTimeRange[dayTimeIndex].apiFormat()"
                        :data-date-time="dayTimeRange[dayTimeIndex].longApiFormat()"
                        :data-time-index="dayTimeIndex"
                        @mousedown="beginSelection(dayTimeIndex, $event)"
                        @mouseup="endSelection(dayTimeIndex, $event)"
                        @mouseenter="updateSelection(dayTimeIndex, $event); setHoveredCell(dayTimeIndex, $event)"
                        @mouseleave="setHoveredCell(null, $event)"
                        @click="selectCell(dayTimeIndex, $event)"
                        @dblclick="addLocalShift({from: dayTimeRange[dayTimeIndex].longApiFormat(), to: dayTimeRange[dayTimeIndex].clone().add(1, 'hour').longApiFormat(), departmentId: groupDepartmentId}, $event)"
                    >
                        <TimelineTimeSelectionPreview
                            v-if="showTimePreview(dayTimeIndex)"
                            :ref="`time_preview_${rowIndex}_${dayTimeIndex}`"
                            :daytime="dayTimeRange[dayTimeIndex]"
                            :time-index="dayTimeIndex"
                            :selection-start="selectionStart"
                            :selection-end="selectionEnd"
                            :hovered-time-index="dayTimeIndex"
                        />
                        <VSkeletonLoader
                            v-if="(!isDayView || dayTimeIndex === 0) && loading.accountShifts === employee.account_id"
                            type="`table-cell"
                        />
                        <template v-else-if="!isDayView || dayTimeIndex === 0">
                            <template v-for="(shift, shiftIndex) in dayShifts(dayTimeRange[dayTimeIndex])">
                                <PlanningTimeBlock
                                    :key="`${dayTimeIndex}_${shiftIndex}_${rowIndex}`"
                                    :shift="shift"
                                    :employee="employee"
                                    :time-box-width="timeBoxWidth"
                                    :time-interval-step="60"
                                    :group-department-id="groupDepartmentId"
                                    :is-row-selected="isRowSelected"
                                    :is-saving="savingShiftId === shift.guid"
                                    :show-availability="showAvailability"
                                    :has-context-menu="currentContextMenu === shift.guid"
                                    @contextmenu:shift="$emit('contextmenu:shift', $event)"
                                    @update="updateShift($event)"
                                    @dragging="isDragging = $event"
                                    @toggle:availability="$emit('toggle:availability', $event)"
                                />
                            </template>
                            <template v-if="!employee.readOnly && isDayView && !SHOW_SENT_SCHEDULES">
                                <WabWarningTimeBlock
                                    v-if="wabWarnings && wabWarnings[dayTimeRange[dayTimeIndex].apiFormat()]"
                                    :warnings="wabWarnings[dayTimeRange[dayTimeIndex].apiFormat()]"
                                    :time-box-width="timeBoxWidth"
                                    :time-interval-step="60"
                                    :row-selected="isRowSelected"
                                />
                                <template v-for="nonPlannable in nonPlannableMoments(SELECTED_DATE, employee)">
                                    <component
                                        :is="nonPlannable.component"
                                        :ref="nonPlannable.ref"
                                        :key="nonPlannable.id"
                                        :rdo-request="nonPlannable.rdoRequest"
                                        :substitute-request="nonPlannable.subtituteRequest"
                                        :availability="nonPlannable.availability"
                                        :time-box-width="timeBoxWidth"
                                        :time-interval-step="60"
                                        :index="nonPlannable.index"
                                        :tabindex="0"
                                        :row-selected="isRowSelected"
                                    />
                                </template>
                            </template>
                        </template>
                        <template v-if="!employee.readOnly && !isDayView && isRowSelected && !isDragging && !SHOW_SENT_SCHEDULES">
                            <PlanningEmployeeAddNewButton
                                :day="dayTimeRange[dayTimeIndex]"
                                :day-time-index="dayTimeIndex"
                                :employee="employee"
                                :has-active-add-new="hasActiveAddNew"
                                :big="showAddNewBig(dayTimeRange[dayTimeIndex])"
                                :small="showAddNewSmall(dayTimeRange[dayTimeIndex])"
                                @contextmenu="$emit('contextmenu:cell', $event)"
                                @add-shift="newShiftOnTime($event)"
                            />
                        </template>
                        <EmploymentTooltip
                            v-if="!employee.readOnly && !isDayView && showUnemployedMenuWeek(dayTimeRange[dayTimeIndex], rowIndex)"
                            :employee="employee"
                            :x="hoveredCellRect.x"
                            :y="hoveredCellRect.y"
                            :day="dayTimeRange[dayTimeIndex]"
                        />
                    </div>
                </template>
                <EmploymentTooltip
                    v-if="!employee.readOnly && isDayView && showUnemployedMenuWeek(SELECTED_DATE)"
                    :employee="employee"
                    :x="hoveredCellRect.x"
                    :y="hoveredCellRect.y"
                    :day="SELECTED_DATE"
                />
                <template v-if="!employee.readOnly && showWeekRemarks">
                    <div
                        v-for="dayTimeIndex in columns"
                        :key="`${dayTimeIndex}_${remarksKey}_remarks`"
                        :class="{'day-time-cell remark': true, 'first': dayTimeIndex === 0}"
                        :data-row-index="rowIndex"
                        :data-date="dayTimeRange[dayTimeIndex].apiFormat()"
                        :data-date-time="dayTimeRange[dayTimeIndex].longApiFormat()"
                    >
                        <VSkeletonLoader
                            v-if="loading.accountWeekRemarks === employee.account_id"
                            type="table-cell"
                        />
                        <EmployeeDayRemark
                            v-else
                            :day="dayTimeRange[dayTimeIndex]"
                            :employee="employee"
                            @saved="remarksKey++"
                        />
                    </div>
                </template>
                <template v-if="!employee.readOnly && showWeekNonPlannableMoments">
                    <div
                        v-if="!employee.allNonPlannableMoments"
                        class="expanded-row-header"
                    >
                        {{ $t('sidePanels.availabilityWeeklyDetails.emptyWeekset.label') }}
                    </div>
                    <template v-if="employee.allNonPlannableMoments > 0">
                        <div
                            v-for="dayTimeIndex in columns"
                            :key="`${dayTimeIndex}_non_available`"
                            :class="{'day-time-cell non-available': true, 'first': dayTimeIndex === 0}"
                            :data-row-index="rowIndex"
                            :data-date="dayTimeRange[dayTimeIndex].apiFormat()"
                            :data-date-time="dayTimeRange[dayTimeIndex].longApiFormat()"
                        >
                            <template v-for="nonPlannable in nonPlannableMoments(dayTimeRange[dayTimeIndex], employee)">
                                <component
                                    :is="nonPlannable.component"
                                    :ref="nonPlannable.ref"
                                    :key="nonPlannable.id"
                                    :rdo-request="nonPlannable.rdoRequest"
                                    :substitute-request="nonPlannable.subtituteRequest"
                                    :availability="nonPlannable.availability"
                                    :time-box-width="timeBoxWidth"
                                    :time-interval-step="60"
                                    :index="nonPlannable.index"
                                    :tabindex="0"
                                    :row-selected="true"
                                />
                            </template>
                        </div>
                    </template>
                </template>
            </div>
            <div
                v-if="settings.employeeTotals && !isStandardShifts"
                ref="rightSide"
                class="right-side"
            >
                <EmployeeTotals
                    :employee="employee"
                    :row-index="rowIndex"
                    :is-row-selected="isRowSelected"
                    @active-shift="$emit('active-shift', $event)"
                    @add-new="addLocalShift($event)"
                    @mouseleave:shift="$emit('mouseleave:shift', $event)"
                    @mouseenter:shift="$emit('mouseenter:shift', $event)"
                    @contextmenu:shift="$emit('contextmenu:shift', $event)"
                />
            </div>
        </template>
    </LazyLoad>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import LazyLoad from '@/components/ui/LazyLoad.vue'
import PlanningEmployee from '@/libraries/planningEmployee'
import PlanningTimeBlock from '@/pages/planning/scheduling/views/components/PlanningTimeBlock.vue'
import WabWarningTimeBlock from '@/pages/planning/scheduling/views/components/SimpleTimeblocks/WabWarningTimeBlock.vue'
import EmployeeDetails from '@/pages/planning/scheduling/components/EmployeeDetails.vue'
import EmployeeTotals from '@/pages/planning/scheduling/components/EmployeeTotals.vue'
import AvailabilityTimeBlock from '@/pages/planning/scheduling/views/components/SimpleTimeblocks/AvailabilityTimeBlock.vue'
import RdoTimeBlock from '@/pages/planning/scheduling/views/components/SimpleTimeblocks/RdoTimeBlock.vue'
import SubstituteRequestTimeBlock from '@/pages/planning/scheduling/views/components/SimpleTimeblocks/SubstituteRequestTimeBlock.vue'
import EmployeeDayRemark from '@/pages/planning/scheduling/components/EmployeeDayRemark.vue'
import TimelineTimeSelectionPreview from '@/pages/planning/scheduling/views/components/TimelineTimeSelectionPreview'
import PlanningEmployeeAddNewButton from '@/pages/planning/scheduling/views/components/PlanningEmployeeAddNewButton'
export default {
    name: 'PlanningEmployeeRow',
    components: {
        PlanningTimeBlock,
        WabWarningTimeBlock,
        EmployeeDetails,
        LazyLoad,
        EmployeeTotals,
        AvailabilityTimeBlock,
        RdoTimeBlock,
        SubstituteRequestTimeBlock,
        EmployeeDayRemark,
        TimelineTimeSelectionPreview,
        PlanningEmployeeAddNewButton,
        EmploymentTooltip: () => import('@/pages/planning/scheduling/views/components/SimpleTimeblocks/EmploymentTooltip'),
        EmployeeStandardShiftsFrequency: () => import('@/pages/planning/scheduling/components/EmployeeStandardShiftsFrequency'),
        EmployeeStandardDayRemark: () => import('@/pages/planning/scheduling/components/EmployeeStandardDayRemark'),
        TimelineBlock: () => import('@/pages/planning/scheduling/views/components/TimelineBlock'),
    },
    mixins: [mixins],
    props: {
        employee: {
            type: PlanningEmployee,
            required: true,
        },
        rowIndex: {
            type: [Number, String],
            required: true,
        },
        isRowSelected: Boolean,
        isRowHovered: Boolean,
        hasActiveAddNew: Boolean,
        timeBoxWidth: {
            type: Number,
            required: true,
        },
        gridRect: {
            type: [Object, DOMRectReadOnly, DOMRect],
            required: true,
        },
        groupDepartmentId: {
            type: Number,
            default: null,
        },
        showAvailability: Boolean,
        showRemarks: Boolean,
        currentContextMenu: {
            type: Number,
            default: null,
        },
    },
    data () {
        return {
            timeIntervalStep: 60,
            hoveredCell: null,
            isDragging: false,
            selectionRow: null,
            selectionStart: null,
            selectionEnd: null,
            isSelecting: false,
            remarksKey: 0,
            frequencyRowKey: null,
            sortingKey: 0,
        }
    },
    computed: {
        columns () {
            const columns = this.isDayView ? 24 : 7
            return Array.from(Array(columns).keys())
        },
        rowClasses () {
            return {
                'planning-grid-row': true,
                'standard-shifts': this.isStandardShifts,
                'lent-in': this.employee.lentIn,
                'not-assigned': this.employee.notAssigned,
                selected: this.isRowSelected,
                'day-view': this.isDayView,
                'has-totals': this.settings.employeeTotals,
                compact: !this.isStandard && this.settings.compactView,
            }
        },
        showWeekRemarks () {
            if (this.isStandardShifts) return false
            if (this.employee.lentIn || this.employee.notAssigned) return false
            if (this.SHOW_SENT_SCHEDULES) {
                return this.employee.departmentHistorySentRemarks[this.DEPARTMENT_STATUS_HISTORY_ID]
            }
            if (this.isDayView) return false
            if (this.settings.alwaysShowAllRemarks) return true
            if (this.settings.alwaysShowRemarksWeekViewEmployeeClick && this.isRowSelected) return true
            return this.isRowSelected && this.showRemarks
        },

        showWeekNonPlannableMoments () {
            if (this.isStandardShifts) return false
            if (this.employee.lentIn || this.employee.notAssigned) return false
            if (this.isDayView) return false
            if (!this.isRowSelected) return false
            return this.showAvailability || this.settings.alwaysShowAvailabilityWeekViewEmployeeClick || this.isDragging
        },

        wabWarnings () {
            return this.employee.wabWarnings
        },

        weekOrDepartmentClosed () {
            if (this.isStandardShifts) return false
            if (this.employee.readOnly) return true
            if (this.isStandard) return false
            if (this.SHOW_SENT_SCHEDULES) return true
            if (this.weekIsClosed) return true
            const allEmployeeDepartmentsClosed = this.currentEmployeeDepartments.every(d => this.departmentClosed(d.department_id))
            return allEmployeeDepartmentsClosed
        },
        minRowHeight () {
            if (this.isStandardShifts) {
                const frequencyRows = this.employee.frequencyRows.length || 1
                const frequencyRowsRemarks = this.employee.frequencyRowsRemarks.length
                return (frequencyRows + frequencyRowsRemarks) * 90
            }
            if (this.employee.notAssigned) {
                if (this.isDayView) {
                    return 60 * (this.employee.dayShifts(this.SELECTED_DATE, this.DEPARTMENT_STATUS_HISTORY_ID, this.groupDepartmentId).length || 1)
                } else {
                    return 41 * this.employee.getMaxShiftCount(this.groupDepartmentId) || 1
                }
            }
            if (this.isDayView) return 60
            if (this.employee.lentIn) return 45
            const compactHeight = 45
            const defaultHeight = 90
            const availabilityAdjust = this.settings.alwaysShowAvailabilityWeekViewEmployeeClick && this.isRowSelected ? this.maxNonPlannableCount * 47 : 0
            const remarksAdjust = this.settings.alwaysShowRemarksWeekViewEmployeeClick ? 47 : 0
            const alwaysHasRemarks = this.settings.alwaysShowAllRemarks ? 47 : 0
            return this.settings.compactView ? compactHeight : defaultHeight + alwaysHasRemarks + availabilityAdjust + remarksAdjust
        },

        shiftsKey () {
            return dayTimeIndex => {
                if (this.isDayView && dayTimeIndex === 0) {
                    const gridDay = this.dayTimeRange[dayTimeIndex]
                    const shiftsCount = this.dayShifts(gridDay).length
                    const date = this.SELECTED_DATE.apiFormat()
                    return `${dayTimeIndex}_${date}_${shiftsCount}`
                }
                return `${dayTimeIndex}_${this.dayShifts(this.dayTimeRange[dayTimeIndex]).length}`
            }
        },

        standardShiftsKey () {
            return (frequencyRow, frequencyRowIndex, dayTimeIndex) => {
                const day = this.dayTimeRange[dayTimeIndex]
                const shiftsCount = frequencyRow.shifts.filter(s => this.$moment(s.start_datetime).apiFormat() === day.apiFormat()).length
                return `${this.rowIndex}_${frequencyRowIndex}_${dayTimeIndex}_${shiftsCount}_shifts`
            }
        },
    },
    watch: {
        isRowSelected: {
            handler (newVal) {
                this.$nextTick(() => {
                    const elements = [...document.querySelectorAll(`.planning-shift[data-account-id="${this.employee.account_id}"]`)]
                    this.showHideUnrelatedDepartmentShiftElements(elements, newVal ? this.employee.account_id : null)
                })
            },
        },
        SORTED_COLUMN: {
            async handler () {
                this.sortingKey++
            },
            deep: true,
        },
    },
    methods: {
        cellClass (dayTimeIndex) {
            const day = this.dayTimeRange[dayTimeIndex]
            const cannotPlanOthersShifts = !this.CAN_PLAN_OTHERS && this.employee.account_id !== this.user.accountId
            const cannotPlanOwnShifts = !this.CAN_EDIT_OWN_PLANNING && this.employee.account_id === this.user.accountId
            const isNotEmployed = !this.isStandard && Object.keys(this.employee).length && !this.employee.isEmployed(day)
            return {
                first: dayTimeIndex === 0,
                compact: this.settings.compactView,
                'day-view': this.isDayView,
                'wab-warning': (this.isRowSelected || this.settings.wabWarnings) && !this.isDayView && !this.isStandard && !this.SHOW_SENT_SCHEDULES && this.employee.wabWarnings[day.apiFormat()],
                'not-employed': !this.isStandard && (isNotEmployed || this.hasExpiredContract(day)),
                'not-available': this.employee.lentIn || cannotPlanOthersShifts || cannotPlanOwnShifts,
                'store-closed': !this.isStandard && this.dayIsClosed(day),
                'not-assigned': this.employee.notAssigned,
            }
        },

        hasExpiredContract (day) {
            if (this.isStandard || this.ALLOW_SCHEDULING_AFTER_CONTRACT_ENDING) return false
            const contract = Object.keys(this.employee).length ? this.employee.contract : null
            return contract?.end_date ? day.isAfter(contract.end_date, 'day') : false
        },

        dayCellActualDate (day) {
            if (!this.isStandard) return day
            return this.$moment().isoWeekday(day.isoWeekday())
        },

        showAddButton (day) {
            const date = this.dayCellActualDate(day)
            if (this.employee.readOnly) return false
            if (this.hasExpiredContract(date)) return false
            if (!this.CAN_MANAGE_STANDARD_SCHEDULES) return false
            if (this.weekIsClosed) return false
            if (!this.isStandard) {
                if (!this.employee.notAssigned && this.departmentClosed(this.groupDepartmentId)?.isClosed) return false
                if (!this.employee.notAssigned && this.employee.departments.every(d => this.departmentClosed(d.department_id)?.isClosed)) return false
            }
            const employed = this.isStandardShifts ? true : this.employee.isEmployed(date)
            if (this.dragging || !employed || this.employee.lentIn) return false
            if (this.departments.every(d => this.departmentClosed(d.department_id))) return false
            return true
        },

        showAddNewSmall (day, frequencyRow) {
            if (!this.showAddButton(day)) return false
            const date = this.dayCellActualDate(day)
            if (this.isStandardShifts && frequencyRow) {
                const currentDayShiftsCount = frequencyRow.shifts.filter(s => {
                    return this.$moment(s.start_datetime).apiFormat() === day.apiFormat()
                }).length
                return currentDayShiftsCount >= 2 && currentDayShiftsCount === frequencyRow.maxShiftCount
            }
            const currentDayShiftsCount = this.employee.dayShifts(date, this.DEPARTMENT_STATUS_HISTORY_ID, this.groupDepartmentId).length
            const minShiftsAllowed = this.settings.compactView ? 1 : 2
            return currentDayShiftsCount >= minShiftsAllowed && currentDayShiftsCount === this.employee.getMaxShiftCount(this.groupDepartmentId)
        },

        showAddNewBig (day, frequencyRow) {
            if (!this.showAddButton(day)) return false
            return !this.showAddNewSmall(day, frequencyRow)
        },

        newShiftOnTime (day, frequencyRow) {
            if (this.weekOrDepartmentClosed && !this.isStandardShifts) {
                this.SET_SNACKBAR({ message: this.baseTranslate('warnings.allDepartmentsAreClosed'), warning: true })
                return
            }
            this.addLocalShift({
                from: day.clone().setTime('12:00').longApiFormat(),
                to: day.clone().setTime('13:00').longApiFormat(),
                departmentId: this.groupDepartmentId,
                frequencyRow,
            })
        },

        /**
         * Emits an event to add a new shift on the grid.
         * @param {String} from //example: 2021-08-05 07:00
         * @param {String} to   //example: 2021-08-05 11:30
         */
        addLocalShift ({ from, to, nonProductiveSimple = false, departmentId, frequencyRow }, event) {
            if (event && !event.target.classList.contains('day-time-cell')) return
            if (this.SHOW_SENT_SCHEDULES) return
            if (this.weekOrDepartmentClosed) return
            if (this.employee.lentIn) return
            if (!this.isStandardShifts && !this.employee.isEmployed(this.$moment(from))) return
            this.addShift({ from, to, nonProductiveSimple, departmentId, frequencyRow, employee: this.employee })
        },

        showUnemployedMenuWeek (day) {
            if (this.isStandard) return false
            return (!this.employee.isEmployed(day) || this.hasExpiredContract(day)) && this.hoveredCell === this.rowDayCellId(day)
        },

        setHoveredCell (dayTimeIndex, e) {
            this.$emit('set-inactive-add-new')
            if (this.isDayView) {
                if (dayTimeIndex > 0) {
                    const dayTime = this.dayTimeRange[dayTimeIndex]
                    this.hoveredCell = this.rowDayCellId(dayTime)
                } else {
                    this.hoveredCell = null
                }
                this.hoveredCellRect = {
                    x: e.clientX,
                    y: e.clientY,
                }
            } else {
                const dayTime = this.dayTimeRange[dayTimeIndex]
                this.hoveredCell = this.rowDayCellId(dayTime)
                const cellEl = document.querySelector(`#${this.hoveredCell}`)
                if (cellEl) {
                    this.hoveredCellRect = cellEl.getBoundingClientRect()
                }
            }
        },

        rowDayCellId (day) {
            if (!day) return null
            return `row_${this.rowIndex}_cell_${day.isoWeekday()}`
        },

        onMouseOver (event) {
            if (this.isDayView && event.buttons === 1) {
                const { localShift: shift, employee } = this
                this.$emit('mouseover:row', { event, shift, employee })
            }
        },

        showTimePreview (dayTimeIndex) {
            if (this.employee.readOnly) return false
            if (!this.isDayView || this.SHOW_SENT_SCHEDULES) return false
            const dayTime = this.dayTimeRange[dayTimeIndex]
            if (!this.employee.isEmployed(dayTime)) return false
            const isHoveredCell = this.hoveredCell === this.rowDayCellId(dayTime)
            const hasSelection = this.selectionStart === dayTimeIndex
            const isSelectingCell = this.isSelecting && this.selectionEnd === dayTimeIndex
            return (hasSelection || isSelectingCell) && (this.isRowSelected || isHoveredCell)
        },

        /**
         * Adds a '.selected-cell' class to a grid cell element (event.target)
         * @param {MouseEvent} event
         */
        async selectCell (dayTimeIndex, event) {
            if (!event?.target?.classList?.contains('day-time-cell')) return
            if (!this.isDayView || this.SHOW_SENT_SCHEDULES) return
            this.$emit('click', event)
            if (this.employee.readOnly) return
            if (this.weekOrDepartmentClosed) return
            if (this.employee.notAssigned || this.employee.lentIn || !this.employee.isEmployed(this.dayTimeRange[dayTimeIndex])) return
            await this.removeSelected()
            event.target.classList.add('selected-cell')
            this.selectionRow = dayTimeIndex
            if (!event.shiftKey) {
                this.selectionStart = dayTimeIndex
            } else if (event.shiftKey && this.selectionStart !== null) {
                this.selectionEnd = dayTimeIndex
                await this.selectRangeCells()
                await this.endSelection(event, dayTimeIndex)
                this.selectionStart = null
                this.selectionEnd = null
            }
        },
        async beginSelection (dayTimeIndex, event) {
            if (!event?.target?.classList?.contains('day-time-cell')) return
            if (!this.isDayView || this.SHOW_SENT_SCHEDULES) return
            if (this.employee.readOnly) return
            if (this.weekOrDepartmentClosed) {
                this.SET_SNACKBAR({ message: this.baseTranslate('warnings.allDepartmentsAreClosed'), warning: true })
                return
            }
            if (this.employee.notAssigned || this.employee.lentIn || event.shiftKey || !this.employee.isEmployed(this.dayTimeRange[dayTimeIndex])) return
            this.toggleNonAvailablePointerEvents('none')
            await this.removeSelected()
            this.isSelecting = true
            this.selectionRow = this.rowIndex
            this.selectionStart = dayTimeIndex
            await this.updateSelection(dayTimeIndex, event)
        },
        async updateSelection (dayTimeIndex, event) {
            if (!this.isDayView || this.SHOW_SENT_SCHEDULES) return
            if (this.weekOrDepartmentClosed) return
            const dayTime = this.dayTimeRange[dayTimeIndex]
            if (this.employee.notAssigned || this.employee.lentIn || !this.employee.isEmployed(this.dayTimeRange[dayTimeIndex])) return
            const leftMouseButtonIsPressed = event.buttons === 1
            if (leftMouseButtonIsPressed) {
                this.toggleNonAvailablePointerEvents('none')
            }
            const timeblocksAreStationary = !this.resizing && !this.dragging
            if (event.shiftKey) {
                this.hoveredCell = this.rowDayCellId(dayTime)
            } else {
                this.hoveredCell = null
            }
            if (leftMouseButtonIsPressed && timeblocksAreStationary && this.selectionRow !== null) {
                if (this.isSelecting) {
                    this.selectionEnd = dayTimeIndex
                    await this.selectRangeCells()
                }
            } else {
                this.isSelecting = false
            }
        },
        async endSelection (event, timeIndex) {
            if (!this.isDayView || this.SHOW_SENT_SCHEDULES) return
            this.toggleNonAvailablePointerEvents('all')
            if (this.selectionStart !== this.selectionEnd) {
                await this.addShiftFromMultipleCells()
            }
            this.removeSelected()
            this.updateSelection(event, timeIndex)
        },
        /**
         * Adds selected class to all grid cells that are bewteen selectionStart and selectionEnd
         */
        async selectRangeCells () {
            if (!this.isDayView || this.SHOW_SENT_SCHEDULES) return
            const rowCells = [...document.querySelectorAll(`.day-time-cell[data-cell-account-id="${this.employee.account_id}"]`)]
            rowCells.forEach(async (el, i) => {
                const elementIndex = Number(el.dataset.timeIndex)
                const isSameOrAfterSelectionStart = elementIndex >= this.selectionStart && elementIndex <= this.selectionEnd
                const isSameOrBeforeSelectionEnd = elementIndex >= this.selectionEnd && elementIndex <= this.selectionStart
                await el.classList.toggle('selected-cell', isSameOrAfterSelectionStart || isSameOrBeforeSelectionEnd)
            })
        },

        toggleNonAvailablePointerEvents (events) {
            const nonAvailableBlocks = [...document.querySelectorAll('.availability, .rdo, .approved-substitute-request, .planning-shift, input')]
            nonAvailableBlocks.forEach(block => {
                block.style.pointerEvents = events
            })
        },

        /**
         * Gets all the elements with the '.slected class' and builds
         * the start and end times based on the [data-date] attribute of the selected elements
        */
        addShiftFromMultipleCells () {
            if (!this.isDayView || this.SHOW_SENT_SCHEDULES) return
            if (this.weekOrDepartmentClosed) return
            const selectedCells = [...document.querySelectorAll('.day-time-cell.selected-cell')]
            if (selectedCells.length > 1) {
                const first = selectedCells[0]
                const last = selectedCells[selectedCells.length - 1]
                if (first && last) {
                    const startDate = first.dataset.dateTime
                    const endDate = this.$moment(last.dataset.dateTime).add(1, 'hour').longApiFormat()
                    this.addLocalShift({ from: startDate, to: endDate, departmentId: this.groupDepartmentId })
                }
            }
            this.resetCellSelection()
            this.removeSelected()
        },

        resetCellSelection () {
            this.selectionStart = null
            this.selectionEnd = null
            this.selectionRow = null
            this.isSelecting = false
        },

        /**
         * Removes the '.selected' class from all grid cells elements
         */
        async removeSelected () {
            this.isSelecting = false
            this.selectionRow = null
            this.selectionStart = null
            // remove all other selected cells
            const selectedCells = document.querySelectorAll('.selected-cell')
            if (selectedCells.length) {
                for (const cell of selectedCells) {
                    await cell.classList.remove('selected-cell')
                }
            }
        },

        dayShifts (day) {
            if (this.isDayView && this.employee.notAssigned) {
                return this.employee.dayShifts(day, this.DEPARTMENT_STATUS_HISTORY_ID, this.groupDepartmentId)
            }
            return this.employee.dayShifts(day, this.DEPARTMENT_STATUS_HISTORY_ID, this.groupDepartmentId).filter(s => !this.isDayView || !s.nonProductive)
        },

        updateShift (shift) {
            this.employee.updateShift(shift)
        },

    },
}
</script>

<style lang="scss" scoped>
:deep() .v-skeleton-loader {
    display: grid;
    align-items: center;
    justify-content: center;
}
</style>
