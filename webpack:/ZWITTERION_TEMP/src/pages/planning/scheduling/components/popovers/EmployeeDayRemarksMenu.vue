<template>
    <VMenu
        ref="editRemarkMenu"
        v-model="menu"
        max-width="500"
        min-width="500"
        origin="top left"
        transition="scale-transition"
        nudge-right="35"
        :close-on-content-click="false"
        :close-on-click="true"
    >
        <template #activator="{ value }">
            <VBadge
                class="count-badge"
                overlap
                :content="remarksCount"
                :value="remarksCount > 0"
            >
                <PmtButton
                    id="employee-day-remark-button"
                    ref="employeeDayRemarkButton"
                    v-ripple
                    v-tooltip="remarkTooltip"
                    cy_id="employee-day-remark-button"
                    primary
                    inverted
                    medium
                    round
                    :active="value || hasRemarksSelected"
                    class="grey-100"
                    icon="chat-processing-outline"
                    icon-size="16"
                    tab-index="0"
                    no-margin
                    @click="toggleMenu"
                    @keyup.enter="toggleMenu"
                    @keyup.space="toggleMenu"
                />
            </VBadge>
        </template>
        <EditCreateWeekRemarks
            v-if="menu"
            ref="editCreateWeekRemarks"
            :key="menu"
            :employee="employee"
            @close="closeModal"
        />
    </VMenu>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import EditCreateWeekRemarks from '@/pages/planning/scheduling/components/popovers/EditCreateWeekRemarks'
export default {
    name: 'EmployeeRemarksMenu',
    components: { EditCreateWeekRemarks },
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
            menu: false,
        }
    },
    computed: {
        dayRemark () {
            return this.employee.dayRemark(this.SELECTED_DATE, this.DEPARTMENT_STATUS_HISTORY_ID)
        },
        showRemarkIcon () {
            if (this.isStandardShifts) return false
            if (this.isDayView) return this.dayRemark && this.dayRemark.remark
            return this.remarksCount > 0
        },
        remarkTooltip () {
            if (this.isStandardShifts) return false
            let content = this.baseTranslate('tooltips.weeklyRemarks')
            if (this.isDayView) {
                content = this.dayRemark?.remark
            }
            return {
                content,
                delay: {
                    show: 250,
                    hide: 50,
                },
            }
        },
        remarksCount () {
            return this.employee
                .allRemarks(this.DEPARTMENT_STATUS_HISTORY_ID)
                .filter(r => r.remark.replace(/^\s+|\s+$/gm, '')).length
        },
        hasRemarksSelected () {
            const hasGlobalSetting = this.settings.alwaysShowAllRemarks || (this.isRowSelected && this.settings.alwaysShowRemarksWeekViewEmployeeClick)
            return hasGlobalSetting || this.employee.getDisplay('remarks')
        },
    },
    watch: {
        scroll: {
            handler () {
                if (this.menu) {
                    this.closeModal()
                }
            },
        },
    },
    mounted () {
        document.addEventListener('keydown', this.keyListeners)
    },
    destroyed () {
        document.removeEventListener('keydown', this.keyListeners)
    },
    methods: {
        keyListeners (e) {
            if (e.code === 'Escape') {
                if (this.menu) {
                    this.closeModal()
                }
            }
        },
        toggleMenu (e) {
            // on day view open the popover form
            // on week view open extra remarks row
            if (this.isDayView) {
                this.menu = !this.menu
            }
            this.$emit('click', e)
        },
        closeModal () {
            this.menu = false
            if (this.isRowSelected) {
                this.employeeFocus(this.employee)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
:deep() .v-badge__wrapper {
    span {
        inset: auto auto calc(100% - 14px) calc(100% - 14px) !important;
        height: 13px;
        min-width: 14px;
        line-height: 5px;
        font-size: 10px;
        padding: 4px;
        pointer-events: inherit;
    }
}
</style>
