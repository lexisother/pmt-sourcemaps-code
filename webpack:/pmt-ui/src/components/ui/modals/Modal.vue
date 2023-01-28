<template>
    <div class="pmt-modal">
        <pmt-overlay
            :show="showOverlay"
            :fullscreen="fullscreen"
            @after-enter="afterEnter"
        >
            <transition
                name="slide"
                @after-leave="afterLeave"
                @after-enter="$emit( 'after-modal-enter' )"
            >
                <div
                    v-if="showModal"
                    v-click-outside="onOverlayclick"
                    class="modal"
                    :class="{small, medium}"
                >
                    <div
                        v-if="title || backupTitle"
                        class="modal-title elevation-2"
                        :style="headerStyle"
                    >
                        <div class="title">
                            {{ title || backupTitle }}
                        </div>
                        <a
                            v-if="showClose"
                            class="close"
                        >
                            <pmt-button
                                icon="close"
                                icon-size="22"
                                @click="hide(); $emit('manual-close')"
                            />
                        </a>
                    </div>
                    <div
                        class="modal-body"
                        :class="{'no-padding': noPadding}"
                    >
                        <slot />
                    </div>
                    <div
                        v-if="$slots.actions"
                        class="modal-actions"
                    >
                        <slot name="actions" />
                    </div>
                </div>
            </transition>
        </pmt-overlay>
    </div>
</template>

<script>
import Overlay from '../overlay/Overlay.vue'

export default {
    name: 'Modal',
    components: {
        'pmt-overlay': Overlay,
    },
    props: {
        title: {
            type: String,
            required: false,
        },
        hideOnOverlayClick: {
            type: Boolean,
            default: true,
        },
        noPadding: {
            type: Boolean,
            default: false,
        },
        fullscreen: {
            type: Boolean,
            default: true,
        },
        small: Boolean,
        medium: Boolean,
        headerStyle: [String, Array, Object],
        showClose: {
            type: Boolean,
            default: true,
        },
    },
    data () {
        return {
            showOverlay: false,
            showModal: false,
            backupTitle: '',
        }
    },
    created () {
        this.$bus.$on('close-modals', ($event) => {
            this.hide()
        })
    },
    methods: {
        show (title) {
            if (typeof title !== 'undefined' && typeof this.title === 'undefined') {
                this.backupTitle = title
            }
            this.$bus.$emit('close-modals')

            this.showOverlay = true
        },
        hide () {
            this.$emit('close')
            this.showModal = false
        },
        onOverlayclick () {
            if (this.hideOnOverlayClick) {
                this.hide()
            }
        },
        afterLeave () {
            this.showOverlay = false
        },
        afterEnter () {
            this.showModal = true
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/shaddows.scss';
    @import '@/assets/scss/breakpoints.scss';
    $border-radius: 3px;
    .modal {
        background: transparent;
        border-radius: $border-radius;
        min-height: 300px;
        max-height: 85%;
        .modal-title {
            background-color: $primary-color;
            color: $white;
            padding: 15px;
            border-top-left-radius: inherit;
            border-top-right-radius: inherit;
            position: sticky;
            top: 0;
            z-index: 5;
        }
        .modal-body {
            margin: 40px;
            background: $white;
            border-radius: 0 0 $border-radius $border-radius;
            padding: 10px;
            &.no-padding {
                padding: 0px;
                margin: 0;
            }
            .button-group {
                padding: 25px 0;
            }
        }
        .close {
            margin-top: -30px;
            float: right;
            color: $white !important;
        }
        .modal-actions {
            border-top: 1px solid $border-color;
            padding: 15px;
            background-color: $white;
            text-align: center;
        }
    }
    .modal-body
    .slide-enter {
        opacity: 0;
        transform: translateY(15vh);
    }
    .slide-leave-active {
        opacity: 0;
        transform: translateY(5vh);
    }
    .slide-enter-active,
    .slide-leave-active {
        transition: all 150ms ease-in-out
    }
    @media screen and #{$max-media-query-small} {
        .modal {
            transform: none;
            position: relative;
            margin-top: 0;
            margin-bottom: 0;
            margin-left: 0;
            margin-right: 0;
            max-height: 100%;
            height: 100%;
            width: 100%;
            border-radius: 0;
            overflow: hidden;
            &.small {
                max-width: auto;
            }
            .modal-body {
                margin: 0;
                overflow-y: scroll;
                max-height: 95%;
                height: 95%;
            }
            .tabs-container {
                height: 100%;
            }
            .modal-actions {
                bottom: 0;
                width: 100%;
            }
        }
    };
    @media screen and #{$min-media-query-small} {
        .modal {
            margin-left: 10%;
            margin-right: 10%;
            margin-top: 25px;
            border-radius: $border-radius;
            height: 85%;
            overflow: hidden;
            &.small {
                max-width: 35%;
                margin-left: 35%;
                margin-right: 30%;
            }
            .modal-body {
                margin: 0;;
                max-height: 95%;
                overflow-y: scroll;
            }
        }
    }
    @media screen and #{$min-media-query-medium} {
        .modal {
            margin-left: 25%;
            margin-right: 25%;
            margin-top: 56px;
        }
    }
</style>

<style lang="scss">
    .modal {
        .button-group {
            padding: 25px 0;
            text-align: center;
        }
        .tabs-container {
            border-radius: 6px;
            .header {
                border-top-left-radius: inherit;
                border-top-right-radius: inherit;
            }
        }
    }
</style>
