<template>
    <div>
        <WorkloadTopbar
            v-if="IS_MOBILE && !isDraftWeek"
            ref="filtersTopbar"
            :show-filters="true"
            :show-distribution-chart="true"
            :show-fetch-norms="true"
            :show-search="false"
            :show-date-picker="false"
            :all-disabled="sidePanels.editProcess || isLoading"
            :week-status="weekStatus"
            @show-filters="openSidePanel('filters')"
            @show-distribution-chart="openSidePanel('charts')"
            @fetch-wlp="fetchNorms"
            @go-to-distribution="goToDistribution"
            @go-to-workload="goToWorkload"
        />
        <WorkloadTopbar
            ref="workloadTopBar"
            :is-loading="isLoading && !isFullScreen"
            :right-side-open="isRightSideOpen"
            show-search
            :search="search"
            :show-filters="!IS_MOBILE"
            :show-fetch-norms="!IS_MOBILE"
            :show-distribution-chart="!IS_MOBILE && !isFullScreen"
            show-date-picker
            :show-distribution="!IS_MOBILE"
            :week-status="weekStatus"
            :all-disabled="sidePanels.editProcess || isLoading"
            @search="search = $event"
            @fetch-wlp="fetchNorms"
            @show-distribution-chart="openSidePanel('charts')"
            @on-date-select="initializeWorkload"
            @go-to-distribution="goToDistribution"
            @go-to-workload="goToWorkload"
        />
        <PmtLayout
            ref="layout"
            v-touch="{left: () => navigate('left'), right: () => navigate('right')}"
            fixed-height
            :right-side-width="rightSideWidth"
            :full-width-right-side="isFullScreen"
            :loading="!forceDiplayWhenLoading || isLoading"
            hide-loading-content
            :disabled-content-on-side-open="sidePanels.editProcess"
            :right-side-style="isFullScreen ? {top: '104px'} : {}"
            :show-right-side="sidePanels.charts || sidePanels.editProcess"
            @hide-overlay="wantsToCloseByOverlayClick = true"
        >
            <template #default>
                <PmtContent
                    id="print"
                    :narrow-wide="PAGE_WIDTH > 1300"
                >
                    <div
                        v-if="showWorkload"
                        :key="$route.path + selectedDate.apiFormat()"
                        class="pt-5 pb-5 animated workload"
                        :class="{'pl-3 pr-3': !IS_MOBILE, 'slideInRight': direction === 'right', 'slideInLeft': direction === 'left'}"
                    >
                        <WorkloadTitleHeader
                            :week-status="weekStatus"
                            :is-draft-week="isDraftWeek"
                            :workload-needs-sync="workloadNeedsSync"
                            @reset-filters="setDefaultFilters"
                            @print="PRINT({elementId: 'print', title: 'Print'})"
                        />
                        <WorkloadContent
                            ref="workload"
                            :workload-rows="filteredWorkloadRows"
                            :distribution-rows="filteredDistributionRows"
                            :departments="departments"
                            :selected-process="{id: editingProcessId, department_id: editingProcessDepartmentId}"
                            :search="search"
                            @row-selected="processSelected"
                        />
                    </div>
                    <EmptyState
                        v-else-if="dataFetched || isDraftWeek"
                        ref="emptyState"
                        :title="isDraftWeek ? $t('pages.workload.emptyState.weekNotReleasedTitle') : $t('ui.emptyState.nothingAvailableForFiltersTitle')"
                        :sub-title="isDraftWeek ? $t('pages.workload.emptyState.weekNotReleasedSubTitle') : $t('ui.emptyState.nothingAvailableForFiltersSubTitle')"
                        :component="isDraftWeek ? 'schedules-not-finalized' : 'four-o-four'"
                        empty-search-result
                        :show="true"
                        :size="IS_MOBILE ? 250 : 500"
                        no-padding
                    />
                </PmtContent>
            </template>
            <template #right>
                <WorkloadChartSidePanel
                    v-if="sidePanels.charts"
                    ref="chartsSidePanel"
                    :data="filteredWorkloadRows"
                    :is-loading="isLoading"
                    :is-draft-week="isDraftWeek"
                    :show-workload="showWorkload"
                    @close="closeAllSidepanels"
                    @full-screen="openSidePanel('charts')"
                />
                <WorkloadProcessEditSidePanel
                    v-else-if="sidePanels.editProcess"
                    :key="editingProcessId + `${sidePanels.editProcess}`"
                    ref="processEditSidePanel"
                    :editing-process="editingProcess"
                    :wants-to-close="wantsToCloseByOverlayClick"
                    @close="closeAllSidepanels"
                    @cancel-close="wantsToCloseByOverlayClick = false"
                    @saved-new-timeframes="workloadNeedsSync = true"
                />
            </template>
        </PmtLayout>
    </div>
