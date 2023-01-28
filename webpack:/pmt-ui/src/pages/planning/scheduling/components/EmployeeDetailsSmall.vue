<template>
    <div :class="{'small-details grey-100 pl-3': true, 'standard-shifts': isStandardShifts}">
        <span
            ref="lpgu"
            v-tooltip="!filters.hideLpgu ? detailsTooltip('lpgu') : ''"
            class="lpgu"
        >
            <span v-if="!filters.hideLpgu"> {{ employee.laborCost }} </span>
            <span v-else>--,--</span>
        </span>

        <span
            ref="age"
            v-tooltip="!filters.hideAge ? detailsTooltip('age') : ''"
            class="text-center age"
            :data-suffix="$t('ui.singles.ageYearsShort')"
        >
            <span v-if="!filters.hideAge && employee.age"> {{ employee.age }} </span>
            <span v-else>--</span>
        </span>
        <span
            v-if="!isStandardShifts"
            :key="wabCounterKey + '_wab'"
            :class="{'none': !employee.wab_counters.length, 'employee-wab-counters': true}"
        >
            <template v-for="(counter, index) in employee.wab_counters">
                <span
                    v-if="!isStandardShifts && !SHOW_SENT_SCHEDULES"
                    :key="index"
                    ref="wab"
                    v-tooltip="wabTooltip(index)"
                    class="text-center wab"
                    :style="wabStyle(index)"
                >
                    <span class="wab-threshold">{{ counter.period_threshold }}</span>
                    <span class="wab-hours">{{ counter.period_hours }}</span>
                    <span
                        data-suffix="%"
                        class="wab-percentage"
                    >{{ counter.rounded_percentage }}</span>
                </span>
            </template>
        </span>
        <span
            ref="contractHours"
            v-tooltip="detailsTooltip('contractHours')"
            class="text-center contract-hours"
        >
            {{ employee.contract?.contractHours }}
        </span>
        <span
            v-if="isStandardShifts"
            ref="contractType"
            v-tooltip="detailsTooltip('contractType')"
            class="text-center contract-hours"
        >
            {{ employee.contract?.contract_type }}
        </span>
        <span
            v-else
            ref="deviation"
            v-tooltip="detailsTooltip('deviation')"
            class="text-center deviation"
            :class="{ 'deviation-error': DEPARTMENT_STATUS_HISTORY_ID ? employee.negativeDeviationSentShifts : employee.negativeDeviation }"
        >
            {{ DEPARTMENT_STATUS_HISTORY_ID ? employee.deviationSentShifts : employee.deviation }}
        </span>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'EmployeeDetailsSmall',
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
        tooltipDelay: {
            type: [Number, String],
            default: 250,
            validator: value => {
                return !isNaN(Number(value))
            },
        },
    },
    data () {
        return {
            wabCounterKey: 0,
        }
    },
    watch: {
        DIRTY_GRID: {
            handler (newVal) {
                if (newVal && newVal.account_id === this.employee.account_id && !this.isStandardShifts && this.CAN_FINALIZE_SCHEDULE) {
                    setTimeout(() => {
                        this.getWabCounters({ date: this.SELECTED_DATE, accountId: newVal.account_id }).then(result => {
                            this.employee.setWabCounter(result)
                            this.wabCounterKey++
                        })
                    }, 1000)
                }
            },
        },
    },
    methods: {
        formatMinMax (min, max) {
            return `${min.format('HH:mm')}/${max.format('HH:mm')}`
        },
        detailsTooltip (columnName) {
            return {
                content: this.employeeDetailsTooltipContent(this.employee, columnName),
                delay: {
                    show: Number(this.tooltipDelay),
                    hide: 0,
                },
            }
        },
        wabTooltip (index) {
            const counter = this.employee.wab_counters?.[index]
            if (!counter) return
            const periodNo = counter.period_info?.period_number
            const fromTranslation = this.$t('ui.singles.from')
            const toTranslation = this.$t('ui.singles.to')
            const from = this.$moment(counter.period_info?.start_date).format('dddd, DD MMM YYYY')
            const to = this.$moment(counter.period_info?.end_date).format('dddd, DD MMM YYYY')
            const content = `<div>${this.baseTranslate('resourceColumns.wab.period')} ${periodNo}</div><div>${fromTranslation}: ${from}</div><div>${toTranslation}: ${to}</div><div>${this.baseTranslate('resourceColumns.wab.label')}</div>`
            return {
                content,
                delay: {
                    show: Number(this.tooltipDelay),
                    hide: 0,
                },
            }
        },
        wabStatus (index) {
            let status = 'none'
            const wab = this.employee.wab_counters[index]
            if (wab.rule_violations && wab.rule_violations.length > 0) {
                status = wab.rule_violations[index].type
            }
            return status
        },
        wabStyle (index) {
            let color = 'inherit'
            if (this.wabStatus(index) === 'obly') {
                color = 'var(--fail)'
            }
            if (this.wabStatus(index) === 'warn') {
                color = 'var(--warning)'
            }
            return {
                color,
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.small-details {
    display: grid;
    grid-template-columns: 14% 11% 39% 21% 15%;
    align-items: center;
    font-size: 12px;
    line-height: 1rem;
    &.standard-shifts {
        padding-right: 30px;
        grid-template-columns: 25% 25% 25% 25%;
    }
}
.v-divider--vertical {
    min-height: 50%;
    margin: 7px -1px;
}
.deviation-error {
    color: var(--fail);
}
.lpgu, .age, .wab, .contract-hours, .deviation {
    transition: all .15s ease-in-out;
    &:hover:not(.wab.none) {
        border-radius: 6px;
        font-weight: 600;
        text-decoration: underline;
    }
}
.employee-wab-counters {
    display: grid;
    gap: 3px;
    .wab {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
        .wab-threshold {
            border-right: 1px solid var(--grey-60);
            padding-right: 2px;
        }
        .wab-hours {
            border-right: 1px solid var(--grey-60);
            padding-inline: 2px;
        }
    }
}
:deep() {
    .v-skeleton-loader {
        display: flex;
        align-items: center;
        .v-skeleton-loader__table-cell {
            height: auto !important;
        }
    }
}
</style>
