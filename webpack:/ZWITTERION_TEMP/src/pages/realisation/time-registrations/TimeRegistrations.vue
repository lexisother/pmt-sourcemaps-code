<template>
    <div>
        <TimeRegistrationsTopBar
            v-if="IS_MOBILE"
            ref="mobileTopbar"
            :show="mobileTopbarItems"
        />
        <TimeRegistrationsTopBar
            ref="desktopTopbar"
            :all-collapsed="allCollapsed"
            :all-expanded="allExpanded"
            :show="desktopTopbarItems"
            @collapse-all="collapseAll"
            @expand-all="expandAll"
            @collapse-or-expand-all="collapseOrExpandAll"
        />
        <PmtLayout
            fixed-height
            :show-scroll-top="false"
        >
            <PmtContent>
                <VContainer v-if="TIME_REGISTRATION_READ">
                    <RoundSpinner
                        v-if="TIME_REGISTRATIONS_LOADING"
                        loading
                        :size="24"
                    />
                    <div
                        v-else
                        class="time-registrations"
                    >
                        <template v-if="timeRegistrationsCounter">
                            <VRow v-if="GROUP_ON.length">
                                <PmtGrouping
                                    :groups="TIME_REGISTRATIONS"
                                    :data-depth="GROUP_ON.length"
                                >
                                    <template #header="{ identifier }">
                                        <ChevronRight :size="12" />
                                        <h3>{{ groupHeaderTitle(identifier) }}</h3>
                                        <VBadge
                                            v-if="Boolean(badgeNumber(identifier))"
                                            :color="`var(--grey-80)`"
                                            :content="badgeNumber(identifier)"
                                            inline
                                            class="ml-3"
                                        />
                                    </template>
                                    <template #items="{ items, identifier }">
                                        <template v-if="GROUP_ON.length === 2">
                                            <PmtGrouping
                                                :groups="items"
                                                sub
                                                :data-depth="GROUP_ON.length"
                                            >
                                                <template #header="{ subIdentifier }">
                                                    <ChevronRight :size="12" />
                                                    <h4>{{ groupHeaderTitle(subIdentifier) }}</h4>
                                                </template>
                                                <template #items="{ subItems, subIdentifier }">
                                                    <TimeRegistrationsCard
                                                        v-for="employeeTimeRegistration in subItems"
                                                        :id="`${employeeTimeRegistration.account_id}-${subIdentifier}`"
                                                        :key="`${employeeTimeRegistration.account_id}-${subIdentifier}`"
                                                        :employee-time-registration="employeeTimeRegistration"
                                                        :expanded="cardIsExpanded(employeeTimeRegistration.account_id)"
                                                        @contextmenu:realisation="setRealisationContextMenu($event)"
                                                        @open-log="showTimeRegistationsLogModal"
                                                        @toggle-card="toggleCard"
                                                    />
                                                </template>
                                            </PmtGrouping>
                                        </template>
                                        <template v-else>
                                            <TimeRegistrationsCard
                                                v-for="employeeTimeRegistration in items"
                                                :id="employeeTimeRegistration.account_id"
                                                :key="`${employeeTimeRegistration.account_id}-${identifier}`"
                                                :employee-time-registration="employeeTimeRegistration"
                                                :expanded="cardIsExpanded(employeeTimeRegistration.account_id)"
                                                @contextmenu:realisation="setRealisationContextMenu($event)"
                                                @open-log="showTimeRegistationsLogModal"
                                                @toggle-card="toggleCard"
                                            />
                                        </template>
                                    </template>
                                </PmtGrouping>
                            </VRow>
                            <VRow v-else>
                                <VCol class="col-12 expansion-panels-container">
                                    <VExpansionPanels
                                        v-model="expandedPanels"
                                        multiple
                                    >
                                        <TimeRegistrationsCard
                                            v-for="employeeTimeRegistration in TIME_REGISTRATIONS"
                                            :id="employeeTimeRegistration.account_id"
                                            :key="employeeTimeRegistration.account_id"
                                            :employee-time-registration="employeeTimeRegistration"
                                            :expanded="cardIsExpanded(employeeTimeRegistration.account_id)"
                                            @contextmenu:realisation="setRealisationContextMenu($event)"
                                            @open-log="showTimeRegistationsLogModal"
                                            @toggle-card="toggleCard"
                                        />
                                    </VExpansionPanels>
                                </VCol>
                            </VRow>
                        </template>
                        <template v-else>
                            <VRow>
                                <VCol>
                                    <p>{{ $t('ui.singles.noResultsFound') }}</p>
                                </VCol>
                            </VRow>
                        </template>
                    </div>
                </VContainer>
                <EmptyState
                    v-else
                    ref="noAccess"
                    :title="$t('apiErrors.general.noAccess')"
                    component="four-o-four"
                    :show="true"
                    :is-error="true"
                    no-padding
                />
                <div
                    v-if="hasReadyToProcessRegistrations && !WEEK_IS_CLOSED"
                    class="button-bar"
                >
                    <PmtButton
                        primary
                        :loading="isProcessing"
                        @click="batchProcessRealisation()"
                    >
                        {{ $t('pages.timeRegistrationsPage.batchProcessingButtonLabel') }}
                    </PmtButton>
                </div>
            </PmtContent>
        </PmtLayout>
        <ContextMenu
            v-if="realisationContextMenu.show && realisationContextMenu.realisation"
            ref="timeRegistrationsContextMenu"
            :shift="realisationContextMenu.realisation"
            :employee="realisationContextMenu.employee"
            :event="realisationContextMenu.event"
            :realisation-index="realisationContextMenu.realisationIndex"
            type="timeRegistrations"
            @edit="contextMenuEdit($event)"
            @delete="contextMenuDelete($event)"
            @create="contextMenuCreate($event)"
            @close="closeRealisationContextMenu()"
        />
        <PmtConfirmationDialog
            :is-open="showRemoveRealisationDialog"
            :message="$t('pages.timeRegistrationsPage.removeRealisationConfirm')"
            @close-dialog="closeRemoveRealisationDialog"
            @confirm="removeRealisation()"
        />
        <PmtConfirmationDialog
            :is-open="showLeaveWithoutSavingDialog"
            :message="$t('pages.timeRegistrationsPage.leaveWithoutSavingConfirm')"
            @close-dialog="showLeaveWithoutSavingDialog = false"
            @confirm="leaveWithoutSaving()"
        />
        <TimeRegistrationsLog
            v-if="showTimeRegistationsLog"
            :employee-time-registration="registrationInLog"
            @close-modal="showTimeRegistationsLog = false"
        />
        <ArticleHelper
            v-if="!TIME_REGISTRATIONS_LOADING && $route.meta.settingsRoute === 'time-registrations' && !IS_SUPER_ADMIN"
            label="clocktimes_intro"
            :route="'time-registrations'"
            page="timeRegistrationsPage"
        />
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import ContextMenu from '@/pages/planning/scheduling/components/ContextMenu'
import stringHelper from '@/libraries/stringHelper'
import timeRegistrationsHelper from '@/pages/realisation/time-registrations/resources/timeRegistrationsHelper'
import Mixins from '@/pages/realisation/mixins'

