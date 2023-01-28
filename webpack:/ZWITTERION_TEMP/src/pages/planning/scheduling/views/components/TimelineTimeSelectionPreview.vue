<template>
    <span class="time-preview">
        <span
            v-if="selectionStart === timeIndex && selectionStart < selectionEnd"
            class="start-cell"
        >
            {{ daytime.shortTime() }}
        </span>
        <span
            v-else-if="selectionEnd === timeIndex && selectionEnd > selectionStart"
            class="end-cell"
        >
            {{ daytime.clone().add(1, 'hour').shortTime() }}
        </span>
        <span
            v-else-if="selectionStart === timeIndex && selectionStart > selectionEnd"
            class="end-cell"
        >
            {{ daytime.clone().add(1, 'hour').shortTime() }}
        </span>
        <span
            v-else-if="selectionEnd === timeIndex && selectionEnd < selectionStart"
            class="start-cell"
        >
            {{ daytime.shortTime() }}
        </span>
        <template v-else>
            <span class="center-cell">
                {{ daytime.clone().shortTime() }}
            </span>
        </template>
    </span>
</template>

<script>
export default {
    name: 'TimelineTimeSelectionInfo',
    props: {
        daytime: {
            type: Object,
            required: true,
        },
        timeIndex: {
            type: Number,
            required: true,
        },
        selectionStart: {
            type: Number,
            default: null,
        },
        selectionEnd: {
            type: Number,
            default: null,
        },
        hoveredTimeIndex: {
            type: Number,
            default: null,
        },
    },
}
</script>
<style lang="scss" scoped>
.time-preview {
    user-select: none;
    pointer-events: none;
    top: 3px;
    line-height: 10px;
    font-size: 10px;
    font-weight: 600;
    .start-cell {
        float: left;
        padding: 3px;
    }
    .end-cell {
        float: right;
        padding: 3px;
    }
    .center-cell {
        text-align: center;
        margin: auto;
        padding: 3px;
        display: block;
    }
}
</style>
