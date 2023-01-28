<template>
    <component
        :is="IS_MOBILE ? 'VDialog' : 'VMenu'"
        v-if="showWarning"
        ref="warningPopover"
        v-model="showWarningMenu"
        max-width="500"
        min-width="500"
        origin="top left"
        transition="scale-transition"
        nudge-right="35"
        :close-on-content-click="false"
        :close-on-click="true"
        :fullscreen="PAGE_WIDTH < $cfg.screenSize.small"
        :style="!IS_MOBILE ? 'overflow: hidden;' : ''"
    >
        <template #activator="{on, value}">
            <PmtButton
                id="employee-day-warning"
                ref="employeeDayWarning"
                v-ripple
                cy_id="employee-day-warning-button"
                primary
                inverted
                medium
                round
                :active="value"
                class="grey-100"
                icon="alert-circle"
                icon-size="16"
                :fill-color="leadingWarningColor"
                no-margin
                v-on="on"
            />
        </template>
        <EmployeeWarnings
            v-if="showWarningMenu"
            ref="employeeWarnings"
            :employee="employee"
            @close="showWarningMenu = false"
        />
    </component>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import EmployeeWarnings from '@/pages/planning/scheduling/components/popovers/EmployeeWarnings'
export default {
    name: 'EmployeeWarningsMenu',
    components: {
        EmployeeWarnings,
    },
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            showWarningMenu: false,
        }
    },
    computed: {
        leadingWarningColor () {
            // Using find instead of filter here since we just need to check if there is 1 result present and we do not need to check the rest after that
            if (this.claValidationOutcomes.find(o => o.error)) {
                return 'var(--red-100)'
            }
            if (this.claValidationOutcomes.find(o => o.warn)) {
                return 'var(--orange-100)'
            }
            return 'var(--grey-80)'
        },
        claValidationOutcomes () {
            if (this.isDayView) {
                return this.employee.dayValidations[this.SELECTED_DATE.apiFormat()]
            }
            return this.employee.validations
        },
        showWarning () {
            if ((!this.CAN_READ_CLA_VALIDATIONS && !this.CAN_READ_CAO_RULES) || this.employee.lentIn) return false
            if (!this.isDayView) {
                return this.employee.showWeekValidations
            }
            return this.employee.showDailyValidations[this.SELECTED_DATE.apiFormat()]
        },
    },
    watch: {
        scroll: {
            handler () {
                this.showWarningMenu = false
            },
        },
    },
}
</script>
