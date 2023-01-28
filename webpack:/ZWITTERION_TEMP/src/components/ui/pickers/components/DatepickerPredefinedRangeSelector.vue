<template>
    <div
        id="predefined-range-picker"
        class="predefined-ranges-container"
    >
        <div class="predefined-ranges-container">
            <ul class="ranges">
                <li
                    v-for="(item, i) in items"
                    :key="i"
                    class="range"
                    :class="itemClass(item)"
                    :cy_id="item.value"
                    @click="updateRange(item)"
                >
                    <slot
                        name="selected-range"
                        :item="item"
                    >
                        {{ item.text }}
                    </slot>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'

export default {

    name: 'DatepickerPredefinedRangeSelector',

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
    },

    data () {
        return {
            items: [
                {
                    text: this.$t('components.datepicker.range.predefineRanges.today'),
                    value: 'Today',
                    range: {
                        from: this.$moment(),
                        to: this.$moment(),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.yesterday'),
                    value: 'Yesterday',
                    range: {
                        from: this.$moment().add(-1, 'days'),
                        to: this.$moment().add(-1, 'days'),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.lastWeek'),
                    value: 'LastWeek',
                    range: {
                        from: this.$moment().add(-1, 'weeks').startOf('isoWeek'),
                        to: this.$moment().add(-1, 'weeks').endOf('isoWeek'),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.lastMonth'),
                    value: 'LastMonth',
                    range: {
                        from: this.$moment().add(-1, 'months').startOf('month'),
                        to: this.$moment().add(-1, 'months').endOf('month'),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.lastYear'),
                    value: 'LastYear',
                    range: {
                        from: this.$moment().add(-1, 'years').startOf('year'),
                        to: this.$moment().add(-1, 'years').endOf('year'),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.thisWeek'),
                    value: 'ThisWeek',
                    range: {
                        from: this.$moment().startOf('isoWeek'),
                        to: this.$moment().endOf('isoWeek'),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.thisMonth'),
                    value: 'ThisMonth',
                    range: {
                        from: this.$moment().startOf('month'),
                        to: this.$moment().endOf('month'),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.thisYear'),
                    value: 'ThisYear',
                    range: {
                        from: this.$moment().startOf('year'),
                        to: this.$moment().endOf('year'),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.nextWeek'),
                    value: 'NextWeek',
                    range: {
                        from: this.$moment().add(1, 'weeks').startOf('isoWeek'),
                        to: this.$moment().add(1, 'weeks').endOf('isoWeek'),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.nextMonth'),
                    value: 'NextMonth',
                    range: {
                        from: this.$moment().add(1, 'months').startOf('month'),
                        to: this.$moment().add(1, 'months').endOf('month'),
                    },
                },
                {
                    text: this.$t('components.datepicker.range.predefineRanges.nextYear'),
                    value: 'NextYear',
                    range: {
                        from: this.$moment().add(1, 'years').startOf('year'),
                        to: this.$moment().add(1, 'years').endOf('year'),
                    },
                },
            ],
        }
    },

    methods: {
        itemClass (item) {
            const sameValue = this.datepicker.selectedRange === item.value
            const sameRange = this.datepicker.selectedDateFrom.isSame(item.range.from, 'day') && this.datepicker.selectedDateTo.isSame(item.range.to, 'day')
            return {
                selected: sameValue || sameRange,
            }
        },
    },
}
</script>
