<template>
    <div v-if="CAN_ACCESS_STEER_INFORMATION">
        <SteerInformationIntersectionsTopbar
            ref="desktopTopbar"
            :show="desktopTopbarItems"
            :items="intersectionData"
        />
        <PmtLayout class="steer-information-intersections">
            <VSkeletonLoader
                v-if="intersectionsLoading"
                type="heading, button, table-row-divider@5"
                class="intersections-loader"
            />
            <div
                v-else
                class="inner"
            >
                <VTabs
                    v-model="tab"
                    center-active
                    grow
                    mobile-breakpoint="0"
                >
                    <VTab
                        v-for="(item, index) in tabs"
                        :ref="`steer-information-tab-${index}`"
                        :key="index"
                        class="steer-information-intersections--tab"
                    >
                        {{ item.name }}
                    </VTab>
                </VTabs>
                <div class="steer-information-intersections--departments">
                    <SteerInformationDepartments
                        v-if="departments"
                        ref="steer-information-departments"
                        class="selector"
                    >
                        <template #departments="{item}">
                            <slot
                                name="departemnt-filter"
                                :item="item"
                            />
                        </template>
                    </SteerInformationDepartments>
                </div>
                <VTabsItems
                    v-model="tab"
                    touchless
                >
                    <VTabItem
                        v-for="(rowItem, index) in intersectionData"
                        :key="index"
                    >
                        <SteerInformationIntersectionsTable
                            v-if="rowItem.sections.length > 0"
                            :rows="rowItem"
                            :loading="intersectionsLoading"
                        />
                        <EmptyState
                            v-else
                            ref="emptyState"
                            :title="$t('ui.filtersFlyOut.emptyState.notFound.title')"
                            :sub-title="$t('pages.steerInformationPage.noDataForSection')"
                            :component="'four-o-four'"
                            class="no-steerinfo-data"
                            :show="true"
                            :size="180"
                            no-padding
                            empty-search-result
                        />
                    </VTabItem>
                </VTabsItems>
            </div>
        </PmtLayout>
    </div>
    <EmptyState
        v-else
        :title="$t('ui.singles.noAccess')"
        component="no-schedules"
        :show="true"
        :size="IS_MOBILE ? 250 : 400"
        no-padding
    />
</template>
<script>
import mixins from '@/pages/planning/steerInformation/resources/mixins'
export default {
    name: 'SteerInformationIntersectionsPage',
    components: {
        SteerInformationDepartments: () => import('./components/SteerInformationDepartments.vue'),
        SteerInformationIntersectionsTable: () => import('./components/SteerInformationIntersectionsTable.vue'),
        SteerInformationIntersectionsTopbar: () => import('@/pages/planning/steerInformation/intersections/components/SteerInformationIntersectionsTopbar.vue'),
    },
    mixins: [mixins],
    data () {
        return {
            tab: null,
        }
    },
    computed: {
        intersectionData () {
            return this.STEER_INFORMATION_INTERSECTIONS(this.selectedDate).totals || []
        },
        tabs () {
            const tabs = []
            this.intersectionData.forEach(intersection => {
                const interpolation = intersection.name.replace(/-./g, x => x[1].toUpperCase()) // the regex here camelCases the provided string
                tabs.push(
                    { name: this.$t(`pages.steerInformationPage.intersections.${interpolation}.label`) },
                )
            })
            return tabs
        },
    },
    async mounted () {
        if (this.CAN_READ_STEER_INFORMATION || this.CAN_READ_STEER_INFORMATION_DASHBOARD) {
            if (this.CAN_READ_STEER_INFORMATION_DASHBOARD) {
                this.changeSelectedDate(this.selectedDate, false)
                await this.getSteerInformationIntersections({ date: this.selectedDate, departments: this.filters.departments })
            } else {
                this.$router.push({ name: 'steerinformation-page', params: { year: this.$moment(this.selectedDate).isoWeekYear(), week: this.$moment(this.selectedDate).isoWeek() } })
            }
        }
    },
}
</script>
<style lang="scss" scoped>
    @import '../style.scss';
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/shaddows.scss';
    .steer-information-intersections{
        background: $steer-color-grey-4;
        margin-top: 40px;
        &--departments{
            padding: 20px 16px;
            width: 100%;
            z-index: 1;
            background: white;
        }

        .inner {
            margin: 32px;
            box-shadow: $shaddow-3p;

            .steer-information-intersections--tab {
                font-weight: 600;
            }
        }
    }
    .intersections-loader {
        margin: 32px;
        padding: 16px;
        background-color: white;

        :deep() {
            .v-skeleton-loader__heading {
                width: 80%;
            }
            .v-skeleton-loader__button {
                width: 125px;
                margin: 28px 0;
            }
        }
    }

    .v-tabs {
        border-bottom: 2px solid var($steer-color-grey-4);
    }
</style>
