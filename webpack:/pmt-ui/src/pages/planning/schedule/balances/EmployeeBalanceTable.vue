<template>
    <div class="table-wrapper employee-balance-table">
        <table class="card-list-table">
            <thead>
                <tr>
                    <th
                        v-for="(column, index) in tableColumns"
                        :key="index"
                        class="column-title"
                        :class="{'table-title': column.isMain}"
                    >
                        <component
                            :is="column.icon"
                            v-if="!column.isMain"
                            v-tooltip="{content: column.title, hideOnTargetClick: true, placement: 'top', trigger: 'focus click'}"
                            :size="18"
                            class="icon d-block d-sm-none m-auto"
                        />
                        <span class="d-none d-sm-block">
                            {{ column.title }}
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(row, index) in tableRows"
                    :key="index"
                    :class="{highlight: index === highlight}"
                >
                    <td
                        v-for="(rowData, dataIndex) in row"
                        :key="dataIndex"
                        :class="{
                            'row-title': dataIndex === 0,
                            'row-title-total': index === 'total' && dataIndex === 0,
                            'total': index === 'total' && dataIndex != 0
                        }"
                        :colspan="index === 'total' ? (hasTvt && data.compensation_hours) ? 6 : 4 : 1"
                    >
                        {{ rowData }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import * as vuex from 'vuex'
export default {
    name: 'EmployeeBalanceTable',
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
        highlight: {
            type: String,
            default: '',
        },
    },
    computed: {
        ...vuex.mapGetters('auth', {
            hasVak: 'hasVak',
            hasTvt: 'hasTvt',
            hasAtv: 'hasAtv',
        }),
        tableRows () {
            const rows = { time_off: [] }
            if (this.hasVak && this.data.time_off) {
                rows.time_off = [
                    this.$t('pages.mySchedule.balances.timeOffTitle'),
                    this.data.time_off.start_value ? this.data.time_off.start_value : '-',
                    this.data.time_off.build_up ? '+' + this.data.time_off.build_up : '-',
                ]
                if (this.hasTvt && this.data.compensation_hours) {
                    rows.time_off.push('-')
                    rows.time_off.push('-')
                }
                rows.time_off.push(this.data.time_off.build_down ? '-' + this.data.time_off.build_down : '-')
                rows.time_off.push(this.data.time_off.end_value ? this.data.time_off.end_value : '-')
            }
            if (this.hasTvt && this.data.compensation_hours) {
                rows.time_for_time = [
                    this.$t('pages.mySchedule.balances.timeForTimeTitle'),
                    this.data.compensation_hours.start_value ? this.data.compensation_hours.start_value : '-',
                    this.data.compensation_hours.build_up ? '+' + this.data.compensation_hours.build_up : '-',
                    this.data.compensation_hours.overtime_in_time ? '+' + this.data.compensation_hours.overtime_in_time : '-',
                    this.data.compensation_hours.surcharge_in_time ? '+' + this.data.compensation_hours.surcharge_in_time : '-',
                    this.data.compensation_hours.build_down ? '-' + this.data.compensation_hours.build_down : '-',
                    this.data.compensation_hours.end_value ? this.data.compensation_hours.end_value : '-',
                ]
            }
            if (this.hasAtv && this.data.atv) {
                rows.atv = [
                    this.$t('pages.mySchedule.balances.atvTitle'),
                    this.data.atv.start_value ? this.data.atv.start_value : '-',
                    this.data.atv.build_up ? '+' + this.data.atv.build_up : '-',
                ]
                if (this.hasTvt && this.data.compensation_hours) {
                    rows.atv.push('-')
                    rows.atv.push('-')
                }
                rows.atv.push(this.data.atv.build_down ? '-' + this.data.atv.build_down : '-')
                rows.atv.push(this.data.atv.end_value ? this.data.atv.end_value : '-')
            }
            return rows
        },
        tableColumns () {
            const columns = []
            columns.push(
                { title: this.$t('pages.mySchedule.balances.balanceTotal'), isMain: true },
                { title: this.$t('pages.mySchedule.balances.previousBalance'), icon: 'skip-backward' },
                { title: this.$t('pages.mySchedule.balances.buildUp'), icon: 'chart-areaspline' },
            )
            if (this.hasTvt && this.data.compensation_hours) {
                columns.push(
                    { title: this.$t('pages.mySchedule.balances.overtime'), icon: 'account-plus' },
                    { title: this.$t('pages.mySchedule.balances.surcharges'), icon: 'calendar-plus' },
                )
            };
            columns.push(
                { title: this.$t('pages.mySchedule.balances.withdrawal'), icon: 'timer-sand' },
                { title: this.$t('pages.mySchedule.balances.newBalance'), icon: 'format-indent-decrease' },
            )
            return columns
        },
        finalTotalText () {
            let totalText = this.$t('pages.mySchedule.balances.balanceTotal')
            totalText += ' ('
            if (this.hasVak && this.data.time_off) {
                totalText += this.$t('pages.mySchedule.balances.timeOffTitle')
            }
            if (this.hasTvt && this.data.compensation_hours) {
                if (this.hasVak && this.data.time_off) {
                    totalText += ' + '
                }
                totalText += this.$t('pages.mySchedule.balances.timeForTimeTitle')
            }
            if (this.hasAtv && this.data.atv) {
                if ((this.hasTvt && this.data.compensation_hours) || (this.hasVak && this.data.time_off)) {
                    totalText += ' + '
                }
                totalText += this.$t('pages.mySchedule.balances.atvTitle')
            }
            totalText += ')'
            return totalText
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    $screen-sm-min: 768px;
    @mixin scrollbars($size, $foreground-color, $main-background-color: mix($foreground-color, white, 50%)) {
        ::-webkit-scrollbar {
            width:  $size;
            height: $size;
        }
        ::-webkit-scrollbar-thumb {
            background: $foreground-color;
        }
        ::-webkit-scrollbar-track {
            background: $main-background-color;
        }
        // For Internet Explorer
        body {
            scrollbar-face-color: $foreground-color;
            scrollbar-track-color: $main-background-color;
        }
    }
    @include scrollbars(.15em, slategray);
    .table-wrapper {
        margin: 0 auto 0;
        position: relative;
        transition: all .2s ease-out;
    }
    @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
        .table-wrapper {
            overflow-y: auto;
        }
    }
    .card-list-table {
        background: white;
        width: 100%;
        thead {
            display: table-header-group;
            th:last-child {
                box-shadow: none;
            }
            th {
                border-bottom: 1px solid $border-color;
                padding: 15px 5px;
                &.column-title {
                    font-size: 90%;
                    font-weight: 500;
                }
                &.table-title {
                    font-weight: 500;
                }
                @media (max-width: 576px) {
                    &.table-title {
                        font-size: 100%;
                        font-weight: 600;
                    }
                }
            }
        }
        tbody {
            tr {
                display: table-row;
                padding-bottom: 0;
                background: transparent;
                box-shadow: none;
                margin: 0;
                &:nth-of-type(even) {
                    background: $border-color;
                }
                &:nth-of-type(even) {
                    background: #fff;
                }
                &.highlight {
                    background-color: $dark-text-color;
                    color: $white;
                }
            }
            td {
                border-bottom: 1px solid $border-color;
                cursor: pointer;
                display: table-cell;
                padding: 6px;
                transition: background .2s ease-out;
                vertical-align: middle;
                text-align: center;
                min-width: 44px;
                font-size: 90%;
                &:after {
                    display: none;
                }
                &:before {
                    content: '';
                }
                &.row-title{
                    font-size: 90%;
                    font-weight: 500;
                    text-align: right;
                    border-right: 1px solid #dfdfdf;
                }
                &.row-title-total {
                    border: none;
                    font-size: 125%;
                }
                @media (max-width: 576px) {
                    &.row-title-total {
                        font-size: 100%;
                    }
                }
                &.total {
                    font-size: 150%;
                    font-weight: 700;
                    border: none;
                }
            }
            tr:not(.highlight):hover td {
                background: #eee;
            }
        }

}
</style>
