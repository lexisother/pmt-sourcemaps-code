<template>
    <div class="week-cards my-3">
        <template v-if="hours">
            <VSkeletonLoader
                v-if="loading.planningData"
                type="card"
                style="height: 100px;"
            />
            <VCard
                v-else
                class="week-card"
            >
                <VCardText class="card-text">
                    <VSubheader style="height:25px">
                        {{ $t('ui.singles.hours') }}
                    </VSubheader>
                    <VDivider />
                    <VList
                        style="padding:0;"
                        dense
                    >
                        <VListItem class="card-item">
                            <VListItemContent>
                                <VListItemTitle>{{ baseTranslate('productive') }}</VListItemTitle>
                            </VListItemContent>
                            <VListItemAction style="margin:0;">
                                <strong>{{ employeeTotalProductiveHours(employee) }}</strong>
                            </VListItemAction>
                        </VListItem>
                        <VListItem class="card-item">
                            <VListItemContent>
                                <VListItemTitle>{{ baseTranslate('nonProductive') }}</VListItemTitle>
                            </VListItemContent>
                            <VListItemAction style="margin:0;">
                                <strong>{{ employeeTotalNonProductiveHours(employee) }}</strong>
                            </VListItemAction>
                        </VListItem>
                        <VDivider />
                        <VListItem style="min-height: 30px;background-color:var(--grey-20)">
                            <VListItemContent>
                                <VListItemTitle>{{ $t('ui.singles.total') }}</VListItemTitle>
                            </VListItemContent>
                            <VListItemAction style="margin:0;">
                                <strong>{{ employeeTotalHours(employee) }}</strong>
                            </VListItemAction>
                        </VListItem>
                    </VList>
                </VCardText>
            </VCard>
        </template>
        <template v-if="balances">
            <VSkeletonLoader
                v-if="loading.shifts || loading.contractData"
                type="card"
                style="height: 100px;"
            />
            <VCard
                v-else
                class="week-card"
            >
                <VCardText class="card-text">
                    <VSubheader style="height:25px">
                        {{ baseTranslateCheckHours('balanceTotals') }}
                    </VSubheader>
                    <VDivider />
                    <VList
                        style="padding:0;"
                        dense
                    >
                        <VListItem class="card-item">
                            <VListItemContent>
                                <VListItemTitle>ATV</VListItemTitle>
                            </VListItemContent>
                            <VListItemAction style="margin:0;">
                                <strong>{{ employee.atv }}</strong>
                            </VListItemAction>
                        </VListItem>
                        <VListItem class="card-item">
                            <VListItemContent>
                                <VListItemTitle>TVT</VListItemTitle>
                            </VListItemContent>
                            <VListItemAction style="margin:0;">
                                <strong>{{ employee.tvt }}</strong>
                            </VListItemAction>
                        </VListItem>
                        <VListItem class="card-item">
                            <VListItemContent>
                                <VListItemTitle>VAK</VListItemTitle>
                            </VListItemContent>
                            <VListItemAction style="margin:0;">
                                <strong>{{ employee.vak }}</strong>
                            </VListItemAction>
                        </VListItem>
                    </VList>
                </VCardText>
            </VCard>
        </template>
        <template v-if="details">
            <VSkeletonLoader
                v-if="loading.planningData || loading.contractData"
                type="card"
                style="height: 200px;"
                class="new-row"
            />
            <VCard
                v-else
                class="week-card new-row"
            >
                <VCardText class="card-text">
                    <VSubheader style="height:25px">
                        {{ baseTranslate('employeeDetails') }}
                    </VSubheader>
                    <VDivider />
                    <VList
                        style="padding:0;"
                        dense
                    >
                        <VListItem
                            v-if="!filters.hideLpgu"
                            class="card-item"
                        >
                            <VListItemContent>
                                <VListItemTitle>{{ employeeDetailsTooltipContent(employee, 'lpgu') }}</VListItemTitle>
                            </VListItemContent>
                            <VListItemAction style="margin:0;">
                                <strong>
                                    {{ employee.laborCost }}
                                </strong>
                            </VListItemAction>
                        </VListItem>
                        <VListItem
                            v-if="!filters.hideAge"
                            class="card-item"
                        >
                            <VListItemContent>
                                <VListItemTitle>{{ employeeDetailsTooltipContent(employee, 'age') }}</VListItemTitle>
                            </VListItemContent>
                            <VListItemAction style="margin:0;">
                                <strong :data-suffix="$t('ui.singles.ageYearsShort')">
                                    {{ employee.age }}
                                </strong>
                            </VListItemAction>
                        </VListItem>
                        <template v-if="employee.account_id === user.accountId || canViewOthersContractData">
                            <VListItem
                                v-if="showEmployeeWabCounter(employee)"
                                v-tooltip="employeeDetailsTooltipContent(employee, 'wab')"
                                class="card-item"
                            >
                                <VListItemContent>
                                    <VListItemTitle>WAB</VListItemTitle>
                                </VListItemContent>
                                <VListItemAction style="margin:0;">
                                    <strong class="wab-counters">
                                        <div>{{ employee.wab_counters.period_threshold }}</div>
                                        <VDivider vertical />
                                        <div>{{ employee.wab_counters.period_hours }}</div>
                                        <VDivider vertical />
                                        <div data-suffix="%">{{ employee.wab_counters.rounded_percentage }}</div>
                                    </strong>
                                </VListItemAction>
                            </VListItem>
                            <VListItem class="card-item">
                                <VListItemContent>
                                    <VListItemTitle>{{ employeeDetailsTooltipContent(employee, 'contractHours') }}</VListItemTitle>
                                </VListItemContent>
                                <VListItemAction style="margin:0;">
                                    <strong>{{ employee.contract.contractHours }} </strong>
                                </VListItemAction>
                            </VListItem>
                            <VListItem class="card-item">
                                <VListItemContent>
                                    <VListItemTitle>{{ employeeDetailsTooltipContent(employee, 'contractType') }}</VListItemTitle>
                                </VListItemContent>
                                <VListItemAction style="margin:0;">
                                    <strong>{{ employee.contract.contract_type }} </strong>
                                </VListItemAction>
                            </VListItem>
                            <VListItem
                                class="card-item"
                                :style="{ backgroundColor: employee.negativeDeviation ? 'var(--orange-20)' : ''}"
                            >
                                <VListItemContent>
                                    <VListItemTitle>{{ employeeDetailsTooltipContent(employee, 'deviation') }}</VListItemTitle>
                                </VListItemContent>
                                <VListItemAction style="margin:0;">
                                    <strong :class="{ 'deviation-error': employee.negativeDeviation }">{{ employee.deviation }} </strong>
                                </VListItemAction>
                            </VListItem>
                        </template>
                        <VListItem class="card-item">
                            <VListItemContent>
                                <VListItemTitle>{{ $t('ui.singles.departments') }}</VListItemTitle>
                            </VListItemContent>
                            <VListItemAction style="margin:0;max-width:75%;">
                                <div class="employee-departments">
                                    <template v-for="(department, departmentIndex) in employee.departments">
                                        <VChip
                                            :key="departmentIndex"
                                            color="var(--grey-40)"
                                            text-color="var(--grey-140)"
                                            label
                                            small
                                            style="padding:0 5px;"
                                        >
                                            {{ department.department_shortname }}
                                        </VChip>
                                    </template>
                                </div>
                            </VListItemAction>
                        </VListItem>
                    </VList>
                </VCardText>
            </VCard>
        </template>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'MobilePlanningEmployeeCards',
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
        hours: {
            type: Boolean,
            default: false,
        },
        balances: {
            type: Boolean,
            default: false,
        },
        details: {
            type: Boolean,
            default: false,
        },
    },
}
</script>

<style lang="scss" scoped>
@import './style/mobile-planning.scss';
:deep() {
    .v-list-item__title {
        line-height: 1.1rem !important;
    }
}
.card-item {
    min-height: 30px !important;
}
</style>
