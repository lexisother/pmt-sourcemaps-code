<template>
    <div :class="{'left': true, 'multiple': showMultiple}">
        <template v-if="distinctOverlapsCount > 0">
            <UmbrellaBeachOutline
                v-if="overlapsRdo"
                fill-color="white"
                :size="14"
                name=""
                title=""
            />
            <AccountSwitch
                v-else-if="shiftPendingSubstituteRequest(shift)"
                fill-color="white"
                :size="14"
                name=""
                title=""
            />
            <TimelineClockOutline
                v-else-if="shift.overlaps.businessTimes.from || shift.overlaps.businessTimes.to"
                fill-color="white"
                :size="14"
                name=""
                title=""
            />
            <AccountOff
                v-else-if="overlapsAvailability"
                fill-color="white"
                :size="14"
                name=""
                title=""
            />
            <div
                v-if="showMultiple"
                class="plus-other-overlaps"
            >
                +{{ distinctOverlapsCount - 1 }}
            </div>
        </template>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'ShiftLeftSide',
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            required: true,
        },
    },
    computed: {
        distinctOverlapsCount () {
            return this.shift.overlaps?.distinctOverlapsCount
        },
        showMultiple () {
            if (this.isStandardShifts || this.SHOW_SENT_SCHEDULES) return false
            return this.shift.overlaps?.distinctOverlapsCount > 1
        },
        overlapsRdo () {
            return this.shift?.overlaps?.rdo?.pending || this.shift?.overlaps?.rdo?.approved
        },
        overlapsAvailability () {
            return this.shift?.overlaps?.availability?.some || this.shift.overlaps?.substituteRequests?.approved
        },
    },
}
</script>
