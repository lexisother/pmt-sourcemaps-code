<template>
    <transition
        name="fade"
        @after-enter="afterEnter"
        @before-enter="beforeEnter"
        @after-leave="afterLeave"
    >
        <div
            v-if="show"
            :class="getClassList()"
            :data-portal="portalName"
        >
            <slot />
            <portal-target :name="portalName" />
        </div>
    </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import stringHelper from '@/libraries/stringHelper'
export default {
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        fullscreen: {
            type: Boolean,
            default: true,
        },
        enterDelay: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            id: '',
        }
    },
    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        portalName () {
            return 'overlay-' + this.id
        },
    },
    created () {
        this.id = stringHelper.generateId()
        const zendesk = document.getElementsByClassName('zEWidget-launcher')[0]
        if (zendesk && this.IS_MOBILE) {
            zendesk.style.zIndex = '49'
        }
    },
    methods: {
        getClassList () {
            return [
                'overlay',
                {
                    fullscreen: this.fullscreen,
                    'enter-delay': this.enterDelay,
                },
            ]
        },
        beforeEnter () {
            this.$emit('before-enter')
        },
        afterEnter () {
            if (this.fullscreen) {
                document.body.className += ' overlay'
            }

            this.$emit('after-enter')
        },
        afterLeave () {
            if (this.fullscreen) {
                document.body.className = document.body.className.replace('overlay', '')
            }

            this.$emit('after-leave')
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/breakpoints.scss';
    .overlay {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 8;

        background-color: rgba(0,0,0, .5);
        backdrop-filter: blur(3px);

        overflow: auto;

        &.fullscreen {
            position: fixed;
            z-index: 12;
        }
    }

    @media screen and #{$max-media-query-small} {
        .overlay {
            overflow: hidden;
        }
    };

    .fade-enter {
        opacity: 0;
    }

    .fade-enter-active {
        transition: opacity .3s;
    }

    .enter-delay {
        transition-delay: .5s;
    }

    .fade-leave-active {
        transition: opacity .3s;
        opacity: 0;
    }
</style>

<style lang="scss">
    body.overlay {
        overflow: hidden;
    }
</style>
