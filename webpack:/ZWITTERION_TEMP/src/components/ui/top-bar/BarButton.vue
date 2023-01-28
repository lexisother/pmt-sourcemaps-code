<template>
    <div
        v-tooltip="tooltip"
        class="bar-button"
    >
        <slot name="label" />
        <component
            :is="dialog ? 'VDialog' : 'VMenu'"
            v-model="dropdown"
            bottom
            offset-y
            :min-width="Number(dropdownWidth)"
            :max-width="Number(dropdownWidth)"
            :min-height="Number(dropdownHeight)"
            :max-height="Number(dropdownHeight)"
            :origin="menuOrigin"
            :transition="menuTransition"
            :nudge-width="Number(dropdownWidth)"
            :close-on-content-click="closeOnContentClick"
            :close-on-click="closeOnClick"
            :fullscreen="fullscreen"
        >
            <template #activator="{ on, value }">
                <slot
                    name="activator"
                    :on="on"
                >
                    <VBadge
                        :color="badgeColor"
                        :class="{'top-bar-button-count-badge': showCountBadge > 0}"
                        :overlap="showCountBadge > 0"
                        :dot="!showCountBadge && showBadge"
                        :inline="!showCountBadge && showBadge"
                        :value="showBadge"
                        :content="showCountBadge"
                    >
                        <PmtButton
                            :id="id"
                            ref="actualBarButton"
                            v-ripple
                            v-tooltip="{content: badgeTooltipText, placement: 'bottom', offset: 10}"
                            v-bind="$props"
                            :cy_id="id"
                            :active="value || active"
                            :round="round"
                            :loading="loading"
                            :style="activatorStyle"
                            :disabled="disabled"
                            :disabled-simple="disabledSimple"
                            v-on="$slots.dropdown ? on : false"
                            @click="click"
                        >
                            <span v-if="!loading && text">{{ text }}</span>
                        </PmtButton>
                    </VBadge>
                </slot>
            </template>
            <template v-if="alwaysShowDropdown || dropdown">
                <slot
                    name="dropdown"
                    :close="close"
                    :value="dropdown"
                />
            </template>
        </component>
    </div>
</template>

<script>
export default {
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        disabledSimple: {
            type: Boolean,
            default: true,
        },
        dropdownWidth: {
            type: [Number, String],
            default: 200,
        },
        dropdownHeight: {
            type: [Number, String],
            default: 550,
        },
        medium: {
            type: Boolean,
            default: false,
        },
        primary: {
            type: Boolean,
            default: true,
        },
        secondary: {
            type: Boolean,
            default: false,
        },
        warning: {
            type: Boolean,
            default: false,
        },
        danger: {
            type: Boolean,
            default: false,
        },
        success: {
            type: Boolean,
            default: false,
        },
        inverted: {
            type: Boolean,
            default: true,
        },
        outline: {
            type: Boolean,
            default: true,
        },
        defaultGrey: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: false,
        },
        text: {
            type: [String, Boolean],
            default: '',
        },
        icon: {
            type: String,
            default: undefined,
        },
        iconSize: {
            type: [String, Number],
            default: 20,
        },
        round: Boolean,
        showBadge: Boolean,
        showCountBadge: {
            type: Number,
            default: undefined,
        },
        badgeColor: {
            type: String,
            default: 'warning',
        },
        tooltip: {
            type: [String, Object, Boolean],
            default: '',
        },
        badgeTooltip: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        deafultLoadingIconSize: {
            type: Boolean,
            default: true,
        },
        noMargin: {
            type: Boolean,
            default: true,
        },
        menuOrigin: {
            type: String,
            default: 'top left',
        },
        menuTransition: {
            type: String,
            default: 'scale-transition',
        },
        closeOnClick: {
            type: Boolean,
            default: true,
        },
        closeOnContentClick: {
            type: Boolean,
            default: false,
        },
        id: {
            type: String,
            default: 'bar-button',
        },
        rightIcon: {
            type: Boolean,
            default: false,
        },
        fullscreen: {
            type: Boolean,
            default: false,
        },
        dialog: {
            type: Boolean,
            default: false,
        },
        alwaysShowDropdown: {
            type: Boolean,
            default: false,
        },
        activatorStyle: {
            type: [Object, Array, String],
            default: undefined,
        },
    },
    data () {
        return {
            dropdown: false,
        }
    },
    computed: {
        badgeTooltipText () {
            if (this.showBadge && !this.showCountBadge) {
                return this.badgeTooltip !== '' ? this.badgeTooltip : this.$t('ui.barButton.filtersApply')
            }
            return ''
        },
    },
    methods: {
        open () {
            this.dropdown = true
        },
        click ($event) {
            this.$emit('click', $event)
        },
        close () {
            this.dropdown = false
        },
    },
}
</script>
