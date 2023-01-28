<template>
    <MenuTooltip
        ref="shiftTooltipMenu"
        :show="show"
        :x="menuLeftPosition"
        :y="menuTopPosition"
        :max-width="maxTooltipWidth"
        @input="close($event)"
    >
        <VList
            v-if="show"
            ref="scenarioList"
            nav
            dense
        >
            <VListItem
                v-for="(scenario, i) in tooltipScenarios"
                :key="i"
                ref="scenario"
            >
                <VListItemIcon
                    v-if="scenario.icon"
                    ref="scenarioIcon"
                >
                    <component
                        :is="scenario.icon"
                        :size="18"
                        :fill-color="scenario.color"
                        style="align-self: center;"
                    />
                </VListItemIcon>
                <VListItemContent>
                    <VListItemTitle ref="scenarioTitle">
                        {{ scenario.title }}
                    </VListItemTitle>
                    <VListItemSubtitle
                        v-for="(subtitle, index) in scenario.subtitles"
                        :key="index"
                        ref="scenarioSubtitle"
                    >
                        {{ subtitle }}
                    </VListItemSubtitle>
                </VListItemContent>
            </VListItem>
        </VList>
    </MenuTooltip>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import schedulingHelper from '@/libraries/schedulingHelper'
import PlanningEmployee from '@/libraries/planningEmployee'
export default {
    name: 'ShiftTooltip',
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            default: () => (undefined),
        },
        availability: {
            type: Object,
            default: () => (undefined),
        },
        rdo: {
            type: Object,
            default: () => (undefined),
        },
        ssr: {
            type: Object,
            default: () => (undefined),
        },
        employee: {
            type: PlanningEmployee,
            required: true,
        },
        event: {
            type: MouseEvent,
            required: true,
        },
        showForShift: Boolean,
    },
    data () {
        return {
            rdoFormat: 'DD MMM HH:mm',
            rdoFormatMultipleDays: 'DD MMM',
            maxTooltipWidth: 375,
            shiftRect: {},
        }
    },
    computed: {
        show () {
            return (this.shift && this.showForShift) || !!this.availability || !!this.rdo || !!this.ssr
        },
        shiftTimes () {
            return {
                from: this.$moment(this.shift.start_datetime),
                to: this.$moment(this.shift.end_datetime),
            }
        },
        approvedSSROnTime () {
            const ssrs = this.employee.requests.approved_substitute_requests
            return ssrs.find(ssr => {
                const ssrTimeRange = this.$moment().momentTimeRange(this.$moment(ssr.schedule_time_from), this.$moment(ssr.schedule_time_to), 15, 'minutes', 'YYYY-MM-DD HH:mm')
                for (let i = 0; i < ssrTimeRange.length; i++) {
                    if (this.shiftTimeRange.includes(ssrTimeRange[i])) {
                        return true
                    }
                }
                return false
            })
        },
        nonAvailabilities () {
            const result = {
                school: [],
                sport: [],
                other: [],
            }
            const availabilities = this.employee.availabilities
            const shiftStartDate = this.$moment(this.shift.start_datetime).apiFormat()
            const shiftEndDate = this.$moment(this.shift.end_datetime).apiFormat()
            const availabilityFilter = (a, type) => a.type === type && (a.date === shiftStartDate || a.date === shiftEndDate)
            result.school = availabilities.filter(a => availabilityFilter(a, 'school'))
            result.sport = availabilities.filter(a => availabilityFilter(a, 'sport'))
            result.other = availabilities.filter(a => availabilityFilter(a, 'other'))
            return result
        },
        otherOverlaps () {
            if (!this.shift.overlaps) return false
            return this.shiftHasOverlap(this.shift)
        },
        tooltipScenarios () {
            const result = []
            if (this.shift) {
                this.readOnlyScenario(result)
                // this is not needed for now, might be needed in the standard shifts page
                // this.frequencyScenario(result)
                if (!this.shift.lentIn && !this.shift.nonProductive) {
                    this.businessTimesScenario(result)
                    this.substituteRequestsScenario(result)
                    this.otherOverlapsScenario(result)
                    this.filteredOutScenario(result)
                    this.indirectHoursScenario(result)
                }
                this.remarkScenario(result)
                this.exchangeScenario(result)
                this.smallShiftScenario(result)
            } else if (this.availability) {
                this.availabilityScenario(result)
            } else if (this.rdo) {
                this.rdoScenario(result)
            } else if (this.ssr) {
                this.substituteRequestScenario(result)
            }
            return result
        },
        menuTopPosition () {
            const timeblockHeight = this.shiftRect.height
            let base = this.shiftRect.y - timeblockHeight - 10
            this.tooltipScenarios.forEach((scenario, index) => {
                if (this.tooltipScenarios.length > 1) {
                    if (index > 0) {
                        base -= (!this.shift && this.isDayView) ? 90 : 40
                    }
                }
                if (scenario.subtitles.length > 1) {
                    base -= scenario.subtitles.length * 10
                }
                scenario.subtitles.forEach(st => {
                    if (st.length >= 60) {
                        base -= 5
                    }
                })
            })
            const compact = (this.availability || this.rdo || this.ssr) && this.settings.compactView
            return base - (compact ? 10 : 0)
        },
        menuLeftPosition () {
            if (this.shiftRect.x + this.maxTooltipWidth > this.PAGE_WIDTH) {
                return this.PAGE_WIDTH - this.maxTooltipWidth
            }
            return this.shiftRect.x
        },
        shiftTimeRange () {
            const shiftStart = this.$moment(this.shift.start_datetime)
            const shiftEnd = this.$moment(this.shift.end_datetime)
            return this.$moment().momentTimeRange(shiftStart.add(15, 'minutes'), shiftEnd.subtract(15, 'minutes'), 15, 'minutes', 'YYYY-MM-DD HH:mm')
        },
        hasPendingSubstituteRequest () {
            return !!this.shift.pending_substitute_request && Object.keys(this.shift.pending_substitute_request).length > 0
        },

        isOutsideDepartmentsFilter () {
            if (this.isStandardShifts && this.$route.query.account_id) return false
            return !this.shift.nonProductiveSimple && this.filters.departments.length && !this.filters.departments.includes(this.shift.department_id)
        },
    },
    created () {
        this.shiftRect = this.event.target.getBoundingClientRect()
    },
    methods: {
        close (value) {
            if (!value) {
                this.$emit('close')
            }
        },
        readOnlyScenario (result) {
            if (this.shift.readOnly) {
                const subtitles = []
                const icon = 'lock'
                const title = this.baseTranslate('tooltips.readOnlyShift')
                const departmentStatus = this.departmentsWeekStatuses(this.shift.department_id).slice(0, 1)[0]
                if (this.shift.isLentIn) {
                    result.push({
                        title,
                        subtitles,
                        icon,
                    })
                    return result
                }
                if (departmentStatus && departmentStatus.status === 'closed') {
                    subtitles.push(`${this.$t('ui.singles.department')} ${this.departmentStatusTranslation(departmentStatus)} - ${this.departmentStatusChanged(departmentStatus)}`)
                }
                if (this.shift.readOnlySsr) {
                    subtitles.push(this.baseTranslate('tooltips.readOnlyNoSSRAccess'))
                }
                result.push({
                    title,
                    subtitles,
                    icon,
                })
            }
            return result
        },
        frequencyScenario (result) {
            if (this.shift.frequency) {
                const subtitles = []
                if (this.shift.frequency === 1) {
                    subtitles.push(this.baseTranslate('tooltips.everyWeek'))
                } else {
                    subtitles.push(this.baseTranslate('tooltips.everyXWeeks', { weeks: this.shift.frequency }))
                }
                result.push({
                    title: this.baseTranslate('tooltips.recurringTitle'),
                    subtitles,
                    icon: 'calendar-sync',
                })
            }
        },
        remarkScenario (result) {
            if (this.shift.remark) {
                const subtitles = [this.shift.remark]
                result.push({
                    title: this.$t('ui.singles.remark'),
                    subtitles,
                    icon: 'chat-processing-outline',
                })
            }
        },
        exchangeScenario (result) {
            const lentIn = this.shift.lentIn
            const lentOut = this.shift.lentOut
            if (lentIn || lentOut) {
                const store = this.employee.exchangeStore || this.shiftStore(this.shift)
                const name = store.store_name
                const storeNumber = store.retail_store_number
                let title = this.baseTranslate('tooltips.lentInFromStore', { name })
                let icon = 'account-arrow-left'
                if (lentOut) {
                    title = this.baseTranslate('tooltips.lentOutToStore', { name })
                    icon = 'account-arrow-right'
                }
                const subtitles = []
                // only show subtitle if store number is not included in the store name
                if (name && !name.includes(storeNumber)) {
                    subtitles.push(`${this.baseTranslate('shiftPopover.storeNumber')}: ${storeNumber}`)
                }
                result.push({ title, subtitles, icon })
            }
            return result
        },
        businessTimesScenario (result) {
            if (this.shift.nonProductiveSimple || !this.shift.overlaps || this.SHOW_SENT_SCHEDULES) return result
            if (this.shift?.overlaps?.businessTimes?.from || this.shift?.overlaps?.businessTimes?.to) {
                const dayBusinessTimes = this.weekStoreData.store_times.store_availability[this.shiftTimes.from.isoWeekday() - 1]
                const info = schedulingHelper.shiftOverlapBusinessTimesInfo(this.shift.overlaps.businessTimes, dayBusinessTimes)
                result.push({
                    title: info.title,
                    subtitles: [info.subTitle],
                    icon: 'timeline-clock-outline',
                    color: 'var(--red-100)',
                })
            }
            return result
        },
        substituteRequestsScenario (result) {
            if (this.shiftPendingSubstituteRequest(this.shift) && !this.SHOW_SENT_SCHEDULES) {
                result.push({
                    title: this.baseTranslate('tooltips.hasSubstituteRequests'),
                    subtitles: [this.baseTranslate('tooltips.substituteRequestsCount', [this.shift.pending_substitute_request.sent_to.length])],
                    icon: 'account-switch',
                    color: 'var(--orange-140)',
                })
            }
            return result
        },
        otherOverlapsScenario (result) {
            if (this.shift.nonProductiveSimple || this.SHOW_SENT_SCHEDULES) return result
            if (this.otherOverlaps) {
                const intermediaryResult = {
                    title: this.baseTranslate('overlap.employeeNotAvailableForTimes'),
                    subtitles: [],
                    icon: 'calendar-alert',
                    color: 'var(--red-100)',
                }
                const requests = this.employee.requests.request_time_off
                if (this.shift.overlaps.rdo.pending) {
                    requests.filter(r => r.status === 'pending').forEach(rdo => {
                        const start = this.$moment(`${rdo.start_date} ${rdo.start_time}`)
                        const end = this.$moment(`${rdo.end_date} ${rdo.end_time}`)
                        intermediaryResult.subtitles.push(`${this.baseTranslate('pageSettings.gridDisplay.items.pendingRdo')}: ${start.format(this.rdoFormat)} - ${end.format(this.rdoFormat)}`)
                    })
                }
                if (this.shift.overlaps.rdo.approved) {
                    const overlappingRdos = requests.filter(rdo => {
                        if (rdo.status !== 'approved') return false
                        const rdoStart = this.$moment(rdo.start_date).setTime(rdo.start_time)
                        const rdoEnd = this.$moment(rdo.end_date).setTime(rdo.end_time)
                        const rdoTimeRange = this.$moment().momentTimeRange(rdoStart.add(15, 'minutes'), rdoEnd.subtract(15, 'minutes'), 15, 'minutes', 'YYYY-MM-DD HH:mm')
                        let hasRdo = false
                        for (let i = 0; i < rdoTimeRange.length; i++) {
                            if (this.shiftTimeRange.includes(rdoTimeRange[i])) {
                                hasRdo = true
                                break
                            }
                        }
                        return hasRdo
                    })
                    overlappingRdos.forEach(rdo => {
                        const start = this.$moment(`${rdo.start_date} ${rdo.start_time}`)
                        const end = this.$moment(`${rdo.end_date} ${rdo.end_time}`)
                        intermediaryResult.subtitles.push(`${this.baseTranslate('pageSettings.gridDisplay.items.approvedRdo')}: ${start.format(this.rdoFormat)} - ${end.format(this.rdoFormat)}`)
                    })
                }
                if (this.shift.overlaps.substituteRequests.approved) {
                    const ssr = this.approvedSSROnTime
                    if (ssr) {
                        intermediaryResult.subtitles.push(this.baseTranslate('tooltips.approvedSubstituteRequest'))
                        intermediaryResult.subtitles.push(this.baseTranslate('tooltips.substituteShiftAssignedTo', { name: ssr.substitute_name }))
                        if (ssr.remark) {
                            intermediaryResult.subtitles.push(`${this.$t('ui.singles.remark')}: ${ssr.remark}`)
                        }
                    }
                }
                if (this.shift.overlaps.availability.school) {
                    this.insertAvailabilitySubtitles(intermediaryResult, 'school')
                }
                if (this.shift.overlaps.availability.sport) {
                    this.insertAvailabilitySubtitles(intermediaryResult, 'sport')
                }
                if (this.shift.overlaps.availability.other) {
                    this.insertAvailabilitySubtitles(intermediaryResult, 'other')
                }
                result.push(intermediaryResult)
            }
            return result
        },
        availabilityScenario (result) {
            let icon = 'school'
            let color = 'var(--red-100)'
            let available = 'notAvailable'
            const type = this.availability.type
            if (type === 'sport') {
                icon = 'soccer'
            }
            if (type === 'other') {
                icon = 'cancel'
            }
            if (type === 'agreed') {
                icon = 'lock'
                color = 'var(--green-140)'
                available = 'available'
            }
            if (type === 'preferred') {
                icon = 'check'
                color = 'var(--green-140)'
                available = 'available'
            }
            const availabilityType = this.$t(`components.timeBlock.types.${type}`)
            const remarks = this.employee.requests.availabilities.remarks
            const availabilityTimes = schedulingHelper.availabilityTimes(this.availability, this.SELECTED_DATE)
            const setWeeksetRemarksSubtitles = (subtitles) => {
                if (remarks.manager_remark) {
                    subtitles.push(`${this.$t('ui.singles.manager')}: ${remarks.manager_remark || 'N/A'}`)
                }
                if (remarks.employee_remark) {
                    subtitles.push(`${this.$t('ui.singles.employee')}: ${remarks.employee_remark || 'N/A'}`)
                }
            }
            if (this.isDayView) {
                result.push({
                    title: this.baseTranslate(`tooltips.${available}`, { availabilityType }),
                    subtitles: [`${availabilityTimes.from.shortTime()} - ${availabilityTimes.to.shortTime()}`],
                    icon,
                    color,
                })
                if (remarks) {
                    const subtitles = []
                    setWeeksetRemarksSubtitles(subtitles)
                    result.push({
                        title: this.$t('ui.singles.remarks'),
                        subtitles,
                        icon: 'chat-processing-outline',
                    })
                }
            } else {
                const subtitles = []
                if (remarks) {
                    setWeeksetRemarksSubtitles(subtitles)
                }
                const compact = this.settings.compactView
                result.push({
                    title: this.baseTranslate(`tooltips.${available}${!compact ? 'Simple' : ''}`, { availabilityType }),
                    subtitles,
                    color,
                })
            }
            return result
        },
        rdoScenario (result) {
            const start = this.$moment(`${this.rdo.start_date} ${this.rdo.start_time}`)
            const end = this.$moment(`${this.rdo.end_date} ${this.rdo.end_time}`)
            const isMultipleDays = start.date() !== end.date()
            const subtitleFormat = isMultipleDays ? this.rdoFormatMultipleDays : this.rdoFormat
            const duration = schedulingHelper.rdoDuration(this.rdo).humanize()
            const subtitles = [`${start.format(subtitleFormat)} - ${end.format(subtitleFormat)} (${duration})`]
            if (this.rdo.remark) {
                subtitles.push(`${this.$t('ui.singles.remark')}: ${this.rdo.remark}`)
            }
            result.push({
                title: `${this.baseTranslate(`tooltips.rdo.${this.rdo.status}`)}`,
                subtitles,
                icon: 'umbrella-beach-outline',
                color: this.rdo.status === 'pending' ? 'var(--orange-140)' : 'var(--grey-100)',
            })
            return result
        },
        substituteRequestScenario (result) {
            const subtitles = [this.baseTranslate('tooltips.substituteShiftAssignedTo', { name: this.ssr.substitute_name })]
            if (this.ssr.remark) {
                subtitles.push(`${this.$t('ui.singles.remark')}: ${this.ssr.remark}`)
            }
            result.push({
                title: this.baseTranslate('tooltips.approvedSubstituteRequest'),
                subtitles,
                icon: 'account-switch',
            })
            return result
        },
        filteredOutScenario (result) {
            if (this.shiftIsOutsideDepartmentsFilter(this.shift)) {
                result.push({
                    title: this.baseTranslate('shiftPopover.isNotIncludedInFiltersTitle'),
                    subtitles: [this.baseTranslate('shiftPopover.isNotIncludedInFilters')],
                    icon: 'filter-off-outline',
                })
            }
            return result
        },
        indirectHoursScenario (result) {
            if (!this.CAN_READ_INDIRECT_HOURS_OR_TASKS || this.isStandardShifts) return result
            const hours = this.shift.indirect_hours.filter(h => !h.toDelete)
            if (hours.length) {
                const indirectHourSubtitles = []
                hours.forEach(hour => {
                    const subtitle = `${this.indirectTaskType(hour.indirect_task_id).description} | ${hour.duration}`
                    indirectHourSubtitles.push(subtitle)
                })
                result.push({
                    title: this.baseTranslate('shiftPopover.indirectTasks.title'),
                    subtitles: indirectHourSubtitles,
                    icon: 'format-list-checks',
                })
            }
            return result
        },
        insertAvailabilitySubtitles (result, type) {
            const availabilities = this.nonAvailabilities[type].filter(availability => {
                const timeRange = schedulingHelper.availabilityTimeRange(availability)
                return this.shiftTimeRange.find(time => timeRange.includes(time))
            })
            const available = type === 'agreed' || type === 'preferred'
            const availabilityType = this.$t(`components.timeBlock.types.${type}`)
            const availableTranslation = this.baseTranslate(`tooltips.${available ? 'availableSimple' : 'notAvailableSimple'}`)
            availabilities.forEach(availability => {
                const availabilityTimes = schedulingHelper.availabilityTimes(availability)
                result.subtitles.push(`${availableTranslation} (${availabilityType}): ${availabilityTimes.from.shortTime()} - ${availabilityTimes.to.shortTime()}`)
            })
        },

        smallShiftScenario (result) {
            if (!this.isDayView) return
            if (this.shift.nonProductive || this.shift.duration > '01:00') return
            const from = this.$moment(this.shift.start_datetime).shortTime()
            const to = this.$moment(this.shift.end_datetime).shortTime()
            const breakLength = this.shift.breaks[0].duration
            const department = this.currentEmployeeDepartments.find(d => d.department_id === this.shift.department_id)
            result.push({
                title: department.department_name,
                subtitles: [`${from} - ${to} | ${breakLength}`],
                icon: 'send',
                color: 'var(--blue-100)',
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.tooltip-content {
    padding: 5px;
}
:deep() {
    .v-list-item__content {
        padding: 5px 0 !important;
    }
    .v-list-item {
        margin-bottom: 0 !important;
        .v-list-item__subtitle {
            white-space: inherit;
        }
    }
}
</style>
