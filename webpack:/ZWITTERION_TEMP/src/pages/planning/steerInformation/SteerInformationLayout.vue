<template>
    <div
        v-if="CAN_ACCESS_STEER_INFORMATION"
    >
        <SteerInformationTopBar
            ref="desktopTopbar"
            :loading="steerInformationLoading"
            :show="desktopTopbarItems"
        />
        <PmtLayout>
            <div
                class="steerinformation-layout"
            >
                <SteerInformationHeader />
                <RoundSpinner
                    v-if="steerInformationLoading"
                    ref="loading"
                    default-loading-text
                    full-screen
                    :loading="true"
                />
                <div v-else-if="steerData && weekStatus && CAN_ACCESS_STEER_INFORMATION">
                    <PmtGrouping
                        :groups="steerData.departments"
                        :data-depth="1"
                    >
                        <template #header="{ subIdentifier }">
                            <div class="grouping-header">
                                <ChevronRight :size="14" />
                                <div class="type">
                                    {{ $t(`pages.steerInformationPage.${subIdentifier}Departments`) }}
                                </div>
                            </div>
                        </template>
                        <template #items="{ subItems, subIdentifier, identifier }">
                            <VExpansionPanels
                                v-model="expandedGroupPanels[`${identifier}-${subIdentifier}`]"
                                multiple
                            >
                                <div
                                    class="steer-table--section"
                                >
                                    <VDataTable
                                        :items="subItems"
                                        :headers="width"
                                        item-key="name"
                                        class="steer-table"
                                        :hide-default-footer="true"
                                        :show-expand="true"
                                        :disable-pagination="true"
                                        calculate-widths
                                    >
                                        <template
                                            #item="{ item, expand, isExpanded }"
                                        >
                                            <SteerInformationWeekTotals
                                                :item="item"
                                                :is-expanded="isExpanded"
                                                @expand="expand"
                                            />
                                        </template>
                                        <template #expanded-item="{ item }">
                                            <SteerInformationDays
                                                :item="item"
                                                :department="subItems"
                                            />
                                        </template>
                                        <template
                                            v-if="!isSelectedDepartment"
                                            slot="body.append"
                                        >
                                            <SteerinformationTotal
                                                :type="'turnover'"
                                                :department="subItems"
                                            />
                                            <SteerinformationTotal
                                                :type="'external'"
                                                :department="subItems"
                                            />
                                            <SteerinformationTotal
                                                :type="'costs'"
                                                :department="subItems"
                                            />
                                            <SteerinformationTotal
                                                :type="'store'"
                                                :department="subItems"
                                            />
                                            <SteerinformationTotal
                                                :type="'company'"
                                                :department="subItems"
                                            />
                                        </template>
                                    </VDataTable>
                                </div>
                            </VExpansionPanels>
                        </template>
                    </PmtGrouping>
                </div>
                <div v-else>
                    <EmptyState
                        :title="$t('pages.steerInformationPage.noDataLoaded')"
                        component="no-schedules"
                        :show="true"
                        :size="IS_MOBILE ? 250 : 400"
                        no-padding
                    />
                </div>
            </div>
        </PmtLayout>
        <div
            v-if="changeTriggered"
            class="button-bar"
        >
            <PmtButton
                @click="initForeCast({ date: selectedDate, full: false })"
            >
                {{ $t('ui.singles.cancel') }}
            </PmtButton>
            <PmtButton
                primary
                :disabled="!changeTriggered"
                @click="saveForeCast(selectedDate)"
            >
                {{ $t('ui.singles.save') }}
            </PmtButton>
        </div>
        <ArticleHelper
            v-if="!steerInformationLoading && $route.meta.settingsRoute === 'steerinformation' && !IS_SUPER_ADMIN"
            label="steerinformation_intro"
            :route="'steerinformation'"
            page="steerInformationPage"
        />
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
    name: 'PmtForeCastTable',
    components: {
        SteerInformationTopBar: () => import('./components/SteerInformationTopBar.vue'),
        SteerInformationHeader: () => import('./table/SteerInformationHeader.vue'),
        SteerInformationWeekTotals: () => import('./table/SteerInformationWeekTotals.vue'),
        SteerInformationDays: () => import('./table/SteerInformationDays.vue'),
        SteerinformationTotal: () => import('./table/SteerinformationTotal.vue'),
        PmtGrouping: () => import('@/components/ui/cards/PmtGrouping'),

    },
    mixins: [mixins],
    data () {
        return {
            menu: false,
            visibleMenu: false,
            subtotalCosts: 0,
            expandedGroupPanels: {},
            changedSubdepartments: {},
            width: [
                { width: '20%' },
                { width: '20%' },
                { width: '15%' },
                { width: '15%' },
                { width: '20%' },
            ],
        }
    },
    async created () {
        if (this.CAN_READ_STEER_INFORMATION || this.CAN_READ_STEER_INFORMATION_DASHBOARD) {
            if (this.CAN_READ_STEER_INFORMATION) {
                this.initPage()
            } else {
                this.$router.push({ name: 'steerinformation-intersections-page', params: { year: this.$moment(this.selectedDate).isoWeekYear(), week: this.$moment(this.selectedDate).isoWeek() } })
            }
        }
    },
}
</script>
<style lang="scss" scoped>
    @import './style.scss';

    .steerinformation-layout {
        width: fit-content;
        min-width: 100%;
    }

    :deep(.steer-table > .v-data-table__wrapper > table > tbody) {
        width: 100%;
    }

    :deep(.v-data-table__wrapper)  {
        overflow: clip;
    }

    .grouping-header {
        font-size: 13px;
        display: flex;
        align-items: center;
        position: sticky;
        left: 12px;
        .type {
            margin-left: 13px;
            color: var(--grey-100);
            text-transform: uppercase;
        }
    }
</style>