</template>

<script>
import Mixins from '@/pages/planning/workload/views/components/mixins'
import stringHelper from '@/libraries/stringHelper'
import { mapMutations } from 'vuex'
export default {
    name: 'Workload',

    components: {
        WorkloadTopbar: () => import('@/pages/planning/workload/views/components/WorkloadTopbar'),
        WorkloadContent: () => import('@/pages/planning/workload/views/components/WorkloadContent'),
        WorkloadTitleHeader: () => import('@/pages/planning/workload/views/components/WorkloadTitleHeader'),
        WorkloadChartSidePanel: () => import('@/pages/planning/workload/views/components/WorkloadChartSidePanel.vue'),
        WorkloadProcessEditSidePanel: () => import('@/pages/planning/workload/views/components/WorkloadProcessEditSidePanel'),
    },

    mixins: [Mixins],

    data () {
        return {
            direction: 'right',
            search: '',
            workloadRows: [],
            distributionRows: [],
            panels: [],
            sidePanels: {
                filters: false,
                charts: false,
                editProcess: false,
            },
            editingProcessId: 0,
            editingProcessDepartmentId: 0,
            wantsToCloseByOverlayClick: false,
            workloadNeedsSync: false,
            localLoading: false,
            forceDiplayWhenLoading: false,
            dataFetched: false,
        }
    },

    computed: {
        showWorkload () {
            if (this.isLoading) return false
            if (this.isDraftWeek) return false
            if ((!this.isDistributionRoute && this.filteredWorkloadRows.length)) return true
            if ((this.isDistributionRoute && this.filteredDistributionRows.length)) return true
            return false
        },
        weekStatus () {
            return this.weekStatuses[`"${this.selectedDate.yearWeekApiFilter()}"`]
        },
        isDraftWeek () {
            return this.weekStatus && this.weekStatus.status === 'draft'
        },
        isRightSideOpen () {
            if (this.sidePanels.charts && !this.isFullScreen) return true
            if (this.sidePanels.editProcess) return true
            return false
        },
        rightSideWidth () {
            if (this.PAGE_WIDTH > 1024 && this.sidePanels.editProcess) {
                return 500
            }
            return false
        },

        /**
         * Returns true if data is being fetched from the API.
         */
        isLoading () {
            return (this.loading.workload || this.loading.timeframes || this.loadingStoreData.weekStatus || this.loadingDepartments.weekDepartments) || (this.isDistributionRoute && (this.loading.patterns || this.loading.profiles))
        },
        IS_MOBILE () {
            return this.PAGE_WIDTH <= 940
        },
        timeframes () {
            return this.weekTimeframes[`"${this.selectedDate.isoWeek()}-${this.selectedDate.isoWeekYear()}"`] || []
        },
        isFullScreen () {
            return this.$route.query.full_screen === 'true' || this.$route.query.full_screen
        },
        editingProcess () {
            return this.filteredWorkloadRows.find(item => {
                return item.work_process_id === this.editingProcessId && item.department.department_id === this.editingProcessDepartmentId
            })
        },
        workload () {
            const workload = this.weekWorkload[`"${this.$route.params.year}-${this.$route.params.week}"`] || []
            if (workload && workload.length) {
                return workload.map(load => {
                    const department = this.departmentById(load.department_id)
                    if (department) {
                        load.department_name = department.department_name
                        load.status = department.status
                        load.color = department.color
                        load.department = department
                    }
                    return load
                })
            }
            return []
        },
        distributionPatterns () {
            return this.weekDistributionPatterns[`"${this.$route.params.year}-${this.$route.params.week}"`] || []
        },
        distributionProfiles () {
            return this.weekDistributionProfiles[`"${this.$route.params.year}-${this.$route.params.week}"`] || []
        },
        departments () {
            return this.weekDepartments[`"${this.selectedDate.isoWeek()}-${this.selectedDate.isoWeekYear()}"`] || []
        },
        /**
             * Filters workload.
             */
        filteredWorkloadRows () {
            const rows = []
            // eslint-disable-next-line no-unused-vars
            for (const processKey in this.workloadRows) {
                const process = this.workloadRows[processKey]
                const fitsFilter = this.FITS_FILTERS_ON({ department_ids: [process.department.department_id] })
                if (!fitsFilter) continue
                if (this.filters.hideNonEditableProcesses && !process.editable) continue
                if (this.filters.hideZeroProcessValues && process.total.work_time === '00:00') continue
                if (this.search !== '') {
                    if (!this.fitsSearchParam(process)) continue
                }
                rows.push(process)
            }
            return rows
        },
        filteredDistributionRows () {
            const rows = []
            for (let i = 0; i < this.distributionRows.length; i++) {
                const pattern = this.distributionRows[i]
                const fitsFilter = this.FITS_FILTERS_ON({ department_ids: [pattern.department_id] })
                if (!fitsFilter) continue
                if (this.filters.hideNonEditablePatterns && pattern.distribution_type === 'calculated') continue
                if (this.search !== '') {
                    if (!this.fitsDistributionSearchParam(pattern)) continue
                }
                rows.push(pattern)
            }
            return rows
        },
        hasOpenSidePanel () {
            let has = false
            // eslint-disable-next-line no-unused-vars
            for (const panel in this.sidePanels) {
                if (this.sidePanels[panel]) {
                    has = true
                    break
                }
            }
            return has
        },
    },

    watch: {
        profilesApplied () {
            this.setDistributionRows()
        },
        isDistributionRoute () {
            this.updateFilters()
        },
        'filters.groupByDay' () {
            this.updateFilters()
        },
    },

    created () {
        // remove full_screen query param on mounted
        const query = Object.assign({}, this.$route.query)
        if (typeof query.full_screen !== 'undefined') {
            delete query.full_screen
            this.$router.push({ query })
        }

        this.updateFilters()
    },

    destroyed () {
        this.CLEAR_PAGE_FILTERS()
    },

    methods: {
        ...mapMutations(['SET_PAGE_FILTERS_DATE']),
        goToDistribution () {
            this.setDefaultFilters()
            this.setDistributionRows()
            this.$router.push({ name: 'workload-distribution' })
        },
        goToWorkload () {
            this.setDefaultFilters()
            this.$router.push({ name: 'workload' })
        },
        openSidePanel (name) {
            this.closeAllSidepanels()
            this.sidePanels[name] = true
        },
        closeSidePanel (name) {
            this.sidePanels[name] = false
        },
        closeAllSidepanels (except) {
            this.wantsToCloseByOverlayClick = false
            this.editingProcessId = 0
            // eslint-disable-next-line no-unused-vars
            for (const sidepanel in this.sidePanels) {
                if (sidepanel === 'charts' && this.isFullScreen) {
                    continue
                }
                if (sidepanel !== except) {
                    this.sidePanels[sidepanel] = false
                }
            }
        },
        processSelected (item) {
            this.openSidePanel('editProcess')
            this.editingProcessId = item.work_process_id
            this.editingProcessDepartmentId = item.department.department_id
        },

        /**
             * Clears certain filtters from store
             * It also clears the group by options
             */
        setDefaultFilters () {
            this.CLEAR_PARTICULAR_PAGE_FILTERS(['weekdays', 'groupByDay', 'groupByProcess', 'departments'])
        },

        updateFilters () {
            this.UPDATE_ENABLED_FILTERS({
                // Groups
                groupByPattern: this.isDistributionRoute,
                groupByDay: !this.isDistributionRoute,
                groupByProcess: !this.isDistributionRoute,
                // Settings
                hideZeroProcessValues: !this.isDistributionRoute,
                hideNonEditableProcesses: !this.isDistributionRoute,
                showWorkCostOnDayLevel: !this.isDistributionRoute,
                showWorkTimeOnDayLevel: !this.IS_MOBILE && !this.isDistributionRoute,
                hideNonEditablePatterns: this.isDistributionRoute,
                showNormHoursInDistributionNonEditView: this.isDistributionRoute,
                // Filters
                departments: true,
                weekdays: this.filters.groupByDay && !this.isDistributionRoute,
            })
        },

        /**
             * A set of items to search against the search item for workload processes
             * @param {Object} row
             * @returns Boolean
             */
        fitsSearchParam (process) {
            const search = this.search.trim().toLowerCase()
            const processName = process.name.toString().toLowerCase()
            const processId = process.work_process_id.toString().toLowerCase()
            const processFound = processName.includes(search) || processId.includes(search)
            if (processFound) {
                return true
            }
            return false
        },
        /**
             * A set of items to search against the search item for distribution patterns
             * @param {Object} row
             * @returns Boolean
             */
        fitsDistributionSearchParam (pattern) {
            const search = this.search.trim().toLowerCase()
            const patternName = pattern.pattern_name.toString().toLowerCase()
            if (patternName.includes(search)) {
                return true
            }
            return false
        },
        /**
             * Used for mobile swipe navigation
             */
        navigate (direction) {
            if (!this.isLoading && !this.hasOpenSidePanel) {
                this.$refs.workloadTopBar.$refs.datepicker.navigate(direction === 'right' ? -1 : 1)
            }
        },
        /**
             * Sets the directiron of the animation
             */
        setNavigationDirection (newDate) {
            this.direction = newDate.isBefore(this.selectedDate, 'day') ? 'left' : 'right'
        },
        /**
             * Initial load of the data used to show on the page
             */
        async initializeWorkload (date, force, setContentLoading = true) {
            if (!this.localLoading || force) {
                this.SET_PAGE_FILTERS_DATE(this.selectedDate)
                this.localLoading = true
                this.forceDiplayWhenLoading = setContentLoading
                await this.closeSidePanel('editProcess')
                await this.setNavigationDirection(date)
                await this.getWeekStatus()
                if (this.weekStatus && !this.isDraftWeek) {
                    const [departments, processes, timeframes, workload] = this.mainWorkloadCalls(force)
                    const [patterns, profiles] = this.distributionCalls(force)
                    await this.fetchAll([departments, processes, timeframes, workload])
                    // wait for ditribution calls on distribution route else make the calss without waiting
                    if (this.isDistributionRoute) {
                        await this.fetchAll([patterns, profiles])
                    }
                } else {
                    this.dataFetched = true
                }
                await this.setRows()
                this.localLoading = false
            }
        },
        async fetchAll (calls) {
            await Promise.all(calls).then(values => {
                return values
            }).catch(err => {
                this.SET_SNACKBAR({ message: err.message, error: true })
                console.error(err)
            }).finally(() => {
                this.dataFetched = true
            })
        },
        /**
             * Returns the calls that need to be made on
             * workload page on each timepicker change.
             * If the data for the repsective call is already
             * present in VUEX we will skip that respective call.
             * If force is used, the calls wiill be made again,
             * regardless if their respective data is already present
             * locally. force is used manually after fetching wlp.
             * @param {Boolean} force
             * @returns {Array <Promise>}
             */
        mainWorkloadCalls (force) {
            // if force is used, the calls wiill be made again, regardless if their respective data is already present locally
            const calls = []
            if (!this.departments.length) {
                calls.push(this.GET_DEPARTMENTS({ date: this.selectedDate.apiFormat(), allDepartments: this.canYou('planning', 'all_departments') }))
            }
            if (!Object.keys(this.processes).length) {
                calls.push(this.GET_PROCESSES())
            }
            // if we use force we get again the timeframes regardless if they were fetched before
            // used manually after fetching wlp
            if (!this.timeframes || !this.timeframes.length || force) {
                calls.push(this.GET_TIMEFRAMES({ week: this.selectedDate.isoWeek(), year: this.selectedDate.isoWeekYear() }))
            }
            // if we use force we get again the timeframes regardless if they were fetched before
            // used manually after fetching wlp
            if (!this.workload || !this.workload.length || force) {
                calls.push(this.GET_WEEK_WORKLOAD(this.selectedDate))
            }
            return calls
        },
        /**
             * Returns the calls that need to be made on
             * distribution page on each timepicker change.
             * If the data for the repsective call is already
             * present in VUEX we will skip that respective call.
             * If force is used, the calls wiill be made again,
             * regardless if their respective data is already present
             * locally. force is used manually after fetching wlp.
             * @param {Boolean} force
             * @returns {Array <Promise>}
             */
        distributionCalls (force) {
            const calls = []
            if (!this.distributionPatterns || !this.distributionPatterns.length || force) {
                calls.push(this.GET_WEEK_DISTRUTION_PATTERNS(this.selectedDate).catch(err => { this.SET_SNACKBAR({ message: err.message, error: true }) }))
            }
            if (!this.distributionProfiles || !this.distributionProfiles.length || force) {
                calls.push(this.GET_WEEK_DISTRUTION_PROFILES(this.selectedDate).catch(err => { console.error(err) }))
            }
            return calls
        },
        /**
             * Makes the call to fetch WLP Norms.
             * When is finishes it also fetches again
             * the wokload and distribution calls.
             * It uses force param for the workload calls
             * in order to re-fetch all the latest data.
             */
        fetchNorms () {
            this.FETCH_WLP_NORMS({ week: this.selectedDate.isoWeek(), year: this.selectedDate.isoWeekYear() }).then(result => {
                // run with force param to overide defaults
                this.initializeWorkload(this.selectedDate, true, true).then(result => {
                    this.SET_SNACKBAR({ message: this.$t('pages.workload.normsFetchSuccessfully'), success: true })
                    this.workloadNeedsSync = false
                }).catch(err => {
                    this.SET_SNACKBAR({ message: err.message, error: true })
                })
            }).catch(err => {
                this.SET_SNACKBAR({ message: err.message, error: true })
            })
        },
        /**
             * Set the worload rows
             */
        setRows () {
            const processes = []
            this.workload.forEach(item => {
                if (item.department) {
                    item.work_processes.forEach(process => {
                        process.department = item.department
                        process.department_id = item.department.department_id
                        process.hasFrames = !!this.HAS_TIMEFRAMES(
                            this.selectedDate.isoWeek(),
                            this.selectedDate.isoWeekYear(),
                            item.department.department_id,
                            process.work_process_id,
                        )
                        processes.push({ ...process, ...this.processes[parseInt(process.work_process_id)] })
                    })
                }
            })
            this.workloadRows = processes
            if (this.isDistributionRoute) {
                this.setDistributionRows()
            }
        },
        /**
             * Set the distribution rows
             */
        setDistributionRows () {
            const departmentPatterns = stringHelper.groupBy(this.distributionPatterns, 'department_id')
            const result = []
            // eslint-disable-next-line no-unused-vars
            for (const dep in departmentPatterns) {
                departmentPatterns[dep][0].patterns.forEach(pattern => {
                    const departmentId = departmentPatterns[dep][0].department_id
                    pattern.profile = this.departmentProfiles(departmentId).find(profile => {
                        return profile.pattern_id === pattern.pattern_id
                    })
                    if (!pattern.profile) {
                        // this means that WLP Settings need to be saved for this week in PMT1
                        // waiting for an automated process to do not need this action in the future
                        pattern.missing_profile = true
                    }
                    pattern.department_id = departmentId
                    pattern.department = this.departmentById(departmentId)
                    pattern.date = this.selectedDate.apiFormat()
                    result.push(pattern)
                })
            }
            this.distributionRows = result
        },
        /**
             * Returns distribution profiles, for the desired department
             * @param {Number} departmentId
             * @returns {Array}
             */
        departmentProfiles (departmentId) {
            const departmentProfiles = this.distributionProfiles.find(row => {
                return +row.department_id === +departmentId
            })
            if (departmentProfiles) {
                return departmentProfiles.patterns
            }
        },

        async getWeekStatus () {
            if (!this.weekStatus || !Object.keys(this.weekStatus).length) {
                const payload = { week: this.selectedDate.yearWeekApiFilter(), latest_status: true }
                await this.GET_WEEK_STATUS(payload)
            }
        },
    },

}
</script>
<style lang="scss" scoped>
    :deep(.narrow-wide) {
        max-width: 1600px !important;
    }
    .filters-container {
        padding: 10px;
    }
    .scroller {
        height: 100%;
    }
    .user {
        height: 32%;
        padding: 0 12px;
        display: flex;
        align-items: center;
    }
    .remove-comparison {
        top: -2px;
        position: relative;
    }
</style>
