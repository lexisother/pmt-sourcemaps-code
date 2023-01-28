<template>
    <div
        v-click-outside="onClickOutside"
        class="crud-input"
        :class="{ active }"
        @click="click"
    >
        <slot v-if="!active" />
        <CrudInputActions
            v-if="active & !disabled"
            ref="crudInputActions"
            :full-object="fullObject"
            :identifier="identifier"
            :type="type"
            :items="items"
            :value-identifier="valueIdentifier"
            :label-identifier="labelIdentifier"
            :multiselect="multiselect"
            action-buttons
            :dense="dense"
            :required="required"
            :max-length="maxLength"
            @save="save($event)"
            @cancel="active = false"
        />
    </div>
</template>

<script>
export default {
    components: {
        CrudInputActions: () => import('@/components/ui/form/CrudInputActions'),
    },
    props: {
        fullObject: {
            type: Object,
            required: true,
        },
        identifier: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: 'text',
        },
        maxLength: {
            type: Number,
            default: null,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        items: {
            type: Array,
            default: () => [],
        },
        valueIdentifier: {
            type: String,
            default: 'value',
        },
        labelIdentifier: {
            type: String,
            default: 'label',
        },
        multiselect: {
            type: Boolean,
            default: false,
        },
        dense: {
            type: Boolean,
            default: false,
        },
        required: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            active: this.isActive,
        }
    },
    methods: {
        onClickOutside () {
            this.active = false
        },
        click () {
            if (!this.disabled) {
                this.active = true
            }
        },
        save (event) {
            this.$emit('save', event)
            this.active = false
        },
    },
}
</script>

<style lang="scss" scoped>
    .crud-input {
        min-width: 80px;
        min-height: 18px;
        border-radius: 2px;
        cursor: pointer;
    }
</style>
