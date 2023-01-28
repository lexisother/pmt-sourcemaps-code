<template>
    <ShiftFormDropdown
        ref="bookableHour"
        type="bookableHour"
        :searchable="options.length > 10"
        :options="options"
        :placeholder="baseTranslate('placeholders.selectBookableHourType')"
        :selected="selectedBookableHourType"
        :show-clear="showClear"
        :disabled="disabled"
        v-bind="$attrs"
        :hide-label="hideLabel"
        @clear="$emit('clear')"
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
    name: 'ShiftBookableHourTypeSelector',
    components: {
        ShiftFormDropdown,
    },
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            required: true,
        },
        selectedBookableHourType: {
            type: Object,
            default: () => ({}),
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        hideLabel: {
            type: Boolean,
            default: false,
        },
        showClear: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        options () {
            return this.bookableHourTypesOptions(this.selectedBookableHourType)
        },
    },
}
</script>
