<template>
    <PmtContent>
        <PmtLayout>
            <VContainer>
                <VRow>
                    <VCol v-if="standardTimes.length">
                        <VCard class="p-2 p-md-3">
                            <VRow
                                v-if="STANDARDTIMES_ACCESS"
                                no-gutters
                            >
                                <VCol
                                    v-if="alertMessage && !IS_MOBILE"
                                    cols="12"
                                >
                                    <VAlert
                                        outlined
                                        type="error"
                                    >
                                        {{ alertMessage }}
                                    </VAlert>
                                </VCol>
                                <template v-for="index in 7">
                                    <VCol
                                        v-if="showFirstColumn(index - 1)"
                                        :key="'label-column-' + index"
                                        :cols="colsInLabelColumn"
                                    >
                                        <VSimpleTable>
                                            <template #default>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            &nbsp;
                                                        </th>
                                                    </tr>
                                                    <tr class="second-head-row">
                                                        <th>
                                                            &nbsp;
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{{ $t('pages.standardTimes.openingTimes') }}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>{{ $t('pages.standardTimes.businessTimes') }}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>{{ $t('pages.standardTimes.closed') }}</td>
                                                    </tr>
                                                </tbody>
                                            </template>
                                        </VSimpleTable>
                                    </VCol>
                                    <VCol
                                        :key="index"
                                        :cols="colsInValueColumn"
                                    >
                                        <VSimpleTable>
                                            <template #default>
                                                <thead>
                                                    <tr>
                                                        <th colspan="2">
                                                            {{ $moment().day(index).format('dddd') }}
                                                        </th>
                                                    </tr>
                                                    <tr class="second-head-row">
                                                        <th>{{ $t('pages.standardTimes.start') }}</th>
                                                        <th>{{ $t('pages.standardTimes.end') }}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <PInput
                                                                v-if="STANDARDTIMES_MANAGE"
                                                                :id="'opening_from_time_' + index"
                                                                v-model="standardTimes[index - 1].opening_from_time"
                                                                :cy_id="'opening_from_time_' + index"
                                                                dense
                                                                :danger="standardTimes[index - 1].opening_from_time_invalid"
                                                                :has-value="standardTimes[index - 1].opening_from_time_dirty"
                                                                :disabled="standardTimes[index - 1].closed"
                                                                :loading="focussedInput.index === index && focussedInput.identifier === 'opening_from_time'"
                                                                @input="isTyping(index - 1, 'opening_from_time')"
                                                                @blur="validateTime(index - 1, 'opening_from_time')"
                                                            />
                                                            <span v-else>{{ standardTimes[index - 1].opening_from_time }}</span>
                                                        </td>
                                                        <td>
                                                            <PInput
                                                                v-if="STANDARDTIMES_MANAGE"
                                                                :id="'opening_to_time_' + index"
                                                                v-model="standardTimes[index - 1].opening_to_time"
                                                                :cy_id="'opening_to_time_' + index"
                                                                dense
                                                                :danger="standardTimes[index - 1].opening_to_time_invalid"
                                                                :has-value="standardTimes[index - 1].opening_to_time_dirty"
                                                                :disabled="standardTimes[index - 1].closed"
                                                                :loading="focussedInput.index === index && focussedInput.identifier === 'opening_to_time'"
                                                                @input="isTyping(index - 1, 'opening_to_time')"
                                                                @blur="validateTime(index - 1, 'opening_to_time')"
                                                            />
                                                            <span v-else>{{ standardTimes[index - 1].opening_to_time }}</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <PInput
                                                                v-if="STANDARDTIMES_MANAGE"
                                                                :id="'business_from_time_' + index"
                                                                v-model="standardTimes[index - 1].business_from_time"
                                                                :cy_id="'business_from_time_' + index"
                                                                dense
                                                                :danger="standardTimes[index - 1].business_from_time_invalid"
                                                                :has-value="standardTimes[index - 1].business_from_time_dirty"
                                                                :disabled="standardTimes[index - 1].closed"
                                                                :loading="focussedInput.index === index && focussedInput.identifier === 'business_from_time'"
                                                                @input="isTyping(index - 1, 'business_from_time')"
                                                                @blur="validateTime(index - 1, 'business_from_time')"
                                                            />
                                                            <span v-else>{{ standardTimes[index - 1].business_from_time }}</span>
                                                        </td>
                                                        <td>
                                                            <PInput
                                                                v-if="STANDARDTIMES_MANAGE"
                                                                :id="'business_to_time_' + index"
                                                                v-model="standardTimes[index - 1].business_to_time"
                                                                :cy_id="'business_to_time_' + index"
                                                                dense
                                                                :danger="standardTimes[index - 1].business_to_time_invalid"
                                                                :has-value="standardTimes[index - 1].business_to_time_dirty"
                                                                :disabled="standardTimes[index - 1].closed"
                                                                :loading="focussedInput.index === index && focussedInput.identifier === 'business_to_time'"
                                                                @input="isTyping(index - 1, 'business_to_time')"
                                                                @blur="validateTime(index - 1, 'business_to_time')"
                                                            />
                                                            <span v-else>{{ standardTimes[index - 1].business_to_time }}</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colspan="2"
                                                            class="switch-cell"
                                                        >
                                                            <PmtSwitch
                                                                v-model="standardTimes[index - 1].closed"
                                                                :disabled="standardTimes[index - 1].toggle_disabled || !STANDARDTIMES_MANAGE"
                                                                @input="toggleClose(index - 1)"
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </template>
                                        </VSimpleTable>
                                    </VCol>
                                </template>
                            </VRow>
                            <EmptyState
                                v-else
                                ref="noAccess"
                                :title="$t('ui.singles.noAccess')"
                                :component="'four-o-four'"
                                :show="true"
                                :is-error="true"
                                no-padding
                            />
                        </VCard>
                    </VCol>
                </VRow>
            </VContainer>
        </PmtLayout>
        <VDialog
            ref="alertModal"
            v-model="alertModalOpen"
            persistent
            max-width="320"
        >
            <VCard class="py-4">
                <VCardText>
                    <VRow>
                        <VCol class="col-12 text-align-last-right">
                            <PmtButton
                                icon="close"
                                @click="alertModalOpen = false, alertMessage = ''"
                            />
                        </VCol>
                    </VRow>
                    <VRow>
                        <VCol>
                            <VAlert
                                outlined
                                type="error"
                            >
                                {{ alertMessage }}
                            </VAlert>
                        </VCol>
                    </VRow>
                </VCardText>
                <VCardActions>
                    <VSpacer />
                    <PmtButton
                        default
                        outline
                        :tab-index="0"
                        @click="alertModalOpen = false, alertMessage = ''"
                    >
                        {{ $t('ui.singles.close') }}
                    </PmtButton>
                </VCardActions>
            </VCard>
        </VDialog>
    </PmtContent>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
    name: 'StandardTimesOverview',
    data () {
        return {
            standardTimes: [],
            alertMessage: '',
            typingTimer: null,
            alertModalOpen: false,
            focussedInput: { index: null, identifier: null },
            reloadKey: true,
        }
    },
    computed: {
        ...mapGetters(['IS_MOBILE', 'PAGE_WIDTH']),
        ...mapGetters('configuration/standardTimes', ['STANDARD_TIMES']),
        ...mapGetters('auth', ['STANDARDTIMES_ACCESS', 'STANDARDTIMES_MANAGE']),
        /**
         * Determines width of the values column (scale 1-12)
         */
        colsInValueColumn () {
            if (this.PAGE_WIDTH < 768) {
                return 8
            } else if (this.PAGE_WIDTH < 992) {
                return 4
            } else {
                return 3
            }
        },
        /**
         * Determines width of the labels column (scale 1-12)
         */
        colsInLabelColumn () {
            if (this.PAGE_WIDTH < 992) {
                return 4
            } else {
                return 3
            }
        },
    },
    watch: {
        STANDARD_TIMES (newValue) {
            this.standardTimes = JSON.parse(JSON.stringify(newValue))
        },
        /**
         * For usability reasons alert messages on mobile are displayed in a modal
         */
        alertMessage (newValue) {
            if (newValue.length && this.IS_MOBILE) {
                this.alertModalOpen = true
            }
        },
        reloadKey () {
            this.standardTimes = this.STANDARD_TIMES
        },
    },
    mounted () {
        this.getStandardTimes()
        this.reloadKey = !this.reloadKey
    },
    methods: {
        ...mapActions('configuration/standardTimes', ['getStandardTimes', 'addStandardTimes', 'editStandardTimes']),
        ...mapMutations(['SET_SNACKBAR']),
        /**
         * Determines if the labels column is displayed directly before the column with actual times for a day
         * Depends on screen size
         */
        showFirstColumn (index) {
            if (this.PAGE_WIDTH < 768) {
                return true
            } else if (this.PAGE_WIDTH < 992 && index % 2 === 0) {
                return true
            } else if (this.PAGE_WIDTH >= 992 && (index === 0 || index === 3 || index === 6)) {
                return true
            }
            return false
        },
        /**
         * Detects when user stopped typing
         */
        isTyping (index, identifier) {
            this.focussedInput = { index: index + 1, identifier }
            clearTimeout(this.typingTimer)
            this.typingTimer = setTimeout(() => {
                this.validateTime(index, identifier)
                this.focussedInput = { index: null, identifier: null }
            }, 1500)
        },
        /**
         * Returns if a entered time has the right format
         */
        isValidTime (value) {
            this.alertMessage = ''

            // input must follow hh:mm pattern
            const pattern = '^([0-1]?[0-9]|2[0-4]):[0-5][0-9]$'
            if (!value || !value.match(pattern)) {
                this.alertMessage = this.$t('pages.standardTimes.formatMustBeHHmm')
                return false
            }

            // input cannot exceed 24:00
            const hours = value.substr(0, 2)
            const min = Number(value.substr(3, 2))
            if (hours >= 24 && min > 0) {
                this.alertMessage = this.$t('pages.standardTimes.canNotExceed2400')
                return false
            }

            // minutes must be 00 or 30
            const minutes = value.substr(3, 2)
            if (minutes !== '00' && minutes !== '30') {
                this.alertMessage = this.$t('pages.standardTimes.mustBeMultipleOf30')
                return false
            }

            return true
        },
        /**
         * Validates entered time
         * If so, it will engage the process of validating times for an entire day
         * If not, the input will have a danger state
         */
        validateTime (index, identifier) {
            this.alertMessage = ''
            let value = this.standardTimes[index][identifier]
            this.standardTimes[index][identifier + '_invalid'] = false
            this.standardTimes[index][identifier + '_dirty'] = true

            // change 00:00 inputs to 24:00 inputs if opening_to_time or business_to_time
            if (value === '00:00' && (identifier === 'opening_to_time' || identifier === 'business_to_time')) {
                value = '24:00'
                this.standardTimes[index][identifier] = value
            }

            if (this.isValidTime(value)) {
                if (this.standardTimesForDayAreValid(index)) {
                    this.save(index)
                }
            } else {
                this.standardTimes[index][identifier + '_invalid'] = true
            }
        },
        /**
         * Validate opening and business times for a day in relation to each other
         */
        standardTimesForDayAreValid (index) {
            this.alertMessage = ''
            const day = this.standardTimes[index]
            let dayIsValid = true

            day.opening_from_time_invalid = false
            day.opening_to_time_invalid = false
            day.business_from_time_invalid = false
            day.business_to_time_invalid = false
            day.toggle_disabled = false

            if (!this.isValidTime(day.opening_from_time) ||
                !this.isValidTime(day.opening_to_time) ||
                !this.isValidTime(day.business_from_time) ||
                !this.isValidTime(day.business_to_time)) {
                this.alertMessage = ''
                dayIsValid = false
            } else if (day.opening_from_time >= day.opening_to_time) {
                this.alertMessage = this.$t('pages.standardTimes.startOpeningTimeBeforeEndOpeningTime')
                day.opening_from_time_invalid = true
                day.opening_to_time_invalid = true
                dayIsValid = false
            } else if (day.business_from_time > day.opening_from_time) {
                this.alertMessage = this.$t('pages.standardTimes.startBusinessTimeBeforeStartOpeningTime')
                day.opening_from_time_invalid = true
                day.business_from_time_invalid = true
                dayIsValid = false
            } else if (day.business_to_time < day.opening_to_time) {
                this.alertMessage = this.$t('pages.standardTimes.endOpeningTimeBeforeEndBusinessTime')
                day.opening_to_time_invalid = true
                day.business_to_time_invalid = true
                dayIsValid = false
            } else if (day.business_from_time >= day.business_to_time) {
                this.alertMessage = this.$t('pages.standardTimes.startBusinessTimeBeforeEndBusinessTime')
                day.business_to_time_invalid = true
                day.business_from_time_invalid = true
                dayIsValid = false
            }

            if (!dayIsValid) {
                day.toggle_disabled = true
            }

            return dayIsValid
        },
        /**
         * Handles a toggle state change
         * If entered times for that day are valid, the save procedure is engaged
         */
        toggleClose (index) {
            if (this.standardTimesForDayAreValid(index)) {
                this.save(index)
            }
        },
        /**
         * Saves entered time value and toggle state
         * If there are no times set for given day, a post call is engaged, otherwise a put call.
         */
        save (index) {
            if (!this.STANDARDTIMES_MANAGE) {
                return
            }
            let apiMethod = 'addStandardTimes'
            let body = JSON.parse(JSON.stringify(this.standardTimes[index]))
            body = this.removeUnnecessaryProperties(body)

            const payload = { body: body }
            if (body.id) {
                apiMethod = 'editStandardTimes'
                payload.id = body.id
            }

            this[apiMethod](payload)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.standardTimes.dataHaveBeenUpdated'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.standardTimes.dataUpdateFailed'), error: true })
                    this.standardTimes = JSON.parse(JSON.stringify(this.STANDARD_TIMES))
                })
        },
        /**
         * Remove all validation flags which are not needed for the api call
         */
        removeUnnecessaryProperties (body) {
            delete body.opening_from_time_invalid
            delete body.opening_to_time_invalid
            delete body.business_from_time_invalid
            delete body.business_to_time_invalid

            delete body.opening_from_time_dirty
            delete body.opening_to_time_dirty
            delete body.business_from_time_dirty
            delete body.business_to_time_dirty

            delete body.toggle_disabled

            return body
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';

    :deep() .v-data-table__wrapper table {
        margin-bottom: 16px;

        thead tr {
            th {
                height: auto;
                padding: 8px;
                text-transform: capitalize;
            }
            &.second-head-row th {
                padding: 0 8px 8px 8px;
                font-weight: 400;
            }
        }

        tbody tr {
            td {
                height: 48px;
                min-width: 64px;
                padding: 0 8px;
                line-height: 16px;
                border-bottom: 1px solid $grey-40 !important;

                &.switch-cell {
                    padding: 9px 8px 6px;
                }
            }

            &:hover {
                background-color: transparent !important;
            }

            &:last-child td {
                border-bottom: none !important;
            }
        }
    }

    :deep() .v-alert {
        font-size: 12px;
        font-weight: 700;

        .v-icon {
            font-size: 16px;
        }
    }
</style>
