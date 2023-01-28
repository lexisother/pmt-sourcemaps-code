<template>
    <div
        v-if="!employee.notAssigned"
        ref="employeeTotals"
        :class="{ 'totals-container': true, 'day-view': isDayView, compact: settings.compactView }"
        @click="totalsClick"
    >
        <div
            v-if="isDayView"
            ref="nonProductiveContainer"
            class="non-productive-cell"
            @mouseenter="hovered = true"
            @mouseleave="hovered = false"
        >
            <PlanningTimeBlock
                v-if="nonProductiveShifts.length"
                :shift="nonProductiveShifts[0]"
                :employee="employee"
                :is-row-selected="isRowSelected"
                :row-index="rowIndex"
                :is-saving="savingShiftId === nonProductiveShifts[0].guid"
                @mouseleave="$emit('mouseleave:shift', $event)"
                @mouseenter="$emit('mouseenter:shift', $event)"
                @contextmenu="$emit('contextmenu:shift', $event)"
                @active-shift="$emit('active-shift', $event)"
            />
            <template v-if="nonProductiveShifts.length">
                <div class="details">
                    <VMenu
                        ref="settingsMenu"
                        v-model="nonProductiveMenu"
                        min-width="150"
                        bottom
                        nudge-bottom="5"
                        :close-on-content-click="false"
                    >
                        <template #activator="{ on }">
                            <PmtButton
                                ref="showAll"
                                class="others"
                                primary
                                inverted
                                mini
                                no-margin
                                v-on="on"
                            >
                                <span v-if="nonProductiveShifts.length > 1">
                                    + {{ nonProductiveShifts.length - 1 }} {{ $t('ui.singles.more') }}
                                </span>
                                <span v-else-if="nonProductiveShifts.length === 1 && !nonProductiveShifts[0].isNew">
                                    {{ $t('ui.singles.more') }}
                                </span>
                            </PmtButton>
                        </template>
                        <div
                            ref="allNonProductives"
                            style="padding: 15px"
                        >
                            <template v-for="(instance, index) in nonProductiveShifts">
                                <PlanningTimeBlock
                                    :key="index"
                                    :shift="instance"
                                    :employee="employee"
                                    :is-row-selected="isRowSelected"
                                    :row-index="rowIndex"
                                    :is-saving="savingShiftId === instance.guid"
                                    @update="employee.updateShift($event)"
                                    @mouseleave="$emit('mouseleave:shift', $event)"
                                    @mouseenter="$emit('mouseenter:shift', $event)"
                                    @contextmenu="$emit('contextmenu:shift', $event)"
                                    @active-shift="$emit('active-shift', $event)"
                                />
                            </template>
                            <div
                                v-if="showAddNew"
                                ref="addNew"
                            >
                                <PmtButton
                                    ref="addNewButton"
                                    class="others"
                                    primary
                                    inverted
                                    medium
                                    no-margin
                                    icon="plus"
                                    icon-size="15"
                                    @click="addNew"
                                >
                                    {{ $t('pages.scheduling.shortcutsMenu.addNew') }}
                                </PmtButton>
                            </div>
                        </div>
                    </VMenu>
                </div>
            </template>
            <template v-if="showAddNew && !nonProductiveShifts.length">
                <div
                    ref="addNewButton"
                    tabindex="0"
                    class="add-new"
                    @click="addNew"
                    @keyup.enter="addNew"
                    @keyup.space="addNew"
                >
                    <span>+ <span v-if="!IS_MOBILE">{{ baseTranslate('shortcutsMenu.addNew') }}</span></span>
                </div>
            </template>
        </div>
        <div
            ref="plannedDayHours"
            :key="totalsKey"
            class="total-hours"
        >
            <div
                class="employee-total"
                :class="{'lent-in': employee.lentIn}"
            >
                <div
                    v-if="!employee.lentIn"
                    v-tooltip.left="baseTranslate('shiftPopover.productiveHours')"
                    class="total"
                >
                    <span class="total-tag">P:</span>
                    <span class="hours">{{ plannedMinutes().productive }}</span>
                </div>
                <div
                    v-if="!employee.lentIn"
                    v-tooltip.left="baseTranslate('shiftPopover.nonProductiveHours')"
                    class="total"
                >
                    <span class="total-tag">NP:</span>
                    <span class="hours">{{ plannedMinutes().nonProductive }}</span>
                </div>
                <div
                    v-tooltip.left="$t('ui.singles.total')"
                    class="total"
                >
                    <span class="total-tag">T:</span>
                    <span class="hours"> {{ plannedMinutes().total }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import PlanningTimeBlock from '@/pages/planning/scheduling/views/components/PlanningTimeBlock'
export default {
    name: 'EmployeeTotals',
    components: {
        PlanningTimeBlock,
    },
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
        rowIndex: {
            type: [Number, String],
            required: true,
        },
        frequencyRow: {
            type: Object,
            default: () => (undefined),
        },
        planningStandardShifts: {
            type: Boolean,
            default: false,
        },
        activeShift: {
            type: Object,
            default: null,
        },
        isRowSelected: Boolean,
    },
    data () {
        return {
            hovered: true,
            nonProductiveMenu: false,
            totalsKey: 0,
        }
    },
    computed: {
        isStandard () {
            return this.isStandardShifts || this.planningStandardShifts
        },
        nonProductiveShifts () {
            return this.employee.allShifts(this.DEPARTMENT_STATUS_HISTORY_ID).filter(shift => {
                return shift.nonProductive && this.$moment(shift.start_datetime).apiFormat() === this.SELECTED_DATE.apiFormat()
            })
        },
        showAddNew () {
            if (this.SHOW_SENT_SCHEDULES) return false
            if (this.weekIsClosed) return false
            return this.CAN_PLAN_OTHERS &&
                this.CAN_EDIT_NON_PRODUCTIVE &&
                !this.employee.readOnly &&
                !this.employee.notAssigned &&
                !this.employee.lentIn
        },
    },

    watch: {
        layoutScroll: {
            handler () {
                this.nonProductiveMenu = false
            },
        },
        employee: {
            handler () {
                this.totalsKey += 1
            },
            deep: true,
        },
    },

    methods: {
        addNew (debounce = 0) {
            setTimeout(() => {
                this.totalsClick()
                this.$emit('add-new', { from: this.SELECTED_DATE.setTime('00:00'), to: this.SELECTED_DATE.setTime('00:00'), nonProductiveSimple: true })
            }, debounce)
        },
        totalsClick () {
            if (!this.weekIsClosed) {
                this.HIDE_SNACKBAR()
            }
        },
        dayTotals () {
            const productive = this.employee.plannedProductiveMinutesDay(this.SELECTED_DATE) || 0
            const nonProductive = this.employee.plannedNonProductiveMinutesDay(this.SELECTED_DATE) || 0
            const duration = (minutes) => {
                return this.$moment.duration({ minutes }).format('HH:mm')
            }
            return {
                productive: duration(productive),
                nonProductive: duration(nonProductive),
                total: duration(productive + nonProductive),
            }
        },
        weekTotals () {
            const productive = this.employeeTotalProductiveHours(this.employee, !!this.frequencyRow, this.frequencyRow)
            const nonProductive = this.employeeTotalNonProductiveHours(this.employee, !!this.frequencyRow, this.frequencyRow)
            return {
                productive,
                nonProductive,
                total: this.employeeTotalHours(this.employee, !!this.frequencyRow, this.frequencyRow),
            }
        },

        plannedMinutes () {
            if (this.isDayView) return this.dayTotals()
            return this.weekTotals()
        },
    },
}
</script>

