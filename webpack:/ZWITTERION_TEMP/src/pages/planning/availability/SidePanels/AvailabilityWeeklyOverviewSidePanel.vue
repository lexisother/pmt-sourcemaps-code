<template>
    <SidePanel
        :key="sidepanelKey"
        ref="sidePanel"
        :title="$t( 'sidePanels.availabilityWeeklyOverview.title' )"
        :border-left="borderLeft"
        :padding="false"
        header-icon="clock-check-outline"
        class="weekset-overview-side-panel"
        @close="$emit('close')"
    >
        <clock-check-outline
            slot="header-icon"
            :size="20"
        />
        <template #actions>
            <PopoverButton
                v-if="!isOverview"
                ref="createNewBtn"
                :is-open="addNew"
                primary
                outline
                medium
                icon="calendar-plus"
                :text="$t('sidePanels.availabilityWeeklyOverview.actions.createNew')"
                @click="addNew = true"
                @hide="addNew = false"
            >
                <template slot="popover-content">
                    <div class="reject-form">
                        <h3 style="font-weight: 600;">
                            {{ $t('forms.availabilityEntry.titles.new') }}
                        </h3>
                        <PmtButton
                            v-tooltip="$t('forms.availabilityEntry.newAvailability.freshStartTooltip')"
                            default
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
                            v-tooltip="$t('forms.availabilityEntry.newAvailability.fromCurrentTooltip')"
                            default
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
                </template>
            </PopoverButton>
            <PopoverButton
                v-if="isOverview"
                ref="approveAllActivator"
                cy_id="approve-all-activator"
                :is-open="approveAll"
                success
                medium
                outline
                :loading="approving"
                :disabled="!pending.length"
                icon="done-all"
                :text="$t('sidePanels.availabilityWeeklyOverview.actions.approveAll')"
                @click="approveAll = true"
                @hide="approveAll = false"
            >
                <template slot="popover-content">
                    <div class="reject-form">
                        <p>{{ $t('sidePanels.availabilityWeeklyOverview.approveAllQuestionOne') }}</p>
                        <p>{{ $t('sidePanels.availabilityWeeklyOverview.approveAllQuestionTwo') }}</p>
                        <PmtButton
                            ref="approveAll"
                            cy_id="approve-all"
                            success
                            medium
                            @click="approveAllClick"
                        >
                            {{ $t('sidePanels.availabilityWeeklyOverview.actions.approveAll') }}
                        </PmtButton>
                        <PmtButton
                            ref="cancelApproveAll"
                            cy_id="cancel-approve-all"
                            default
                            outline
                            medium
                            @click="approveAll = false"
                        >
                            {{ $t('sidePanels.availabilityWeeklyOverview.actions.cancel') }}
                        </PmtButton>
                    </div>
                </template>
            </PopoverButton>
        </template>
        <template v-if="!hasNoItems">
            <SidePanelSection
                v-for="section in sections"
                ref="section"
                :key="section.title + sectionKey"
                :title="section.title"
                :title-extra="section.titleExtra"
                force-show-title-extra
                :top-border="false"
                :open-on-init="section.type === 'pending'"
            >
                <RoundSpinner
                    v-if="weeksetsLoading"
                    :block="true"
                    :loading="true"
                    :size="20"
                />
                <WeeksetSection
                    v-else
                    ref="weeksetSection"
                    :loading="weeksetsLoading"
                    :type="section.type"
                    @compare="$emit('compare', $event)"
                />
            </SidePanelSection>
        </template>
        <div
            v-if="hasNoItems"
            class="no-results"
        >
            <!-- Show only empty state when there are no pending and no asessed weeksets -->
            <EmptyState
                ref="noWeeksets"
                :title="$t( 'sidePanels.availabilityWeeklyOverview.noWeeksetsFound' )"
                component="no-schedule"
                :show="true"
                :title-font-size="14"
                :size="75"
                no-padding
            />
        </div>
    </SidePanel>
</template>

<script>
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'

