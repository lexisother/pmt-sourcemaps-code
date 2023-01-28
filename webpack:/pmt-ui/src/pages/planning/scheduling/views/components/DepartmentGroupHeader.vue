<template>
    <div class="expansion-panel-header">
        <div
            ref="departmentName"
            :class="{
                'expansion-panel-header--name': true,
                'expansion-panel-header--name--day': isDayView,
                'has-sidepanel': settings.weekStatus,
                'no-status': !panelDepartmentStatus
            }"
        >
            <div class="d-inline">
                {{ department.department_name }}
            </div>
            <div
                v-if="panelDepartmentStatus && !isStandardShifts"
                class="status"
                :class="{'day-view': isDayView}"
            >
                <WeekStatusSidepanelLogItem
                    :departments-statuses="departmentsWeekStatuses(department.department_id).slice(0, 1)"
                    :for-group-header="true"
                />
            </div>
        </div>
    </div>
</template>

<script>
import WeekStatusSidepanelLogItem from '@/pages/planning/scheduling/components/WeekStatusSidepanelLogItem'
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'DepartmentGroupHeader',
    components: {
        WeekStatusSidepanelLogItem,
    },
    mixins: [mixins],
    props: {
        open: Boolean,
        department: {
            type: Object,
            required: true,
        },
        departmentEmployees: {
            type: Array,
            required: true,
        },
    },
    computed: {
        panelDepartmentStatus () {
            const status = this.departmentsWeekStatuses(this.department.department_id)[0]
            return this.departmentStatusTranslation(status)
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixins/_breakpoints.scss';
.department-panels {
    margin-top: 10px;
    .expansion-panel-header {
        position: relative;
        &--name {
            font-size: 18px;
            font-weight: 600;
            max-width: calc(var(--scheduler-resources-width) - 35px);
            position: sticky;
            left: 25px;
            background-color: white;
            z-index: 3;
            .status {
                padding-top: 2px;
                font-weight: normal;
            }
            &.no-status {
                margin: 0;
            }
        }
    }
}
.status {
    z-index: 1;
}
/**Overide some status side panel CSS for department status */
:deep() .v-timeline {
    margin-top: 5px;
    &-item {
        display: grid;
        grid-template-columns: 15px 1fr;
        padding-bottom: 0 !important;
        &__body {
            grid-column: 2;
            grid-row: 1;
            line-height: 1rem;
        }
        &__divider {
            grid-column: 1;
            grid-row: 1;
            justify-content: left;
        }
    }
    .status-timeline-item-text {
        &-status {
            width: auto;
            font-size: small;
            margin-right: 15px;
        }
    }
}
</style>
