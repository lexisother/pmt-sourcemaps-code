<template>
    <div
        class="overlay"
        @mousedown.self.prevent="!isTimePickerOpen && !sendingForm && !isDeleting ? closeForm({saved: false, oldTimeBlock: entry}) : false"
        @keyup.esc="closeForm({saved: false, oldTimeBlock: entry})"
    >
        <div
            v-if="userWantsToDelete"
            class="entry-form delete"
            :style="position"
        >
            <div>
                {{ $t( 'pages.baseAvailability.confirmTimeBlockDeletion.title' ) }}
            </div>
            <i18n path="pages.baseAvailability.confirmTimeBlockDeletion.info">
                <strong>{{ $moment(timeBlock.date).longDayFormat() + ' (' + timeBlock.timeFrom + ' - ' + timeBlock.timeTo + ')' }}</strong>
            </i18n>
            <div>
                <pmt-button
                    default
                    @click="userWantsToDelete = false"
                >
                    {{ $t( 'forms.availabilityEntry.cancelBtn.label' ) }}
                </pmt-button>
                <pmt-button
                    danger
                    @click.prevent="deleteActiveTimeBlock(); userWantsToDelete = false"
                >
                    {{ $t( 'forms.availabilityEntry.deleteBtn.label' ) }}
                </pmt-button>
            </div>
        </div>

        <div
            v-if="!userWantsToDelete && availabilityPopoverVisible"
            ref="entryForm"
            :key="popOverKey"
            class="entry-form main"
            :class="{mobile: IS_MOBILE}"
            :style="position"
            @keyup.esc="closeForm({saved: false, oldTimeBlock: entry})"
        >
            <div>
                <div class="form-title">
                    <div class="availability-title">
                        {{ timeBlock.placeholder ? $t('forms.availabilityEntry.titles.new') : $t('forms.availabilityEntry.titles.edit') }}
                        <span
                            v-if="!timeBlock.placeholder && !isDisabled"
                            ref="deleteBtn"
                            class="delete-btn"
                        >
                            <pmt-button
                                v-tooltip="$t('forms.availabilityEntry.delete')"
                                danger
                                outline
                                round
                                mini
                                icon="delete-forever"
                                :loading="isDeleting"
                                icon-size="15"
                                :readonly="isDisabled || isDeleting"
                                @click="userWantsToDeleteClick"
                            />
                        </span>
                        <span
                            v-if="isDisabled"
                            class="delete-btn"
                        >
                            <pmt-button
                                id="close"
                                default
                                round
                                mini
                                icon="close"
                                icon-size="15"
                                :readonly="sendingForm"
                                @click="closeForm({saved: false, oldTimeBlock: entry})"
                            />
                        </span>
                    </div>
                    <changed-by
                        v-if="showModifiedField"
                        show-icon
                        :account-id="timeBlock.last_modified.account_id"
                        :modified-date="timeBlock.last_modified.datetime"
                    />
                </div>
                <div class="form-body">
                    <form
                        class="availability-entry"
                        @keyup.esc="closeForm({saved: false, oldTimeBlock: entry})"
                    >
                        <pmt-error :show="error !== ''">
                            {{ error }}
                        </pmt-error>
                        <div class="row">
                            <div class="col col-xs-6 pa-1">
                                <div class="form-field">
                                    <pmt-dropdown
                                        :key="dropdownKey"
                                        ref="typeField"
                                        v-model="typeModel"
                                        :label="$t( 'forms.availabilityEntry.typeField.label' )"
                                        :options="typeOptions"
                                        :readonly="isDisabled"
                                        :align-bottom="!IS_MOBILE"
                                        :offset-y="false"
                                        @item-selected="timeBlock.type = $event.key"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <time-range-picker
                                v-if="showTimeRangePicker"
                                id="entry-form-time-range"
                                ref="timeRangePicker"
                                :time="{from: timeBlock.timeFrom, to: timeBlock.timeTo}"
                                :is-school="isSchoolTypeSelected"
                                :readonly="isDisabled"
                                :allowed-hours-from="allowedHoursFrom"
                                :allowed-minutes-from="allowedMinutesFrom"
                                :allowed-hours-to="allowedHoursTo"
                                :allowed-minutes-to="allowedMinutesTo"
                                @hour-from-click="setPickerTime('hour-from', $event)"
                                @minute-from-click="setPickerTime('minute-from', $event)"
                                @hour-to-click="setPickerTime('hour-to', $event)"
                                @minute-to-click="setPickerTime('minute-to', $event)"
                            />
                            <!-- <time-range-input :time="{from: timeBlock.timeFrom, to: timeBlock.timeTo}" :disabled="isDisabled" @input="timeBlock.timeFrom = $event.from; timeBlock.timeTo = $event.to" /> -->
                            <pmt-time-range-input
                                v-if="showTimeRangeInput"
                                id="entry-form-time-range"
                                :key="overlapping"
                                ref="timeRange"
                                :disabled="isDisabled"
                                :readonly="isDisabled"
                                :time="{from: timeBlock.timeFrom, to: timeBlock.timeTo}"
                                :allowed-hours-from="allowedHoursFrom"
                                :allowed-minutes-from="allowedMinutesFrom"
                                :allowed-hours-to="allowedHoursTo"
                                :allowed-minutes-to="allowedMinutesTo"
                                not-null
                                :overlapping="overlapping"
                                :is-school="isSchoolTypeSelected"
                                @times-not-valid="timesNotValid = true"
                                @times-valid="timesNotValid = false, overlapping = false"
                                @ok="error = ''"
                                @time-from-input="setPickerTime('hour-from', $event); setPickerTime('minute-from', $event)"
                                @time-to-input="setPickerTime('hour-to', $event); setPickerTime('minute-to', $event)"
                            />
                        </div>
                        <div
                            v-if="timeBlock.type === 'school'"
                            class="row"
                        >
                            <div class="col col-xs-4 pa-1">
                                <div class="form-field">
                                    <pmt-dropdown
                                        id="travel-from"
                                        ref="travelFrom"
                                        v-model="travelBeforeModel"
                                        :label="$t('forms.availabilityEntry.travelBeforeField.label')"
                                        :options="travelOptionsBefore"
                                        :readonly="isDisabled || !travelOptionsBefore.length"
                                        :align-bottom="false"
                                        max-menu-height="240"
                                        :offset-y="false"
                                        :selected="travelBeforeModel"
                                    />
                                </div>
                            </div>
                            <div class="col col-xs-4 pa-1">
                                <div class="form-field">
                                    <pmt-dropdown
                                        id="travel-to"
                                        ref="travelAfter"
                                        v-model="travelAfterModel"
                                        :label="$t('forms.availabilityEntry.travelAfterField.label')"
                                        :options="travelOptionsAfter"
                                        :readonly="isDisabled || !travelOptionsAfter.length"
                                        :align-bottom="false"
                                        max-menu-height="240"
                                        :offset-y="false"
                                        :selected="travelAfterModel"
                                    />
                                </div>
                            </div>
                            <div class="col col-xs-4 pa-1">
                                <div class="form-field">
                                    <label>{{ $t('forms.availabilityEntry.lessonHoursField.label') }}</label>
                                    <pmt-button
                                        default
                                        block
                                        outline
                                        no-margin
                                        readonly
                                    >
                                        <span>{{ lessonHours }}</span>
                                    </pmt-button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div
                    v-if="!timeBlock.repeat || isInsideEditableWeekset"
                    class="form-actions"
                >
                    <div class="button-group">
                        <pmt-button
                            id="cancel"
                            ref="closeFormButton"
                            default
                            icon="close"
                            icon-size="15"
                            :disabled="sendingForm"
                            @click="closeForm({saved: false, oldTimeBlock: entry})"
                        >
                            {{ $t( 'forms.availabilityEntry.cancelBtn.label') }}
                        </pmt-button>
                        <pmt-button
                            ref="submitBtn"
                            primary
                            icon="content-save"
                            icon-size="15"
                            :loading="sendingForm"
                            :disabled="isDisabled || overlapping || timesNotValid"
                            type="submit"
                            @click="onSubmit"
                        >
                            {{ $t( 'forms.availabilityEntry.submitBtn.label' ) }}
                        </pmt-button>
                    </div>
                </div>
                <div
                    v-if="timeBlock.created && timeBlock.created.datetime"
                    class="form-history"
                >
                    <changed-by
                        show-created
                        show-prefix
                        :account-id="timeBlock.created.account_id"
                        :modified-date="timeBlock.created.datetime"
                    />
                </div>
                <div
                    v-if="timeBlock.repeat && (isEditingSetInViewMode || !isInsideEditableWeekset)"
                    class="disabled-info"
                >
                    <PmtInfo blue>
                        <template v-if="isEditingSetInViewMode">
                            <span class="info-body">{{ $t('forms.availabilityEntry.singleWeekEdit') }}</span>
                        </template>
                        <template v-else>
                            <h4 class="info-title">
                                {{ $t('forms.availabilityEntry.notEditableTitle') }}
                            </h4>
                            <span class="info-body">{{ $t('forms.availabilityEntry.notEditable') }}</span>
                        </template>
                    </PmtInfo>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import timeBlockHelper from '@/libraries/timeBlockHelper'
