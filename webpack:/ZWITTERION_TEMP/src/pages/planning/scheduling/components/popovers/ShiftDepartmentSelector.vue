<template>
    <ShiftFormDropdown
        ref="shiftDepartmentSelector"
        type="department"
        :options="departmentOptions"
        :placeholder="placeholder"
        :selected="selectedDepartment"
        :disabled="disabled"
        v-bind="$attrs"
        :hide-label="hideLabel"
        @item-selected="$emit('item-selected', $event)"
    >
        <template #activator="{ on, value, selected }">
            <slot
                name="activator"
                :on="on"
                :value="value"
                :selected="selected"
            />
        </template>
        <template #selected-text>
            <slot name="selected-text" />
        </template>>
    </ShiftFormDropdown>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import ShiftFormDropdown from '@/pages/planning/scheduling/components/popovers/ShiftFormDropdown'
export default {
    name: 'ShiftDepartmentSelector',
    components: {
        ShiftFormDropdown,
    },
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            required: true,
        },
        selectedDepartment: {
            type: Object,
            default: () => ({}),
        },
        selectedStore: {
            type: Object,
            default: () => ({}),
        },
        placeholder: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        hideLabel: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        /**
         * List of departments for the departments select component
         * @return {Array}
         */
        departmentOptions () {
            return this.departmentSelectOptions({
                selectedDepartment: this.selectedDepartment,
                selectedStore: this.selectedStore,
                shift: this.shift,
            })
        },
    },
    methods: {
        focus () {
            this.$refs.shiftDepartmentSelector.focus()
        },
    },
}
</script>
