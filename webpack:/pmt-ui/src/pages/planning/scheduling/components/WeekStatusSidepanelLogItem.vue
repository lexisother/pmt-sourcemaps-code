<template>
    <VTimeline
        dense
        class="status-timeline"
    >
        <template
            v-for="(status, statusIndex) in departmentsStatuses"
        >
            <VTimelineItem
                v-if="departmentsStatuses.length > 0"
                :key="statusIndex"
                ref="departmentLog"
                :color="logColor(status.status)"
                fill-dot
                class="status-timeline-item"
            >
                <div
                    v-if="show"
                    class="status-timeline-item-text"
                >
                    <span
                        class="status-timeline-item-text-status"
                        :class="statusClasses(status)"
                    >
                        <span :class="{ selected: SHOW_SENT_SCHEDULES && status.id === Number(DEPARTMENT_STATUS_HISTORY_ID) }">
                            {{ departmentStatusTranslation(status) }}
                        </span>
                        <span
                            v-if="status.reopened && (status.status === 'finalized' || status.status === 'changed')"
                            class="reopened"
                        >
                            ({{ $t(`pages.scheduling.publishPopUp.extraLabels.reopened`) }})
                        </span>
                        <span
                            v-if="!status.emailed && !status.reopened && status.status === 'finalized'"
                            class="not-emailed"
                        >
                            ({{ $t(`pages.scheduling.publishPopUp.extraLabels.emailNotSent`) }})
                        </span>
                        <span
                            v-if="status.changed_on"
                            v-tooltip="!IS_MOBILE ? `${$moment(status.changed_on).fullReadableDateFormat()}` : ''"
                            class="status-timeline-item-text-changed"
                            :class="{ ellipsis: !forGroupHeader, 'check-hours-item': isCheckHours }"
                        >
                            {{ departmentStatusChanged(status) }}
                        </span>
                    </span>

                    <PmtButton
                        v-if="!IS_MOBILE && !isCheckHours && !forGroupHeader"
                        v-ripple
                        v-tooltip="eyeIconTooltip(SHOW_SENT_SCHEDULES && status.id === Number(DEPARTMENT_STATUS_HISTORY_ID))"
                        default
                        round
                        medium
                        :icon="SHOW_SENT_SCHEDULES && status.id === Number(DEPARTMENT_STATUS_HISTORY_ID) ? 'EyeOff' : 'EyeOutline'"
                        :icon-size="16"
                        :fill-color="SHOW_SENT_SCHEDULES && status.id === Number(DEPARTMENT_STATUS_HISTORY_ID) ? `var(--blue-100)` : undefined"
                        :class="{ 'visually-hidden': status.status !== 'finalized' }"
                        @click="toggleTrackSchedules(status.id, status.department_id)"
                    />
                </div>
            </VTimelineItem>
        </template>
        <VTimelineItem
            v-if="departmentsStatuses.length <= 0"
            ref="departmentLog"
            :color="logColor('concept')"
            fill-dot
            class="status-timeline-item"
        >
            <div
                class="status-timeline-item-text"
            >
                <span
                    class="status-timeline-item-text-status"
                >
                    <span> Concept </span>
                </span>
            </div>
        </VTimelineItem>
    </VTimeline>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import statusMixins from '@/pages/planning/scheduling/resources/statusMixins'
export default {
    name: 'WeekStatusSidepanelLogItem',

    mixins: [mixins, statusMixins],
    props: {
        departmentsStatuses: {
            type: Array,
            default: () => [],
        },
        show: {
            type: Boolean,
            default: true,
        },
        forGroupHeader: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        statusClasses (status) {
            return {
                reopened: status.reopened && (status.status === 'finalized' || status.status === 'changed'),
                'not-emailed': !status.emailed && (status.status === 'finalized' || status.status === 'changed'),
            }
        },
        async toggleTrackSchedules (departmentStatusHistoryId, departmentId) {
            let name = null
            const params = this.$route.params
            if (this.SHOW_SENT_SCHEDULES && departmentStatusHistoryId === this.DEPARTMENT_STATUS_HISTORY_ID) {
                // return to scheduling page
                this.UPDATE_ENABLED_FILTERS(this.enabledFilters)
                delete params.departmentStatusHistoryId
                delete params.departmentId
                name = 'week-planning'
                if (this.$route.params.day) {
                    name = 'day-planning'
                }
                this.$router.push({ name, params })
            } else {
                // load sent schedules page
                this.UPDATE_ENABLED_FILTERS(this.enabledFilters)
                name = 'week-track-schedules'
                if (this.$route.params.day) {
                    name = 'day-track-schedules'
                }
                params.departmentStatusHistoryId = departmentStatusHistoryId
                params.departmentId = departmentId
                this.$router.push({ name, params })
            }
            if (this.IS_MOBILE) {
                await this.toggleSetting('weekStatus')
            }
        },
        changedOnTooltip (status) {
            return {
                content: this.$moment(status.changed_on).fullReadableDateFormat(),
                delay: {
                    show: 500,
                    hide: 0,
                },
            }
        },
        eyeIconTooltip (backToSchedulingPage) {
            return backToSchedulingPage ? this.$t('pages.scheduling.tooltips.backToSchedulingPage') : this.$t('pages.scheduling.tooltips.showSentSchedules')
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/mixins/_ellipsis.scss';
    @import '@/assets/scss/mixins/_breakpoints.scss';

    .status-timeline::before {
        left: 23px !important;
    }

    .status-timeline-item {
        padding-bottom: 4px !important;
        &:last-child {
            padding-bottom: 0;
        }
    }

    :deep() .v-timeline-item__body {
        max-width: initial !important;
        @include bp-md {
            max-width: calc(100% - 48px);
        }
    }

    .status-timeline-item-text {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--grey-120);
        font-size: 12px;
        font-weight: 400;

        &-status {
            margin-right: 8px;
        }
        &-changed {
            font-size: 12px;
            color: var(--grey-80);
        }
    }

    .status-timeline {
        padding-top: 0px !important;
    }

    .status-timeline::before {
        top: 20px !important;
        height: calc(100% - 40px) !important;
    }

    :deep() .v-timeline-item__divider {
        min-width: 48px;
        .v-timeline-item__dot {
            height: 8px;
            width: 8px;
            background: rgba(0, 0, 0, 0.05)
        }
    }

    .no-status {
        margin-left: 44px;
    }

    .status-timeline-item-text-status {
        display: inline-block;

        span {
            line-height: 20px;
            vertical-align: middle;
            &.selected {
                color: var(--blue-100);
                font-weight: 700;
            }
        }
    }

    .status-timeline-item-text-changed {
        margin-left: 4px;
        line-height: 20px;

        &.ellipsis {
            max-width: 176px;
            @include ellipsis();
        }
        &.check-hours-item {
            &.ellipsis {
                max-width: 260px;
            }
        }
    }

    .visually-hidden {
        visibility: hidden;
    }
</style>
