<template>
    <VList
        v-if="Object.keys(shift).length"
        ref="suggestions"
        dense
    >
        <template v-for="(suggestedEmployee, employeeIndex) in suggestedEmployees">
            <VListItem
                :id="`account-${suggestedEmployee.account_id}-suggestion`"
                ref="topFive"
                :key="employeeIndex"
                cy_id="assign-suggested-employee-to-shift"
                class="employee-item"
                :class="{'autoloaded': autoLoadEmployees}"
                @click="employeeSuggestionSelect(suggestedEmployee)"
            >
                <VListItemContent>
                    <VListItemTitle>
                        <span class="employee-name">{{ suggestedEmployee.name }}</span>
                    </VListItemTitle>
                    <VListItemSubtitle>
                        <EmployeeDetailsSmall
                            v-if="!employee.notAssigned && !suggestedEmployee.lentIn"
                            :employee="suggestedEmployee"
                            tooltip-delay="750"
                        />
                    </VListItemSubtitle>
                    <VListItemSubtitle class="details-info">
                        <NotEmployeeDepartment
                            :shift="shift"
                            :employee="suggestedEmployee"
                        />
                    </VListItemSubtitle>
                    <SuggestedEmployeeAvailability
                        :employee="suggestedEmployee"
                        :shift="shift"
                    />
                </VListItemContent>
            </VListItem>
        </template>
        <VListItem
            ref="otherEmployees"
            :disabled="!SHIFT_PLANNABLE_EMPLOYEES.length"
            cy_id="assign-other-employees-to-shift"
            :class="{'no-suggestion': !SHIFT_PLANNABLE_EMPLOYEES.length}"
            @click="openAllEmployeesSelector"
        >
            <VListItemContent>
                <VListItemTitle v-if="!SHIFT_PLANNABLE_EMPLOYEES.length">
                    {{ baseTranslate('contextMenu.noSuggestionsForShift') }}
                </VListItemTitle>
                <VListItemSubtitle v-else>
                    {{ $t('pages.scheduling.contextMenu.otherEmployees') }}
                </VListItemSubtitle>
            </VListItemContent>
        </VListItem>
    </VList>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'QuickEmployeeSuggestions',
    components: {
        EmployeeDetailsSmall: () => import(/* webpackChunkName: "scheduling" */'@/pages/planning/scheduling/components/EmployeeDetailsSmall'),
        NotEmployeeDepartment: () => import(/* webpackChunkName: "scheduling" */'@/pages/planning/scheduling/components/NotEmployeeDepartment'),
        SuggestedEmployeeAvailability: () => import(/* webpackChunkName: "scheduling" */'@/pages/planning/scheduling/components/SuggestedEmployeeAvailability'),
    },
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            default: () => ({}),
        },
        employee: {
            type: Object,
            default: () => ({}),
        },
        autoLoadEmployees: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        /**
         * A list of employees suggestions based on certain criterias
         * (a story will folow to add business logic criteria)
         * @returns {Array}
         */
        suggestedEmployees () {
            const employeeSuggestions = this.shiftPlannableEmployees(this.shift).filter(e => {
                /**
                    In the top five suggestions we should
                    only show employees that are fully
                    available or employee that do not
                    have any overlaps with non-availability,
                    rdo or substitute requests
                 */
                return e.isFullyAvailableForShift(this.shift)
            }).slice(0, 5)
            if (employeeSuggestions.length) {
                // return employees sorted on wage per hour ascending
                const lpgu = (employee) => {
                    return employee.details.labor_cost
                }
                return employeeSuggestions.sort((a, b) => lpgu(a) === lpgu(b) ? 0 : lpgu(a) < lpgu(b) ? -1 : 1) || []
            }
            return employeeSuggestions
        },
    },
    mounted () {
        if (!this.isCheckHours && this.autoLoadEmployees) {
            this.getPlannableEmployees(this.shift)
        }
    },
    methods: {
        /**
         * Called when an employee is selected from the suggestions list
         * Emits an event to the parent
         * @param {Object} employee
         */
        employeeSuggestionSelect (suggestedEmployee) {
            this.$emit('select-employee', { employee: this.employee, newEmployee: suggestedEmployee, shift: this.shift })
        },

        openAllEmployeesSelector () {
            if (!this.SHIFT_PLANNABLE_EMPLOYEES.length) return
            this.$emit('another-employee', this.shift)
        },
    },
}
</script>

<style lang="scss" scoped>
.employee-name {
    font-weight: 600;
    color: var(--grey-180);
}
.employee-details {
    color: var(--grey-100);
}
:deep() {
    .v-list-item__content {
        padding: 5px 0 !important;
    }
    .v-list-item {
        &.no-suggestion, &.employee-item:not(.autoloaded) {
            margin-bottom: 0 !important;
        }
        &.employee-item {
            border-bottom: 1px solid var(--grey-20);
        }
        .small-details, .details-info {
            opacity: .7;
        }
        .small-details {
            font-size: inherit !important;
            padding-left: 0 !important;
            line-height: 1.2rem;
            height: 1.2rem;
            &:hover {
                * {
                    font-weight: normal !important;
                    text-decoration: none !important;
                }
            }
        }
        &:hover {
            .small-details, .details-info {
                opacity: 1;
            }
        }
    }
}
</style>
