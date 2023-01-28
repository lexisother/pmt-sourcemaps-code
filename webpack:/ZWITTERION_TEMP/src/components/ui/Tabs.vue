<template>
    <div
        ref="tabsContainer"
        :class="{'tabs-container': !child, 'left-tabs-container': left, 'no-shadow': noShadow}"
    >
        <div
            class="header"
            :class="{'left-header': left, 'child-header': child, 'small-header': smallHeader}"
            :style="headerStyle"
        >
            <div
                id="tabs"
                :class="{'left-tabs': left}"
            >
                <a
                    v-for="(tab, index) in tabs"
                    :id="tab.id"
                    :ref="getActiveTabRefName(tab)"
                    :key="index"
                    v-ripple
                    v-tooltip="{content: tab.disabled ? tab.disabledTooltip : tab.tooltip, hideOnTargetClick: true, placement: 'left', trigger: 'focus hover click'}"
                    :cy_id="tab.id"
                    :class="{'tab': true, 'active-tab': isActiveTab(tab), 'left-tab': left, 'child': child, disabled: tab.disabled}"
                    :data-row="tab.id"
                    :disabled="tab.disabled"
                    class="d-print-none"
                    @click="tabClick(tab)"
                >
                    {{ tab.name }}
                    <span
                        v-if="tab.showBadge && !isActiveTab(tab)"
                        class="tab-badge"
                        :class="{pulse: tab.pulsateBadge, primary: tab.primaryBadge, success: tab.successBadge, warning: tab.warningBadge, danger: tab.dangerBadge}"
                        :data-badge="tab.badgeText"
                    />
                    <span v-if="tab.loading && !isActiveTab(tab)">
                        <round-spinner
                            loading
                            :size="15"
                        />
                    </span>
                </a>
                <span
                    class="active-tab-bar"
                    :style="activeTabElementRect"
                />
                <div
                    v-if="actionItems && IS_MOBILE"
                    class="tab-actions"
                >
                    <VMenu
                        v-model="show"
                        offset-y
                    >
                        <template #activator="{ on }">
                            <PmtButton
                                primary
                                inverted
                                icon="dots-vertical"
                                icon-size="18"
                                round
                                v-on="on"
                            />
                        </template>
                        <ContextMenu
                            ref="contextMenu"
                            :items="actionItems"
                            :in-view="true"
                            :align-bottom="true"
                            @on-hide="show = false"
                            @item-clicked="$emit($event)"
                        />
                    </VMenu>
                </div>
                <div
                    v-if="$slots.actions"
                    class="tab-actions"
                >
                    <slot name="actions" />
                </div>
                <div
                    v-if="showClose"
                    class="tab-actions"
                >
                    <pmt-button
                        v-ripple
                        round
                        medium
                        icon="close"
                        :icon-size="16"
                        class="float-right"
                        @click="close()"
                    />
                    <v-popover
                        trigger="manual"
                        :open="showConfirmationMessage"
                        :auto-hide="true"
                        @apply-hide="showConfirmationMessage = false"
                    >
                        <template slot="popover">
                            <p>
                                {{ confirmMessage }}
                            </p>
                            <pmt-button
                                danger
                                outline
                                custom-class="tooltip-target b1"
                                @click="$emit('close'); showConfirmationMessage = false"
                            >
                                {{ $t('sidePanels.availabilityWeeklyDetails.sections.yes') }}
                            </pmt-button>
                            <pmt-button
                                normal
                                custom-class="tooltip-target b1"
                                @click="showConfirmationMessage = false"
                            >
                                {{ $t('sidePanels.availabilityWeeklyDetails.sections.no') }}
                            </pmt-button>
                        </template>
                    </v-popover>
                </div>
            </div>
        </div>
        <div
            v-touch="{
                left: () => swipe('left'),
                right: () => swipe('right')
            }"
            class="tab-content animated"
            :class="{
                'child-tab-content': child,
                'slideInRight': direction === 'left',
                'slideInLeft': direction === 'right'
            }"
        >
            <slot name="tabs-content" />
        </div>
    </div>
    <!-- leave this commented code for now as example of adding sub-tabs -->
    <!-- <div v-show="$route.query.path === 'Dummy_Tab'">
        <tabs :tabs="childTabs" @on-click="childActiveTab = $event" child left>
            <template slot="tabs-content">
                <div v-if="childActiveTab === 'One'" class="inner-tab-content">
                    <pmt-value-list :items="employeeInfo.accountInfo" />
                    <pmt-button small @click="showAccountEditModal">{{ $t( 'pages.myAccountInformation.editBtn.label' ) }}</pmt-button>
                </div>
                <div v-if="childActiveTab === 'Two'" class="inner-tab-content">
                    <pmt-value-list :items="employeeInfo.personalInfo" />
                </div>
                <div v-if="childActiveTab === 'Three'">
                    <tabs :tabs="childTabs" @on-click="childTwoActiveTab = $event" child>
                        <template slot="tabs-content">
                            <div v-if="childTwoActiveTab === 'One'" class="inner-tab-content">
                                <pmt-value-list :items="employeeInfo.accountInfo" />
                                <pmt-button small @click="showAccountEditModal">{{ $t( 'pages.myAccountInformation.editBtn.label' ) }}</pmt-button>
                            </div>
                            <div v-if="childTwoActiveTab === 'Two'" class="inner-tab-content">
                                <pmt-value-list :items="employeeInfo.personalInfo" />
                            </div>
                            <div v-if="childTwoActiveTab === 'Three'" class="inner-tab-content">
                                <pmt-value-list :items="contractInfo" />
                                <pmt-value-list :items="employeeInfo.employmentInfo" />
                            </div>
                        </template>
                    </tabs>
                </div>
            </template>
        </tabs>
    </div> -->
