<template>
    <CheckHoursContainer
        v-if="isCheckHours"
        ref="checkHoursContainer"
        :employee-list="employeeList.filter(e => !e.notAssigned && (!e.lentIn || (e.lentIn && e.allShifts.length)))"
        :selected-account="selected"
        @click:row="selectEmployee($event)"
    />
    <div
        v-else
        :class="{ 'planning-grid': true, 'day-view': isDayView }"
    >
        <div
            id="schedules-print"
            class="d-none d-print-block"
        >
            <ShiftsPrint v-if="IS_PRINTING" />
        </div>
        <EmployeeStandardShiftsModal
            v-if="isStandardShifts && $route.query.account_id"
            ref="employeeStandardShiftsModal"
            :employee="standardShiftEmployee"
            :time-box-width="timeBoxWidth"
            @set-inactive-add-new="hasActiveAddNew = false"
            @click:row="selectEmployee(standardShiftEmployee)"
        />
        <template v-else-if="employeeList.length">
            <PlanningGridCellsHeader
                :employee-list="employeeList"
                class="d-print-none"
            />
            <PlanningContainer :employee-list="employeeList">
                <template #before>
                    <BusinessTimesWrapper
                        v-if="isDayView && !SHOW_SENT_SCHEDULES"
                        :key="`business_times_${SELECTED_DATE.apiFormat()}`"
                        :time-box-width="timeBoxWidth"
                    />
                </template>
                <template #employee-row="{ employee, employeeIndex, groupDepartmentId }">
                    <PlanningEmployeeRow
                        v-if="!isStandardShifts || (isStandardShifts && !employee.notAssigned && !employee.lentIn)"
                        ref="employeeRow"
                        :key="`${employeeIndex}_${resourceSearch}`"
                        :employee="employee"
                        :is-row-selected="selected === employee.account_id"
                        :is-row-hovered="hovered === employee.account_id"
                        :time-box-width="timeBoxWidth"
                        :grid-rect="gridRect"
                        :row-index="employeeIndex"
                        :has-active-add-new="hasActiveAddNew"
                        :group-department-id="groupDepartmentId"
                        :show-availability="showAvailability === employee.account_id"
                        :show-remarks="showRemarks === employee.account_id"
                        :current-context-menu="currentContextMenu"
                        @contextmenu:shift="currentContextMenu = $event"
                        @mouseenter:row="setHoveredRow(employee, $event)"
                        @mouseleave:row="setHoveredRow(null)"
                        @mouseover:row="selectEmployee(employee)"
                        @set-inactive-add-new="hasActiveAddNew = false"
                        @click:row="selectEmployee(employee)"
                        @toggle:availability="toggleEmployeeAvailability(employee)"
                        @toggle:remarks="toggleEmployeeRemarks(employee)"
                    />
                </template>
                <template
                    v-if="settings.workloadChart"
                    #after="{groupDepartmentId}"
                >
                    <SchedulingWorkloadContainer :group-department-id="groupDepartmentId" />
                </template>
            </PlanningContainer>
        </template>
        <EmptyState
            v-else
            ref="emptyState"
            :title="$t('ui.emptyState.nothingAvailableForFiltersTitle')"
            :sub-title="$t('ui.emptyState.nothingAvailableForFiltersSubTitle')"
            :component="'no-schedules'"
            :show="true"
            :size="IS_MOBILE ? 250 : 500"
            no-padding
        />

        <PBottomSheet
            v-if="Object.keys(standardShiftEmployee).length && $route.meta.standard_shifts_account_id === standardShiftEmployee.account_id"
            @close="$refs.employeeStandardShiftsModal.close()"
        >
            <EmployeeStandardShiftsModal
                v-if="!DEPARTMENT_STATUS_HISTORY_ID && !standardShiftEmployee.lentIn && !isStandardShifts"
                ref="employeeStandardShiftsModal"
                :employee="standardShiftEmployee"
                :time-box-width="timeBoxWidth"
                @set-inactive-add-new="hasActiveAddNew = false"
                @click:row="selectEmployee(standardShiftEmployee)"
            />
        </PBottomSheet>
        <SteerInfo
            v-if="!loading.planningData && (settings.steerInformation || settings.steerInformationExtended)"
            ref="steerInfo"
            :employee-list="employeeList"
        />
        <WeekPublishWarnings
            v-if="!loading.week && settings.weekPublishWarnings"
            :employee-list="employeeList"
            @activate-filter="setSnackbarFilter($event)"
        />
        <VSnackbar
            v-if="apiErrors && apiErrors.length"
            v-model="apiErrorsSnackbar"
            timeout="-1"
            :value="true"
            color="var(--red-100)"
            class="api-errors-snackbar"
            multi-line
        >
            {{ baseTranslate('apiErrors.base') }}
            <div
                v-for="(error, index) in apiErrors"
                :key="index"
            >
                {{ index + 1 }}  - {{ baseTranslate(`apiErrors.${error}`) }}
            </div>
            <template #action>
                <PmtButton
                    v-ripple
                    round
                    medium
                    icon="close"
                    :icon-size="16"
                    @click="REMOVE_NON_CRITICAL_API_ERRORS(); apiErrorsSnackbar = false"
                />
            </template>
        </VSnackbar>
        <EmptyState
            v-if="filters.groupByEmployees && noEmployeesForFilters && !$route.query.account_id"
            ref="emptyState"
            :title="$t('pages.scheduling.emptyState.noShiftsForFilters.title')"
            :sub-title="$t('pages.scheduling.emptyState.noShiftsForFilters.subTitle')"
            :component="'no-schedules'"
            :show="true"
            :size="IS_MOBILE ? 250 : 500"
            no-padding
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import timeHelper from '@/libraries/timeHelper'
import PlanningEmployeeRow from '@/pages/planning/scheduling/views/components/PlanningEmployeeRow.vue'
import PlanningGridCellsHeader from '@/pages/planning/scheduling/views/components/PlanningGridCellsHeader.vue'
import PlanningContainer from '@/pages/planning/scheduling/views/PlanningContainer.vue'
import BusinessTimesWrapper from '@/pages/planning/scheduling/views/components/SimpleTimeblocks/BusinessTimesWrapper.vue'
import htmlHelper from '../../../../libraries/htmlHelper'
import { useResizeObserver } from '@vueuse/core'
export default {
    name: 'PlanningGridView',
    components: {
        PlanningEmployeeRow,
        PlanningGridCellsHeader,
        PlanningContainer,
        BusinessTimesWrapper,
        /** Dynamically imported components that are not needed for initial load and interaction */
        ShiftsPrint: () => import(/* webpackChunkName: "planning" */'@/pages/planning/scheduling/views/components/print/ShiftsPrint.vue'),
        SchedulingWorkloadContainer: () => import(/* webpackChunkName: "planning" */'@/pages/planning/scheduling/components/scheduling-workload/SchedulingWorkloadContainer.vue'),
        SteerInfo: () => import(/* webpackChunkName: "planning" */'@/pages/planning/scheduling/components/steer-information/SteerInfo.vue'),
        WeekPublishWarnings: () => import(/* webpackChunkName: "planning" */'@/pages/planning/scheduling/components/WeekPublishWarnings.vue'),
        CheckHoursContainer: () => import('@/pages/realisation/check-hours/components/CheckHoursContainer.vue'),
        EmployeeStandardShiftsModal: () => import('@/pages/planning/scheduling/components/popovers/EmployeeStandardShiftsModal.vue'),
    },
    mixins: [mixins],
    props: {
        employeeList: {
            type: Array,
            default: () => ([]),
        },
    },
    data () {
        return {
            timeBoxWidth: 50,
            gridSteps: 4,
            gridRect: {},
            selected: null,
            hovered: null,
            shiftTimeFromKeyboard: '',
            shiftTimeFromKeyboardTimer: null,
            hasActiveAddNew: false,
            apiErrorsSnackbar: true,
            noEmployeesForFilters: false,
            showAvailability: null,
            showRemarks: null,
            currentContextMenu: null,
        }
    },
    watch: {
        filters: {
            async handler (newVal) {
                if (this.hasAnyLoading) return
                const visibleRows = await this.filterPlanningRows()
                this.noEmployeesForFilters = visibleRows.length === 0
            },
            deep: true,
        },
        hasAnyLoading: {
            async handler (newVal) {
                if (!newVal) {
                    const visibleRows = await this.filterPlanningRows()
                    this.noEmployeesForFilters = visibleRows.length === 0
                }
            },
        },
        resourceSearch: {
            async handler () {
                if (this.hasAnyLoading) return
                const visibleRows = await this.filterPlanningRows()
                this.noEmployeesForFilters = visibleRows.length === 0
            },
        },
        SELECTED_DATE: {
            async handler () {
                if (this.hasAnyLoading) return
                const visibleRows = await this.filterPlanningRows()
                this.noEmployeesForFilters = visibleRows.length === 0
            },
        },
        'settings.hideUnrelatedDepartmentShifts': {
            handler (newVal) {
                const elements = [...document.querySelectorAll('.planning-shift')]
                this.showHideUnrelatedDepartmentShiftElements(elements, this.selected)
            },
        },
        'filters.departments': {
            handler (newVal) {
                if (!newVal.length) {
                    this.changeSetting({ setting: 'hideUnrelatedDepartmentShifts', value: false })
                }
                const elements = [...document.querySelectorAll('.planning-shift')]
                this.showHideUnrelatedDepartmentShiftElements(elements, this.selected)
            },
        },
        isDayView: {
            async handler (newVal) {
                if (this.hasAnyLoading) return
                const visibleRows = await this.filterPlanningRows()
                this.noEmployeesForFilters = visibleRows.length === 0
                this.watchTheGrid(!newVal)
            },
        },
        EXPANDED_PANELS: {
            async handler () {
                if (this.hasAnyLoading) return
                await this.$sleep(0)
                const visibleRows = await this.filterPlanningRows()
                this.noEmployeesForFilters = visibleRows.length === 0
            },
        },
    },
    destroyed () {
        document.removeEventListener('keyup', this.addKeyEventListeners)
        document.removeEventListener('keydown', this.navigateNextEmployee)
    },
    mounted () {
        document.addEventListener('keyup', this.addKeyEventListeners)
        document.addEventListener('keydown', this.navigateNextEmployee)
        document.documentElement.style.setProperty('--wab-warning-background', this.$helpers.transparentize(this.variableToHexcode('--orange-20'), 30))
        setTimeout(async () => {
            // focus on the first row (that is assigned and not lent in)
            // to be able to directly tab through the grid
            let dataSource = this.employeeList
            if (this.filters.groupByDepartment && this.currentEmployeeDepartments.length) {
                const firstDepartmentId = this.currentEmployeeDepartments[0].department_id
                dataSource = this.departmentSortedEmployeesWithShifts(this.employeeList, firstDepartmentId)
            }
            const firstFeasibleEmployee = dataSource.find(e => !e.notAssigned && !e.lentIn)
            if (firstFeasibleEmployee) {
                this.selectEmployee(firstFeasibleEmployee)
                this.employeeFocus(firstFeasibleEmployee)
            }
        }, 0)
        this.watchTheGrid()
    },
    methods: {
        addKeyEventListeners (e) {
            if (!(e instanceof KeyboardEvent)) return
            if (e.target.matches('input') || e.target.matches('textarea')) {
                return
            }
            if (/^[0-9]+$/.test(e.key)) {
                clearTimeout(this.shiftTimeFromKeyboardTimer)
                const dayCell = document.activeElement.parentNode
                const addNewIsActive = document.activeElement.className.includes('add-new')
                if (!addNewIsActive) return
                if (this.shiftTimeFromKeyboard.length < 6) {
                    this.shiftTimeFromKeyboard += e.key.toString()
                }
                if (this.shiftTimeFromKeyboard.length > 1 && this.shiftTimeFromKeyboard.length < 6) {
                    this.shiftTimeFromKeyboardTimer = setTimeout(() => {
                        this.shiftTimeFromKeyboard = timeHelper.validateTime(this.shiftTimeFromKeyboard)
                        const employee = this.weekPlanningData[dayCell.dataset.cellAccountId]
                        const from = this.$moment(dayCell.dataset.date).setTime(this.shiftTimeFromKeyboard)
                        const to = from.clone().add(1, 'hours')
                        const frequencyRow = this.isStandard ? employee.frequencyRows.find(fr => fr.id === Number(dayCell.dataset.frequencyRowId)) : null
                        this.addShift({
                            from: from.longApiFormat(),
                            to: to.longApiFormat(),
                            employee,
                            frequencyRow,
                            fromKeyboard: true,
                        })
                        this.shiftTimeFromKeyboard = ''
                    }, 500)
                }
            }
            if (e.code === 'Tab') {
                if (!e.shiftKey) {
                    if (document.activeElement.className.includes('add-new')) {
                        this.hasActiveAddNew = true
                    } else {
                        this.hasActiveAddNew = false
                    }
                }
            }
        },
        async watchTheGrid (force) {
            if (this.IS_MOBILE || this.isCheckHours) return
            const querySelector = this.isDayView ? '.time-cell' : '.day-time-cell.header'
            const cell = await htmlHelper.waitForElement(querySelector)
            if (!cell) return
            this.timeBoxWidth = cell.getBoundingClientRect().width
            useResizeObserver(cell, (entries) => {
                const updatedCell = entries[0].target
                this.timeBoxWidth = updatedCell.getBoundingClientRect().width
            })
        },
        selectEmployee (employee) {
            /* TODO:
                check why previously selected employee appears
                after a row selection, while filters are hiding it
                TEMPORARY
            */
            this.filterPlanningRows()
            if (this.showAvailability !== employee.account_id) {
                this.showAvailability = null
            }
            if (this.showRemarks !== employee.account_id) {
                this.showRemarks = null
            }
            this.selected = employee.account_id
        },

        toggleEmployeeAvailability (employee) {
            this.selectEmployee(employee)
            if (this.showAvailability === employee.account_id) {
                this.showAvailability = null
            } else {
                this.showAvailability = employee.account_id
            }
        },

        toggleEmployeeRemarks (employee) {
            this.selectEmployee(employee)
            if (this.showRemarks === employee.account_id) {
                this.showRemarks = null
            } else {
                this.showRemarks = employee.account_id
            }
        },

        setHoveredRow (employee) {
            this.hovered = employee?.account_id || null
        },

        navigateNextEmployee (e) {
            const stop = (e) => {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
            }
            if (e.target.matches('input') || e.target.matches('textarea')) {
                return
            }
            // Navigate next/previous employee
            if ((e.code === 'Enter' || e.code === 'NumpadEnter') && (e.ctrlKey || e.shiftKey)) {
                stop(e)
                const direction = e.ctrlKey ? 'down' : e.shiftKey ? 'up' : null
                this.selectNextEmployee(direction)
            }
        },
        async selectNextEmployee (direction = 'down') {
            if (!direction) return
            let dataSource = []
            const selectedHtmlElementInfo = this.selectedGroupedEmployeeElementInfo()
            let currentEmployeeIndex = 0
            if (this.filters.groupByEmployees) {
                dataSource = this.employeeList
                currentEmployeeIndex = dataSource.findIndex(e => e.account_id === Number(selectedHtmlElementInfo.accountId))
            } else {
                let departmentId = this.currentEmployeeDepartments[0].department_id
                if (selectedHtmlElementInfo) {
                    departmentId = Number(selectedHtmlElementInfo.groupDepartmentId)
                    currentEmployeeIndex = Number(selectedHtmlElementInfo.groupAccountIndex)
                }
                dataSource = this.departmentSortedEmployeesWithShifts(this.employeeList, departmentId)
            }
            let nextEmployeeIndex = 0
            if (currentEmployeeIndex > -1) {
                if (direction === 'down') {
                    nextEmployeeIndex = currentEmployeeIndex + 1
                } else if (direction === 'up') {
                    nextEmployeeIndex = currentEmployeeIndex - 1
                }
                if (nextEmployeeIndex < 0) {
                    nextEmployeeIndex = 0
                }
            }
            const employee = dataSource[nextEmployeeIndex]
            if (employee) {
                if (this.isStandardShifts) {
                    const activeRows = this.activeEmployeeFrequencyRows(employee.account_id)
                    this.SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(activeRows[0].id)
                }
                this.selectEmployee(employee)
                await this.employeeFocus(employee)
            }
        },
        selectedGroupedEmployeeElementInfo () {
            const selectedGroupedEmployeeElement = document.querySelector('.planning-grid-row.selected')
            if (selectedGroupedEmployeeElement) {
                return selectedGroupedEmployeeElement.dataset
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import './PlanningGridView.scss';
</style>
