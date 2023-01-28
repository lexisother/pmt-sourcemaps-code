<template>
    <div class="wrapper">
        <transition
            name="slide"
            @after-enter="afterEnter"
            @after-leave="afterLeave"
        >
            <div
                v-if="showMenu"
                id="mobile-menu"
                v-click-outside="onOverlayclick"
                class="mobile-menu"
                :style="{right: IS_LANDSCAPE ? 'inherit' : '50px'}"
            >
                <pmt-brand is-mobile />

                <div
                    v-if="isAuthenticated"
                    class="user-greet"
                >
                    {{ nameLabel }}
                </div>

                <pmt-mobile-menu-nav
                    :menu-items="menuItems"
                    :theme="theme"
                    @on-click="hide()"
                />

                <div
                    v-if="user"
                    class="user-menu"
                >
                    <h2 class="section-title">
                        {{ $t('headerMenu.myInfo.label') }}
                    </h2>
                    <pmt-mobile-menu-nav
                        :menu-items="userMenuItems"
                        :theme="theme"
                        @on-click="hide()"
                        @about="openAbout"
                    />
                    <ul
                        v-if="canViewZendeskWidget"
                        class="zendesk-menu"
                    >
                        <li
                            class="zendesk-menu-item"
                            @click="getZendeskPopover()"
                        >
                            <a class="zendesk-menu-item-button">
                                <component
                                    :is="'question'"
                                    class="zendesk-menu-item-icon"
                                    :size="18"
                                />
                                <span class="zendesk-menu-item-text"> {{ $t('headerMenu.myInfo.help') }} </span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>

        <pmt-overlay :show="showMenu" />
        <pmt-about-modal ref="aboutPmt" />
    </div>
</template>

<script>
import Overlay from '@/components/ui/overlay/Overlay.vue'
import PmtBrand from '../Brand.vue'
import MobileMenuNavigation from './MobileMenuNavigation.vue'
import PmtAboutModal from '@/components/modals/PmtAboutModal.vue'
import { mapGetters } from 'vuex'

export default {
    components: {
        'pmt-overlay': Overlay,
        'pmt-mobile-menu-nav': MobileMenuNavigation,
        PmtBrand,
        PmtAboutModal,
    },
    props: {
        menuItems: {
            type: Array,
            required: true,
        },
        userMenuItems: {
            type: Array,
            required: true,
        },
        user: {
            type: Object,
            default: () => {},
        },
        theme: Object,
    },
    data () {
        return {
            showMenu: false,
            menuVisible: false,
        }
    },
    computed: {
        ...mapGetters('auth', [
            'isAuthenticated',
            'canViewZendeskWidget',
        ]),
        ...mapGetters({
            IS_LANDSCAPE: 'IS_LANDSCAPE',
            IS_MOBILE: 'IS_MOBILE',
        }),
        nameLabel () {
            const greet = this.$moment().getDayPhase()
            if (this.user.firstname) {
                return greet + this.user.firstname
            }

            return greet + this.user.fullname
        },
    },
    mounted () {
        // Open the modal if we have a query parameter requiring this. This will work for both regular and mobile menus.
        if (this.$route.query.aboutPmt) {
            // Clear the query
            this.$router.push(this.$route.path)
            this.openAbout()
        }
    },
    methods: {
        onOverlayclick () {
            if (this.menuVisible) {
                this.hide()
            }
        },
        show () {
            this.showMenu = true
        },
        hide () {
            this.showMenu = false
        },
        afterEnter () {
            this.menuVisible = true
        },
        afterLeave () {
            this.menuVisible = false
        },

        /**
         * Opens the Zendesk Widget modal upon clicking the 'Help?' button
         */
        getZendeskPopover () {
            setTimeout(() => {
                window.zE(function () {
                    window.zE.show()
                })
                window.zE('webWidget', 'open')
                if (this.IS_MOBILE) {
                    window.zE('webWidget:on', 'close', function () {
                        window.zE.hide()
                    })
                }
            }, 1)
        },

        /**
         * Opens the "About PMT" modal.
         */
        openAbout () {
            this.hide()
            this.$refs.aboutPmt.open()
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '../../../assets/scss/_colors.scss';

    $bg-color: #252E3C;
    $border-color: darken( $bg-color, 5% );
    #mobile-menu {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 50px;
        z-index: 50;

        background-color: white;

        overflow-y: auto;

        header {
            padding: 7px 15px;

            text-align: center;
            line-height: 1em;

            background-color: $primary-color;

            border-bottom: 1px solid darken( $primary-color, 40% );
        }

        .mobile-navigation {
            border-top: 1px solid $border-color;
        }

        .user-greet {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #252525;
            padding-left: 10px;

            height: 45px;
        }

        .user-menu {
            margin-top: 30px;
        }

        .section-title {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1em 0 2px;
            padding: 0 20px;

            color: #252525;
            font-size: 1rem;
        }
    }

    .slide-enter {
        opacity: 0;
        transform: translateX(-100%);
    }

    .slide-leave-active {
        opacity: 0;
        transform: translateX(-100%);
    }

    .slide-enter-active,
    .slide-leave-active {
        transition: all 150ms ease-in-out;
    }

    .zendesk-menu {
        list-style: none;
        .zendesk-menu-item {
            line-height: 1em;
        }
        .zendesk-menu-item-button {
            display: block;
            padding: 15px 20px;
            background-color: white;
            color: rgb(37, 37, 37);
            text-decoration: none;
        }
        .zendesk-menu-item-text {
            color: rgb(230, 126, 34);
            font-weight: 500;
        }
        .zendesk-menu-item-icon {
            margin-right: 0.6em;
            width: 17px;
            color: rgb(230, 126, 34);
            font-weight: 500;
        }
    }
</style>
