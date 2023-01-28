<template>
    <div
        ref="tabs"
        class="bar-tabs-container"
        :class="{ 'no-border': noBorder, 'd-flex': displayFlex }"
        :style="style"
    >
        <button
            v-for="(tab, index) in tabs"
            :id="`tab_${index}`"
            :key="index"
            :ref="`tab_${index}`"
            v-tooltip="tab.tooltip"
            v-ripple
            :class="{'tab': true, 'active': tab.selected}"
            tabindex="0"
            @click="tabClick(tab, index)"
            @keyup.enter="tabClick(tab, index)"
            @keyup.space="tabClick(tab, index)"
        >
            <div
                class="text"
            >
                <slot
                    :tab="tab"
                    :index="index"
                >
                    <span>{{ tab.text }}</span>
                </slot>
            </div>
        </button>
        <div
            v-if="$slots['tab-item']"
            class="tab-item animated"
            :class="animation"
            :style="tabItemStyle"
        >
            <slot name="tab-item" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'BarTabs',
    props: {
        tabs: {
            type: Array,
            required: true,
        },
        noBorder: {
            type: Boolean,
            default: false,
        },
        displayFlex: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            animation: '',
        }
    },
    computed: {
        style () {
            return {
                gridTemplateColumns: `repeat(${this.tabs.length}, 1fr)`,
            }
        },
        tabItemStyle () {
            return {
                gridColumn: `1/span ${this.tabs.length}`,
            }
        },
    },
    mounted () {
        this.selected = this.tabs.findIndex(t => t.selected)
    },
    methods: {
        tabClick (tab, index) {
            if (this.selected > index) {
                this.animation = 'slideInLeft'
            } else {
                this.animation = 'slideInRight'
            }
            this.selected = index
            setTimeout(() => {
                this.animation = ''
            }, 300)
            if (tab.action) {
                tab.action(tab.payload)
            }
            this.$emit('click', { tab, index })
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .bar-tabs-container {
        display: grid;
        position: relative;
        box-sizing: border-box;
        border-radius: 2px;

        .tab {
            min-width: 40px;
            text-align: center;
            font-size: 12px;
            background: $grey-20;
            cursor: pointer;
            border-top: 1px solid $grey-20;
            border-bottom: 1px solid $grey-20;
            &:first-of-type {
                border-left: 1px solid $grey-20;
            }
            &:last-of-type {
                border-right: 1px solid $grey-20;
            }
            .text {
                font-weight: 500;
            }
            &.active {
                background-color: $white;
                border-bottom: none;
                .text {
                    color: $grey-200;
                }
            }
            &:hover:not(.active) {
                background-color: $grey-30;
                .text {
                    color: $grey-140;
                }
            }
            &:focus-visible {
                outline: none;
                background-color: $grey-30;;
            }
        }
        .tab-item {
            border: 1px solid $grey-20;
            border-top: none
        }
    }
</style>