export default {
    name: 'AvailabilityWeeklyOverviewSidePanel',

    components: {
        SidePanel: () => import('@/components/ui/side-panels/SidePanel.vue'),
        SidePanelSection: () => import('@/components/ui/side-panels/SidePanelSection.vue'),
        WeeksetSection: () => import('./Components/WeeksetSection.vue'),
    },

    props: {
        borderLeft: {
            type: Boolean,
            default: true,
        },
    },

    data () {
        return {
            addNew: false,
            approveAll: false,
            sectionKey: 0,
            sidepanelKey: 0,
            approving: false,
        }
    },

    computed: {
        ...mapGetters('locale', { locale: 'getLocale' }),
        ...mapGetters('auth', ['canEditOthersAvailabilities']),
        ...mapState('availability', {
            weeksetsLoading: 'weeksetsLoading',
            employeeWeeksets: 'weeksets',
            employeesWeeksets: 'employeesWeeksets',
        }),
        noSectionItems () {
            return section => {
                if (section.type === 'pending') {
                    return !this.pending.length && !this.weeksetsLoading
                } else {
                    return !this.assessed.length && !this.weeksetsLoading
                }
            }
        },
        weeksets () {
            return this.isOverview ? this.employeesWeeksets : this.employeeWeeksets
        },
        isOverview () {
            return this.$route.name === 'availability-overview'
        },
        pending () {
            return this.weeksets.filter(weekset => {
                return weekset.status === 'pending'
            })
        },
        assessed () {
            return this.weeksets.filter(weekset => {
                return weekset.status === 'approved'
            })
        },
        rejected () {
            return this.weeksets.filter(weekset => {
                return weekset.status === 'rejected'
            })
        },
        sections () {
            return [
                {
                    title: `${this.$t('sidePanels.availabilityWeeklyOverview.sections.pending')}`,
                    titleExtra: !this.weeksetsLoading ? this.pending.length || 0 : '...',
                    type: 'pending',
                },
                {
                    title: this.$t('sidePanels.availabilityWeeklyOverview.sections.assessed'),
                    titleExtra: !this.weeksetsLoading ? this.assessed.length || 0 : '...',
                    type: 'assessed',
                },
                {
                    title: this.$t('sidePanels.availabilityWeeklyOverview.sections.rejected'),
                    titleExtra: !this.weeksetsLoading ? this.rejected.length || 0 : '...',
                    type: 'rejected',
                },
            ]
        },
        hasNoItems () {
            return !this.weeksets.length
        },
    },

    mounted () {
        this.getWeeksets()
    },

    methods: {
        ...mapActions('availability', {
            getWeeksets: 'getWeeksets',
            approveAllPending: 'approveAll',
        }),
        ...mapMutations('availability', {
            setNewWeeksetWeekYear: 'setNewWeeksetWeekYear',
        }),
        ...mapMutations(['SET_SNACKBAR']),
        /**
         * Saves new weekset route params into the vuex state,
         * because we are not making the route redirect from this component.
         */
        updateNewWeeksetParams () {
            if (this.$route.name === 'my-week-availability' || this.$route.name === 'week-availability' || this.$route.name === 'week-availability-accountid') {
                this.setNewWeeksetWeekYear({
                    week: this.$route.params.week,
                    year: this.$route.params.year,
                })
            }
        },
        async approveAllClick () {
            this.approving = true
            await this.approveAllPending().then(result => {
                this.approveAll = false
                this.$emit('approve-all')
                this.SET_SNACKBAR({ message: this.$t('sidePanels.availabilityWeeklyOverview.approveAllSuccess'), success: true })
            }).catch(err => {
                console.error(err)
                this.approveAll = false
                this.approving = false
                this.SET_SNACKBAR({ message: err.message, err: true })
            })
            this.approveAll = false
            this.approving = false
        },
        startFresh () {
            this.updateNewWeeksetParams()
            this.$emit('start-fresh')
        },
        startRecurring () {
            this.updateNewWeeksetParams()
            this.$emit('start-import-recurring')
        },
    },

}
</script>
