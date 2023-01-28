<template>
    <EmptyState
        v-if="loading.planningData || !employee"
        :show="true"
        component="empty-employee-selection"
        :title="baseTranslate('emptyState.noEmployeeSelected.title')"
        :sub-title="baseTranslate('emptyState.noEmployeeSelected.subTitle')"
        no-padding
        :size="220"
    />
    <PmtTransition
        v-else
        name="slide-sideways"
        mode="in-out"
        :direction="MOBILE_PLANNING_SWIPE_DIRECTION"
    >
        <div v-if="isStandardShifts">
            <EmptyState
                :show="true"
                component="schedules-not-finalized"
                :title="baseTranslate('emptyState.notImplementedOnMobile.title')"
                :sub-title="baseTranslate('emptyState.notImplementedOnMobile.subTitle')"
                size="220"
            />
        </div>

        <div
            :key="$route.query.selected_account"
            v-touch="{
                left: () => swipe('left'),
                right: () => swipe('right'),
            }"
            class="mobile-planning-container"
        >
            <MobilePlanningEmployeeCards
                v-if="!SHOW_SENT_SCHEDULES && !employee.notAssigned && !employee.lentIn"
                :key="`${shiftsKey + wabCounterKey + SELECTED_DATE.apiFormat()}_details`"
                :employee="employee"
                details
            />
            <div class="days">
                <template v-for="(day, dayIndex) in weekDays">
                    <div
                        :key="dayIndex"
                        :class="{'day-row': true, 'today': day.isToday()}"
                    >
                        <div class="day-row-content">
                            <div class="day-header">
                                <div />
                                <div class="header-content">
                                    <span>{{ day.dayCalendar('dddd').toLowerCase() }}</span>
                                    <PmtButton
                                        v-if="showAddButton(day)"
                                        primary
                                        inverted
                                        icon="plus"
                                        icon-size="14"
                                        class="add-new"
                                        @click="addDayShift(day)"
                                    >
                                        {{ baseTranslate('shortcutsMenu.addNew') }}
                                    </PmtButton>
                                </div>
                            </div>
                            <div class="shifts-container">
                                <div class="day-name">
                                    <div class="day">
                                        {{ day.format('MMM') }}
                                    </div>
                                    <div class="number">
                                        {{ day.format('DD') }}
                                    </div>
                                    <div
                                        v-if="!loading.contractData && employee.isEmployed(day) && hasWabWarning(day)"
                                        v-tooltip="{ content: wabWarningInfoTooltip(employee, true, day) }"
                                        class="wab-warning"
                                    >
                                        <InformationOutline
                                            :size="16"
                                            title=""
                                            class="shift-cla-info"
                                        />
                                    </div>
                                </div>
                                <div
                                    :key="shiftsKey + SELECTED_DATE.apiFormat()"
                                    class="day-shifts"
                                >
                                    <VSkeletonLoader
                                        v-if="loading.shifts"
                                        type="card"
                                        class="mobile-day-shifts-loading"
                                    />
                                    <template v-else-if="employee.dayShifts(day, DEPARTMENT_STATUS_HISTORY_ID).length">
                                        <template v-for="(shift, shiftIndex) in employee.dayShifts(day, DEPARTMENT_STATUS_HISTORY_ID)">
                                            <VCard
                                                :id="`shift_${shift.guid}`"
                                                :key="shiftIndex"
                                                :class="shiftClass(shift)"
                                                @contextmenu="onContextMenu($event, shift, employee)"
                                            >
                                                <VProgressLinear
                                                    v-if="savingShiftId === shift.guid"
                                                    ref="loadingIndicator"
                                                    :active="true"
                                                    :indeterminate="true"
                                                    absolute
                                                    height="2"
                                                />
                                                <VCardText
                                                    v-ripple
                                                    class="shift-text"
                                                    @click="openShiftMenu(shift)"
                                                >
                                                    <div
                                                        class="highlighter"
                                                        :style="`background-color: ${shift.nonProductive ? 'var(--grey-80)' : departmentById(shift.department_id).color};`"
                                                    />
                                                    <div class="shift-details">
                                                        <div class="department-name">
                                                            <span v-if="shift.nonProductive && bookableHourTypes[shift.type]">{{ bookableHourTypes[shift.type].local_description }}</span>
                                                            <span v-else>{{ departmentById(shift.department_id).department_name }}</span>
                                                        </div>
                                                        <div v-if="shift.nonProductive">
                                                            {{ shift.duration }}
                                                        </div>
                                                        <div v-else>
                                                            {{ $moment(shift.start_datetime).shortTime() }} - {{ $moment(shift.end_datetime).shortTime() }} | {{ shift.breaks[0].duration }}
                                                        </div>
                                                        <div v-if="shift.remark">
                                                            <VDivider />
                                                            {{ shift.remark }}
                                                        </div>
                                                        <div
                                                            v-if="employee.lentIn"
                                                            class="exchange-info"
                                                        >
                                                            <VDivider />
                                                            <div class="store-info">
                                                                {{ lentEmployeeInTooltip(employee) }}
                                                            </div>
                                                        </div>
                                                        <div
                                                            v-if="isShiftLentOut(shift)"
                                                            class="exchange-info"
                                                        >
                                                            <VDivider />
                                                            <div class="store-info">
                                                                {{ baseTranslate('tooltips.lentOutToStore', { name: shiftExchangeStore(shift).store_name }) }}
                                                            </div>
                                                        </div>
                                                        <div v-if="pendingSubstituteRequests(shift)">
                                                            <template v-if="pendingSubstituteRequests(shift).remark">
                                                                <VDivider />
                                                                {{ pendingSubstituteRequests(shift).remark }}
                                                            </template>
                                                            <VDivider />
                                                            {{ baseTranslate('tooltips.substituteRequestsCount', [pendingSubstituteRequests(shift).sent_to]) }}
                                                        </div>
                                                        <div v-if="shiftIndirectHours(shift).filter(h => !h.toDelete).length">
                                                            <VDivider />
                                                            <VList
                                                                dense
                                                                class="pa-0"
                                                            >
                                                                <VListItem class="pa-0">
                                                                    <VListItemContent>
                                                                        <VListItemTitle>{{ baseTranslate('shiftPopover.indirectTasks.title') }}</VListItemTitle>
                                                                        <template v-for="(indirectHour, indirectHourIndex) in shiftIndirectHours(shift).filter(h => !h.toDelete)">
                                                                            <VListItemSubtitle :key="indirectHourIndex">
                                                                                {{ `${indirectTaskType(indirectHour.indirect_task_id).description} | ${indirectHour.duration}` }}
                                                                            </VListItemSubtitle>
                                                                        </template>
                                                                    </VListItemContent>
                                                                </VListItem>
                                                            </VList>
                                                        </div>
                                                        <ShiftOverlapInfo
                                                            :shift="shift"
                                                            show-divider
                                                        />
                                                    </div>
                                                    <div
                                                        class="shift-action"
                                                    >
                                                        <ShiftIcons
                                                            :employee="employee"
                                                            :shift="shift"
                                                        />
                                                        <PmtButton
                                                            v-if="!employee.lentIn && !shift.readOnly"
                                                            v-ripple
                                                            primary
                                                            inverted
                                                            medium
                                                            round
                                                            icon="dots-vertical"
                                                            icon-size="20"
                                                            @click="onContextMenu($event, shift, employee)"
                                                        />
                                                    </div>
                                                </VCardText>

                                                <ContextMenu
                                                    v-if="showContextMenu.shift && showContextMenu.shift.guid === shift.guid"
                                                    :key="`${shiftIndex}_contextMenu`"
                                                    ref="schedulerContextMenu"
                                                    :shift="showContextMenu.shift"
                                                    :employee="employee"
                                                    :event="showContextMenu.event"
                                                    type="shift"
                                                    @swap-employee="swapEmployee($event)"
                                                    @select-employee="swapEmployee($event)"
                                                    @another-employee="selectAnotherEmployee($event)"
                                                    @edit="contextMenuEdit($event)"
                                                    @copy="copyShift(shift)"
                                                    @edit-indirect-tasks="editIndirectTasks($event)"
                                                    @delete="deleteShiftBlock(shift, employee)"
                                                    @remove-employee="removeEmployeeFromShift(shift)"
                                                    @assess-substitute-request="contextMenuEdit({ ...$event, assessSubstituteRequest: true })"
                                                    @reject-substitute-request="rejectSubstituteRequest($event)"
                                                    @close="showContextMenu = {}"
                                                />
                                            </VCard>
                                        </template>
                                    </template>
                                    <VCard v-else>
                                        <VCardText class="shift-text no-plan">
                                            <div v-if="!employee.isEmployed(day)">
                                                <EmployementData
                                                    :employee="employee"
                                                    :day="day"
                                                    :has-exipred-contract="employee.hasExpiredContract(day, ALLOW_SCHEDULING_AFTER_CONTRACT_ENDING)"
                                                />
                                            </div>
                                            <template v-else>
                                                <div class="highlighter" />
                                                <div>
                                                    {{ baseTranslate('nothingPlanned') }}
                                                </div>
                                            </template>
                                        </VCardText>
                                    </VCard>
                                    <VSkeletonLoader
                                        v-if="!employee.notAssigned && (loading.shifts || loading.availabilities || loading.rdoRequests || loading.substituteRequests)"
                                        type="table-cell"
                                    />
                                    <div
                                        v-else-if="!employee.notAssigned && employee.isEmployed(day) && nonPlannableMoments(day, employee).length"
                                        class="non-available"
                                    >
                                        <template v-for="nonPlannable in nonPlannableMoments(day, employee)">
                                            <component
                                                :is="nonPlannable.component"
                                                :ref="nonPlannable.ref"
                                                :key="nonPlannable.id"
                                                :rdo-request="nonPlannable.rdoRequest"
                                                :substitute-request="nonPlannable.subtituteRequest"
                                                :availability="nonPlannable.availability"
                                                :index="nonPlannable.index"
                                                :tabindex="0"
                                                :row-selected="true"
                                            />
                                        </template>
                                    </div>
                                    <div
                                        v-if="employee.dayRemark(day, DEPARTMENT_STATUS_HISTORY_ID)"
                                        class="day-remark"
                                    >
                                        <ChatProcessingOutline
                                            :size="18"
                                            class="mr-2"
                                        />
                                        <span>{{ employee.dayRemark(day, DEPARTMENT_STATUS_HISTORY_ID).remark }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <VDivider />
                    </div>
                </template>
            </div>
            <MobilePlanningEmployeeCards
                v-if="!SHOW_SENT_SCHEDULES && !employee.notAssigned"
                :key="`${shiftsKey + weekBalancesKey + SELECTED_DATE.apiFormat()}_balances`"
                :employee="employee"
                hours
                :balances="!employee.lentIn"
            />
            <component
                :is="IS_MOBILE ? 'VDialog' : 'VMenu'"
                v-if="showMenu"
                :key="showMenu"
                :value="showMenu"
                :fullscreen="PAGE_WIDTH < $cfg.screenSize.small"
                :close-on-content-click="false"
                :close-on-click="!savingShiftId"
            >
                <ShiftPopover
                    v-if="showMenu"
                    ref="shiftPopover"
                    :shift="activeShift"
                    :start-date="SELECTED_DATE.startOf('isoWeek')"
                    :read-only="!canEditShiftBookableHourType(activeShift)"
                    :employee="employee"
                    @update="softUpdate"
                    @close="closeShiftMenu"
                    @cancel="closeShiftMenu"
                />
            </component>
        </div>
    </PmtTransition>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import AvailabilityTimeBlock from '@/pages/planning/scheduling/views/components/SimpleTimeblocks/AvailabilityTimeBlock'
import RdoTimeBlock from '@/pages/planning/scheduling/views/components/SimpleTimeblocks/RdoTimeBlock'
import SubstituteRequestTimeBlock from '@/pages/planning/scheduling/views/components/SimpleTimeblocks/SubstituteRequestTimeBlock'
import ShiftOverlapInfo from '@/pages/planning/scheduling/components/ShiftOverlapInfo'
import ShiftIcons from '@/pages/planning/scheduling/components/ShiftIcons'
import EmployementData from '@/pages/planning/scheduling/views/components/SimpleTimeblocks/EmployementData'
import MobilePlanningEmployeeCards from '@/pages/planning/scheduling/views/MobilePlanningEmployeeCards'
import ShiftPopover from '@/pages/planning/scheduling/components/popovers/ShiftPopover'
import ContextMenu from '@/pages/planning/scheduling/components/ContextMenu.vue'
export default {
    name: 'MobilePlanning',
    components: {
        AvailabilityTimeBlock,
        RdoTimeBlock,
        SubstituteRequestTimeBlock,
        ShiftOverlapInfo,
        ShiftIcons,
        EmployementData,
        MobilePlanningEmployeeCards,
        ShiftPopover,
        ContextMenu,
    },
    mixins: [mixins],
    data () {
        return {
            shiftsKey: 0,
            weekBalancesKey: 0,
            wabCounterKey: 0,
            activeShift: null,
            showMenu: false,
            editing: false,
            showContextMenu: {},
        }
    },
    computed: {
        employee () {
            return this.mobileSelectedEmployee
        },
        weekDate () {
            return this.SELECTED_DATE.startOf('isoWeek')
        },
        weekDays () {
            return this.weekDate.toCalendarArray('week')
        },
    },
    watch: {
        'employee.shifts': {
            handler (newVal) {
                this.shiftsKey++
                if (newVal) {
                    const newShift = newVal.find(s => s.isNew)
                    if (newShift) {
                        this.openShiftMenu(newShift)
                    } else if (!this.editing) {
                        this.showMenu = false
                    }
                }
            },
            deep: true,
        },
        DIRTY_GRID: {
            handler (newVal) {
                if (newVal && newVal.account_id === this.employee.account_id && !this.isStandardShifts && this.CAN_FINALIZE_SCHEDULE) {
                    setTimeout(() => {
                        this.getWeekBalances({ date: this.SELECTED_DATE, accountId: newVal.account_id }).then(() => {
                            this.weekBalancesKey++
                        })
                        this.getWabCounters({ date: this.SELECTED_DATE, accountId: newVal.account_id }).then(() => {
                            this.wabCounterKey++
                        })
                    }, 1000)
                }
            },
        },
    },
    mounted () {
        requestAnimationFrame(this.scrollToToday)
    },
    methods: {
        hasWabWarning (day) {
            if (this.isStandardShifts || this.SHOW_SENT_SCHEDULES) return false
            return this.hasCLAWarning(this.employee, day.clone().startOf('day'))
        },
        scrollToToday () {
            const today = document.querySelector('.today')
            if (today) today.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
        },
        openShiftMenu (shift) {
            shift.editIndirectTasks = false
            this.activeShift = shift
            this.showMenu = true
            this.setShiftWarningSnackbar(shift)
            this.editing = false
        },
        closeShiftMenu () {
            this.showMenu = false
            this.activeShift = null
            this.editing = false
        },
        softUpdate (shift) {
            shift.overlaps = this.setShiftOverlaps(shift)
            this.employee.updateShift(shift)
        },
        /**
         * Runs when the user clicks on a timeblock
         */
        onContextMenu (event, shift, employee) {
            event.preventDefault()
            if (employee.lentIn || shift.readOnly) return
            this.showContextMenu = { event, shift, employee }
        },
        pendingSubstituteRequests (shift) {
            if (this.isStandardShifts) return null
            return this.shiftPendingSubstituteRequest(shift.shift_instance_id)
        },
        shiftClass (shift) {
            const hideInStandardAndSentShift = !this.isStandardShifts && !this.SHOW_SENT_SCHEDULES
            return {
                'shift-card': true,
                'not-assigned': shift.notAssigned,
                'substitute-request': hideInStandardAndSentShift && Boolean(this.pendingSubstituteRequests(shift)),
                'has-pending-rdo': hideInStandardAndSentShift && shift.overlaps && shift.overlaps.rdo.pending,
                'has-approved-rdo': hideInStandardAndSentShift && shift.overlaps && shift.overlaps.rdo.approved,
                'has-non-availabilities': hideInStandardAndSentShift && shift.overlaps && shift.overlaps.availability.some,
                'has-approved-substitute-requests': hideInStandardAndSentShift && shift.overlaps && shift.overlaps.substituteRequests.approved,
                'overlaps-business-times': hideInStandardAndSentShift && shift.overlaps && (shift.overlaps.businessTimes.from || shift.overlaps.businessTimes.to),
                exchange: shift.exchange_store_id,
                'non-productive': !this.isStandardShifts && shift.nonProductive,
                'non-productive-simple': shift.nonProductiveSimple,
            }
        },
        dayCellActualDate (day) {
            if (!this.isStandardShifts) return day
            return this.$moment().isoWeekday(day.isoWeekday())
        },
        showAddButton (day) {
            const date = this.dayCellActualDate(day)
            if (this.SHOW_SENT_SCHEDULES) return false
            if (this.loading.shifts) return false
            if (this.employee.readOnly) return false
            if (this.employee.hasExpiredContract(date, this.ALLOW_SCHEDULING_AFTER_CONTRACT_ENDING)) return false
            if (this.isStandardShifts && !this.CAN_MANAGE_STANDARD_SCHEDULES) return false
            if (this.weekIsClosed) return false
            if (!this.isStandardShifts) {
                if (this.employee.departments.every(d => this.departmentClosed(d.department_id)?.isClosed)) return false
            }
            const employed = this.isStandardShiftsShifts ? true : this.employee.isEmployed(date)
            if (!employed || this.employee.lentIn) return false
            if (this.departments.every(d => this.departmentClosed(d.department_id)?.isClosed)) return false
            return true
        },

        setShiftWarningSnackbar (shift) {
            if (this.isStandardShifts) return
            const shiftStart = this.$moment(shift.start_datetime)
            const wabWarning = this.employee.getWabWarnings()[[shiftStart.apiFormat()]]
            if (wabWarning && !shift.readOnly && !shift.nonProductive) {
                const shiftStart = this.$moment(shift.start_datetime)
                const shiftEnd = this.$moment(shift.end_datetime).subtract(15, 'minutes')
                const startHasWabWarning = shiftStart.isAfterOrSameTimeAs(wabWarning.from) && shiftStart.isBeforeOrSameTimeAs(wabWarning.to)
                const endHasWabWarning = shiftEnd.isAfterOrSameTimeAs(wabWarning.from) && shiftEnd.isBeforeOrSameTimeAs(wabWarning.to)
                if (startHasWabWarning || endHasWabWarning) {
                    if (!this.hasActiveShift()) {
                        this.SET_SNACKBAR({ warning: true, message: this.$t('pages.scheduling.warnings.extraPayout') })
                    }
                } else {
                    this.HIDE_SNACKBAR()
                }
            }
        },

        async addDayShift (day) {
            const from = day.clone().setTime('12:00').longApiFormat()
            const to = day.clone().setTime('13:00').longApiFormat()
            await this.addShift({ employee: this.employee, from, to })
        },

        swipe (direction) {
            if (this.SHOW_SENT_SCHEDULES) return
            this.$emit('swipe', direction)
            this.SET_ACTIVE_CONTEXT_MENU(null)
        },

        contextMenuEdit (event) {
            this.editing = true
            this.showMenu = true
            this.activeShift = event.shift
        },

        async removeEmployeeFromShift (shift) {
            const notAssignedEmployee = this.weekPlanningData.not_assigned
            await this.employee.removeShift(shift)
            notAssignedEmployee.addShift({ ...shift, account_id: 'not_assigned', notAssigned: true })
            const result = this.removeEmployeeFromAssignedShift({ shift })
            if (result.error) {
                await notAssignedEmployee.removeShift(shift)
                this.employee.addShift(shift)
            } else {
                notAssignedEmployee.updateShift({ ...result, account_id: 'not_assigned', notAssigned: true })
            }
        },

        async swapEmployee ({ employee, newEmployee, shift }) {
            employee.removeShift(shift)
            newEmployee.addShift(shift)

            const result = await this.assignEmployeeToShift({ employee, newEmployee, shift })
            if (result.error) {
                newEmployee.removeShift(shift)
                employee.addShift(shift)
            } else {
                newEmployee.updateShift(shift)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import './style/mobile-planning.scss';
</style>
