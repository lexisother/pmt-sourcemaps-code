<template>
    <span class="icon-wrap weekset-status">
        <component
            :is="getWeeksetIcon(status)"
            v-tooltip="!statusName ? statusName : ''"
            :size="parseInt(iconSize)"
            :class="status"
        />
        <span
            v-if="statusName"
            class="status-name"
        >{{ statusName }}</span>
    </span>
</template>

<script>
export default {
    name: 'WeeksetStatus',
    props: {
        status: {
            type: String,
            default: '',
        },
        statusName: {
            type: String,
            default: '',
        },
        iconSize: {
            type: [String, Number],
            default: 18,
        },
    },
    methods: {
        getWeeksetIcon () {
            if (this.status === 'approved') {
                return 'check-circle-outline'
            } else if (this.status === 'denied' || this.status === 'rejected') {
                return 'close-circle-outline'
            } else if (this.status === 'pending') {
                return 'help-circle-outline'
            }
            return 'calendar-remove'
        },
    },
}
</script>
<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .icon-wrap {
        position: relative;
        flex-basis: 20px;
        .pending {
            color: $pending-color;
        }
        .approved {
            color: $success-color;
        }
        .denied {
            color: $fail-color;
        }
        .rejected {
            color: $fail-color;
        }
        .status-name {
            padding-left: 5px;
        }
    }
    .weekset-status {
        margin: 5px;
    }
</style>
