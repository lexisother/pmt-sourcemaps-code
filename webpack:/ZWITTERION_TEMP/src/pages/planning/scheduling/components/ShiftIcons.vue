<template>
    <span class="shift-icons">
        <AccountArrowLeft
            v-if="isShiftLentIn(shift)"
            ref="lentInIcon"
            :size="14"
            name=""
            title=""
        />
        <AccountArrowRight
            v-if="isShiftLentOut(shift)"
            ref="lentOutIcon"
            :size="14"
            name=""
            title=""
        />
        <div
            v-if="CAN_READ_INDIRECT_HOURS_OR_TASKS && localIndirectHours.length"
            ref="indirectHoursLength"
            v-tooltip="$t('pages.scheduling.shiftPopover.shiftTabs.indirectTasks')"
            class="day-indirect-tasks"
        >
            {{ localIndirectHours.length }}
        </div>
        <span
            v-if="shift.showRecurringIcon || isStandard"
            v-tooltip="baseTranslate(`tooltips.${shift.frequency === 1 ? 'everyWeek' : 'everyXWeeks'}`, { weeks: shift.frequency })"
            class="shift-frequency-container"
        >
            <CalendarSync
                ref="frequencyIcon"
                :size="14"
                name=""
                title=""
            />
            <span class="shift-frequency">{{ shift.frequency }}</span>
        </span>
        <FilterOffOutline
            v-if="outsideDepartmentsFilter"
            ref="filteredOutIcon"
            :size="14"
            name=""
            title=""
        />
        <ChatProcessingOutline
            v-if="shift.remark"
            ref="remarkIcon"
            :size="16"
            name=""
            title=""
        />
        <Lock
            v-if="readOnly || shift.readOnly"
            ref="readOnlyLockIcon"
            :size="14"
            name=""
            title=""
        />
        <!-- Bellow buttons do not have any effect yet until proper logic is determined (api and front-end) -->
        <PmtButton
            v-if="showContinuousShift && startsPreviousDay && !isStandard"
            v-tooltip="baseTranslate('tooltips.startsPreviousWeek')"
            primary
            round
            inverted
            mini
            icon="chevron-double-left"
            :disabled="activeShift.showMenu"
            class="before"
            @click.stop.prevent="navigate(-1)"
        />
        <PmtButton
            v-if="showContinuousShift && endsNextDay && isDayView"
            v-tooltip="baseTranslate('tooltips.endsNextDay')"
            primary
            round
            inverted
            mini
            icon="chevron-double-right"
            :disabled="activeShift.showMenu"
            class="after"
            @click.stop.prevent="navigate(1)"
        />
        <PmtButton
            v-if="showContinuousShift && outsideWeek.after && !isDayView && !isStandard"
            v-tooltip="baseTranslate('tooltips.endsNextWeek')"
            primary
            round
            inverted
            mini
            icon="chevron-double-right"
            :disabled="activeShift.showMenu"
            class="after"
            @click.stop.prevent="navigate(1)"
        />
    </span>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'ShiftIcons',
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
        shift: {
            type: Object,
            required: true,
        },
        outsideDepartmentsFilter: {
            type: [Boolean, Number],
            default: false,
        },
        readOnly: Boolean,
    },
    data () {
        return {
            // there is yet no logic for determining if a sunday shift
            // has a corresponding continuous shift on monday or viceversa
            // this is yet to be implemented in the future
            showContinuousShift: false,
        }
    },
    computed: {
        localIndirectHours () {
            if (this.employee.notAssigned || !this.shift.indirect_hours) return []
            return this.shift.indirect_hours.filter(h => !h.toDelete)
        },
        startsPreviousDay () {
            const from = this.$moment(this.shift.start_datetime)
            return from.isBefore(this.SELECTED_DATE, 'day')
        },
        endsNextDay () {
            // we need to subtract a minute for cases when shifts ends at midnight 00:00
            // which technically is the next day.
            const to = this.$moment(this.shift.end_datetime).subtract(1, 'minutes')
            return to.isAfter(this.SELECTED_DATE, 'day')
        },
        outsideWeek () {
            const from = this.$moment(this.shift.start_datetime)
            const to = this.$moment(this.shift.end_datetime)
            return {
                before: from.isoWeek() < this.startDate.isoWeek(),
                after: to.isoWeek() > this.startDate.isoWeek(),
            }
        },
        outsideDay () {
            const from = this.$moment(this.shift.start_datetime)
            const to = this.$moment(this.shift.end_datetime)
            return {
                before: from.isoWeekday() < this.SELECTED_DATE.isoWeekday(),
                after: to.isoWeekday() > this.SELECTED_DATE.isoWeekday(),
            }
        },
    },
    methods: {
        async navigate (step) {
            const day = this.SELECTED_DATE.clone().add(step, this.isDayView ? 'days' : 'weeks')
            await this.$router.push({
                name: this.$route.name,
                params: this.isDayView ? day.dayWeekYearObject(true) : day.weekYearObject(),
            }).catch(() => { })
            this.getAllSchedulingData()
        },
    },
}
</script>

<style lang="scss" scoped>
.shift-icons {
    display: flex;
    align-items: center;
    gap: 3px;
    position: sticky;
    right: 0;
}
.shift-frequency-container {
    display: grid;
    grid-auto-flow: column;
    place-items: center;
    font-size: 11px;
    font-weight: 700;
}
.day-indirect-tasks {
    display: grid;
    place-content: center;
    background-color: var(--grey-100);
    color: white;
    height: 15px;
    width: 15px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 50%;

}
.new-shift-icon {
    color: var(--grey-100);
    padding: 0 5px;
    height: 14px;
    margin-left:0 !important;
}
</style>
