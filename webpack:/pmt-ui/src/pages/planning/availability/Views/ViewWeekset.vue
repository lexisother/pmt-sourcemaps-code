<template>
    <div
        id="availability-scroll"
        class="availability-layout"
    >
        <pmt-layout
            ref="layout"
            fixed-height
            :show-right-side="!IS_MOBILE"
        >
            <template v-if="!IS_MOBILE">
                <pmt-transition
                    name="slide"
                    mode="in-out"
                    :direction="direction"
                    :loading="loading"
                >
                    <week-time-grid
                        v-if="editingWeekset.availabilities && editingWeekset.start_date"
                        ref="weekTimeGrid"
                        :custom-week="$moment(editingWeekset.start_date).isoWeek()"
                        :custom-year="$moment(editingWeekset.start_date).isoWeekYear()"
                        :start-time="getWeekBusinessTimes.from"
                        :end-time="getWeekBusinessTimes.to"
                    />
                </pmt-transition>
                <template slot="right">
                    <availability-weekly-details-side-panel
                        ref="sidePanel"
                        :weekset="editingWeekset"
                        :week-finalized="weekFinalized"
                        @close="goBack"
                    />
                </template>
            </template>
            <template v-else>
                <tabs
                    ref="weeksetTabs"
                    :tabs="tabs"
                    :tab-loading="loading"
                    show-close
                    :confirm-close="!!weeksetChanges.length"
                    :confirm-message="$t('sidePanels.availabilityWeeklyDetails.sections.unsavedChanges') + $t('sidePanels.availabilityWeeklyDetails.sections.closeAnyway')"
                    @close="goBack"
                >
                    <template slot="tabs-content">
                        <div
                            v-show="$route.query.path === 'edit_weekset' && !loading"
                            class="inner-tab-content"
                        >
                            <pmt-transition
                                name="slide"
                                mode="in-out"
                                :direction="direction"
                                :loading="loading"
                            >
                                <week-time-grid
                                    :custom-week="$moment(editingWeekset.start_date).isoWeek()"
                                    :custom-year="$moment(editingWeekset.start_date).isoWeekYear()"
                                    :start-time="getWeekBusinessTimes.from"
                                    :end-time="getWeekBusinessTimes.to"
                                    @swipe="$event === 'left' ? goTo('Save Weekset') : false"
                                />
                            </pmt-transition>
                        </div>
                        <div
                            v-show="$route.query.path === 'save_edited_weekset' || $route.query.path === 'Weekset' && !loading"
                            class="inner-tab-content"
                            @swipe="$event === 'right' ? goTo('Save Weekset') : false"
                        >
                            <pmt-transition
                                name="slide"
                                mode="in-out"
                                :direction="'left'"
                            >
                                <availability-weekly-details-side-panel
                                    ref="sidePanel"
                                    :weekset="editingWeekset"
                                    :week-finalized="weekFinalized"
                                    :show-close="!IS_MOBILE"
                                    @close="goBack"
                                />
                            </pmt-transition>
                        </div>
                    </template>
                </tabs>
            </template>
        </pmt-layout>
    </div>
</template>

<script>
import * as vuex from 'vuex'
import WeekTimeGrid from '@/components/ui/time-grid/WeekTimeGrid.vue'
import AvailabilityWeeklyDetailsSidePanel from '../SidePanels/AvailabilityWeeklyDetailsSidePanel.vue'
import myScheduleService from '@/services/MyScheduleService'
export default {
    name: 'ViewWeekset',
    components: {
        WeekTimeGrid, AvailabilityWeeklyDetailsSidePanel,
    },
    data () {
        return {
            loading: true,
            showSidebar: false,
            weekFinalized: true,
            wantsToClose: false,
        }
    },
    computed: {
        ...vuex.mapState('availability', {
            editingWeekset: 'editingWeekset',
            availabilityEmployeeId: 'availabilityEmployeeId',
            weeksetChanges: 'weeksetChanges',
        }),
        ...vuex.mapGetters('stores', [
            'getWeekBusinessTimes',
        ]),
        ...vuex.mapGetters('availability', {
            direction: 'getNavigationDirection',
        }),
        ...vuex.mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        tabs () {
            const tabs = []
            tabs.push({ name: 'Availibilities', id: 'edit_weekset' })
            tabs.push({ name: this.editingWeekset.status === 'approved' ? 'Weekset' : 'Save Weekset', showBadge: this.editingWeekset.status !== 'approved', badgeText: '', pulsateBadge: true, dangerBadge: true, id: 'save_edited_weekset' })
            return tabs
        },
    },
    mounted () {
        if (this.editingWeekset.availabilities) {
            this.getFinalizedWeek(this.availabilityEmployeeId)
        } else {
            this.getVisitedWeekset()
        }
    },
    methods: {
        ...vuex.mapActions('availability', {
            getWeekset: 'getWeekset',
        }),
        ...vuex.mapMutations(['SET_SNACKBAR']),
        goBack (noWeekset) {
            if (this.$route.params.fromOverview) {
                const newParams = this.$route.params
                newParams.fetchWeeksets = true
                this.$router.push({
                    name: 'availability-overview',
                    params: newParams,
                    query: this.$route.query,
                })
                return
            }
            const isManagerRoute = this.$route.meta.manager
            const route = {
                name: isManagerRoute ? noWeekset ? 'weekly-availability' : 'week-availability-accountid' : 'my-week-availability',
                // params are added to the route when clicking a weekset in th sidepanel
                // here we are just reading what was added to the route
                params: {
                    week: parseInt(this.$route.params.week) || this.$moment().isoWeek(),
                    year: parseInt(this.$route.params.year) || this.$moment().isoWeekYear(),
                },
            }
            if (isManagerRoute) {
                // adds account_id to the route when the user is using a manager route
                route.params.account_id = this.$route.params.account_id || this.editingWeekset.account_id
            }
            this.$router.push(route)
        },
        toggleSidebar () {
            this.showSidebar = !this.showSidebar
        },
        goTo (tab) {
            this.$router.push({ name: this.$route.name, query: { path: tab } })
        },
        getFinalizedWeek (account_id) {
            const payload = {
                week: this.$moment(this.editingWeekset.start_date).isoWeek(),
                year: this.$moment(this.editingWeekset.start_date).isoWeekYear(),
                accountId: account_id,
            }
            myScheduleService.getActiveWeeks(payload).then((data) => {
                this.weekFinalized = data.week_finalized
            }).then(() => {
                this.loading = false
            })
        },
        getVisitedWeekset () {
            this.getWeekset(this.$route.params.id).then(result => {
                this.getFinalizedWeek(result.account_id)
            }).catch(err => {
                if (err.code === 'general.notFound') {
                    this.SET_SNACKBAR({ message: this.$t('apiErrors.availability.weeksetNotFound'), error: true })
                } else {
                    this.SET_SNACKBAR({ message: err.message, error: true })
                }
                this.goBack(true)
            })
        },
    },
}
</script>
<style lang="scss" scoped>
    @media only screen and (max-width: 600px) {
        .availability-layout {
            position: absolute;
            width: 100%;
            top: 0;
        }
    }
</style>
