<template>
    <div
        class="overlay"
        @click.self.prevent="closeForm()"
    >
        <div
            ref="chooseEntryTypeForm"
            class="entry-form choose"
            :style="position"
            @keyup.esc="$emit('nothing')"
        >
            <div v-if="recurringStart">
                <h3>
                    {{ $t('forms.availabilityEntry.titles.new') }}
                </h3>
                <PmtButton
                    ref="createSingle"
                    normal
                    icon="calendar-today"
                    :icon-size="30"
                    @click="$emit('one-time')"
                >
                    <div>
                        {{ $t('forms.availabilityEntry.newAvailability.oneTime') }}
                    </div>
                </PmtButton>
                <PmtButton
                    ref="startRecurring"
                    normal
                    icon="calendar-multiple-check"
                    :icon-size="30"
                    @click="$emit('recurring'); recurringStart = false; importExistingRecuring = true;"
                >
                    <div>
                        {{ $t('forms.availabilityEntry.newAvailability.recurring') }}
                    </div>
                </PmtButton>
            </div>
            <div
                v-if="!recurringStart && importExistingRecuring"
                class="recurring-form"
            >
                <h3 style="font-weight: 600;">
                    {{ $t('forms.availabilityEntry.titles.new') }}
                </h3>
                <PmtButton
                    ref="freshStart"
                    v-tooltip="$t('forms.availabilityEntry.newAvailability.freshStartTooltip')"
                    normal
                    icon="calendar-plus"
                    :icon-size="30"
                    cy_id="freshStart"
                    @click="startFresh"
                >
                    <div>
                        {{ $t('forms.availabilityEntry.newAvailability.freshStart') }}
                    </div>
                </PmtButton>
                <PmtButton
                    ref="fromCurrent"
                    v-tooltip="$t('forms.availabilityEntry.newAvailability.fromCurrentTooltip')"
                    normal
                    icon="calendar-range"
                    :icon-size="30"
                    cy_id="fromCurrent"
                    @click="startRecurring"
                >
                    <div>
                        {{ $t('forms.availabilityEntry.newAvailability.fromCurrent') }}
                    </div>
                </PmtButton>
                <hr>
                <p style="font-size: 90%; text-align: justify; line-height: normal;">
                    {{ $t('forms.availabilityEntry.newAvailability.aboutWeeksetsPrimary') }}
                </p>
                <p style="font-size: 90%; text-align: justify; line-height: normal;">
                    {{ $t('forms.availabilityEntry.newAvailability.aboutWeeksetsSecondary') }}
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import timeBlockHelper from '@/libraries/timeBlockHelper'
import { mapGetters, mapMutations } from 'vuex'
export default {
    data () {
        return {
            entry: null,
            recurringStart: true,
            importExistingRecuring: true,
            position: false,
        }
    },
    computed: {
        ...mapGetters('availability', {
            timeBlock: 'activeTimeBlock',
            getPopoverPosition: 'getPopoverPosition',
        }),
        isAccountActivation () {
            return this.$route.name === 'activate-account-finalize'
        },
    },
    mounted (isNewWeekset) {
        this.position = this.getPopoverPosition(this.$refs.chooseEntryTypeForm.getBoundingClientRect())
        this.entry = timeBlockHelper.cloneTimeBlock(this.timeBlock, this.timeBlock.date)
    },
    methods: {
        ...mapMutations('availability', {
            availabilityFormReset: 'availabilityFormReset',
            closePopover: 'closePopover',
        }),
        startFresh () {
            this.$emit('start-fresh')
            this.closeForm(true)
        },
        startRecurring () {
            if (this.isAccountActivation) {
                this.$emit('start-fresh')
                this.closeForm(true)
            } else {
                this.$emit('start-import-recurring')
                this.recurringStart = false
                this.importExistingRecuring = true
                this.closeForm(true)
            }
        },
        closeForm (isNewWeekset) {
            this.availabilityFormReset({ saved: false, oldTimeBlock: this.entry, isNewWeekset })
            this.closePopover()
        },
    },
}
</script>

<style lang="scss" scoped>
    @import './PopoverStyle.scss';
</style>
