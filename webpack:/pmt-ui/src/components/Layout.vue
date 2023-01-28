<template>
    <div
        id="layout"
        ref="layout"
        v-on-window-resize="onWindowSizeChange"
        :class="classList"
    >
        <div
            ref="panel-left"
            class="left-side"
            :class="{activation: $route.params.activation}"
            :style="leftSideStyle"
        >
            <slot name="left" />
        </div>
        <div
            id="main"
            v-scroll:#main="onScroll"
            :class="{'main': true, 'loading': loading, 'bp-60': scrollTopVisible && showScrollTop}"
            :style="mainStyle"
            @scroll="scroll"
        >
            <div
                v-if="disabledContentOnSideOpen"
                class="overlay"
                @click="$emit('hide-overlay')"
            />
            <slot
                v-if="hideLoadingContent ? !loading : true"
                :disabled="disabledContentOnSideOpen"
            />
            <RoundSpinner
                v-if="loading"
                :full-screen="fullScreenLoading"
                :relative="relative"
                :block="blockLoading"
                :loading-text="loadingText"
                :default-loading-text="!loadingText"
                :loading="loading"
            />
        </div>
        <div
            ref="panel-right"
            class="right-side"
            :class="{activation: $route.params.activation, 'full-width': fullWidthRightSide, 'right-side-topbar-height': rightSideTopbarHeight}"
            :style="{...rightSideStyle, ...rightSideStyleLocal}"
        >
            <slot name="right" />
        </div>
        <PmtScrollTop v-if="scrollTopVisible && showScrollTop" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PmtScrollTop from '@/components/ScrollTop.vue'
