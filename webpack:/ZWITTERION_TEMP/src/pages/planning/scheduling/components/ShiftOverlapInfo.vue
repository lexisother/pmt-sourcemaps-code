<template>
    <div v-if="hasShiftsOverlap || overlapsBusinessTimes || otherOverlaps">
        <VDivider v-if="showDivider" />
        <Chip
            v-if="hasShiftsOverlap"
            error
            inverted
            text-left
        >
            {{ !isStandardShifts ? baseTranslate('overlap.shift') : baseTranslate('standardShifts.info.overlap') }}
        </Chip>
        <Chip
            v-if="overlapsBusinessTimes"
            error
            inverted
            text-left
        >
            {{ businessTimesInfo.title }} <span v-if="!shift.overlaps.businessTimes.closed">({{ dayBusinessTimes.business_from_time }} - {{ dayBusinessTimes.business_to_time }})</span>
        </Chip>
        <Chip
            v-if="otherOverlaps"
            error
            inverted
            text-left
        >
            {{ IS_MOBILE ? baseTranslate('overlap.notAvailableForTimes') : baseTranslate('overlap.employeeNotAvailableForTimes') }}
        </Chip>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import schedulingHelper from '@/libraries/schedulingHelper'
export default {
    name: 'ShiftOverlapInfo',
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            required: true,
        },
        hasShiftsOverlap: {
            type: Boolean,
            default: false,
        },
        showDivider: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        dayBusinessTimes () {
            const startsPreviousWeek = this.shiftHasAnotherWeekTimes(this.shift).startsPreviousWeek
            const shiftDate = startsPreviousWeek ? this.SELECTED_DATE.startOf('isoWeek') : this.$moment(this.shift.start_datetime)
            return this.weekStoreData.store_times.store_availability[shiftDate.isoWeekday() - 1]
        },
        businessTimesInfo () {
            return schedulingHelper.shiftOverlapBusinessTimesInfo(this.shift.overlaps.businessTimes, this.dayBusinessTimes)
        },
        otherOverlaps () {
            return !this.isCheckHours && this.shiftHasNonPlannableOverlap(this.shift)
        },
        overlapsBusinessTimes () {
            return this.shift.overlaps?.businessTimes?.some
        },
    },
}
</script>
