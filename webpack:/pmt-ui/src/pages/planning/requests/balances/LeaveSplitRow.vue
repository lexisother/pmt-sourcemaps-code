<template>
    <tr>
        <td>
            <div>
                {{ item.rowType.label }}
            </div>
        </td>
        <td>
            <div class="cell">
                <div class="flexed-item">
                    {{ item.remainderLastYear }}
                </div>
            </div>
        </td>
        <td>
            <div class="cell">
                <div class="flexed-item">
                    {{ item.buildupYearEnd }}
                </div>
                <div class="flexed-item">
                    {{ item.withdrawalToday }}
                </div>
                <div
                    v-if="item.totalBuildupThisYear"
                    class="flexed-item half text-semi-bold"
                >
                    <span
                        class="total"
                        :class="positiveClasses(item.totalBuildupThisYear)"
                    >
                        {{ item.totalBuildupThisYear }}
                    </span>
                </div>
            </div>
        </td>
        <td v-if="item.expiresJuly || item.expiresJanuary">
            <div class="cell">
                <div class="flexed-item">
                    <span
                        class="total"
                        :class="positiveClasses(item.expiresJuly)"
                    >{{ item.expiresJuly }}</span>
                </div>
                <div class="flexed-item">
                    <span
                        class="total"
                        :class="positiveClasses(item.expiresJanuary)"
                    >{{ item.expiresJanuary }}</span>
                </div>
            </div>
        </td>
        <td v-if="item.balanceEndWeekYear">
            <div class="cell">
                <div class="flexed-item text-semi-bold">
                    <span
                        class="total"
                        :class="positiveClasses(item.balanceEndWeekYear)"
                    >
                        {{ item.balanceEndWeekYear }}
                    </span>
                </div>
            </div>
        </td>
    </tr>
</template>

<script>
export default {
    name: 'LeaveSplitRow',
    props: {
        item: {
            type: Object,
            default: () => (undefined),
        },
        headers: {
            type: Array,
            default: () => ([]),
        },
        baseTranslate: {
            type: Function,
            required: true,
        },
        positiveClasses: {
            type: Function,
            required: true,
        },
    },
}
</script>

<style lang="scss" scoped>
@import './LeaveSplit.scss';
</style>