export default {
    name: 'PmtLayout',
    components: {
        PmtScrollTop,
    },
    props: {
        showRightSide: {
            type: Boolean,
            default: false,
        },
        showLeftSide: {
            type: Boolean,
            default: false,
        },
        lockLeftSide: {
            type: Boolean,
            default: false,
        },
        smallLeftSide: {
            type: Boolean,
            default: false,
        },
        resizeCalculationFunction: {
            type: Function,
        },
        fixedHeight: {
            type: Boolean,
            default: false,
        },
        fullScrollEvent: {
            type: Boolean,
            default: false,
        },
        rightSideStyle: [String, Object, Array],
        leftSideStyle: [String, Object, Array],
        mainStyle: [String, Object, Array],
        loading: Boolean,
        fullScreenLoading: {
            type: Boolean,
            default: true,
        },
        blockLoading: {
            type: Boolean,
            default: false,
        },
        relative: {
            type: Boolean,
            default: true,
        },
        loadingText: String,
        hideLoadingContent: {
            type: Boolean,
            default: true,
        },
        fullWidthRightSide: {
            type: Boolean,
            default: false,
        },
        disabledContentOnSideOpen: {
            type: Boolean,
            default: false,
        },
        rightSideWidth: {
            type: [Number, Boolean],
        },
        rightSideTopbarHeight: {
            type: Boolean,
            default: false,
        },
        // Prop is used to make sure the layout doesn't shift when opening a sidebar
        overlapRightSide: {
            type: Boolean,
            default: false,
        },
        showScrollTop: {
            type: Boolean,
            default: true,
        },
    },

    data () {
        return {
            originalSidebarWidth: '',
            scrollTopVisible: false,
        }
    },

    computed: {
        rightWidth () {
            let width = this.rightSideWidth ? this.rightSideWidth + 'px' : this.originalSidebarWidth
            if (this.fullWidthRightSide || this.IS_MOBILE) {
                width = '100%'
            }
            return width
        },
        classList () {
            return {
                'open-right-side': this.showRightSide,
                'open-left-side': this.showLeftSide,
                'lock-left-side': this.lockLeftSide,
                'small-left-side': this.smallLeftSide,
                'overlap-right-side': this.overlapRightSide,
            }
        },
        ...mapGetters(['IS_MOBILE']),
        rightSideStyleLocal () {
            const styles = {}
            if (this.fullWidthRightSide) {
                styles.width = '100%'
            }
            return styles
        },
        mainLocalStyle () {
            return {
                ...this.mainStyle,
            }
        },
    },

    watch: {
        showRightSide (newVal, oldVal) {
            if (newVal !== oldVal) {
                this.$emit('on-right-side-' + (newVal ? 'show' : 'hide'))
            }
        },
        showLeftSide (newVal, oldVal) {
            if (newVal !== oldVal) {
                this.$emit('on-left-side-' + (newVal ? 'show' : 'hide'))
            }
        },
        rightSideWidth () {
            document.documentElement.style.setProperty('--right-side-bar-width', this.rightWidth)
        },
    },
    mounted () {
        setTimeout(this.onWindowSizeChange, 500)
        this.originalSidebarWidth = getComputedStyle(document.documentElement).getPropertyValue('--right-side-bar-width')
        document.documentElement.style.setProperty('--right-side-bar-width', this.rightWidth)
    },
    destroyed () {
        document.documentElement.style.setProperty('--right-side-bar-width', this.originalSidebarWidth)
    },

    methods: {
        /**
         * Make sure that the layout is always full height of parent.
         */
        onWindowSizeChange () {
            this.$nextTick(() => {
                let height
                const bodyRect = document.body.getBoundingClientRect()
                const layout = this.$refs.layout
                const panel = this.$refs['panel-right']
                // in some cases the layout and panel are undefined resulting in console errors
                if (layout && panel) {
                    layout.style.minHeight = 0
                    const appHeight = bodyRect.height
                    const layoutOffsetY = layout.getBoundingClientRect().top - bodyRect.top
                    const panelHeight = panel.scrollHeight
                    if (typeof this.resizeCalculationFunction === 'function') {
                        height = this.resizeCalculationFunction({
                            layout,
                            panel,
                            bodyRect,
                            appHeight,
                            layoutOffsetY,
                            panelHeight,
                        })
                    } else if (this.fixedHeight) {
                        // height of the PMT menu
                        const headerHeight = document.getElementById('pmt-header').getBoundingClientRect().height
                        // all topbars present on the page
                        const topBars = [...document.getElementsByClassName('top-bar')]
                        // height of all topbars on the page
                        let topBarsHeight = 0
                        topBars.forEach(topBar => {
                            topBarsHeight += topBar.getBoundingClientRect().height
                        })
                        height = appHeight - (headerHeight + topBarsHeight)
                    } else {
                        height = this.calculateMinHeight(layout, panel, bodyRect)
                    }
                    layout.style.height = height + 'px'
                    // needs a bit of rework in order to make the menu topbar non fixed on mobile
                    // if (this.fixedHeight) {
                    //     layout.style.height = height + (this.IS_MOBILE ? 56 /**main navbar height */ : 0) + 'px'
                    // } else {
                    //     layout.style.minHeight = height + 'px'
                    // }
                    this.$emit('on-size-change', height)
                }
            })
        },
        calculateMinHeight (appHeight, panelHeight, layoutOffsetY) {
            let minHeight = appHeight - layoutOffsetY

            if (panelHeight > minHeight) {
                minHeight = panelHeight
            }

            return minHeight
        },
        calculateFixedHeight (appHeight, layoutOffsetY) {
            return appHeight - layoutOffsetY
        },
        scroll (event) {
            const scrollY = event.srcElement.scrollTop
            const visible = event.srcElement.clientHeight + 10
            const pageHeight = event.srcElement.scrollHeight
            const bottomOfPage = visible + scrollY >= pageHeight
            if ((bottomOfPage || pageHeight < visible) && !this.fetchingNews && !this.noMoreResults) {
                this.$emit('scrolled-bottom')
            }
            if (this.fullScrollEvent) {
                this.$emit('scroll', event)
            }
        },

        onScroll (e) {
            const element = document.getElementById('main')
            this.scrollTopVisible = element.scrollTop > 200
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/layout.scss';

    .bp-60 {
        padding-bottom: 60px;
    }
</style>
