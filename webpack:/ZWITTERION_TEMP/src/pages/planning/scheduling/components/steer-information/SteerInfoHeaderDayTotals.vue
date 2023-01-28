<template>
    <div
        v-if="steerInfo && column"
        :key="DAY_TOTALS_STEER_TYPE"
        v-tooltip="steerInfoDayHeaderMeaning(day, departmentId)"
        class="day-totals animated zoomIn"
        :class="{'smaller': isSmaller && !isDayView}"
    >
        <div class="day-totals__item">
            {{ column.norm_actual }}
        </div>
        <VDivider vertical />
        <div class="day-totals__item">
            {{ column.planning_actual }}
        </div>
        <VDivider vertical />
        <div
            class="day-totals__item bold"
            :class="{'value-error plus': column.deviationError}"
        >
            {{ column.deviation }}
        </div>
    </div>
</template>

<script>
import mixins from './mixins'
export default {
    name: 'SteerInfoHeaderDayTotals',
    mixins: [mixins],
    props: {
        day: {
            type: Object,
            default: undefined,
        },
        departmentId: {
            type: Number,
            default: undefined,
        },
    },
    computed: {
        isSmaller () {
            return this.PAGE_WIDTH < 1500
        },
        column () {
            if (!this.departmentId) {
                return this.daySteerTypeInfo(this.DAY_TOTALS_STEER_TYPE, this.day)
            }
            const columns = this.steerColumns(this.day, this.departmentId)
            if (columns) {
                return columns[this.DAY_TOTALS_STEER_TYPE]
            }
            return {}
        },
    },
}
</script>

<style lang="scss" scoped>
.day-totals {
    font-size: .8rem;
    overflow: hidden;
    display: flex;
    justify-content: space-evenly;
    animation-duration: .4s !important;
    min-height: 30px;
    &.smaller * {
        font-size: .7rem;
        padding: 0 !important;
    }
    &__item {
        padding-inline: .4rem;
        text-align: center;
        white-space: nowrap;
        flex: 1;
        &.smaller {
            padding-inline: 0;
        }
    }
}
</style>