<style lang="scss" scoped>
@import '../../scheduling/views/components/PlanningTimeBlock.scss';
.totals-container {
    display: grid;
    height: 100%;
    font-size: .9rem;
    &:not(.day-view) {
        padding-inline: 5px;
    }
    &.day-view {
        grid-template-columns: 1fr 65px;
    }
    .non-productive-cell {
        border-right: 1px solid var(--grey-40);
    }
    .total-hours {
        display: grid;
        align-content: center;
        .employee-total {
            display: grid;
            grid-template-rows: repeat(3, 20px);
            align-items: center;
            font-size: .9rem;

            &.lent-in {
                grid-template-rows: 1fr;
            }

            .total {
                display: flex;
                justify-content: flex-end;
                gap: 5px;
            }

            .total-tag {
                color: var(--grey-80);
            }
        }
    }
    &.compact {
        .total-hours {
            .employee-total {
                grid-template-rows: repeat(3, 15px);
                &.lent-in {
                    grid-template-rows: 1fr;
                }
            }
        }
    }
}

.details {
    position: absolute;
    bottom: 1px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    .others {
        margin-right: 7px;
    }
    .add {
        float: right;
    }
}
:deep() .relative-non-productive {
    position: relative !important;
    top: inherit !important;
    display: list-item;
    margin: 7px;
    margin-left: -3px;
}
.non-productive-cell {
    .add-new {
        display: none;
        width: 100%;
        height: 100%;
        text-align: center;
        align-items: center;
        cursor: pointer;
        overflow: hidden;
        background-color: var(--grey-20);
        transition: all .2s ease-in-out;
        &:focus-visible {
            opacity: 1;
            outline: none;
        }
    }
    &:hover {
        .add-new {
            display: flex;
            place-content: center;
        }
    }
}
</style>
