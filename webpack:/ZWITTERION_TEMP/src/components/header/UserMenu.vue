<template>
    <div class="user-menu">
        <pmt-button
            v-if="!IS_MOBILE && isAuthenticated && canViewZendeskWidget"
            class="help-button"
            icon="help-circle-outline"
            icon-size="20"
            primary
            inverted
            :rounded="showFullHelpText"
            :round="!showFullHelpText"
            :style="{color: theme.primaryColor, width: showFullHelpText ? '80px' : ''}"
            @click="getZendeskPopover()"
        >
            <span v-if="showFullHelpText">{{ $t('headerMenu.myInfo.helpSimple') }}</span>
        </pmt-button>

        <pmt-header-button
            v-if="user"
            ref="menuItem"
            :title="nameLabel"
            :sub-menu="userMenuItems"
            :theme="theme"
            align-right
            no-active-sub-menu
        />

        <pmt-header-button
            v-if="!user"
            :theme="theme"
            icon="account"
            :label="$t( 'headerMenu.login.label' )"
            url="/login"
        />
    </div>
</template>

<script>
import HeaderButton from './HeaderButton.vue'
import { mapGetters } from 'vuex'

export default {
    components: {
        'pmt-header-button': HeaderButton,
    },
    props: {
        menuItemsLength: {
            type: Number,
            default: 0,
        },
        userMenuItems: {
            type: Array,
            required: true,
        },
        user: {
            type: Object,
            default: () => {},
        },
        theme: {
            type: Object,
        },
    },
    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('auth', [
            'isAuthenticated',
            'canViewZendeskWidget',
        ]),
        fullname () {
            return this.user.firstname ? this.user.firstname : 'no name'
        },
        nameLabel () {
            const greet = this.$moment().getDayPhase()
            return greet + this.user.firstname
        },
        showFullHelpText () {
            return this.menuItemsLength < 8
        },
    },
    methods: {
        hideSwitchStoreMenu () {
            if (this.$refs.menuItem) {
                this.$refs.menuItem.updateActiveState(false)
            }
        },

        /**
         * Opens the Zendesk Widget modal upon clicking the 'Help?' button
         */
        getZendeskPopover () {
            if (typeof zE !== 'undefined') {
                setTimeout(() => {
                    window.zE(function () {
                        window.zE.show()
                    })
                    window.zE('webWidget', 'open')
                    window.zE('webWidget:on', 'close', function () {
                        window.zE.hide()
                    })
                }, 1)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    .user-menu {
        position: relative;
        display: flex;
        align-items: center;
    }
    .help-button {
        font-weight: 700 !important;
    }
</style>
