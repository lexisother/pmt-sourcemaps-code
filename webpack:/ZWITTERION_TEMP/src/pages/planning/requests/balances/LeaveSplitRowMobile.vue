<template>
    <VCard>
        <VCardTitle>{{ item.rowType.label }}</VCardTitle>
        <VCardSubtitle><slot name="subtitle" /></VCardSubtitle>
        <VCardText>
            <div class="mobile-split">
                <div class="key-value-pair">
                    <div class="key">
                        {{ header('remainderLastYear').text }}:
                    </div>
                    <div class="value">
                        {{ item.remainderLastYear }}
                    </div>
                </div>
                <div class="key-value-pair">
                    <div class="key highlight">
                        {{ header('buildupThisYear').text }}
                    </div>
                </div>
                <div class="key-value-pair offset">
                    <div class="key">
                        {{ baseTranslate('buildupThisYear.buildupYearEnd') }}:
                    </div>
                    <div class="value">
                        {{ item.buildupYearEnd }}
                    </div>
                </div>
                <div class="key-value-pair offset">
                    <div class="key">
                        {{ baseTranslate('buildupThisYear.withdrawalToday') }}:
                    </div>
                    <div class="value">
                        {{ item.withdrawalToday }}
                    </div>
                </div>
                <div
                    v-if="item.totalBuildupThisYear"
                    class="key-value-pair offset"
                >
                    <div class="key">
                        {{ baseTranslate('buildupThisYear.total') }}:
                    </div>
                    <div
                        class="value total"
                        :class="positiveClasses(item.totalBuildupThisYear)"
                    >
                        {{ item.totalBuildupThisYear }}
                    </div>
                </div>
                <template v-if="item.expiresJuly || item.expiresJanuary">
                    <div class="key-value-pair">
                        <div class="key highlight">
                            {{ header('expiringLeave').text }}
                        </div>
                    </div>
                    <div class="key-value-pair offset">
                        <div class="key">
                            {{ expiringLabels.statutory }}:
                        </div>
                        <div
                            class="value total"
                            :class="positiveClasses(item.totalBuildupThisYear)"
                        >
                            {{ item.expiresJuly }}
                        </div>
                    </div>
                    <div class="key-value-pair offset">
                        <div class="key">
                            {{ expiringLabels.nonStatutory }}:
                        </div>
                        <div
                            class="value total"
                            :class="positiveClasses(item.totalBuildupThisYear)"
                        >
                            {{ item.expiresJanuary }}
                        </div>
                    </div>
                </template>
                <template v-if="item.balanceEndWeekYear">
                    <div class="key-value-pair">
                        <div class="key">
                            {{ header('balanceEndWeekYear').text }}:
                        </div>
                        <div
                            class="value total"
                            :class="positiveClasses(item.totalBuildupThisYear)"
                        >
                            {{ item.balanceEndWeekYear }}
                        </div>
                    </div>
                </template>
            </div>
        </VCardText>
    </VCard>
</template>

<script>
export default {
    name: 'LeaveSplitRowMobile',
    props: {
        item: {
            type: Object,
            default: () => (undefined),
        },
        headers: {
            type: Array,
            default: () => ([]),
        },
        expiringLabels: {
            type: Object,
            default: () => (undefined),
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
    methods: {
        header (itemType) {
            return this.headers.find(h => h.value === itemType)
        },
    },
}
</script>

<style lang="scss" scoped>
@import './LeaveSplit.scss';
</style>
