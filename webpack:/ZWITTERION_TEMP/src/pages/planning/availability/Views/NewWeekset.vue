<template>
    <div>
        <pmt-layout
            ref="layout"
            fixed-height
            :show-right-side="(!IS_MOBILE && $route.params.activation && hasWeeksetInActivationFlow) || (!IS_MOBILE && !$route.params.activation)"
        >
            <pmt-transition
                v-if="!IS_MOBILE"
                name="slide"
                mode="in-out"
                :direction="direction"
                :loading="loading"
            >
                <week-time-grid
                    ref="weekTimeGrid"
                    :time-blocks="availabilityTimeBlocks"
                    :custom-week="$moment(newWeekset.start_date).isoWeek()"
                    :custom-year="$moment(newWeekset.start_date).isoWeekYear()"
                    :start-time="openingTimes.from"
                    :end-time="openingTimes.to"
                    :scroll="scroll"
                />
            </pmt-transition>
            <template
                v-if="!IS_MOBILE && !$route.params.activation || ($route.params.activation && hasWeeksetInActivationFlow)"
                #right
            >
                <!-- TODO hide form and only show buttons for activation step with weekset adding deactivated for stor option. Use route param from activation addOnlySingles -->
                <new-weekset-side-panel
                    ref="sidePanel"
                    :weekset="newWeekset"
                    :week-finalized="weekFinalized"
                />
            </template>
            <!-- Bellow button should be visible only when accessing weekset from activation flow -->
            <template v-if="!showWeeksetMobileTab">
                <div
                    v-tooltip="!availabilityTimeBlocks.length ? $t('forms.editAccount.activate.steps.availability.addAtLeastOne') : ''"
                    :style="continueActivationButtonStyle"
                >
                    <div :style="{pointerEvents: availabilityTimeBlocks.length ? 'inherit' : 'none'}">
                        <pmt-button
                            primary
                            icon="arrow-right"
                            icon-size="15"
                            right-icon
                            @click="goBack"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.continue') }}
                        </pmt-button>
                    </div>
                </div>
            </template>
            <div v-if="IS_MOBILE">
                <tabs
                    :tabs="tabs"
                    :tab-loading="loading"
                    :show-close="showWeeksetMobileTab"
                    :confirm-close="!!availabilityTimeBlocks.length"
                    :confirm-message="$t('sidePanels.availabilityWeeklyDetails.sections.unsavedChanges') + $t('sidePanels.availabilityWeeklyDetails.sections.closeAnyway')"
                    @close="goBack"
                >
                    <template slot="tabs-content">
                        <div
                            v-show="$route.query.path === 'new_weekset'"
                            class="inner-tab-content"
                        >
                            <pmt-transition
                                name="slide"
                                mode="in-out"
                                :direction="direction"
                                :loading="loading"
                            >
                                <week-time-grid
                                    ref="weekTimeGrid"
                                    :time-blocks="availabilityTimeBlocks"
                                    :custom-week="$moment(newWeekset.start_date).isoWeek()"
                                    :custom-year="$moment(newWeekset.start_date).isoWeekYear()"
                                    :start-time="openingTimes.from"
                                    :end-time="openingTimes.to"
                                    :scroll="scroll"
                                />
                            </pmt-transition>
                        </div>
                        <div
                            v-show="$route.query.path === 'save_weekset' && !loading"
                            class="inner-tab-content"
                        >
                            <new-weekset-side-panel
                                ref="sidePanel"
                                :weekset="newWeekset"
                                :week-finalized="weekFinalized"
                                :show-close="!IS_MOBILE"
                            />
                        </div>
                    </template>
                    <template
                        v-if="!showWeeksetMobileTab"
                        slot="actions"
                    >
                        <pmt-button
                            primary
                            medium
                            icon="arrow-right"
                            icon-size="15"
                            right-icon
                            :disabled="!availabilityTimeBlocks.length"
                            @click="availabilityTimeBlocks.length ? goBack : false"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.continue') }}
                        </pmt-button>
                    </template>
                </tabs>
            </div>
        </pmt-layout>
    </div>
</template>

<script>
import * as vuex from 'vuex'
import WeekTimeGrid from '@/components/ui/time-grid/WeekTimeGrid.vue'
import NewWeeksetSidePanel from '../SidePanels/NewWeeksetSidePanel.vue'
import myScheduleService from '@/services/MyScheduleService'
import WeeksetMixin from '@/pages/planning/availability/Views/WeeksetMixin'
export default {
    name: 'NewWeekset',
    components: {
        WeekTimeGrid,
        NewWeeksetSidePanel,
    },
    mixins: [WeeksetMixin],
    props: {
        openingTimes: {
            type: Object,
            default: () => {},
        },
        direction: {
            type: String,
            default: '',
        },
        scroll: {
            type: Number,
            default: 0,
        },
    },
    data () {
        return {
            loading: true,
            weekset: {},
            showSidebar: false,
            weekFinalized: true,
        }
    },
    computed: {
        ...vuex.mapGetters('auth', ['canYou', 'user', 'hasWeeksetInActivationFlow']),
        ...vuex.mapState('availability', {
            newWeekset: 'newWeekset',
            availabilityTimeBlocks: 'availabilityTimeBlocks',
        }),
        ...vuex.mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        tabs () {
            const tabs = []
            tabs.push({ name: this.$t('pages.baseAvailability.newWeekset.mobileTabs.availabilities'), id: 'new_weekset' })
            if (this.showWeeksetMobileTab) {
                tabs.push({ name: this.$t(`pages.baseAvailability.newWeekset.mobileTabs.${!this.hasWeeksetInActivationFlow ? 'save' : 'saveWeekset'}`), showBadge: true, badgeText: '', pulsateBadge: true, dangerBadge: true, id: 'save_weekset' })
            }
            return tabs
        },
        showWeeksetMobileTab () {
            return !this.$route.params.activation || (this.$route.params.activation && this.hasWeeksetInActivationFlow)
        },
        continueActivationButtonStyle () {
            return {
                position: 'fixed',
                top: '56px',
                right: '25px',
            }
        },
    },
    mounted () {
        this.getFinalizedWeek(this.$route.params.account_id || this.user.accountId)
    },
    methods: {
        ...vuex.mapActions('availability', {
            getWeekset: 'getWeekset',
        }),
        getFinalizedWeek (account_id) {
            const payload = {
                week: this.$moment().isoWeek(),
                year: this.$moment().isoWeekYear(),
                accountId: account_id,
            }
            myScheduleService.getActiveWeeks(payload)
                .then((data) => {
                    this.weekFinalized = data.week_finalized
                })
                .finally(() => {
                    this.loading = false
                })
        },
    },
}
</script>
