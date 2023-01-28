<!-- Inspiration: https://gist.github.com/MartinMalinda/ec1ba589e8c1c220e9f7b251fbd4d5c1#file-vue-lazy-four-vue -->
<!-- Full-Article: https://medium.com/js-dojo/lazy-rendering-in-vue-to-improve-performance-dcccd445d5f -->
<template>
    <component
        :is="tag"
        ref="targetEl"
        :style="`min-height:${fixedMinHeight ? fixedMinHeight : minHeight}px`"
        @mousedown="$emit('mousedown', $event)"
        @mousemove="$emit('mousemove', $event)"
        @mouseup="$emit('mouseup', $event)"
        @click="$emit('click', $event)"
        @keyup.tab="$emit('tab', $event)"
        @contextmenu="$emit('contextmenu', $event)"
        @mouseenter="$emit('mouseenter', $event)"
        @mouseleave="$emit('mouseleave', $event)"
        @mouseover="$emit('mouseover', $event)"
    >
        <slot v-if="shouldRender || !lazy" />
        <slot
            v-else
            name="placeholder"
        />
    </component>
</template>
<script setup>
import { useIntersectionObserver } from '@vueuse/core'
import { ref, nextTick, defineProps } from 'vue'
function onIdle (cb = () => {}) {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(cb)
    } else {
        setTimeout(() => {
            nextTick(cb)
        }, 300)
    }
}
const props = defineProps({
    renderOnIdle: Boolean,
    unrender: Boolean,
    lazy: {
        type: Boolean,
        default: true,
    },
    minHeight: {
        type: Number,
        default: 0,
    },
    unrenderDelay: {
        type: Number,
        default: 2000,
    },
    intersectionRenderDelay: {
        type: Number,
        default: 200,
    },
    // the amount of time to wait for the
    // component to be in the root view
    // before rendering the slot
    rootContainerQueryString: {
        type: String,
        default: '#main',
    },
    rootContainerObserverMargin: {
        type: Number,
        default: 2000,
    },
    tag: {
        type: String,
        default: 'div',
    },
})

const shouldRender = ref(false)
const targetEl = ref()
const fixedMinHeight = ref(0)
let unrenderTimer
let renderTimer
const emit = defineEmits(['rendered'])
const { stop } = useIntersectionObserver(
    targetEl,
    ([{ isIntersecting }]) => {
        if (props.lazy && isIntersecting) {
            // perhaps the user re-scrolled to a component that was set to unrender.
            // In that case stop the un-rendering timer
            clearTimeout(unrenderTimer)
            // If we're dealing un-rendering lets add a waiting period of {intersectionRenderDelay}ms before rendering.
            // If a component enters the viewport and also leaves it within {intersectionRenderDelay}ms it will not render at all.
            // This saves work and improves performance when user scrolls very fast
            const renderTimeDelay = props.unrender ? props.intersectionRenderDelay : 0
            renderTimer = setTimeout(() => {
                shouldRender.value = true
                emit('rendered', true)
            }, renderTimeDelay)
            shouldRender.value = true
            if (!props.unrender) {
                stop()
            }
        } else if (props.unrender) {
            // if the component was set to render, cancel that
            clearTimeout(renderTimer)
            unrenderTimer = setTimeout(() => {
                fixedMinHeight.value = targetEl.value?.clientHeight || 0
                shouldRender.value = false
                emit('rendered', false)
            }, props.unrenderDelay)
        }
    },
    {
        root: document.querySelector(props.rootContainerQueryString),
        rootMargin: `${props.rootContainerObserverMargin}px`,
    },
)
if (props.renderOnIdle) {
    onIdle(() => {
        shouldRender.value = true
        if (!props.unrender) {
            stop()
        }
    })
}
</script>
