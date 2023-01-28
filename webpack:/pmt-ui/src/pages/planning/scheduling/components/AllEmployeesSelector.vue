<template>
    <VDialog
        ref="dialog"
        :value="!!shift"
        :fullscreen="IS_MOBILE"
        scrollable
        @input="close($event)"
    >
        <AllEmployeesSelectorContent
            v-if="!!shift"
            ref="selectorContent"
            :shift="shift"
            @close="close()"
            @select-employee="rowClick($event)"
        />
    </VDialog>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'

export default {
    name: 'AllEmployeesSelector',
    components: {
        AllEmployeesSelectorContent: () => import('@/pages/planning/scheduling/components/AllEmployeesSelectorContent'),
    },
    mixins: [mixins],
    props: {
        onlySelect: {
            type: Boolean,
            default: false,
        },
        shift: {
            type: Object,
            default: null,
        },
        employee: {
            type: Object,
            default: null,
        },
    },
    computed: {
        event () {
            return this.shift
        },
    },
    methods: {
        close (val) {
            if (typeof val === 'undefined' || (typeof val === 'boolean' && !val)) {
                this.$emit('close')
            }
        },
        /**
         * Called when a table row is clicked
         * Emits a 'select-employee' event to the parent
         * @param {Object} employee
         */
        rowClick (item) {
            this.close()
            const newEmployee = item.employee
            this.$emit('select-employee', { employe: this.employee, newEmployee, shift: this.shift })
            if (!this.onlySelect) {
                this.employee.removeShift(this.shift)
                newEmployee.addShift(this.shift)
                const result = this.assignEmployeeToShift({ employe: this.employee, newEmployee, shift: this.shift })
                if (result.error) {
                    newEmployee.removeShift(this.shift)
                    this.employee.addShift(this.shift)
                } else {
                    newEmployee.updateShift(result)
                }
            }
        },
    },
}
</script>
