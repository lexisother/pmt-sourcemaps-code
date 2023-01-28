<template>
    <div
        ref="employeeActions"
        class="employee-actions pr-3"
    >
        <PmtButton
            v-if="employee.lentIn && !isStandardShifts"
            id="employee-lent-in-button"
            ref="employeeLentInIcon"
            v-ripple
            v-tooltip="lentEmployeeInTooltip(employee)"
            cy_id="employee-lent-in-icon"
            primary
            inverted
            medium
            round
            class="grey-100"
            icon="account-arrow-left"
            icon-size="16"
            no-margin
        />
        <EmployeeWarningsMenu
            v-if="!DEPARTMENT_STATUS_HISTORY_ID && !employee.lentIn && !isStandardShifts"
            ref="employeeWarningMenu"
            :key="employee.showWeekValidations"
            :employee="employee"
        />
        <VBadge
            v-if="!DEPARTMENT_STATUS_HISTORY_ID && !employee.lentIn && !isStandardShifts"
            class="plannability-badge"
            dot
            :value="hasStandardShiftsOrRemarks"
        >
            <PmtButton
                id="employee-standard-shifts-button"
                ref="employeeStandardShiftsButton"
                v-tooltip="{ content: baseTranslate('standardShifts.titles.shifts'), delay: { show: 500 } }"
                v-ripple
                cy_id="employee-standard-shifts-icon"
                primary
                inverted
                medium
                round
                class="grey-100"
                icon="calendar-sync-outline"
                icon-size="16"
                no-margin
                @click="openAccountStandardShifts"
            />
        </VBadge>
        <VBadge
            v-if="!DEPARTMENT_STATUS_HISTORY_ID && !employee.lentIn && !isDayView"
            class="plannability-badge"
            dot
            :content="employee.allNonPlannableMoments"
            :value="employee.allNonPlannableMoments > 0"
        >
            <PmtButton
                id="employee-availability-button"
                ref="employeeAvailabilityButton"
                v-tooltip="availabilityTooltip"
                v-ripple
                cy_id="employee-availability-icon"
                primary
                inverted
                medium
                round
                class="grey-100"
                icon="account-check-outline"
                icon-size="16"
                no-margin
                :active="isAvailabilityActive"
                @click="$emit('toggle:availability')"
            />
        </VBadge>
        <EmployeeDayRemarksMenu
            v-if="!DEPARTMENT_STATUS_HISTORY_ID && !employee.lentIn && !isStandardShifts"
            ref="employeeDayRemarksMenu"
            :employee="employee"
            :is-row-selected="isRowSelected"
            @click="$emit('toggle:remarks')"
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import EmployeeWarningsMenu from '@/pages/planning/scheduling/components/popovers/EmployeeWarningsMenu'
import EmployeeDayRemarksMenu from '@/pages/planning/scheduling/components/popovers/EmployeeDayRemarksMenu'

export default {
    name: 'EmployeeDetailsActions',
    components: {
        EmployeeWarningsMenu,
        EmployeeDayRemarksMenu,
    },
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
        isRowSelected: Boolean,
    },
    computed: {
        isAvailabilityActive () {
            if (!this.isRowSelected) return false
            return this.settings.alwaysShowAvailabilityWeekViewEmployeeClick
        },
        availabilityTooltip () {
            let content = this.baseTranslate('tooltips.availability')
            if (this.isStandardShifts) {
                content += ` - ${this.$t('ui.singles.currentWeek')} (${this.$moment().weekYearFormat()})`
            } else {
                content += ` - ${this.SELECTED_DATE.weekYearFormat()}`
            }
            return {
                content,
                delay: {
                    show: 250,
                    hide: 50,
                },
            }
        },
        hasStandardShiftsOrRemarks () {
            // Using some instead of filter here
            // since we just need to check if there
            // is at least 1 result present and we
            // do not need to check the rest after that
            const hasRecurringShifts = this.employee.allShifts().some(e => e.frequency)
            const hasStandard = Boolean(this.employee.allFrequencyRowsShifts().length || this.employee.allFrequencyRowsRemarks().length)
            return hasRecurringShifts || hasStandard
        },
    },
    methods: {
        selectFirstFrequencyRow () {
            if (this.isStandardShifts) {
                const activeRows = this.activeEmployeeFrequencyRows(this.employee.account_id)
                this.SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(activeRows[0]?.id)
            }
        },
        toggleDisplay (display) {
            try {
                this.$emit('toggle-display', display)
            } catch (error) {
                console.error(error)
            }
        },
        async openAccountStandardShifts () {
            this.SET_STANDARD_SHIFT_EMPLOYEE(this.employee)
            this.$route.meta.standard_shifts_account_id = this.employee.account_id
            const date = this.SELECTED_DATE
            if (this.CAN_READ_STANDARD_REMARKS && !this.employee.frequencyRowsRemarks.length) {
                await this.getStandardDayRemarks({ date, accountId: this.employee.account_id })
                    .catch((error) => { this.setSchedulingApiError('standardRemarks', error) })
            }
            if (!this.employee.frequencyRows.length) {
                await this.getStandardShifts({ date, accountId: this.employee.account_id })
                    .catch((error) => { this.setSchedulingApiError('standardShifts', error) })
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.employee-actions {
    display: flex;
    align-items: center;
}
:deep() .plannability-badge {
    .v-badge__badge {
        inset: auto auto calc(100% - 8px) calc(100% - 8px) !important;
        width: 6px;
        height: 6px;
    }
}
</style>
