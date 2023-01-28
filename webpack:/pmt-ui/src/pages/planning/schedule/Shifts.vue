<template>
    <ul class="shifts">
        <template v-for="shift in finalShifts">
            <Shift
                :key="shift.scheduleId"
                :shift="shift"
            />
        </template>
        <template v-for="shift in nonWorkingShifts">
            <Shift
                :key="shift.scheduleId"
                :shift="shift"
                no-work
            />
        </template>

        <ul
            v-if="nonFinalShifts.length > 0"
            class="non-finalized-shifts"
        >
            <ContentDivider v-tooltip="$t('entities.shift.nonFinalizedInfo')">
                {{ $t('entities.shift.nonFinalized') }}
            </ContentDivider>
            <template v-for="shift in nonFinalShifts">
                <Shift
                    :key="shift.scheduleId"
                    :shift="shift"
                />
            </template>
        </ul>
    </ul>
</template>

<script>
export default {
    name: 'Shifts',
    components: {
        Shift: () => import('./Shift.vue'),
    },
    props: {
        shifts: {
            type: Array,
            default: () => ([]),
        },
    },
    computed: {
        finalShifts () {
            return this.shifts.filter(elem => {
                return typeof elem.department !== 'undefined'
            })
        },
        nonFinalShifts () {
            return this.shifts.filter(elem => {
                return typeof elem.department !== 'undefined' && elem.status === 'draft'
            })
        },
        nonWorkingShifts () {
            return this.shifts.filter(elem => { return typeof elem.department === 'undefined' })
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/mixins/shift.scss';
    @import '@/assets/scss/mixins/remark.scss';
    @import '@/assets/scss/shaddows.scss';
    .non-finalized-fieldset {
        margin: 0px 5px 15px 5px;
        padding: 0px 10px 5px 10px;
        border-style: solid;
        border-width: 1px 1px 1px 1px;
    }
    .non-finalized-fieldset legend {
        padding: 0 5px;
    }
    .non-finalized-shifts {
        opacity: 0.4;
    }
</style>
