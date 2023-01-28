<template>
    <div :class="transitionClasses">
        <!--
            If needed the transition component can emit out of the box the following events,
            which can be used in the parent component to do other stuff. https://vuejs.org/v2/guide/transitions.html
                @before-enter="$emit('before-enter', $el)"
                @enter="$emit('enter', $el)"
                @after-enter="$emit('after-enter', $el)"
                @enter-cancelled="$emit('enter-cancelled', $el)"
                @before-leave="$emit('before-leave', $el)"
                @leave="$emit('enter', $el)"
                @after-leave="$emit('after-leave', $el)"
                @leave-cancelled="$emit('leave-cancelled', $el)"
        -->
        <component
            :is="isGroup ? 'transition-group' : 'transition'"
            :name="transitionName"
            appear
            :mode="mode"
        >
            <slot v-if="!isGroup" />
            <div
                v-else
                :key="itemKey"
            >
                <slot />
            </div>
        </component>
        <round-spinner
            v-if="loading"
            :loading="true"
            :size="45"
            :full-screen="true"
        />
    </div>
</template>

<script>
import browserHelper from '@/libraries/browserHelper'
export default {
    props: {
        mode: {
            type: String,
            default: 'in-out',
        },
        name: {
            type: String,
            default: 'slide',
        },
        direction: {
            type: String,
            default: 'right',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        fullscreenloading: {
            type: Boolean,
            default: false,
        },
        itemKey: {
            type: [Number, String],
            default: '',
        },
        isGroup: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        IS_IE () {
            return browserHelper.isInternetExplorer()
        },
        transitionClasses () {
            let res = this.direction
            if (this.IS_IE) {
                res += ' IS_IE'
            }
            return res
        },
        transitionName () {
            if (this.name === 'slide-sideways') {
                if (this.direction === 'right') return 'leftToRight'
                if (this.direction === 'left') return 'rightToLeft'
            }
            return this.name
        },
    },
}
</script>

<style lang="scss" scoped>

    .transition-tag {
        display: inline;
    }

    .slide-enter {
        opacity: 0;
    }

    .slide-enter-active {
        animation: slide-in .3s ease-in backwards;
        transition: opacity .3s;
    }

    .IS_IE .slide-enter-active {
        opacity: 1;
    }

    .slide-leave-active {
        animation: slide-out .3s ease-out forwards;
        transition: opacity .3s;
        opacity: 0;
        position: absolute;
    }

    .rightToLeft-enter-active {
        animation: rightToLeft 0.5s;
    }
    .rightToLeft-leave-active {
        animation: rightToLeft 0.5s reverse;
    }

    .leftToRight-enter-active {
        animation: leftToRight 0.5s;
    }
    .leftToRight-leave-active {
        animation: leftToRight 0.5s reverse;
    }
    .bounceIn-enter-active {
        animation: bounceIn 0.3s;
    }
    .bounceIn-leave-active {
        animation: bottomToTop 0.2s reverse;
    }
    .bottomToTop-enter-active {
        animation: bottomToTop 0.5s forwards;
    }
    .bottomToTop-leave-active {
        animation: bottomToTop 0.5s reverse;
    }
    .topToBottom-enter-active {
        animation: topToBottom 0.5s forwards;
    }
    .topToBottom-leave-active {
        animation: topToBottom 0.5s reverse;
    }

    .left {
        .slide-enter-active {
            animation: left-slide-in .3s ease-out backwards;
        }

        .slide-leave-active {
            animation: right-slide-out .3s ease-out forwards;
        }
    }

    .right {
        .slide-enter-active {
            animation: right-slide-in .3s ease-out forwards;
        }

        .slide-leave-active {
            animation: left-slide-out .3s ease-out backwards;
        }
    }

    .slide-move {
        transition: transform .3s;
    }

    @keyframes slide-in {
        from {
            transform: translateX(-100px);
        }
        to {
            transform: translateX(0);
        }
    }

    @keyframes slide-out {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(-400px);
        }
    }

    @keyframes left-slide-in {
        from {
            transform: translateX(-100px);
        }
        to {
            transform: translateX(0);
        }
    }

    @keyframes left-slide-out {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(-100px);
        }
    }

    @keyframes right-slide-in {
        from {
            transform: translateX(100px);
        }
        to {
            transform: translateX(0);
        }
    }

    @keyframes right-slide-out {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(100px);
        }
    }

    @-moz-keyframes rightToLeft {
        0% {
            transform: translateX(100vw);
        }
        50% {
            transform: translateX(-2em);
        }
        100% {
            transform: translateX(0);
        }
    }
    @-webkit-keyframes rightToLeft {
        0% {
            transform: translateX(100vw);
        }
        50% {
            transform: translateX(-2em);
        }
        100% {
            transform: translateX(0);
        }
    }
    @-o-keyframes rightToLeft {
        0% {
            transform: translateX(100vw);
        }
        50% {
            transform: translateX(-2em);
        }
        100% {
            transform: translateX(0);
        }
    }
    @keyframes rightToLeft {
        0% {
            transform: translateX(100vw);
        }
        50% {
            transform: translateX(-2em);
        }
        100% {
            transform: translateX(0);
        }
    }
    @-moz-keyframes leftToRight {
        0% {
            transform: translateX(-100vw);
        }
        50% {
            transform: translateX(2em);
        }
        100% {
            transform: translateX(0);
        }
    }
    @-webkit-keyframes leftToRight {
        0% {
            transform: translateX(-100vw);
        }
        50% {
            transform: translateX(2em);
        }
        100% {
            transform: translateX(0);
        }
    }
    @-o-keyframes leftToRight {
        0% {
            transform: translateX(-100vw);
        }
        50% {
            transform: translateX(2em);
        }
        100% {
            transform: translateX(0);
        }
    }
    @keyframes leftToRight {
        0% {
            transform: translateX(-100vw);
        }
        50% {
            transform: translateX(2em);
        }
        100% {
            transform: translateX(0);
        }
    }
    @-moz-keyframes bounceIn {
        from, 20%, 40%, 60%, 80%, to {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        0% {
            opacity: 0;
            transform: scale3d(0.3, 0.3, 0.3);
        }
        20% {
            transform: scale3d(1.1, 1.1, 1.1);
        }
        40% {
            transform: scale3d(0.9, 0.9, 0.9);
        }
        60% {
            opacity: 1;
            transform: scale3d(1.03, 1.03, 1.03);
        }
        80% {
            transform: scale3d(0.97, 0.97, 0.97);
        }
        to {
            opacity: 1;
            transform: scale3d(1, 1, 1);
        }
    }
    @-webkit-keyframes bounceIn {
        from, 20%, 40%, 60%, 80%, to {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        0% {
            opacity: 0;
            transform: scale3d(0.3, 0.3, 0.3);
        }
        20% {
            transform: scale3d(1.1, 1.1, 1.1);
        }
        40% {
            transform: scale3d(0.9, 0.9, 0.9);
        }
        60% {
            opacity: 1;
            transform: scale3d(1.03, 1.03, 1.03);
        }
        80% {
            transform: scale3d(0.97, 0.97, 0.97);
        }
        to {
            opacity: 1;
            transform: scale3d(1, 1, 1);
        }
    }
    @-o-keyframes bounceIn {
        from, 20%, 40%, 60%, 80%, to {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        0% {
            opacity: 0;
            transform: scale3d(0.3, 0.3, 0.3);
        }
        20% {
            transform: scale3d(1.1, 1.1, 1.1);
        }
        40% {
            transform: scale3d(0.9, 0.9, 0.9);
        }
        60% {
            opacity: 1;
            transform: scale3d(1.03, 1.03, 1.03);
        }
        80% {
            transform: scale3d(0.97, 0.97, 0.97);
        }
        to {
            opacity: 1;
            transform: scale3d(1, 1, 1);
        }
    }
    @keyframes bounceIn {
        from, 20%, 40%, 60%, 80%, to {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        0% {
            opacity: 0;
            transform: scale3d(0.3, 0.3, 0.3);
        }
        20% {
            transform: scale3d(1.1, 1.1, 1.1);
        }
        40% {
            transform: scale3d(0.9, 0.9, 0.9);
        }
        60% {
            opacity: 1;
            transform: scale3d(1.03, 1.03, 1.03);
        }
        80% {
            transform: scale3d(0.97, 0.97, 0.97);
        }
        to {
            opacity: 1;
            transform: scale3d(1, 1, 1);
        }
    }
    @-moz-keyframes bottomToTop {
        0% {
            opacity: 0;
            transform: translateY(100%);
        }
        100% {
            transform: translateY(0);
        }
        }
    @-webkit-keyframes bottomToTop {
        0% {
            opacity: 0;
            transform: translateY(100%);
        }
        100% {
            transform: translateY(0);
        }
    }
    @-o-keyframes bottomToTop {
        0% {
            opacity: 0;
            transform: translateY(100%);
        }
        100% {
            transform: translateY(0);
        }
    }
    @keyframes bottomToTop {
        0% {
            opacity: 0;
            transform: translateY(100%);
        }
        100% {
            transform: translateY(0);
        }
    }

    @-moz-keyframes topToBottom {
        0% {
            opacity: 0;
            transform: translateY(-15%);
        }
        100% {
            transform: translateY(0);
        }
        }
    @-webkit-keyframes topToBottom {
        0% {
            opacity: 0;
            transform: translateY(-15%);
        }
        100% {
            transform: translateY(0);
        }
    }
    @-o-keyframes topToBottom {
        0% {
            opacity: 0;
            transform: translateY(-15%);
        }
        100% {
            transform: translateY(0);
        }
    }
    @keyframes topToBottom {
        0% {
            opacity: 0;
            transform: translateY(-15%);
        }
        100% {
            transform: translateY(0);
        }
    }
</style>
