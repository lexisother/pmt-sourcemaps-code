<template>
    <div
        v-bind="$attrs"
        :class="headerClassses"
    >
        <div class="left-side">
            <EmployeesDetailsHeaderColumns :employee-list="employeeList" />
        </div>
        <PlanningGridCellsHeaderWeek v-if="!isDayView" />
        <PlanningGridCellsHeaderDay v-else />
        <div
            v-if="settings.employeeTotals"
            class="right-side"
        >
            <EmployeeTotalsHeaders />
        </div>
        <EmployeeStandardShiftsFrequencyHeader v-if="isStandardShifts" />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'PlanningGridCellsHeader',
    components: {
        EmployeeStandardShiftsFrequencyHeader: () => import('@/pages/planning/scheduling/components/popovers/EmployeeStandardShiftsFrequencyHeader'),
        EmployeesDetailsHeaderColumns: () => import('@/pages/planning/scheduling/components/EmployeesDetailsHeaderColumns'),
        EmployeeTotalsHeaders: () => import('@/pages/planning/scheduling/components/EmployeeTotalsHeaders'),
        PlanningGridCellsHeaderWeek: () => import('@/pages/planning/scheduling/views/components/PlanningGridCellsHeaderWeek'),
        PlanningGridCellsHeaderDay: () => import('@/pages/planning/scheduling/views/components/PlanningGridCellsHeaderDay'),
    },
    mixins: [mixins],
    props: {
        employeeList: {
            type: Array,
            default: () => ([]),
        },
    },
    computed: {
        hasScroll () {
            return this.layoutScroll.top > 0 && this.filters.groupByEmployees
        },
        headerClassses () {
            return {
                'planning-grid-row': true,
                header: true,
                'elevation-3': this.hasScroll,
                'has-totals': this.settings.employeeTotals,
                'standard-shifts': this.isStandardShifts,
            }
        },
    },
}
</script>
