<template>
    <!-- GROUP BY EMPLOYEES -->
    <div
        v-if="filters.groupByEmployees || SHOW_SENT_SCHEDULES || (isStandardShifts && $route.query.account_id)"
        class="main-grid d-print-none"
    >
        <slot name="before" />
        <template v-for="(employee, employeeIndex) in employeeList">
            <slot
                name="employee-row"
                :employee="employee"
                :employee-index="employeeIndex"
            />
        </template>
        <div class="after">
            <slot name="after" />
        </div>
    </div>
    <!-- GROUP BY DEPARTMENT -->
    <VExpansionPanels
        v-else
        ref="expansionPanels"
        v-model="panels"
        multiple
        class="department-panels"
    >
        <template v-for="(department, departmentIndex) in panelDepartments">
            <VExpansionPanel
                v-if="departmentSortedEmployeesWithShifts(employeeList, department.department_id).length"
                :key="departmentIndex"
                ref="expansionPanel"
                @click="checkPanel(departmentIndex)"
            >
                <VExpansionPanelHeader
                    :style="`--department-color: ${department.color};`"
                    :class="panelHeaderClasses"
                >
                    <template #default="{open}">
                        <DepartmentGroupHeader
                            :open="open"
                            :department="department"
                            :department-employees="departmentSortedEmployeesWithShifts(employeeList, department.department_id)"
                        />
                        <div
                            v-if="settings.showNormPlannedHours && !isStandardShifts && CAN_READ_TIME_DISTRIBUTION && Object.keys(weekStatus).length && !weekIsDraft"
                            class="week steer-info-grid"
                            :class="{'has-totals': settings.employeeTotals, 'is-day': isDayView}"
                            :style="`--department-color: ${department.color};`"
                        >
                            <template v-for="(day, index) in isDayView ? [SELECTED_DATE] : SELECTED_DATE.toCalendarArray('week')">
                                <SteerInfoHeaderDayTotals
                                    :key="index"
                                    :day="day"
                                    :department-id="department.department_id"
                                />
                            </template>
                            <VSpacer />
                        </div>
                    </template>
                </VExpansionPanelHeader>

                <VExpansionPanelContent
                    v-if="showDepartmentContent[departmentIndex]"
                >
                    <template #default>
                        <slot
                            name="before"
                            :group-department-id="department.department_id"
                        />
                        <div class="main-grid d-print-none">
                            <template v-for="(employee, employeeIndex) in departmentSortedEmployeesWithShifts(employeeList, department.department_id)">
                                <slot
                                    name="employee-row"
                                    :employee="employee"
                                    :employee-index="employeeIndex"
                                    :group-department-id="department.department_id"
                                />
                            </template>
                        </div>
                        <div class="after">
                            <slot
                                name="after"
                                :group-department-id="department.department_id"
                            />
                        </div>
                    </template>
                </VExpansionPanelContent>
            </VExpansionPanel>
        </template>
    </VExpansionPanels>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import DepartmentGroupHeader from '@/pages/planning/scheduling/views/components/DepartmentGroupHeader'
import SteerInfoHeaderDayTotals from '@/pages/planning/scheduling/components/steer-information/SteerInfoHeaderDayTotals'
export default {
    name: 'TimelineBlocksContainer',
    components: {
        DepartmentGroupHeader,
        SteerInfoHeaderDayTotals,
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
            showDepartmentContent: { 0: true },
        }
    },
    computed: {
        panels: {
            get () {
                return this.EXPANDED_PANELS
            },
            set (newVal) {
                this.SET_EXPANDED_PANELS(newVal)
            },
        },
        panelDepartments () {
            return this.currentEmployeeDepartments.filter(d => {
                const departmentEmployees = this.departmentSortedEmployeesWithShifts(this.employeeList, d.department_id).filter(e => !e.notAssigned)
                const hasEmployees = departmentEmployees.filter(employee => this.fitsSearchParam(employee) && this.employeeFilters(employee)).length

                return hasEmployees && (!this.filters.departments.length || this.filters.departments.includes(d.department_id))
            })
        },
        panelHeaderClasses () {
            return {
                'border-bottom elevation-1': true,
                'panel-header': true,
                'week-view': !this.isDayView,
                'day-view': this.isDayView,
                'no-steer-info-totals': (this.settings.showNormPlannedHours && !this.steerInfo) || !this.settings.showNormPlannedHours,
                'week-has-holidays': !this.isStandardShifts && this.weekHasHoliday,
                'standard-shifts': this.isStandardShifts,
            }
        },

    },
    methods: {
        checkPanel (departmentIndex) {
            this.showDepartmentContent[departmentIndex] = !this.panels.includes(departmentIndex)
        },
    },
}
</script>
<style lang="scss" scoped>
@import '@/pages/planning/scheduling/views/style/week-timeline.scss';
@import '@/pages/planning/scheduling/views/style/week-day-cells.scss';
:deep() .v-expansion-panel-content__wrap {
    position: relative;
}
:deep() .v-expansion-panel {
    padding: 0;
    .v-expansion-panel-header {
        padding: 8px 24px;
        top: 64px;
        cursor: pointer;
        &.day-view {
            top: 65px;
        }
        &.week-view {
            top: 66px;
            &.week-has-holidays {
                top: 85px;
            }
            &.standard-shifts {
                top: 62px;
            }
        }
        &.no-steer-info-totals:not(.week-has-holidays):not(.day-view) {
            top: 46px;
        }
        &.week-has-holidays:not(.no-steer-info-totals):not(.day-view) {
            top: 92px;
        }
        &.week-has-holidays.no-steer-info-totals:not(.day-view) {
            top: 57px;
        }
        &__icon {
            position: sticky;
            right: 24px;
            z-index: 3;
        }
    }
    .v-expansion-panel-content {
        margin-top: 1px;
    }
    .v-expansion-panel-content__wrap {
        padding: 0 !important;
    }
}
:deep() .after {
    position: sticky;
    bottom: 0;
    border-top: 1px solid var(--grey-60);
    z-index: 10;
}
.steer-info-grid {
    position: absolute;
    left: calc(var(--scheduler-resources-width));
    width: calc(100% - calc(var(--scheduler-resources-width)));
    display: grid;
    grid-template-columns: repeat(7, 1fr) 0 !important;
    z-index: 2;
    background-color: white;
    transition: left .3s ease-in-out;
    &.has-totals {
        grid-template-columns:  repeat(7, 1fr) calc(var(--employee-totals-width)) !important;
    }
    &.is-day {
        grid-template-columns: 1fr calc(var(--employee-totals-width)) !important;
        justify-items: start;
        .day-totals {
            border-right: none !important;
        }
    }
    .day-totals {
        align-items: center;
        &:first-of-type {
            border-left: 1px solid var(--grey-40);
        }
        border-right: 1px solid var(--grey-40);
    }
}
.panel-header {
    &:after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
        height: 100%;
        background: var(--department-color, var(--grey-80));
    }
}
</style>
