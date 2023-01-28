<template>
    <div
        v-if="!shift.isNew && modifiedBy.date"
        class="modified-by"
    >
        {{ $t('ui.singles.changedBy') }}:
        <span
            v-if="modifiedBy.name"
            class="modified-by__name"
        >
            {{ modifiedBy.name }}
        </span>
        <span
            v-if="modifiedBy.date"
            v-tooltip="modifiedBy.dateLong"
            class="modified-by__date"
        >
            ({{ modifiedBy.date }})
        </span>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'ShiftPopoverModifiedBy',
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            required: true,
        },
    },
    computed: {
        modifiedBy () {
            const result = {
                name: this.$t('ui.singles.admin'),
                date: '',
                dateLong: '',
            }
            const source = this.shift.last_modified.account_id ? this.shift.last_modified : this.shift.created
            if (source.account_id) {
                const employee = this.weekPlanningData[source.account_id]
                if (employee) {
                    result.name = employee.name
                }
            }
            if (source.datetime) {
                result.date = this.$moment(source.datetime).fromNow()
                result.dateLong = this.$moment(source.datetime).longDayTimeFormat()
            }
            return result
        },
    },
}
</script>

<style lang="scss" scoped>
.modified-by {
    font-size: 0.8rem;
    color: var(--grey-100);
    width: max-content;
    &__name {
        font-weight: 600;
    }
}
</style>