</template>

<script>
import browserHelper from '@/libraries/browserHelper'
import ContextMenu from '@/components/ui/pickers/ContextMenu.vue'
import { mapGetters } from 'vuex'
export default {
    name: 'Tabs',
    components: {
        ContextMenu,
    },
    props: {
        tabs: {
            type: Array,
            default: () => ([]),
        },
        left: {
            type: Boolean,
            default: false,
        },
        tabLoading: {
            type: Boolean,
            default: false,
        },
        child: {
            type: Boolean,
            default: false,
        },
        showClose: {
            type: Boolean,
            default: false,
        },
        confirmClose: {
            type: Boolean,
            default: false,
        },
        confirmMessage: {
            type: String,
            default: 'Are you sure you want to close?',
        },
        activeTab: {
            type: String,
            default: '',
        },
        actionItems: {
            type: Array,
            default: () => ([]),
        },
        headerStyle: {
            type: [String, Array, Object],
            default: '',
        },
        smallHeader: Boolean,
        noShadow: Boolean,
    },
    data: () => ({
        activeTabElementRect: {
            left: '0px',
            width: '0px',
            top: 'auto',
            height: '3px',
            transition: 'left .3s ease',
            '-webkit-transition': 'left .3s ease',
        },
        childActiveTab: null,
        showConfirmationMessage: false,
        direction: 'left',
        show: false,
    }),
    computed: {
        routerActiveTab () {
            return this.$route.query.path
        },
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
    },
    mounted () {
        this.checkExistingTab().then(() => {
            this.setActiveTabElementRect()
            window.addEventListener('resize', this.setActiveTabElementRect)
        })
    },
    destroyed () {
        window.removeEventListener('resize', this.setActiveTabElementRect)
    },
    methods: {
        swipe (direction) {
            this.direction = direction
            const currentTabIndex = this.tabs.findIndex(tab => tab.id === this.$refs.activeTab[0].id)
            const numberDirection = direction === 'right' ? -1 : 1
            const nextTab = this.tabs[currentTabIndex + numberDirection]
            if (nextTab) {
                const nextTabElement = document.getElementById(nextTab.id)
                this.tabClick(nextTabElement, nextTab.id)
            }
        },
        close () {
            if (this.confirmClose) {
                this.showConfirmationMessage = true
            } else {
                this.$emit('close')
            }
        },
        getActiveTabRefName (tab) {
            if (this.activeTab) {
                return tab.id === this.activeTab ? 'activeTab' : false
            }
            return this.$route.query.path === tab.id ? 'activeTab' : false || this.childActiveTab === tab.name ? 'activeTab' : false
        },
        tabClick (tab) {
            if (tab.disabled) return
            const elem = document.querySelector(`#${tab.id}`)
            if (this.activeTab) {
                this.$emit('on-click', tab.id)
                this.setActiveTabElementRect(elem.getBoundingClientRect(), true)
                return
            }
            if (!this.child && !this.activeTab) {
                this.pushActiveTab(tab.id)
            } else {
                this.childActiveTab = tab.id
            }
            const activeTabIndex = this.tabs.findIndex(tab => tab.id === this.$refs.activeTab[0].id)
            const navigatedTabIndex = this.tabs.findIndex(t => t.id === tab.id)
            if (activeTabIndex > navigatedTabIndex) {
                this.direction = 'right'
            } else {
                this.direction = 'left'
            }
            this.$emit('on-click', !this.child ? (!this.activeTab ? this.routerActiveTab : this.activeTab) : this.childActiveTab)
            this.setActiveTabElementRect(elem.getBoundingClientRect(), true)
        },
        /**
             * Returns true if current tab is active. If none is selected, defaults to first tab.
             * @param tab
             * @returns {boolean}
             */
        isActiveTab (tab) {
            if (this.activeTab) {
                return tab.id === this.activeTab
            }
            if (this.child) {
                return this.childActiveTab ? this.childActiveTab === tab.id : !!this.tabs[0].id
            }
            return typeof this.routerActiveTab !== 'undefined' ? this.routerActiveTab === tab.id : !!this.tabs[0].name && this.tabs[0].name === tab.name
        },
        setActiveTabElementRect (elemRect, fromClick) {
            const activeTab = this.$refs.activeTab
            const boundaries = !fromClick ? activeTab[0].getBoundingClientRect() : elemRect
            const tabsContainerRect = this.$refs.tabsContainer.getBoundingClientRect()
            if (this.left && !browserHelper.isInternetExplorer()) { // pmt-tabs does not yet support left in IE
                this.activeTabElementRect.top = boundaries.top - tabsContainerRect.top + 'px' // subtract the .tabs-container top
                this.activeTabElementRect.width = '3px'
                this.activeTabElementRect.left = boundaries.width - 3 + 'px'
                this.activeTabElementRect.height = boundaries.height + 'px'
                this.activeTabElementRect.transition = 'top .3s ease'
                this.activeTabElementRect['-webkit-transition'] = 'top .3s ease'
            } else {
                this.activeTabElementRect.left = boundaries.left - tabsContainerRect.left + 'px' // subtract the .tabs-container left
                this.activeTabElementRect.width = boundaries.width + 'px'
            }
        },
        pushActiveTab (tab) {
            if (!this.activeTab && this.$route.query.path !== tab) {
                const withRoute = {
                    name: this.$route.name,
                    query: { ...this.$route.query, path: tab },
                }
                if (this.$route.params && Object.keys(this.$route.params).length > 0) {
                    withRoute.params = this.$route.params
                }
                this.$router.replace(withRoute)
            }
        },
        checkExistingTab () {
            const _this = this
            return new Promise(function (resolve, reject) {
                if (_this.activeTab) {
                    resolve()
                } else if (!_this.child && !_this.activeTab) {
                    const query = _this.$route.query.path
                    if (typeof query === 'undefined') {
                        _this.pushActiveTab(_this.tabs[0].id)
                    } else {
                        const existingTab = _this.tabs.find(tab => tab.id === query)
                        if (!existingTab) {
                            _this.pushActiveTab(_this.tabs[0].id)
                        }
                    }
                } else {
                    _this.childActiveTab = _this.tabs[0].id
                }
                resolve()
            })
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/shaddows.scss';
@import '@/assets/scss/breakpoints.scss';
.tabs-container{
    height: auto;
    width: auto;
    padding: 0;
    margin: 15px;
    border-radius: 3px;
    box-shadow: $shaddow-2p;
    background-color: white;
    &.no-shadow {
        box-shadow: none;
    }
    & .header {
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 3;
        overflow-x: auto;
        white-space: nowrap;
        -ms-overflow-style: none;
        &:not(.child-header) {
            border-bottom: 1px solid var(--grey-40);
        }
        &.child-header:not(.left-header) {
            top: 74px;
        }
        .tab-actions {
            display: inline-block;
            position: absolute;
            right: 5px;
            top: 5px;
        }
        &::-webkit-scrollbar {
            display: none;
        }
        &.small-header {
            .tab-actions {
                right: 10px !important;
                top: 10px !important;
            }
            #tabs {
                .tab {
                    padding: 9px;
                    text-transform: none;
                }
            }
        }
        & #tabs {
            position: relative;
            padding:0;

            & .tab {
                position: relative;
                display:inline-block;
                text-decoration: none;
                padding: 16px;
                font-size: 14px;
                color: var(--grey-100);
                text-align: center;
                outline:none;

                &.active-tab {
                    outline:none;
                    color: var(--primary-color);
                }
                &:not(.active-tab):hover {
                    color: var(--grey-200);
                }
                &.child {
                    padding: 5px 10px;
                    text-transform: none;
                }
                &.disabled {
                    pointer-events: none;
                    background-color: var(--grey-30);
                    color: var(--grey-80);
                }
            }
            & .active-tab-bar {
                position: absolute;
                bottom: 0;
                height: 3px;
                background: var(--primary-color);
                display: block;
                left: 0;
                transition: left .2s ease;
                -webkit-transition: left .2s ease;
            }
            .tab-badge {
                &::after {
                    content: attr(data-badge);
                    display: -webkit-box;
                    display: -webkit-flex;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-orient: horizontal;
                    -webkit-box-direction: normal;
                    -webkit-flex-direction: row;
                    -ms-flex-direction: row;
                    flex-direction: row;
                    -webkit-flex-wrap: wrap;
                    -ms-flex-wrap: wrap;
                    flex-wrap: wrap;
                    -webkit-box-pack: center;
                    -webkit-justify-content: center;
                    -ms-flex-pack: center;
                    justify-content: center;
                    -webkit-align-content: center;
                    -ms-flex-line-pack: center;
                    align-content: center;
                    -webkit-box-align: center;
                    -webkit-align-items: center;
                    -ms-flex-align: center;
                    align-items: center;
                    position: absolute;
                    top: 28px;
                    right: -5px;
                    font-weight: 400;
                    font-size: 12px;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    color: white;
                    text-transform: none;
                    box-shadow: $shaddow-2p;
                    pointer-events: none;
                }
                &.pulse::after {
                    animation: pulse 2s infinite;
                }
                &.primary::after {
                    background: var(--primary-color);
                }
                &.success::after {
                    background: var(--success-color);
                }
                &.warning::after {
                    background: var(--warning-color);
                }
                &.danger::after {
                    background: var(--danger-color);
                }
            }
            @media only screen and #{$max-media-query-medium} {
                & .tab {
                    padding: 10px;
                    font-size: 13px;
                }
                & .tab-badge::after {
                    font-size: 10px;
                    width: 13px;
                    height: 13px;
                    top: 20px;
                }
            }
        }
        @media only screen and #{$max-media-query-medium} {
            &.child-header:not(.left-header) {
                top: 45px;
            }
        }
    }
    & .tab-content {
        min-height: 300px;
    }
    @-webkit-keyframes pulse {
        0% {
            -webkit-box-shadow: 0 0 0 0 rgba(var(--danger-color), 0.4);
        }
        70% {
            -webkit-box-shadow: 0 0 0 15px rgba(var(--danger-color), 0);
        }
        100% {
            -webkit-box-shadow: 0 0 0 0 rgba(var(--danger-color), 0);
        }
    }
    @keyframes pulse {
        0% {
            -moz-box-shadow: 0 0 0 0 rgba(var(--danger-color), 0.4);
            box-shadow: 0 0 0 0 rgba(var(--danger-color), 0.4);
        }
        70% {
            -moz-box-shadow: 0 0 0 15px rgba(var(--danger-color), 0);
            box-shadow: 0 0 0 15px rgba(var(--danger-color), 0);
        }
        100% {
            -moz-box-shadow: 0 0 0 0 rgba(var(--danger-color), 0);
            box-shadow: 0 0 0 0 rgba(var(--danger-color), 0);
        }
    }
}
@media print {
    .tabs-container {
        margin: 0;
        width: unset;
    }
}

@media screen and #{$max-media-query-medium} {
    .tabs-container {
        height: 100%;
        margin:0;
        box-shadow: none;
    }
}
.left-tabs-container {
    display: flex;
    .left-header {
        position: relative;
        border-bottom: none;
        overflow-x: inherit;
        white-space: nowrap;
        border-right: 1px solid #e0e0e0;
        .left-tabs {
            .left-tab {
                text-align: right !important;
                display: block !important;
            }
        }
    }
    .tab-content {
        overflow: auto;
        width: 100%;
    }
}
</style>
