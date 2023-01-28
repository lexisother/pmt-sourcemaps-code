<template>
    <li :style="mobileShiftColor(shift)">
        <div class="department-title">
            {{ shiftTitle(shift) }}
            <span
                v-if="shift.remark"
                v-tooltip="shift.remark"
                class="shift-remark-icon"
            >
                <ChatProcessingOutline
                    ref="remarkIcon"
                    :size="16"
                    name=""
                    title=""
                />
            </span>
            <span
                v-if="shift.isExchangeSchedule"
                v-tooltip="$t('entities.shift.exchange') + ' ' + shift.exchStoreName"
                class="shift-remark-icon"
            >
                <AccountArrowRight
                    ref="lentOutIcon"
                    :size="14"
                    name=""
                    title=""
                />
            </span>
        </div>

        <!-- Define hours -->
        <div
            v-if="shift.startTime === '00:00' && shift.endTime === '23:59'"
            class="hours"
        >
            <i>{{ $t( 'entities.shift.wholeDay' ) }}</i>
        </div>
        <div
            v-else-if="shift.duration"
            class="hours"
        >
            <b>{{ shift.duration }}</b>
        </div>
        <div
            v-else
            class="hours"
        >
            <span
                v-tooltip="{content: $moment().addTimeStrings(shift.startTime, shift.endTime) + ' ' + $t('entities.shift.hours'), placement: 'right'}"
                class="schedule"
            >
                <b>{{ shift.startTime }} - {{ shift.endTime }}</b>
            </span>
            <span
                v-if="shift.break && shift.break !== '00:00'"
                class="break"
            >
                | {{ shift.break }}
            </span>
        </div>
    </li>
</template>

<script>

export default {
    props: {
        shift: {
            type: Object,
            default: () => ({}),
        },
        noWork: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        mobileShiftColor (shift) {
            if (shift.isExchangeSchedule || !shift.isProductive) {
                return {
                    borderLeft: '6px solid var(--grey-80)',
                    backgroundColor: 'var(--grey-40)',
                }
            }
            return {
                borderLeft: shift.department ? `6px solid ${shift.department.color}` : this.$cfg.departments.defaultBackgroundColor,
                backgroundColor: shift.department ? this.$helpers.transparentize(shift.department.color, 15) : 'white',
            }
        },
        shiftTitle (shift) {
            if (shift.type) {
                return shift.isProductive ? shift.department?.department_name : this.$t(`entities.rdo.types.${shift.type.toLowerCase()}`)
            } else {
                return shift.department?.department_name
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    .shift {
        min-height: 36px;
        color: var(--grey-140);
        .department-title {
            font-size: 14px;
            margin-bottom: 4px;
        }
        .shift-remark-icon {
            float: right;
        }
    }
    .non-productive-shift {
        background: var(--non-productive-gradient-background);
        opacity: .8;
        min-height: 36px;
        color: var(--grey-140);
        .department-title {
            font-size: 14px;
            margin-bottom: 4px;
        }
        .shift-remark-icon {
            float: right;
        }
    }
</style>
