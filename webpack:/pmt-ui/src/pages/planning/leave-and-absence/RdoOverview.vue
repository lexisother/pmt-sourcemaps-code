<template>
    <div>
        <div v-if="RDO_OTHERS_MANAGE">
            <RdoTopBar
                v-if="IS_MOBILE"
                ref="mobileTopbar"
                :show="mobileTopbarItems"
            />
            <RdoTopBar
                ref="desktopTopbar"
                :show="desktopTopbarItems"
                :view="VIEW_TYPE"
                @toggle-view="toggleView"
                @open-modal="createRdoRequest"
            />
            <PmtLayout fixed-height>
                <PmtContent>
                    <VContainer
                        v-if="RDO_OTHERS_READ"
                        :class="{ 'full-width': VIEW_TYPE === 'timeline' }"
                    >
                        <VRow>
                            <VCol
                                v-if="!isLoading && VIEW_TYPE === 'list' && RDO_REQUESTS_WITHIN_PERIOD"
                                class="pa-0"
                            >
                                <PmtGrouping
                                    v-if="GROUP_ON.length"
                                    :groups="RDO_REQUESTS_WITHIN_PERIOD"
                                    :data-depth="1"
                                >
                                    <template #header="{ identifier }">
                                        <ChevronRight :size="12" />
                                        <h3>{{ $t(`pages.leaveAndAbsencePage.status.${identifier}`) }}</h3>
                                        <VBadge
                                            :color="`var(--grey-80)`"
                                            :content="RDO_REQUESTS_WITHIN_PERIOD[identifier].length"
                                            inline
                                            class="ml-3"
                                        />
                                    </template>
                                    <template #items="{ identifier }">
                                        <RdoListView
                                            :identifier="identifier"
                                            :approving-request-id="approvingRequestId"
                                            :denying-request-id="denyingRequestId"
                                            @edit-rdo="editRdoRequest"
                                            @deny="deny"
                                            @approve="approve"
                                        />
                                    </template>
                                </PmtGrouping>
                                <RdoListView
                                    v-else
                                    :approving-request-id="approvingRequestId"
                                    :denying-request-id="denyingRequestId"
                                    @edit-rdo="editRdoRequest"
                                    @deny="deny"
                                    @approve="approve"
                                />
                            </VCol>
                            <VCol
                                v-else-if="!isLoading && VIEW_TYPE === 'timeline'"
                                class="pa-0"
                            >
                                <RdoTimelineView
                                    @edit-rdo="editRdoRequest"
                                    @deny-rdo="denyRdoRequest"
                                    @approve-rdo="approveRdoRequest"
                                />
                            </VCol>
                            <VCol
                                v-else
                                class="pa-0"
                            >
                                <RoundSpinner
                                    loading
                                    :size="24"
                                    class="ma-5"
                                />
                            </VCol>
                        </VRow>
                    </VContainer>
                    <VContainer v-else>
                        <EmptyState
                            ref="noAccess"
                            :title="$t('apiErrors.general.noAccess')"
                            component="four-o-four"
                            :show="true"
                            :is-error="true"
                            no-padding
                        />
                    </VContainer>
                </PmtContent>
            </PmtLayout>
            <RdoEditCreateModal
                :edit-rdo-request="selectedRdoRequest"
                :is-open="editCreateModalIsOpen"
                @close-dialog="closeModal"
                @prepare-for-save="prepareForSave"
            />
        </div>
        <EmptyState
            v-else
            ref="noAccess"
            :title="$t('ui.singles.noAccess')"
            :component="'four-o-four'"
            :show="true"
            :is-error="true"
            no-padding
        />
        <ArticleHelper
            v-if="!isLoading && $route.meta.settingsRoute === 'leave-and-absence' && !IS_SUPER_ADMIN"
            label="leave_and_absence_intro"
            :route="'leave-and-absence'"
            page="leaveAndAbsencePage"
        />
        <PmtConfirmationDialog
            :is-open="showOpenShiftsDialog"
            :message="$t('pages.leaveAndAbsencePage.modal.createOpenShifts')"
            :cancel-button-label="$t('ui.singles.no')"
            :confirm-button-label="$t('ui.singles.yes')"
            @close-dialog="createOpenShifts(false)"
            @confirm="createOpenShifts(true)"
        />
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import stringHelper from '@/libraries/stringHelper'
import constants from './resources/constants'

