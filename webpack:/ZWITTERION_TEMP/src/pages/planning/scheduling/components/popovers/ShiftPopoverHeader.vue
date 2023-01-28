<template>
    <div>
        <VCardTitle class="grey-200">
            <span>
                {{ cardTitle }}
            </span>
            <template v-if="extraTitleIcons.length">
                <span
                    v-for="(item, index) in extraTitleIcons"
                    :key="index"
                    v-tooltip="item.tooltip"
                    class="extra-icon"
                >
                    <component
                        :is="item.icon"
                        :ref="item.ref"
                        :size="16"
                        color="inherit"
                        name=""
                        title=""
                    />
                </span>
            </template>
        </VCardTitle>
        <VCardSubtitle class="grey-140">
            <span>
                <span v-if="(shift.account_id || selectedEmployee.account_id) && !shift.notAssigned">{{ $t('ui.singles.for') }} {{ selectedEmployee.name }}</span> {{ $t('ui.singles.on') }} {{ eventDate }}
            </span>
        </VCardSubtitle>
        <PmtButton
            ref="close"
            v-ripple
            default
            round
            medium
            icon="close"
            icon-size="20"
            class="close"
            :disabled="saving"
            cy_id="close-shift-btn"
            @click="$emit('cancel')"
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'ShiftPopoverHeader',
    mixins: [mixins],
    props: {
        lentOut: Boolean,
        lentIn: Boolean,
        shift: {
            type: Object,
            required: true,
        },
        selectedEmployee: {
            type: Object,
            default: () => ({}),
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
        saving: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        /**
         * Determines if the shift department is not within the selected page filters
         * Used to indicate that the current shift is filtered out but still shown for planning ease
         * @return {Boolean}
         */
        showFilteredMessage () {
            if ((this.isStandardShifts && this.$route.query.account_id) || this.$route.meta.standard_shifts_account_id) return false
            if (!this.filters.departments.length) return false
            return !this.FITS_FILTERS_ON({ department_ids: [this.shift.department_id] })
        },
        /**
         * Returns a list of extra icons that should be visible in the form
         * @returns {Array}
         */
        extraTitleIcons () {
            const result = []
            if (this.shift.readOnly || this.readOnly) {
                result.push({
                    tooltip: this.$t('pages.scheduling.tooltips.readOnlyShift'),
                    icon: 'lock',
                    ref: 'nonEditableIcon',
                })
            }
            if (this.showFilteredMessage) {
                result.push({
                    tooltip: this.baseTranslate('shiftPopover.isNotIncludedInFilters'),
                    icon: 'filter-off-outline',
                    ref: 'filteredOutIcon',
                })
            }
            if (this.shift.frequency) {
                result.push({
                    tooltip: this.baseTranslate(`tooltips.${this.shift.frequency === 1 ? 'everyWeek' : 'everyXWeeks'}`, { weeks: this.shift.frequency }),
                    icon: 'calendar-sync',
                    ref: 'frequencyIcon',
                })
            }
            return result
        },
        /**
         * Returns the title of the form card
         * @returns {String}
         */
        cardTitle () {
            if (this.lentOut) {
                return this.baseTranslate('contextMenu.lendOutEmployee')
            }
            if (this.lentIn) {
                return this.baseTranslate('contextMenu.lentInEmployee')
            }
            if (this.shift.readOnly || this.readOnly || this.weekIsClosed) {
                return this.baseTranslate(`shiftPopover.titles.view${this.shift.nonProductive ? 'NonProductive' : 'Schedule'}`)
            }
            if (this.shift.isNew || !this.shift.account_id) {
                return this.baseTranslate(`shiftPopover.titles.new${this.shift.nonProductive ? 'NonProductive' : this.shift.notAssigned ? 'NotAssigned' : 'Schedule'}`)
            }
            if (this.shift.notAssigned) {
                return this.baseTranslate('shiftPopover.titles.editNotAssignedShift')
            }
            return this.baseTranslate(`shiftPopover.titles.edit${this.shift.nonProductive ? 'NonProductive' : 'Schedule'}`)
        },
        /**
         * Gets the readable format of the shift date
         * @returns {String}
         */
        eventDate () {
            if (this.isStandardShifts) {
                return this.$moment(this.shift.start_datetime).format('dddd')
            }
            return this.$moment(this.shift.start_datetime).longDayFormat()
        },
    },
}
</script>

<style lang="scss" scoped>
@import './styling/scheduling-grid-form.scss';
</style>
