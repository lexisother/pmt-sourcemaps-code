<template>
    <span v-tooltip="tooltip">
        <component
            :is="copied ? 'done' : 'content-copy'"
            :ref="copied ? 'done' : 'contentCopy'"
            :size="parseInt(size)"
            title=""
            :class="{'text-normal': !copied, 'text-success': copied, 'copy-icon': true}"
            @click="copy()"
        />
    </span>
</template>

<script>
import navigatorHelper from '@/libraries/navigatorHelper'
export default {
    name: 'CopyToClipboard',

    props: {
        size: {
            type: [String, Number],
            default: 18,
        },
        elementId: [String, Number],
    },

    data () {
        return {
            copied: false,
        }
    },

    computed: {
        tooltip () {
            return this.copied ? this.$t('ui.singles.copied', [this.elementId]) : this.$t('ui.singles.copyToClipboard')
        },
    },

    methods: {
        async copy () {
            this.copied = true
            await navigatorHelper.copyElementText(this.elementId)
            /**
                 * this is used to visually indicate to the user,
                 * for x amount of time, that the text was copied
                */
            setTimeout(() => {
                this.copied = false
            }, 2000)
        },
    },
}
</script>

<style lang="scss" scoped>
    .copy-icon {
        cursor: pointer;
    }
</style>