export default {
    name: 'RdoOverview',
    components: {
        RdoTopBar: () => import('@/pages/planning/leave-and-absence/RdoTopBar'),
        RdoListView: () => import('@/pages/planning/leave-and-absence/RdoListView'),
        RdoTimelineView: () => import('@/pages/planning/leave-and-absence/RdoTimelineView'),
        RdoEditCreateModal: () => import('@/pages/planning/leave-and-absence/RdoEditCreateModal'),
        PmtGrouping: () => import('@/components/ui/cards/PmtGrouping'),
        PmtConfirmationDialog: () => import('@/components/modals/PmtConfirmationDialog'),
    },
    data () {
        return {
            mobileTopbarItems: {
                filters: true,
                search: true,
                viewTypeToggle: false,
                create: false,
                import: false,
                export: false,
                groupingAndSorting: false,
            },
            isLoading: false,
            editCreateModalIsOpen: false,
            selectedRdoRequest: {},
            approvingRequestId: null,
            denyingRequestId: null,
            showOpenShiftsDialog: false,
        }
    },
    computed: {
        ...mapState('account', ['employees', 'userSettings']),
        ...mapState('stores', ['currentStore']),
        ...mapState('contracts', ['employeeContracts']),
        ...mapGetters(['IS_MOBILE']),
        ...mapGetters('auth', ['RDO_OTHERS_READ', 'RDO_OTHERS_MANAGE', 'IS_SUPER_ADMIN']),
        ...mapGetters('rdoRequests', [
            'RDO_REQUESTS_WITHIN_PERIOD',
            'RELOAD_RDO_REQUESTS',
            'REQUEST_TYPES',
            'IS_SAVING_RDO',
            'GROUP_ON',
            'VIEW_TYPE',
        ]),
        desktopTopbarItems () {
            return {
                filters: !this.IS_MOBILE,
                search: !this.IS_MOBILE,
                viewTypeToggle: true,
                create: true,
                import: true,
                export: true,
                groupingAndSorting: true,
            }
        },
    },
    watch: {
        RELOAD_RDO_REQUESTS (val) {
            if (val) {
                this.getRdoRequests()
            }
        },
    },
    async mounted () {
        this.isLoading = true

        if (this.RDO_OTHERS_MANAGE) {
            const callsArray = [
                this.getRequestTypes(),
                this.getEmployees({ active: true }),
                this.getContracts({ date: this.$moment().apiFormat() }),
                this.getDepartments({ date: this.$moment(this.$route.params.date), allDepartments: true }),
                this.getWeekStatus({ store_id: this.currentStore.id, latest_status: true }),
            ]
            await Promise.all(callsArray).then(async () => {
                await this.updateFilters()
                this.setRdoListGrouping()
                this.setRdoSorting()
                this.setTableRowsPerPage()
                this.getRdoRequests()
            })
        }

        this.isLoading = false
    },
    methods: {
        ...mapMutations(['UPDATE_ENABLED_FILTERS', 'SET_SNACKBAR', 'SET_TABLE_ROWS_PER_PAGE']),
        ...mapMutations('rdoRequests', [
            'SET_EMPLOYEE',
            'CLEAR_LEAVE_BALANCE',
            'CLEAR_RDO_REQUESTS_FOR_EMPLOYEE',
            'SET_RELOAD_RDO_REQUESTS',
            'UPDATE_RDO_REQUEST',
            'SET_IS_SAVING_RDO',
            'SET_RDO_LIST_VIEW_SORTING',
            'SET_RDO_TIMELINE_VIEW_SORTING',
            'SET_GROUP_ON',
            'SET_VIEW_TYPE',
        ]),
        ...mapActions('account', ['getEmployees']),
        ...mapActions('contracts', ['getContracts']),
        ...mapActions('departments', {
            getDepartments: 'get',
        }),
        ...mapActions('rdoRequests', [
            'getRdoRequestsWithinPeriod',
            'getWeekStatus',
            'saveRdoRequest',
            'getRequestTypes',
        ]),
        async getRdoRequests () {
            const payload = {
                from_date: this.$moment().subtract(2, 'months').apiFormat(),
                to_date: this.$moment().add(1, 'year').apiFormat(),
                limit: 99999,
            }
            await this.getRdoRequestsWithinPeriod(payload)
                .catch(error => {
                    this.SET_SNACKBAR({ message: error, error: true })
                })
                .finally(() => {
                    this.SET_RELOAD_RDO_REQUESTS(false)
                })
        },
        toggleView (type) {
            this.SET_VIEW_TYPE(type)
        },
        updateFilters () {
            this.UPDATE_ENABLED_FILTERS({
                pendingRdo: true,
                approvedRdo: true,
                deniedRdo: true,
                departments: true,
            })
        },
        /**
         * Set grouping settings if saved in user preferences (or default if not available)
         */
        setRdoListGrouping () {
            const leaveAndAbsenceSettings = this.userSettings.find(o => o.screen === this.$route.meta.settingsRoute)
            if (leaveAndAbsenceSettings?.settings?.settings?.groupOn) {
                // grouping option has been stored previously, load into vuex
                this.SET_GROUP_ON(leaveAndAbsenceSettings?.settings?.settings?.groupOn)
            } else {
                // no stored sorting options, select no grouping
                this.SET_GROUP_ON([])
            }
        },
        /**
         * Set sorting settings if saved in user preferences (or default if not available)
         */
        setRdoSorting () {
            const leaveAndAbsenceSettings = this.userSettings.find(o => o.screen === this.$route.meta.settingsRoute)
            if (leaveAndAbsenceSettings?.settings?.settings?.rdoListViewSorting) {
                // sorting options have been stored previously, load into vuex
                this.SET_RDO_LIST_VIEW_SORTING(leaveAndAbsenceSettings.settings.settings.rdoListViewSorting)
            } else {
                // no stored sorting options, select default
                this.SET_RDO_LIST_VIEW_SORTING({ by: ['firstName'], desc: [false] })
            }
            if (leaveAndAbsenceSettings?.settings?.settings?.rdoTimelineViewSorting) {
                // sorting options have been stored previously, load into vuex
                this.SET_RDO_TIMELINE_VIEW_SORTING(leaveAndAbsenceSettings.settings.settings.rdoTimelineViewSorting)
            } else {
                // no stored sorting options, select default
                this.SET_RDO_TIMELINE_VIEW_SORTING({ by: ['firstName'], desc: [false] })
            }
        },
        /**
         * Set table rows per page if saved in user preferences (or default if not available)
         * If now user preferences are stored, standard rows amount is 10
         */
        setTableRowsPerPage () {
            const leaveAndAbsenceSettings = this.userSettings.find(o => o.screen === this.$route.meta.settingsRoute)
            const payload = {
                routeName: this.$route.meta.settingsRoute,
                tableRowsPerPage: constants.DEFAULT_ROWS_PER_PAGE,
            }
            if (leaveAndAbsenceSettings?.settings?.settings?.tableRowsPerPage) {
                // rows per page has been stored previously, load into vuex
                payload.tableRowsPerPage = leaveAndAbsenceSettings.settings.settings.tableRowsPerPage
            }
            this.SET_TABLE_ROWS_PER_PAGE(payload)
        },
        createRdoRequest () {
            this.selectedRdoRequest = {}
            this.editCreateModalIsOpen = true
        },
        editRdoRequest (rdoRequestId) {
            if (!rdoRequestId) return false
            this.selectedRdoRequest = this.rdoRequest(rdoRequestId)
            this.editCreateModalIsOpen = true
        },
        /**
         * Approve request from timeline view
         */
        approveRdoRequest (rdoRequestId, type = null) {
            if (!rdoRequestId) return false
            const request = this.rdoRequest(rdoRequestId)
            if (type) {
                request.typeName = type.name
            }
            this.approve(request)
        },
        /**
         * Deny request from timeline view
         */
        denyRdoRequest (rdoRequestId) {
            if (!rdoRequestId) return false
            this.deny(this.rdoRequest(rdoRequestId))
        },
        rdoRequest (rdoRequestId) {
            // no grouping, find request within array
            if (Array.isArray(this.RDO_REQUESTS_WITHIN_PERIOD)) {
                return this.RDO_REQUESTS_WITHIN_PERIOD.find(o => o.id === rdoRequestId)
            }

            // rdo requests are grouped, find request within object
            let result = {}
            const statuses = ['pending', 'approved', 'denied']
            statuses.forEach(status => {
                const request = this.RDO_REQUESTS_WITHIN_PERIOD[status].find(o => o.id === rdoRequestId)
                if (typeof request === 'object') {
                    result = request
                }
            })
            return result
        },
        body (request) {
            const type = request.typeName ? this.REQUEST_TYPES.find(o => o.name === request.typeName) : null
            return {
                id: request.id,
                account_id: request.account_id,
                single_day: request.start_date === request.end_date,
                date_from: request.start_date,
                date_to: request.end_date,
                time_from: request.start_time,
                time_to: request.end_time,
                type: type?.id ? type.id : null,
                hours: request.hours,
                remark: stringHelper.escapeString(request.remark),
                reason: stringHelper.escapeString(request.reason),
                re_insert_default: false,
                open_shifts: true,
            }
        },
        /**
         * Initiate saving of approved request
         */
        approve (request) {
            const body = { ...this.body(request), status: 'approved' }
            this.approvingRequestId = request.id
            this.prepareForSave(body)
        },
        /**
         * Initiate saving of denied request
         */
        deny (request) {
            this.requestBody = { ...this.body(request), status: 'denied' }
            this.denyingRequestId = request.id
            this.save()
        },
        prepareForSave (body) {
            this.requestBody = body
            if (body.status === 'approved' && (!this.selectedRdoRequest.status || this.selectedRdoRequest.status !== 'approved')) {
                this.showOpenShiftsDialog = true
            } else {
                this.save()
            }
        },
        save () {
            this.SET_IS_SAVING_RDO(true)
            this.saveRdoRequest(this.requestBody)
                .then(response => {
                    this.UPDATE_RDO_REQUEST({ employees: this.employees, result: response.data.result, contracts: this.employeeContracts })
                    if (this.requestBody.id) {
                        this.SET_SNACKBAR({ message: this.$t('pages.leaveAndAbsencePage.modal.requestAjusted'), success: true })
                    } else {
                        this.SET_SNACKBAR({ message: this.$t('pages.leaveAndAbsencePage.modal.requestSubmitted'), success: true })
                    }
                })
                .catch(error => {
                    let message = this.$t('pages.leaveAndAbsencePage.modal.requestSubmitFailed')
                    if (error.code === 'requestDayOff.invalidNumberOfDays') {
                        message = this.$t('pages.leaveAndAbsencePage.modal.invalidNumberOfDays')
                    }
                    this.SET_SNACKBAR({ message, error: true })
                })
                .finally(() => {
                    setTimeout(() => {
                        this.SET_IS_SAVING_RDO(false)
                        this.approvingRequestId = null
                        this.denyingRequestId = null
                        this.closeModal()
                    }, 500)
                })
        },
        closeModal () {
            this.editCreateModalIsOpen = false
            this.selectedRdoRequest = {}
            this.SET_EMPLOYEE(null)
            this.CLEAR_LEAVE_BALANCE()
            this.CLEAR_RDO_REQUESTS_FOR_EMPLOYEE()
        },
        createOpenShifts (bool) {
            this.requestBody.open_shifts = bool
            this.showOpenShiftsDialog = false
            this.save()
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/mixins/_breakpoints.scss';

    .container {
        max-width: 100vw;
        margin: 0 !important;

        &:not(.full-width) {
            @include bp-xl {
                max-width: 1904px !important;
                margin: 0 auto !important;
            }
        }
    }

    :deep() .v-badge__badge {
        padding: 4px;
        font-size: 10px;
        font-weight: 700;
    }

</style>
