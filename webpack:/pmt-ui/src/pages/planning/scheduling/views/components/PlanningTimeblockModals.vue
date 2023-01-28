<template>
    <div>
        <component
            :is="IS_MOBILE ? 'VDialog' : 'VMenu'"
            v-if="showShiftPopover"
            :key="showShiftPopover"
            :value="showShiftPopover"
            :fullscreen="PAGE_WIDTH < $cfg.screenSize.small"
            :close-on-content-click="false"
            :close-on-click="!savingShiftId"
            :min-width="shiftPopoverWidth"
            :max-width="shiftPopoverWidth"
            :position-x="shiftPopoverPosition.x"
            :position-y="shiftPopoverPosition.y"
            offset-x
            @input="closeShiftForm($event)"
        >
            <ShiftPopover
                v-if="showShiftPopover"
                ref="shiftPopover"
                :shift="shift"
                :start-date="SELECTED_DATE.startOf('isoWeek')"
                :read-only="!canEditShiftBookableHourType(shift)"
                :employee="employee"
                :has-expanded-availability="showAvailability"
                @update="$emit('update', $event)"
                @break-blur="$emit('break-blur', $event)"
                @close="closeShiftForm(false)"
                @cancel="closeShiftForm(false)"
                @toggle:availability="$emit('toggle:availability', employee)"
            />
        </component>
        <ShiftConfirmationPopover
            v-if="shiftConfirmation.show"
            ref="shiftConfirmation"
            :show="shiftConfirmation.show"
            :text="shiftConfirmation.text"
            :disable-override-confirm="!CAN_MANAGE_SUBSTITUTE_REQUESTS"
            @confirm="$emit('confirm-overwrite', { rejectSubstitute: true })"
            @hide="$emit('cancel-overwrite')"
            @cancel="$emit('cancel-overwrite')"
        />
        <ShiftTooltip
            v-if="hovered && !showShiftPopover"
            ref="shiftTooltip"
            :shift="shift"
            :employee="employee"
            :event="hovered"
            :show-for-shift="true"
        />
        <ContextMenu
            v-if="showContextMenu"
            ref="schedulerContextMenu"
            :shift="shift"
            :employee="employee"
            :event="showContextMenu"
            type="shift"
            @swap-employee="swapEmployee($event)"
            @select-employee="swapEmployee($event)"
            @another-employee="selectAnotherEmployee($event)"
            @edit="contextMenuEdit($event)"
            @copy="copyShift(shift)"
            @edit-indirect-tasks="editIndirectTasks($event)"
            @delete="deleteShiftBlock(shift, employee)"
            @remove-employee="removeEmployeeFromShift()"
            @assess-substitute-request="contextMenuEdit({ ...$event, assessSubstituteRequest: true })"
            @reject-substitute-request="rejectSubstituteRequest($event)"
            @close="closeContextMenu()"
        />
        <VDialog
            v-if="showAssessSubstituteRequests"
            ref="dialog"
            :value="true"
            :fullscreen="IS_MOBILE"
            scrollable
            @input="$emit('toggle:assess-substitute-requests', $event)"
        >
            <AssessSubstituteRequestLayout
                :asses-substitute-request="{ shift, employee }"
                :employee="employee"
                @close="$emit('toggle:assess-substitute-requests', false)"
            />
        </VDialog>
        <AllEmployeesSelector
            v-if="showSwapEmployeeMenu"
            ref="shiftEmployeeSelector"
            :shift="shift"
            :employee="employee"
            @close="$emit('toggle:swap-employee-menu', false)"
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import ShiftConfirmationPopover from '@/pages/planning/scheduling/components/popovers/ShiftConfirmationPopover'
import ShiftPopover from '@/pages/planning/scheduling/components/popovers/ShiftPopover.vue'
import ShiftTooltip from '@/pages/planning/scheduling/components/popovers/ShiftTooltip.vue'
import ContextMenu from '@/pages/planning/scheduling/components/ContextMenu.vue'
import AssessSubstituteRequestLayout from '@/pages/planning/scheduling/components/popovers/Assessments/AssessSubstituteRequestLayout'
import AllEmployeesSelector from '@/pages/planning/scheduling/components/AllEmployeesSelector'
import htmlHelper from '../../../../../libraries/htmlHelper'
export default {
    name: 'PlanningTimeblockModals',
    components: {
        ShiftConfirmationPopover,
        ShiftPopover,
        ShiftTooltip,
        ContextMenu,
        AssessSubstituteRequestLayout,
        AllEmployeesSelector,
    },
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            required: true,
        },
        employee: {
            type: Object,
            required: true,
        },
        shiftConfirmation: {
            type: Object,
            default: () => ({}),
        },
        showContextMenu: {
            type: MouseEvent,
            default: null,
        },
        hovered: {
            type: [Boolean, MouseEvent],
            default: false,
        },
        showMenu: Boolean,
        showAvailability: Boolean,
        showSwapEmployeeMenu: Boolean,
        showAssessSubstituteRequests: Boolean,
    },
    data () {
        return {
            shiftPopoverPosition: {},
            showShiftPopover: false,
        }
    },
    computed: {
        shiftPopoverWidth () {
            if (this.shift.readOnly) return 345
            if (this.shift.nonProductive) {
                if (!this.isDayView && this.shift.isNew) {
                    return 370
                }
                return 300
            }
            return 435
        },
    },
    watch: {
        showMenu: {
            async handler (newVal) {
                if (newVal) {
                    await this.$nextTick()
                    const element = await htmlHelper.waitForElement(`[data-shift-guid="${this.shift.guid}"]`)
                    this.shiftPopoverPosition = this.getShiftPopoverPosition({ element, shift: this.shift })
                    this.showShiftPopover = true
                } else {
                    this.showShiftPopover = false
                }
            },
        },
    },
    methods: {
        /**
         * Called by the Context Menu => change employee option
         */
        async swapEmployee ({ employee, newEmployee, shift }) {
            this.$emit('toggle:context-menu', null)
            employee.removeShift(shift)
            newEmployee.addShift(shift)
            const result = await this.assignEmployeeToShift({ employee, newEmployee, shift })
            if (result.error) {
                newEmployee.removeShift(shift)
                employee.addShift(shift)
            } else {
                newEmployee.updateShift(result)
            }
        },

        selectAnotherEmployee () {
            this.$emit('toggle:swap-employee-menu', true)
            this.$emit('toggle:context-menu', null)
        },

        async contextMenuEdit ({ assessSubstituteRequest }) {
            if (assessSubstituteRequest) {
                this.$emit('toggle:assess-substitute-requests', true)
            } else {
                this.$emit('toggle:context-menu-edit', { indirectTasks: false })
            }
        },

        async editIndirectTasks () {
            this.$emit('toggle:context-menu-edit', { indirectTasks: true })
        },

        rejectSubstituteRequest ({ shift }) {
            this.$emit('toggle:context-menu', null)
            const request = this.shiftPendingSubstituteRequest(shift)
            if (!request) return
            this.saveSubstituteRequest({
                status: 'rejected',
                request,
                shift,
                rejecting: true,
                employee: this.employee,
            })
        },

        async closeShiftForm (val) {
            this.$emit('toggle:shift-form', val)
        },

        closeContextMenu () {
            this.$emit('toggle:context-menu', null)
        },

        async removeEmployeeFromShift () {
            const notAssignedEmployee = this.weekPlanningData.not_assigned
            await this.employee.removeShift(this.shift)
            notAssignedEmployee.addShift({ ...this.shift, account_id: 'not_assigned', notAssigned: true })
            const result = this.removeEmployeeFromAssignedShift({ shift: this.shift })
            if (result.error) {
                await notAssignedEmployee.removeShift(this.shift)
                this.employee.addShift(this.shift)
            } else {
                notAssignedEmployee.updateShift({ ...result, account_id: 'not_assigned', notAssigned: true })
            }
        },
    },
}
</script>