export default {
    name: 'TimeRegistrations',
    components: {
        TimeRegistrationsTopBar: () => import('@/pages/realisation/time-registrations/TimeRegistrationsTopBar'),
        TimeRegistrationsCard: () => import('@/pages/realisation/time-registrations/TimeRegistrationsCard'),
        TimeRegistrationsLog: () => import('@/pages/realisation/time-registrations/TimeRegistrationsLog'),
        PmtConfirmationDialog: () => import('@/components/modals/PmtConfirmationDialog'),
        PmtGrouping: () => import('@/components/ui/cards/PmtGrouping'),
        ContextMenu,
    },
    mixins: [Mixins],
    beforeRouteLeave (to, from, next) {
        this.handleRouteMutation(to, next)
    },
    beforeRouteUpdate (to, from, next) {
        this.handleRouteMutation(to, next)
    },
    data () {
        return {
            expandedPanels: [],
            expandedGroupPanels: {},
            mobileTopbarItems: {
                filters: true,
                pastDaysSelector: true,
                weekStatus: false,
                search: false,
                groupingAndSorting: false,
                collapseAndExpand: false,
            },
            showRemoveRealisationDialog: false,
            showLeaveWithoutSavingDialog: false,
            removeRealisationPayload: null,
            showShiftPopover: false,
            shift: null,
            navigateTo: null,
            showTimeRegistationsLog: false,
            registrationInLog: null,
            isProcessing: false,
            allowLeavingWithoutSaving: false,
            isoWeek: -1,
            realisationContextMenu: {
                show: false,
            },
        }
    },
    computed: {
        ...mapState('stores', ['currentStore']),
        ...mapState('account', ['userSettings']),
        ...mapState('departments', ['departments']),
        ...mapState('realisation/timeRegistrations', ['timeRegistrations', 'scrollToEmployeeCardId']),
        ...mapGetters(['IS_MOBILE', 'COLLAPSED_SECTIONS', 'APPLIED_FILTERS_COUNT']),
        ...mapGetters('auth', ['TIME_REGISTRATION_READ', 'TIME_REGISTRATION_MANAGE', 'user', 'IS_SUPER_ADMIN', 'CAN_ADD_INDIRECT_TASKS']),
        ...mapGetters('realisation/timeRegistrations', [
            'TIME_REGISTRATIONS',
            'TIME_REGISTRATIONS_LOADING',
            'GROUP_ON',
            'SORT_ON',
            'SEARCH_STRING',
            'DIRTY_TIME_REGISTRATIONS',
            'ACCESSIBLE_DEPARTMENTS',
            'WEEK_IS_CLOSED',
            'UNTOUCHED_TIME_REGISTRATIONS',
            'GLOBAL_TIME_REGISTRATIONS_CARD_STATE',
            'EXPANDED_EMPLOYEE_CARDS',
        ]),
        ...mapGetters('stores', {
            weekStatus: 'weekStatus',
        }),
        selectedDate () {
            return this.$route.params.date
        },
        readableSelectedDate () {
            return this.$route.params.date ? this.$moment(this.$route.params.date).longDayFormat() : null
        },
        allCollapsed () {
            return this.EXPANDED_EMPLOYEE_CARDS.length === 0
        },
        allExpanded () {
            return this.EXPANDED_EMPLOYEE_CARDS.length === this.timeRegistrations.length
        },
        timeRegistrationsCounter () {
            let counter = 0
            if (this.GROUP_ON.length) {
                for (const key of Object.keys(this.TIME_REGISTRATIONS)) {
                    if (this.GROUP_ON.length === 2) {
                        for (const subKey of Object.keys(this.TIME_REGISTRATIONS[key])) {
                            counter += this.TIME_REGISTRATIONS[key][subKey].length
                        }
                    } else {
                        counter += this.TIME_REGISTRATIONS[key].length
                    }
                }
            } else {
                counter = this.TIME_REGISTRATIONS.length
            }
            return counter
        },
        desktopTopbarItems () {
            return {
                filters: !this.IS_MOBILE,
                pastDaysSelector: !this.IS_MOBILE,
                weekStatus: true,
                search: true,
                groupingAndSorting: true,
                collapseAndExpand: true,
            }
        },
        /**
         * processible registrations is a merge of 'ready' realisations combined with edited, already processed realisations
         */
        readyToProcessRegistrations () {
            return this.timeRegistrations.filter(o => o.displayStatus === 'ready')
        },
        hasReadyToProcessRegistrations () {
            return this.readyToProcessRegistrations.length > 0
        },
    },
    watch: {
        $route (to) {
            this.loadContents(to.params.date)
        },
        GROUP_ON () {
            this.$nextTick(() => {
                this.collapseOrExpandAll()
            })
        },
        APPLIED_FILTERS_COUNT () {
            this.$nextTick(() => {
                this.collapseOrExpandAll()
            })
        },
        UNTOUCHED_TIME_REGISTRATIONS () {
            this.$nextTick(() => {
                this.collapseOrExpandAll()
            })
        },
        scrollToEmployeeCardId (val) {
            if (val) {
                setTimeout(() => {
                    this.scrollTo(val)
                }, 250)
            }
        },
    },
    async mounted () {
        if (this.selectedDate && this.TIME_REGISTRATION_READ) {
            await this.getEmployees({ active: true })
            await this.getStoreEmployees({ active: true })
            await this.loadTimeRegistrationsUserSettings()
            await this.loadContents(this.selectedDate)
            await this.getStoreGroupsForWeek({ storeId: this.currentStore.id, date: this.$route.params.date })
            if (this.CAN_ADD_INDIRECT_TASKS) {
                this.getIndirectTaskTypes()
            }
            this.updateFilters()
        }
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('realisation/timeRegistrations', [
            'getTimeRegistrations',
            'postProposedRealisation',
            'getAccessibleDepartments',
            'getWeekStatuses',
            'getStoreGroupsForWeek',
        ]),
        ...mapMutations('account', ['UPDATE_USER_SETTINGS']),
        ...mapActions('account', ['getEmployees', 'getStoreEmployees', 'setUserSettings']),
        ...mapActions('departments', {
            getDepartments: 'get',
        }),
        ...mapMutations(['UPDATE_ENABLED_FILTERS']),
        ...mapMutations('realisation/timeRegistrations', [
            'UPDATE_REALISATION',
            'SET_ACCOUNT_ID',
            'SET_REALISATION_INDEX',
            'SET_INITIAL_REALISATION',
            'SET_CREATING',
            'UPDATE_REMARK',
            'REVERT_TO_UNTOUCHED_TIME_REGISTRATIONS',
            'SET_GLOBAL_TIME_REGISTRATIONS_CARD_STATE',
            'SET_GROUP_ON',
            'SET_SORT_ON',
            'SET_SORT_ASCENDING',
            'SET_EDIT_IN_MODAL',
            'SET_EXPANDED_EMPLOYEE_CARDS',
            'TOGGLE_EMPLOYEE_CARD',
            'CLEAR_SCROLL_TO_EMPLOYEE_CARD_ID',
        ]),
        ...mapActions('scheduling', ['getIndirectTaskTypes']),
        async loadContents (to) {
            await this.getDepartments({ date: this.$moment(this.$route.params.date), allDepartments: true })
            await this.getAccessibleDepartments({ date: this.$moment(this.$route.params.date), accountId: this.user.accountId })
            await this.fetchTimeRegistrations(to)
            await this.getWeekStatuses()

            // load store groups again if day in other week has been selected
            if (this.isoWeek !== this.$moment(this.$route.params.date).isoWeek()) {
                this.getStoreGroupsForWeek({ storeId: this.currentStore.id, date: this.$route.params.date })
                this.isoWeek = this.$moment(this.$route.params.date).isoWeek()
            }
        },
        async fetchTimeRegistrations (date) {
            await this.getTimeRegistrations(date)
            this.collapseOrExpandAll()
        },
        updateFilters () {
            this.UPDATE_ENABLED_FILTERS({
                pendingRealisation: true,
                readyRealisation: true,
                approvedRealisation: true,
                departments: true,
            })
        },
        toggleCard (accountId) {
            this.TOGGLE_EMPLOYEE_CARD(accountId)
        },
        cardIsExpanded (accountId) {
            return this.EXPANDED_EMPLOYEE_CARDS.includes(accountId)
        },
        collapseOrExpandAll () {
            if (this.GLOBAL_TIME_REGISTRATIONS_CARD_STATE === 'expanded') {
                this.expandAll()
            } else {
                this.collapseAll()
            }
        },
        collapseAll () {
            this.SET_EXPANDED_EMPLOYEE_CARDS(false)
            this.SET_GLOBAL_TIME_REGISTRATIONS_CARD_STATE('collapsed')
            this.updateUserSettings()
        },
        expandAll () {
            this.SET_EXPANDED_EMPLOYEE_CARDS(true)
            this.SET_GLOBAL_TIME_REGISTRATIONS_CARD_STATE('expanded')
            this.updateUserSettings()
        },
        contextMenuCreate (event) {
            const accessibleDepartments = this.departments.filter(dep => this.ACCESSIBLE_DEPARTMENTS.includes(dep.department_id))
            this.SET_EDIT_IN_MODAL(true)
            this.SET_ACCOUNT_ID(this.realisationContextMenu.employee.account_id)
            this.SET_CREATING(true)

            const realisation = timeRegistrationsHelper.newRealisation(this.timeRegistrations, this.realisationContextMenu.employee.account_id, accessibleDepartments)
            this.UPDATE_REALISATION({
                accountId: this.realisationContextMenu.employee.account_id,
                realisationIndex: -1,
                realisation,
            })

            this.$nextTick(() => {
                // update unused indirect hours prop if assigned to new realisation
                const employeeTimeRegistration = this.TIME_REGISTRATIONS.find(tr => tr.account_id === this.realisationContextMenu.employee.account_id)
                this.updateUnusedIndirectHours(employeeTimeRegistration, realisation)
            })
            this.closeRealisationContextMenu()
        },
        contextMenuEdit (event) {
            this.SET_EDIT_IN_MODAL(true)
            this.SET_ACCOUNT_ID(this.realisationContextMenu.employee.account_id)
            this.SET_REALISATION_INDEX(this.realisationContextMenu.realisationIndex)
            this.SET_INITIAL_REALISATION()
            this.closeRealisationContextMenu()
        },
        contextMenuDelete (event) {
            this.removeRealisationPayload = {
                accountId: this.realisationContextMenu.employee.account_id,
                realisationIndex: this.realisationContextMenu.realisationIndex,
            }
            this.showRemoveRealisationDialog = true
            this.closeRealisationContextMenu()
        },
        closeRemoveRealisationDialog () {
            this.removeRealisationPayload = null
            this.showRemoveRealisationDialog = false
        },
        closeRealisationContextMenu () {
            this.realisationContextMenu.show = false
        },
        removeRealisation () {
            this.UPDATE_REALISATION(this.removeRealisationPayload)
            this.closeRemoveRealisationDialog()
        },
        handleRouteMutation (to, next) {
            if (this.DIRTY_TIME_REGISTRATIONS.length && !this.allowLeavingWithoutSaving) {
                this.showLeaveWithoutSavingDialog = true
                this.navigateTo = to
            } else {
                if (next) {
                    next()
                }
                this.allowLeavingWithoutSaving = false
                this.showLeaveWithoutSavingDialog = false
            }
        },
        leaveWithoutSaving () {
            this.allowLeavingWithoutSaving = true
            this.$nextTick(() => {
                this.$router.push({ path: this.navigateTo.path })
            })
        },
        showTimeRegistationsLogModal (employeeTimeRegistration) {
            this.showTimeRegistationsLog = true
            this.registrationInLog = employeeTimeRegistration
        },
        batchProcessRealisation () {
            this.isProcessing = true
            const payload = { date: this.$route.params.date, body: null }
            const accounts = []

            this.readyToProcessRegistrations.forEach(registration => {
                const realisation = timeRegistrationsHelper.fixNegativeBreakDurations(registration.realisation)

                // adjust status for individual realisations
                realisation.forEach(rel => {
                    if (this.ACCESSIBLE_DEPARTMENTS.includes(rel.department_id)) {
                        // realisation is part of department set
                        rel.status = 'full_approval'
                        rel.status_color = 'success'
                    } else {
                        if (rel.status !== 'full_approval') {
                            rel.status = 'partial_approval'
                        }
                    }
                })

                registration.realisation = realisation

                const untouchedRealisation = this.UNTOUCHED_TIME_REGISTRATIONS.find(o => o.account_id === registration.account_id).realisation || []

                accounts.push({
                    account_id: registration.account_id,
                    remark: stringHelper.escapeString(registration.remark),
                    realisation,
                    initial_realisation: untouchedRealisation,
                })
            })
            payload.body = { accounts }

            this.postProposedRealisation(payload)
                .then(result => {
                    if (!result.unprocessed_accounts.length) {
                        this.SET_SNACKBAR({ message: this.$t('pages.timeRegistrationsPage.processingSucceeded'), success: true })
                        this.clearRemarks()

                        this.readyToProcessRegistrations.forEach(registration => {
                            // update individual realisations
                            registration.realisation.forEach((rel, idx) => {
                                this.UPDATE_REALISATION({
                                    accountId: registration.account_id,
                                    realisationIndex: idx,
                                    realisation: rel,
                                    status: 'approved',
                                })
                            })
                        })
                    } else {
                        const unprocessedAccounts = result.unprocessed_accounts.map(o => o.acount_id) // sic!
                        this.SET_SNACKBAR({ message: this.$t('pages.timeRegistrationsPage.notAllCanBeProcessed'), error: true })
                        this.REVERT_TO_UNTOUCHED_TIME_REGISTRATIONS(unprocessedAccounts)
                    }
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.timeRegistrationsPage.processingFailed'), error: true })
                })
                .finally(() => {
                    this.isProcessing = false
                })
        },
        clearRemarks () {
            this.readyToProcessRegistrations.forEach(registration => {
                const payload = { accountId: registration.account_id, remark: '' }
                this.UPDATE_REMARK(payload)
            })
        },
        groupHeaderTitle (identifier) {
            const statusIdentifiers = ['ready', 'approved', 'pending']
            if (statusIdentifiers.includes(identifier)) {
                return this.$t(`pages.timeRegistrationsPage.${identifier}`)
            } else {
                const department = this.departments.find(dep => dep.department_id === Number(identifier)) || null
                if (department) return department.department_name
            }
            return null
        },
        loadTimeRegistrationsUserSettings () {
            const timeRegistrationsSettings = this.userSettings?.find(o => o.screen === 'time-registrations')
            this.SET_GLOBAL_TIME_REGISTRATIONS_CARD_STATE(timeRegistrationsSettings?.settings?.settings?.globalTimeRegistrationsCardState)
            this.setGrouping(timeRegistrationsSettings)
            this.setSorting(timeRegistrationsSettings)
            this.setSortAscending(timeRegistrationsSettings)
        },
        /**
         * Set grouping settings if saved in user preferences (or default if not available)
         */
        setGrouping (timeRegistrationsSettings) {
            if (timeRegistrationsSettings?.settings?.settings?.timeRegistrationsGroupOn) {
                // grouping option has been stored previously, load into vuex
                this.SET_GROUP_ON(timeRegistrationsSettings?.settings?.settings?.timeRegistrationsGroupOn)
            } else {
                this.SET_GROUP_ON(['status'])
            }
        },
        /**
         * Set sorting settings if saved in user preferences (or default if not available)
         */
        setSorting (timeRegistrationsSettings) {
            if (timeRegistrationsSettings?.settings?.settings?.timeRegistrationsSortOn) {
                // sorting options have been stored previously, load into vuex
                this.SET_SORT_ON(timeRegistrationsSettings?.settings?.settings?.timeRegistrationsSortOn)
            } else {
                // no stored sorting options, select default
                this.SET_SORT_ON('firstName')
            }
        },
        /**
         * Set sorting direction if saved in user preferences (or default if not available)
         */
        setSortAscending (timeRegistrationsSettings) {
            if (timeRegistrationsSettings?.settings?.settings?.timeRegistrationsSortAscending !== undefined) {
                // sorting options have been stored previously, load into vuex
                this.SET_SORT_ASCENDING(timeRegistrationsSettings.settings.settings.timeRegistrationsSortAscending)
            } else {
                // no stored sorting options, select default
                this.SET_SORT_ASCENDING(true)
            }
        },
        updateUserSettings () {
            this.$nextTick(() => {
                this.UPDATE_USER_SETTINGS(this.$route.meta.settingsRoute)
                this.setUserSettings()
            })
        },
        badgeNumber (identifier) {
            if (this.GROUP_ON.length > 1) {
                // grouping on multiple variables is engaged
                let counter = 0
                for (const key of Object.keys(this.TIME_REGISTRATIONS[identifier])) {
                    counter += this.TIME_REGISTRATIONS[identifier][key]?.length
                }
                return counter
            } else if (this.GROUP_ON.length) {
                // grouping on one variable
                return this.TIME_REGISTRATIONS[identifier]?.length || null
            }
            return null
        },
        scrollTo (id) {
            const element = document.getElementById(id)
            const scrollArea = document.getElementById('main')
            const scrollY = scrollArea.scrollTop
            const y = element.getBoundingClientRect().top + scrollY - 176
            scrollArea.scrollTo({ top: y, behavior: 'smooth' })
            this.CLEAR_SCROLL_TO_EMPLOYEE_CARD_ID()
        },

        setRealisationContextMenu ({ event = PointerEvent, realisation, realisationIndex, employee }) {
            event.preventDefault()
            this.realisationContextMenu = {
                show: !!realisation,
                ...{ event, realisation, realisationIndex, employee, type: 'timeRegistrations' },
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/mixins/_breakpoints.scss';
    @import '@/assets/scss/shaddows.scss';

    .container {
        max-width: 100vw !important;
        margin: 0 !important;

        @include bp-xl {
            max-width: 1904px !important;
            margin: 0 auto !important;
        }

        .expansion-panels-container {
            margin: 0;
            padding: 0;
        }
    }

    .time-registrations {
        margin-bottom: 64px;
    }

    :deep(.v-alert) {
        padding: 8px 16px;
        margin: 0;
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;

        .v-icon {
            font-size: 16px;
        }
    }

    .button-bar {
        position: fixed;
        z-index: 99;
        display: flex;
        justify-content: flex-end;
        bottom: 0;
        width: 100%;
        padding: 8px 16px;
        background: white;
        box-shadow: $shaddow-2p;
    }

    :deep(.v-badge) {
        .v-badge__wrapper {
            font-weight: 700;

            & > * {
                font-size: 12px;
            }
        }

        &.small .v-badge__wrapper {
            & > * {
                min-width: 16px;
                height: 16px;
                padding: 0;
                margin-top: 2px;
                font-size: 10px;
                line-height: 16px;
            }
        }
    }

</style>
