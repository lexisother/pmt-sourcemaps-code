<template>
    <div
        class="side-panel"
        :class="getClassList()"
        :style="customStyle"
    >
        <header
            v-if="title"
            class="title"
            :class="{'no-border-bottom': !titleBorder.bottom}"
        >
            <div
                :key="title"
                class="animated sildeInLeft"
            >
                <span
                    v-if="headerIcon"
                    class="header-icon text-normal"
                >
                    <slot name="header-icon">
                        <component
                            :is="headerIcon"
                            v-if="headerIcon"
                            ref="headerIcon"
                            :size="parseInt(headerIconSize)"
                            :fill-color="headerIconColor ? '#' + headerIconColor : 'currentColor'"
                        />
                    </slot>
                </span>
                <span class="title-text">
                    <slot name="title">{{ title }}</slot>
                </span>
                <slot name="title-bar" />
                <span
                    v-if="showClose"
                    class="close"
                >
                    <PmtButton
                        ref="close"
                        v-ripple
                        default
                        round
                        medium
                        icon="close"
                        :icon-size="16"
                        @click="close()"
                    />
                    <v-popover
                        v-if="confirmClose"
                        trigger="manual"
                        :open="showConfirmationMessage"
                        :auto-hide="true"
                        @apply-hide="showConfirmationMessage = false"
                    >
                        <template slot="popover">
                            <p ref="confirmCloseMessage">
                                {{ confirmMessage }}
                            </p>
                            <PmtButton
                                ref="confirmCloseYes"
                                danger
                                outline
                                custom-class="tooltip-target b1"
                                @click="$emit('close'); showConfirmationMessage = false"
                            >
                                {{ $t('sidePanels.availabilityWeeklyDetails.sections.yes') }}
                            </PmtButton>
                            <PmtButton
                                ref="confirmCloseNo"
                                normal
                                custom-class="tooltip-target b1"
                                @click="showConfirmationMessage = false"
                            >
                                {{ $t('sidePanels.availabilityWeeklyDetails.sections.no') }}
                            </PmtButton>
                        </template>
                    </v-popover>
                </span>
                <v-progress-linear
                    :active="loading"
                    :indeterminate="true"
                    height="2"
                />
            </div>
            <span class="sub-title"><slot name="subTitle" /></span>
        </header>
        <div
            class="content"
            :class="{'full-width': fullWidth}"
        >
            <div
                v-if="$slots.actions"
                class="content-actions"
            >
                <slot name="actions" />
            </div>
            <div class="body">
                <slot v-if="!loading" />
            </div>
            <footer
                v-if="$slots.footer"
                class="panel-footer"
            >
                <slot name="footer" />
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
        titleBorder: {
            type: Object,
            default: () => {
                return {
                    top: true,
                    bottom: true,
                    left: true,
                    right: true,
                }
            },
        },
        borderLeft: {
            type: Boolean,
            default: false,
        },
        borderRight: {
            type: Boolean,
            default: false,
        },
        padding: {
            type: Boolean,
            default: false,
        },
        showClose: {
            type: Boolean,
            default: true,
        },
        confirmClose: {
            type: Boolean,
            default: false,
        },
        confirmMessage: {
            type: String,
            default: 'Are you sure you want to close?',
        },
        customStyle: [String, Object, Array],
        loading: {
            type: Boolean,
            default: false,
        },
        fullWidth: {
            type: Boolean,
            default: false,
        },
        headerIcon: {
            type: String,
        },
        headerIconColor: {
            type: String,
        },
        headerIconSize: {
            type: [String, Number],
            default: 20,
        },
    },
    data () {
        return {
            showConfirmationMessage: false,
        }
    },
    methods: {
        getClassList () {
            return {
                'border-left': this.borderLeft,
                'border-right': this.borderRight,
                padding: this.padding,
            }
        },
        close () {
            if (this.confirmClose) {
                this.showConfirmationMessage = true
            } else {
                this.$emit('close')
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    @import './SidePanel.scss';
</style>
