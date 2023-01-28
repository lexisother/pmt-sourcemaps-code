<template>
    <div>
        <MyRequestsTopBar
            ref="topbar"
            show-search
            :search="search"
            @search="search = $event"
        >
            <div>
                <DatePicker
                    ref="requestsRangePicker"
                    :options="datepickerOptions"
                    @on-select="filterRequests($event)"
                    @deselect-date="resetDate"
                >
                    <template #selected-date-text="{ placeholder, range }">
                        {{ manuallyFiltered ? $moment().rangeText(range.from, range.to, 'DD MMM, YYYY', false) : placeholder }}
                    </template>
                </DatePicker>
            </div>
            <PSelect
                ref="statuses"
                v-model="selectedStatus"
                cy_id="statuses"
                :items="rdoStatuses"
                item-value="key"
                dense
                width="auto"
                @input="updateSelectedStatus($event)"
            >
                <template #selected-label>
                    <div class="selected-label">
                        {{ $t('ui.singles.status') }}:
                        <strong> {{ selectedStatus.label }}</strong>
                    </div>
                </template>
            </PSelect>
        </MyRequestsTopBar>
        <PmtContent v-if="!isLoading && rdoRequests.length">
            <VDataTable
                ref="rdosTable"
                :headers="headers"
                :items="rowItems"
                :items-per-page="10"
                :custom-sort="customSort"
                :sort-by="['period']"
                :sort-desc="[true]"
                :fixed-header="true"
                mobile-breakpoint="700"
                :search="search"
                calculate-widths
                :loading="isCustomLoading"
                :dense="false"
            >
                <template #[`item.status`]="{ item }">
                    <div>
                        <Chip
                            :text="item.status"
                            :error="item.fullObject.status.toLowerCase() === 'cancelled' || item.fullObject.status.toLowerCase() === 'denied'"
                            :success="item.fullObject.status.toLowerCase() === 'approved'"
                            :warning="item.fullObject.status.toLowerCase() === 'pending'"
                            outline
                        />
                    </div>
                </template>
                <template #[`item.reason`]="{ item }">
                    <div v-if="item.reason !== '-'">
                        <span v-tooltip="item.reason">{{ cutRemarkString(item.reason) }}</span>
                    </div>
                </template>
                <template #[`item.changedBy`]="{ item }">
                    <div v-if="item.changedBy">
                        <span v-tooltip="item.changedOn">{{ item.changedBy }}</span>
                    </div>
                </template>
                <template #[`item.remark`]="{ item }">
                    <div v-if="item.remark !== '-'">
                        <span v-tooltip="item.remark">{{ cutRemarkString(item.remark) }}</span>
                    </div>
                </template>
                <template #[`item.action`]="{ item }">
                    <v-popover
                        v-if="item.fullObject && item.fullObject.status === 'pending'"
                        trigger="manual"
                        :open="currentRdoRequest.id === item.fullObject.id"
                        offset="10"
                        :auto-hide="true"
                        @apply-hide="currentRdoRequest = {}"
                    >
                        <PmtButton
                            danger
                            outline
                            icon="delete-forever"
                            icon-size="15"
                            @click="currentRdoRequest = item.fullObject"
                        >
                            {{ $t('pages.rdoOverview.revokeBtn.label') }}
                        </PmtButton>
                        <template slot="popover">
                            <div class="p-2">
                                <i18n path="pages.rdoOverview.revokePrompt.info">
                                    <b>{{ currentRdoRequest.id ? getPeriodAsString( currentRdoRequest ) : '' }}</b>
                                </i18n>
                            </div>
                            <div class="button-group">
                                <PmtButton
                                    danger
                                    outline
                                    cy_id="revokeRdoNoBtn"
                                    @click="currentRdoRequest = {}"
                                >
                                    {{ $t( 'components.modal.noBtn.label') }}
                                </PmtButton>
                                <PmtButton
                                    v-if="currentRdoRequest && currentRdoRequest.status === 'pending'"
                                    success
                                    primary
                                    cy_id="revokeRdoYesBtn"
                                    @click="revokeRdoRequest()"
                                >
                                    {{ $t('components.modal.yesBtn.label') }}
                                </PmtButton>
                            </div>
                        </template>
                    </v-popover>
                </template>
            </VDataTable>
        </PmtContent>

        <PmtContent v-else-if="!isLoading">
            <EmptyState
                component="no-rdo-requests"
                :size="IS_MOBILE ? 300 : 400"
                no-padding
                :title="$t( 'pages.rdoOverview.noItemsFound' )"
                show
                :action-text="canRequestTimeOff ? $t('pages.mySchedule.topbar.rdoBtn.label') : ''"
                @action-click="$emit('request-day-off')"
            />
        </PmtContent>

        <PmtContent v-else>
            <RoundSpinner
                :block="true"
                :loading="true"
            />
        </PmtContent>
    </div>
