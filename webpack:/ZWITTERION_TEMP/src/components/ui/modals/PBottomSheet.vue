<template>
    <transition
        name="pop"
        appear
    >
        <div
            class="bottom-sheet-overlay"
            @click="$emit('close', $event)"
        >
            <div class="bottom-sheet-wrapper">
                <div
                    class="bottom-sheet-container"
                    @click.stop.prevent="$emit('body-click', $event)"
                >
                    <slot />
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'PBottomSheet',
}
</script>

<style lang="scss" scoped>

.bottom-sheet-overlay {
    position: fixed;
    z-index: 99;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    cursor: pointer;
    display: table;
    transition: opacity .25s ease;
}

.bottom-sheet-wrapper {
    z-index: 100;
    display: table-cell;
    vertical-align: bottom;
}

.bottom-sheet-container {
    cursor: initial;
    background-color: #fff;
    transition: all .25s ease;
    max-height: 50%;
    overflow: auto;
}

/* ---------------------------------- */

.pop-enter-active,
.pop-leave-active {
    transition: transform .25s cubic-bezier(0.5, 0, 0.5, 1);
}

.pop-enter .bottom-sheet-container  {
    transform: translateY(200%);
}
.pop-leave-active .bottom-sheet-container {
    transform: translateY(200%);
}

</style>
