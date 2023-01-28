<template>
    <div
        ref="menuContainer"
        v-tooltip="!addNewRemarksFrequencyRowEnabled ? addShiftsRowTooltip : ''"
        class="add-standard-shift-row"
        :class="{'standard-single': $route.meta.standard_shifts_account_id || $route.query.account_id}"
    >
        <VMenu
            v-model="standardShiftsAdd"
            :close-on-content-click="false"
            :close-on-click="true"
            top
            nudge-right="5"
            offset-x
        >
            <template #activator="{ on, value }">
                <slot
                    name="activator"
                    :on="on"
                    :value="value"
                >
                    <PmtButton
                        primary
                        round
                        inverted
                        icon="plus"
                        icon-size="15"
                        :disabled="!addNewRemarksFrequencyRowEnabled"
                        disabled-simple
                        :active="value"
                        v-on="on"
                    />
                </slot>
            </template>
            <VList
                v-if="!directAdd.shifts && !directAdd.remarks ? !showForm : false"
                nav
                dense
            >
                <span v-tooltip="addShiftsRowTooltip">
                    <VListItem
                        add-new-shifts-frequency-row-enabled
                        @click="standardSelection = 'shifts'; showForm = true"
                    >
                        <VListItemIcon>
                            <VIcon
                                dense
                                size="15"
                                color="var(--grey-80)"
                            >
                                mdi-calendar-month
                            </VIcon>
                        </VListItemIcon>
                        <VListItemContent>
                            <VListItemTitle>{{ baseTranslate('standardShifts.titles.shifts') }}</VListItemTitle>
                        </VListItemContent>
                    </VListItem>
                </span>
                <span v-tooltip="addRemarksRowTooltip">
                    <VListItem
                        :disabled="!CAN_MANAGE_STANDARD_REMARKS || !addNewRemarksFrequencyRowEnabled"
                        @click="standardSelection = 'remarks'; showForm = true"
                    >
                        <VListItemIcon>
                            <VIcon
                                dense
                                size="15"
                                color="var(--grey-80)"
                            >
                                mdi-chat-processing-outline
                            </VIcon>
                        </VListItemIcon>
                        <VListItemContent>
                            <VListItemTitle>{{ baseTranslate('standardShifts.titles.remarks') }}</VListItemTitle>
                        </VListItemContent>
                    </VListItem>
                </span>
            </VList>
            <FrequencyForm
                v-if="directAdd.shifts || directAdd.remarks ? standardShiftsAdd : showForm"
                :employee="employee"
                add-new
                :is-remarks="standardSelection === 'remarks'"
                @close="closeForm"
            />
        </VMenu>
    </div>
</template>

<script>
import FrequencyForm from '@/pages/planning/scheduling/components/popovers/StandardShifts/FrequencyForm'
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'EmployeeDetailsStandardShiftsMenu',
    components: {
        FrequencyForm,
    },
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
        directAdd: {
            type: Object,
            default: () => ({
                shifts: false,
                remarks: false,
            }),
        },
    },
    data () {
        return {
            standardShiftsAdd: false,
            standardSelection: null,
            showForm: false,
        }
    },
    computed: {

        addNewRemarksFrequencyRowEnabled () {
            const hasNewRow = this.employee.frequencyRowsRemarks.filter(row => !row.remark.standard_remark_id).length
            return this.CAN_MANAGE_STANDARD_REMARKS && !hasNewRow
        },

        addShiftsRowTooltip () {
            if (!this.CAN_MANAGE_STANDARD_SCHEDULES) {
                return this.baseTranslate('standardShifts.tooltips.noPermissionToEditStandardShifts')
            }
            return ''
        },
        addRemarksRowTooltip () {
            if (!this.addNewRemarksFrequencyRowEnabled) {
                return this.baseTranslate('standardShifts.tooltips.newRowAlreadyExists', { employeeName: this.employee.name })
            }
            return ''
        },
    },
    mounted () {
        if (this.directAdd.shifts || this.directAdd.remarks) {
            if (this.directAdd.shifts) {
                this.standardSelection = 'shifts'
            } else {
                this.standardSelection = 'remarks'
            }
        }
    },
    methods: {
        closeForm () {
            if (this.directAdd.shifts || this.directAdd.remarks) {
                if (this.directAdd.shifts) {
                    this.standardSelection = 'shifts'
                } else {
                    this.standardSelection = 'remarks'
                }
            }
            this.showForm = false
            this.standardShiftsAdd = false
        },
    },
}
</script>

<style lang="scss" scoped>
.add-standard-shift-row {
    display: inline-block;
    &.standard-single {
        display: inline-block;
        position: relative;
        bottom: auto;
        right: auto;
    }
    &:not(.standard-single) {
        position: absolute;
        bottom: 0;
        right: 0;
    }
}
:deep() {
    .v-list-item {
        margin-bottom: 0 !important;
        border-radius: 0 !important;
        min-height: 30px !important;
        .v-list-item__icon {
            margin-top: 4px;
            margin-bottom: 4px;
        }
    }
}
</style>
