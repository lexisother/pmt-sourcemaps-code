<template>
    <div class="mt-2">
        <DefinitionList
            ref="definitionList"
            :title="title"
            :details="shiftDetails"
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'ReadOnlyShiftDetails',
    mixins: [mixins],
    props: {
        selectedDepartment: {
            type: Object,
            required: true,
        },
        selectedStore: {
            type: Object,
            default: () => (undefined),
        },
        bookableHour: {
            type: Object,
            default: () => (undefined),
        },
        bookableHourForeignType: {
            type: Object,
            default: () => (undefined),
        },
        title: {
            type: String,
            default: '',
        },
        shift: {
            type: Object,
            default: () => ({}),
        },
        showDuration: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        /**
         * Gets the details that should be displayed in the read-only menu
         * @returns {Array}
         */
        shiftDetails () {
            const result = []
            if (this.showDuration) {
                result.push({
                    title: this.$t('pages.scheduling.shiftPopover.duration'),
                    description: this.shift.duration,
                    ref: 'time',
                })
            } else {
                result.push({
                    title: this.$t('pages.scheduling.shiftPopover.nonEditableInfo.time'),
                    description: `${this.$moment(this.shift.start_datetime).shortTime()} - ${this.$moment(this.shift.end_datetime).shortTime()}`,
                    extraDescription: this.shift.breaks && this.shift.breaks.length ? this.shift.breaks[0].duration : !this.shift.nonProductive ? '00:00' : '',
                    ref: 'time',
                })
            }
            if (this.selectedStore && Object.keys(this.selectedStore).length) {
                result.push({
                    title: this.$t('ui.singles.store'),
                    description: `${this.selectedStore.store_name} ${this.selectedStore.retail_store_number}`,
                    ref: 'storeName',
                })
            }
            if (this.CAN_READ_INDIRECT_HOURS_OR_TASKS) {
                this.shift.indirect_hours.forEach(indirectHour => {
                    const taskType = this.indirectTaskTypes.find(tt => tt.id === indirectHour.indirect_task_id)
                    result.push({
                        title: taskType.description,
                        description: indirectHour.duration,
                        ref: 'indirectTask',
                    })
                })
            }
            if (!this.bookableHour) {
                result.push({
                    title: this.$t('ui.singles.department'),
                    description: this.selectedDepartment.department_name,
                    ref: 'departmentName',
                })
            }
            if (this.shift.remark) {
                result.push({
                    title: this.$t('ui.singles.remark'),
                    description: this.shift.remark,
                    ref: 'remark',
                    tag: 'i',
                })
            }
            if (this.bookableHour || this.shift.nonProductive) {
                result.push({
                    title: this.$t('pages.scheduling.shiftPopover.nonProductive.bookableHourType'),
                    description: this.bookableHour ? this.bookableHour.local_description : this.shift.type,
                    ref: 'bookableHour',
                })
                result.push({
                    title: this.$t('pages.scheduling.shiftPopover.nonProductive.bookableHourTypeForeignOption'),
                    description: this.bookableHourForeignType ? `${this.bookableHourForeignType.foreign_type} - ${this.bookableHourForeignType.foreign_description}` : this.shift.foreign_type,
                    ref: 'bookableHourForeign',
                })
            }
            return result
        },
    },
}
</script>
