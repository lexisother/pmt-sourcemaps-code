<template>
    <div
        ref="employee-resource"
        tabindex="-1"
        class="employee-resources"
        @click="employeeDetailsClick($event)"
    >
        <div
            ref="employeeRow"
            :class="{ readonly: DEPARTMENT_STATUS_HISTORY_ID, 'employee-detail': true, 'selected': isRowSelected }"
            :style="leftDisplayFromVisibleColumns"
        >
            <div
                ref="name"
                class="visible-column visible-name-column grey-100"
            >
                <a
                    class="name-column"
                    tabindex="0"
                >
                    <div class="employee-name pl-3 pr-3">
                        {{ employee.name }}
                    </div>
                    <EmployeeDetailsActions
                        v-if="!employee.readOnly && !isStandardShifts && !employee.notAssigned"
                        ref="employeeDetailsActions"
                        :employee="employee"
                        :is-row-selected="isRowSelected"
                        @toggle:availability="$emit('toggle:availability')"
                        @toggle:remarks="$emit('toggle:remarks')"
                    />
                </a>
                <EmployeeDetailsSmall
                    v-if="!employee.notAssigned && !employee.lentIn"
                    :employee="employee"
                />
                <div
                    v-if="employee.lentIn"
                    style="line-height:0;padding-left:10px;"
                >
                    <small>{{ lentEmployeeInTooltip(employee) }}</small>
                </div>
                <EmployeeDetailsStandardShiftsMenu
                    v-if="isStandardShifts"
                    :employee="employee"
                />
            </div>
            <template v-if="showAdditionalColumns">
                <template v-for="(column, index) in visibleColumns">
                    <div
                        :ref="column.name"
                        :key="index + '_visible_expanded'"
                        v-tooltip="columnTooltip(column)"
                        class="visible-column"
                    >
                        <template v-if="column.name === 'departments'">
                            <EmployeeDetailsExtraList
                                :employee="employee"
                                type="departments"
                            />
                        </template>
                        <template v-else-if="column.name === 'competences' && employee.competences.length">
                            <EmployeeDetailsExtraList
                                :employee="employee"
                                type="competences"
                            />
                        </template>
                        <template v-else-if="column.name === 'plannedHours' && contract?.contract_type">
                            <Chip
                                v-tooltip="columnTooltip(column, true)"
                                :text="$moment.duration({minutes: employee.plannedMinutes + employee.plannedMinutesNonProductive}).format('HH:mm')"
                                :bold="false"
                                inverted
                            />
                        </template>
                        <template v-else-if="column.name === 'contractType' && contract?.contract_type">
                            <Chip
                                v-tooltip="contract?.contract_type"
                                :text="contractTypeMap"
                                :bold="false"
                                inverted
                            />
                        </template>
                        <template v-else-if="column.name === 'atv' || column.name === 'tvt' || column.name === 'vak'">
                            <Chip
                                :key="weekBalancesKey"
                                v-tooltip="columnTooltip(column, true)"
                                :text="employee[column.name]"
                                :bold="false"
                                inverted
                            />
                        </template>
                        <template v-else-if="column.name === 'personnel_number'">
                            <Chip
                                :text="employeeNumber"
                                :bold="false"
                                inverted
                            />
                        </template>
                        <template v-else-if="column.name !== 'extra' && showColumn(column.name)">
                            <span :style="`width: ${column.width}px !important; max-width: ${column.width}px !important`">
                                <Chip
                                    :text="employee[column.name]"
                                    :bold="false"
                                    inverted
                                />
                            </span>
                        </template>
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<script>
import accountHelper from '@/libraries/accountHelper'
import EmployeeDetailsSmall from '@/pages/planning/scheduling/components/EmployeeDetailsSmall'
import EmployeeDetailsStandardShiftsMenu from '@/pages/planning/scheduling/components/popovers/StandardShifts/EmployeeDetailsStandardShiftsMenu'
import EmployeeDetailsActions from '@/pages/planning/scheduling/components/EmployeeDetailsActions'
import EmployeeDetailsExtraList from '@/pages/planning/scheduling/components/EmployeeDetailsExtraList'
import mixins from '@/pages/planning/scheduling/resources/mixins'
import stringHelper from '@/libraries/stringHelper'
export default {
    name: 'EmployeeDetails',
    components: {
        EmployeeDetailsSmall,
        EmployeeDetailsStandardShiftsMenu,
        EmployeeDetailsActions,
        EmployeeDetailsExtraList,
    },
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
        isRowSelected: Boolean,
    },
    data () {
        return {
            assignEmployeeMenu: false,
            weekBalancesKey: 0,
            showAdditionalColumns: false,
        }
    },
    computed: {
        visibleColumns () {
            if (this.employee.notAssigned || this.employee.lentIn) return []
            return this.VISIBLE_COLUMNS
        },
        loadingSmallDetails () {
            return this.loading.contracts || this.loading.wabCounters || this.loading.wageInfo
        },
        contract () {
            return this.employee.contract
        },
        /**
         * Gets a CSV of the employee department short names
         * @returns {String}
         */
        departmentsText () {
            if (this.employee.notAssigned) return ''
            return this.employee.departments.map(d => d.department_shortname).join(', ')
        },
        /**
         * Maps the employee contract type to a list of contract type short names
         * @returns {String}
         */
        contractTypeMap () {
            return accountHelper.shortContractTypeMap(this.contract?.contract_type || '')
        },
        showRemarkIcon () {
            if (this.isDayView) return this.employeeDayRemark && this.employeeDayRemark.remark
            return this.employeeWeekRemarks && this.employeeWeekRemarks.length
        },
        employeeNumber () {
            return stringHelper.textToElipsis(this.employee.details.personnel_number.toString(), 9)
        },
    },
    watch: {
        EMPLOYEES_EXPANDED: {
            handler (newVal) {
                if (!newVal) {
                    setTimeout(() => {
                        this.showAdditionalColumns = false
                    }, 350)
                } else {
                    this.showAdditionalColumns = true
                }
            },
        },
        DIRTY_GRID: {
            async handler (newVal) {
                if (!newVal) return
                if (!this.CAN_FINALIZE_SCHEDULE) return
                if (this.employee.notAssigned) return
                if (this.isStandardShifts) return
                if (newVal.account_id === this.employee.account_id) {
                    setTimeout(() => {
                        this.getWeekBalances({ date: this.SELECTED_DATE, accountId: newVal.account_id })
                        this.weekBalancesKey++
                    }, 1000)
                }
            },
        },
    },

    mounted () {
        if (this.EMPLOYEES_EXPANDED) {
            this.showAdditionalColumns = true
        }
    },

    methods: {
        /**
         * Certain cells will have a tooltip on hover
         * This is used to return those tooltips, more can be added later on
         * @param {Object} column
         * @returns {String}
         */
        columnTooltip (column, force) {
            let content = ''
            if (column.name === 'personnel_number' && this.employee.details.personnel_number.length >= 6) {
                content = this.employee.details.personnel_number
            } else if (force) {
                // all other non-handled columns that we force a translation tooltip
                content = this.baseTranslate(`resourceColumns.${column.name}.label`)
            }
            return {
                content,
                delay: {
                    show: 250,
                    hide: 50,
                },
            }
        },
        async employeeDetailsClick (e) {
            this.$emit('click')
            this.SET_ACTIVE_CONTEXT_MENU(null)
            this.HIDE_SNACKBAR()
            if (this.isStandardShifts) {
                const activeRows = this.activeEmployeeFrequencyRows(this.employee.account_id)
                this.SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(activeRows[0].id)
            }
            if (!e.shiftKey) {
                this.employeeFocus(this.employee)
            }
        },
        showColumn (columnName) {
            if (!this.employee[columnName]) return false
            if (Array.isArray(this.employee[columnName]) && !this.employee[columnName].length) return false
            return this.employee[columnName]
        },
    },
}
</script>
<style lang="scss" scoped>
.employee-resources {
    height: 100%;
    overflow: hidden;
    .employee-detail {
        cursor: pointer;
        display: grid;
        align-items: start;
        grid-auto-flow: column;
        height: 100%;
        &.selected {
            .visible-column > .name-column > .employee-name {
                font-weight: 600;
            }
        }
        .visible-column {
            border-right: 1px solid var(--grey-40);
            height: 100%;
            display: grid;
            &:not(.visible-name-column) {
                place-items: center;
            }
            &.visible-name-column {
                align-content: start;
            }
            .name-column {
                display: flex;
                align-items: flex-start;
                text-decoration: none;
                &:focus-visible {
                    outline: none !important;
                }
                .employee-name {
                    margin-right: auto;
                    color: var(--grey-200);
                    font-weight: 400;
                    white-space: nowrap;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    &:hover {
                        overflow: initial;
                        z-index: 10;
                    }
                }
            }
        }
    }
}
.no-link {
    text-decoration: none;
}
:deep() {
    .v-skeleton-loader__table-cell {
        align-items: flex-start;
    }
}
</style>