import TimeRangePicker from '@/components/ui/form/TimeRangePicker.vue'
import ComputedMixin from './EntryFormMixins/Computed'
import MethodsMixin from './EntryFormMixins/Methods'

export default {
    name: 'AvailabilityEntryForm',
    components: {
        TimeRangePicker,
    },
    mixins: [ComputedMixin, MethodsMixin],
    data () {
        return {
            entry: null,
            error: '',
            sendingForm: false,
            dropdownKey: 0,
            animations: {
                delete: 'bounceOut',
                create: 'rubberBand',
                update: 'jello',
            },
            isDeleting: false,
            currentFormRect: null,
            errorTimer: null,
            userWantsToDelete: false,
            popOverKey: 0,
            position: false,
            overlapping: false,
            disabled: false,
            timesNotValid: false,
        }
    },
    mounted () {
        if (this.timeBlock.type === 'school' && this.weekend) {
            this.resetEditingTimeblockType()
        }
        if (this.timeBlock.type === 'school' && !this.weekend && this.timeBlock.timeFrom < '07:00') {
            this.resetEditingTimeblockType()
        }
        if (this.timeBlock.type === 'agreed' && !this.canEditOthersAvailabilities && !this.isInsideEditableWeekset) {
            this.resetEditingTimeblockType()
        }
        if (this.$refs.entryForm) {
            this.position = this.getPopoverPosition(this.$refs.entryForm.getBoundingClientRect())
        }
        this.entry = timeBlockHelper.cloneTimeBlock(this.timeBlock, this.timeBlock.date) // save timeblock for undo/cancel operations
        this.setType(this.timeBlock.type).catch(() => {})
        if (!this.timeBlock.repeat) {
            this.updateTimeBlockTimes({ from: this.timeBlock.timeFrom, to: this.timeBlock.timeTo })
        }
    },
    destroyed () {
        clearTimeout(this.errorTimer)
    },
}
</script>

<style lang="scss" scoped>
    @import './PopoverStyle.scss';
</style>