</template>

<script>
import stringHelper from '@/libraries/stringHelper.js'
import MyRequestsTopBar from '@/pages/planning/requests/MyRequestsTopBar'
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'

export default {
    components: { MyRequestsTopBar },
    data () {
        return {
            fromDateFilter: this.$moment().apiFormat(),
            toDateFilter: this.$moment().apiFormat(),
            table: null,
            isLoading: true,
            isCustomLoading: false,
            currentRdoRequest: {},
            headers: [
                { text: this.$t('entities.rdo.created'), value: 'created' },
                { text: this.$t('entities.rdo.period'), value: 'period' },
                { text: this.$t('entities.rdo.duration'), value: 'duration' },
                { text: this.$t('entities.rdo.type'), value: 'type' },
                { text: this.$t('entities.rdo.changedBy'), value: 'changedBy' },
                { text: this.$t('entities.rdo.reason'), value: 'reason' },
                { text: this.$t('entities.rdo.remark'), value: 'remark', sortable: false },
                { text: this.$t('entities.rdo.status'), value: 'status' },
                { text: this.$t('entities.rdo.actions'), value: 'action' },
            ],
            search: '',
            rdoTitleLanguage: this.$t('modals.leaveBalance'),
            dateFormat: 'ddd D MMM YYYY',
            dateFrom: this.$moment().startOf('year'),
            dateTo: this.$moment().endOf('year'),
            openPopover: {},
            manuallyFiltered: false,
            selectedStatus: { key: false, label: null },
        }
    },
    computed: {
        ...mapGetters('stores', ['currentStore']),
        ...mapGetters('auth', {
            user: 'user',
            canRequestTimeOff: 'canRequestTimeOff',
        }),
        ...mapGetters('rdoRequests', {
            rdoRequests: 'all',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapState('account', {
            employees: 'storeEmployees',
        }),
        ...mapGetters('account', ['getEmployeeById']),
        minRdoDateTo () {
            return this.$moment(this.fromDateFilter).apiFormat()
        },
        datepickerOptions () {
            return {
                id: 'rdo-overview-datepicker',
                showPredefinedRanges: true,
                selectedDate: this.dateFrom,
                showResetFilter: true,
                emitSelectOnMounted: false,
                isRangePicker: true,
                mode: 'day',
                isSelected: this.manuallyFiltered,
            }
        },
        rowItems () {
            const rows = this.rdoRequests.filter(item => {
                if (!this.manuallyFiltered) return item
                return item.start.isAfterOrSameDayAs(this.dateFrom) && item.end.isBeforeOrSameDayAs(this.dateTo)
            }).map(item => {
                const diff = this.$moment.duration(Math.round(item.end.diff(item.start)))
                const duration = diff.asDays() >= 0.99 ? diff.humanize() : diff.format('HH:mm')
                const changedBy = this.getEmployeeById(item.last_changed_by).name
                const changedOn = item.last_changed_on ? this.$moment(item.last_changed_on) : ''
                return {
                    fullObject: item,
                    status: this.getStatusAsStr(item.status),
                    created: item.created.euFormat(),
                    period: this.getPeriodAsString(item),
                    duration: duration,
                    type: item.type ? item.type.name : '',
                    // if user is not found in employees ( => 'Admin') check if last_changed_by is not null and display PMT
                    changedBy: changedBy !== 'Admin' ? changedBy : item.last_changed_by ? 'PMT' : '',
                    changedOn: changedOn ? changedOn.fromNow() + ' - ' + changedOn.fullReadableDateFormat() : '',
                    reason: item.reason || '',
                    remark: item.remark || '',
                    hasAction: item.status === 'pending' ? 'A' : 'Z',
                }
            })
            if (this.selectedStatus.key !== 'all') {
                return rows.filter(item => {
                    return item.status === this.selectedStatus.label
                })
            } else {
                return rows
            }
        },
        rdoStatuses () {
            return [
                {
                    label: this.$t('entities.rdo.statusOptions.all'),
                    key: 'all',
                    simple: true,
                },
                {
                    label: this.getStatusAsStr('canceled') || this.getStatusAsStr('denied'),
                    key: 'denied',
                    simple: true,
                },
                {
                    label: this.getStatusAsStr('approved'),
                    key: 'approved',
                    simple: true,
                },
                {
                    label: this.getStatusAsStr('pending'),
                    key: 'pending',
                    simple: true,
                },
            ]
        },
    },
    mounted () {
        if (this.rdoRequests.length === 0) {
            this.filterRequests()
        } else {
            this.isLoading = false
        }
        // we need all store employees in order to display changed by for normal employees
        if (!this.employees.length) {
            this.getStoreEmployees({ active: true })
        }

        this.selectedStatus = this.rdoStatuses[0]
    },
    methods: {
        ...mapActions('rdoRequests', {
            getRdoRequests: 'getRdoRequests',
            getRdoRequestsFromDate: 'getRdoRequestsFromDate',
            revokeRdo: 'revokeRdoRequest',
        }),
        ...mapActions('account', {
            getStoreEmployees: 'getStoreEmployees',
        }),
        ...mapMutations(['SET_SNACKBAR']),
        customSort: function (items, index, isDesc) {
            const _this = this

            items.sort((a, b) => {
                if (index[0] === 'duration') {
                    // Sorts the column 'duration' based on minutes
                    if (!isDesc[0]) {
                        const startMinutesA = this.$moment().getDuration(a.fullObject, 'int')
                        const startMinutesB = this.$moment().getDuration(b.fullObject, 'int')
                        return startMinutesA < startMinutesB ? -1 : 1
                    } else {
                        const startMinutesA = this.$moment().getDuration(a.fullObject, 'int')
                        const startMinutesB = this.$moment().getDuration(b.fullObject, 'int')
                        return startMinutesB < startMinutesA ? -1 : 1
                    }
                } else if (index[0] === 'period') {
                    // Sorts the column 'period' based on day
                    if (!isDesc[0]) {
                        return _this.compare(a.fullObject.start.apiFormat(), b.fullObject.end.apiFormat())
                    } else {
                        return _this.compare(b.fullObject.start.apiFormat(), a.fullObject.end.apiFormat())
                    }
                } else if (index[0] === 'created') {
                    // Sorts the column 'created' based on day
                    if (!isDesc[0]) {
                        return _this.compare(a.fullObject.created.apiFormat(), b.fullObject.created.apiFormat())
                    } else {
                        return _this.compare(b.fullObject.created.apiFormat(), a.fullObject.created.apiFormat())
                    }
                } else if (index[0] === 'action') {
                    // Sorts the column 'actions' based on actions
                    if (!isDesc[0]) {
                        return a.hasAction < b.hasAction ? -1 : 1
                    } else {
                        return b.hasAction < a.hasAction ? -1 : 1
                    }
                } else {
                    if (!isDesc[0]) {
                        return a[index] < b[index] ? -1 : 1
                    } else {
                        return b[index] < a[index] ? -1 : 1
                    }
                }
            })
            return items
        },
        compare: (start, end) => {
            return start === end ? 0 : start < end ? -1 : 1
        },
        resetDate (event) {
            this.manuallyFiltered = false
        },
        filterRequests (event) {
            if (event && typeof event.from === 'object') {
                this.dateFrom = event.from
                this.dateTo = event.to
                this.manuallyFiltered = true
            } else {
                this.isLoading = true
                this.getRdoRequestsFromDate({ accountId: this.user.accountId }).then(() => {
                    this.isCustomLoading = false
                    this.isLoading = false
                    this.firstFiltered = true
                })
            }
        },
        /**
         * Refer to underlying stringHelper function to see how this works.
         */
        cutRemarkString (remark) {
            return stringHelper.textToElipsis(remark, 15)
        },
        revokeRdoRequest () {
            if (!this.currentRdoRequest) {
                return
            }
            this.revokeRdo({ id: this.currentRdoRequest.id, storeId: this.currentStore.id }).then(() => {
                this.SET_SNACKBAR({ message: this.$t('pages.rdoOverview.revokeSuccess.message'), success: true })
                this.filterRequests()
            }).catch(error => {
                this.SET_SNACKBAR({ message: error.message, error: true })
            })
        },
        getPeriodAsString (rdoRequest) {
            let str = rdoRequest.start.euFormat()
            if (rdoRequest.start.sameDayAs(rdoRequest.end)) {
                if (rdoRequest.start.shortTime() === '00:00' && rdoRequest.end.shortTime() === '23:59') {
                    str += ` (${this.$t('pages.rdoOverview.wholeDay')})`
                } else {
                    str += ` (${rdoRequest.start.shortTime()} - ${rdoRequest.end.shortTime()})`
                }
            } else {
                str += ` ${this.$t('pages.rdoOverview.till')} ${rdoRequest.end.euFormat()}`
            }
            return str
        },
        getStatusAsStr (status) {
            const allowedStatus = ['approved', 'pending', 'cancelled', 'declined']

            if (!~allowedStatus.indexOf(status)) {
                status = 'declined'
            }

            return this.$t('entities.rdo.statusOptions.' + status)
        },
        updateSelectedStatus (status) {
            this.selectedStatus = status
        },
    },
}
</script>

<style lang="scss">
    @import './resources/RdoOverview.scss';
</style>
