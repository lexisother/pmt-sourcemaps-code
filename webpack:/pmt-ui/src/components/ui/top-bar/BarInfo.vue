<template>
    <div
        ref="barInfo"
        v-tooltip="{content: tooltip, placement: 'bottom'}"
        class="bar-info"
    >
        <slot>
            <span>{{ text }}</span>
        </slot>
    </div>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default: '',
        },
        tooltip: {
            type: String,
            default: '',
        },
    },
}
</script>
<style lang="scss" scoped>
.bar-info {
    margin: 8px 5px;
    background-color: var(--blue-30);
    color: var(--grey-200);
    padding: 8px 10px;
    border-radius: 2px;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
}
</style>
