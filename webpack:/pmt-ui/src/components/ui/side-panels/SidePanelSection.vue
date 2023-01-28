<template>
    <div :class="classList">
        <h3
            ref="expand"
            class="title"
            :class="{big: bigTitle}"
            @click="toggleContent"
        >
            {{ title }}
            <Chip
                v-if="titleExtra || (!titleExtra && forceShowTitleExtra)"
                ref="titleExtra"
                :text="titleExtra"
                simple
                outline
            />
            <chevron-down
                :class="{'icon-extra': titleExtra}"
                class="icon"
            />
        </h3>
        <div class="content-container">
            <transition name="slide">
                <div
                    v-if="show"
                    class="content"
                >
                    <slot />
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SidePanelSection',

    props: {
        title: {
            type: String,
            required: true,
        },
        openOnInit: {
            type: Boolean,
            default: true,
        },
        padding: {
            type: Boolean,
            default: false,
        },
        topBorder: {
            type: Boolean,
            default: true,
        },
        titleExtra: {
            type: [String, Number],
            default: '',
        },
        forceShowTitleExtra: {
            type: Boolean,
            default: false,
        },
        bigTitle: {
            type: Boolean,
            default: false,
        },
    },

    data () {
        return {
            show: false,
        }
    },

    computed: {
        classList () {
            return [
                'side-panel-section animated slideInRight',
                {
                    open: this.show,
                    padding: this.padding,
                    'top-border': this.topBorder,
                    big: this.bigTitle,
                },
            ]
        },
    },

    created () {
        if (this.openOnInit) {
            this.show = true
        }
    },

    methods: {
        toggleContent () {
            this.show = !this.show
        },
    },

}
</script>

<style lang="scss" scoped>
    @import '@/components/ui/side-panels/SidePanelSections.scss';
</style>
