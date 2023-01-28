<template>
    <div id="shift-step">
        <template v-if="!isLoading && SCHEDULED_REQUESTS.length">
            <pmt-info gray>
                {{ $t( 'modals.substituteRequest.selectShiftStep.info' ) }}
            </pmt-info>
            <v-data-table
                :headers="headers"
                :items="rowItems"
                :custom-sort="customSort"
                :items-per-page="10"
                :dense="true"
                :sort-by="['date']"
                :sort-desc="[false]"
                :fixed-header="true"
                mobile-breakpoint="1000"
                calculate-widths
                @click:row="onSelect"
            >
                <template #[`item.hasOpenRequest`]="{ item }">
                    <Lock
                        v-if="item.hasOpenRequest"
                        :size="16"
                        class="not-available-shift-icon"
                    />
                </template>
            </v-data-table>
            <div class="legenda">
                <i18n path="modals.substituteRequest.selectShiftStep.lockIconInfo">
                    <Lock :size="16" />
                </i18n>
            </div>
        </template>
        <round-spinner
            v-if="isLoading"
            :block="true"
            :loading="true"
            default-loading-text
        />
        <div
            v-if="!SCHEDULED_REQUESTS.length && !isLoading"
            class="container"
        >
            <empty-state
                :title="$t('modals.substituteRequest.selectShiftStep.noSchedulesTitle')"
                :sub-title="$t('modals.substituteRequest.selectShiftStep.noSchedulesText')"
                component="no-schedules"
                :show="true"
                :size="IS_MOBILE ? 250 : 400"
                no-padding
            />
        </div>
        <div class="button-group">
            <pmt-button
                default
                icon="close"
                icon-size="15"
                @click="$emit('on-cancel')"
            >
                {{ $t( 'modals.substituteRequest.selectShiftStep.cancelBtn.label' ) }}
            </pmt-button>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
    data () {
        return {
            isLoading: true,
            headers: [
                { text: '', value: 'hasOpenRequest', sortable: false },
                { text: this.$t('entities.requests.substitutes.selectShift.date'), value: 'date' },
                { text: this.$t('entities.requests.substitutes.selectShift.department'), value: 'department' },
                { text: this.$t('entities.requests.substitutes.selectShift.shift'), value: 'shiftTimes' },
                { text: this.$t('entities.requests.substitutes.selectShift.break'), value: 'break' },
            ],
        }
    },
    computed: {
        ...mapGetters('locale', { locale: 'getLocale' }),
        ...mapGetters('auth', ['user']),
        ...mapGetters({ IS_MOBILE: 'IS_MOBILE' }),
        ...mapGetters('substituteRequests', ['SCHEDULED_REQUESTS']),
        ...mapGetters('schedules', ['SCHEDULE_FOR_PERIOD']),
        ...mapGetters('departments', {
            employeeWeekDepartments: 'employeeWeekDepartments',
        }),
        rowItems () {
            return this.SCHEDULED_REQUESTS.map(item => {
                const department = this.fetchDepartment(item.department_id, item.start_datetime)
                return {
                    // Data used to build the headers
                    date: this.getShiftDate(item.start_datetime),
                    department: department ? department.department_name : null,
                    shiftTimes: `${this.$moment(item.start_datetime).format('HH:mm')} - ${this.$moment(item.end_datetime).format('HH:mm')}`,
                    break: item.breaks.length ? item.breaks[0].duration : '',

                    // Data needed to make the row clickable
                    shiftId: item.shift_id,
                    shiftInstanceId: item ? item.shift_instance_id : null,
                    hasOpenRequest: item.hasOpenRequest,
                    from: item.start_datetime,
                    to: item.end_datetime,
                    departmentId: item.department_id,
                }
            })
        },
    },
    async created () {
        const start = this.$moment().apiFormat()
        const end = this.$moment().add(30, 'days').apiFormat()
        await this.getScheduleForPeriod({ start, end, accountId: this.user.accountId, status: 'final', type: 'G' })
        await this.getScheduledRequests()
        await this.getWeekDepartmentsForComingPeriod()
        this.isLoading = false
    },
    methods: {
        ...mapActions('substituteRequests', {
            getScheduledRequests: 'getScheduledRequests',
        }),
        ...mapActions('schedules', {
            getScheduleForPeriod: 'getScheduleForPeriod',
        }),
        ...mapActions('departments', {
            getWeekDepartmentsForEmployee: 'getWeekDepartmentsForEmployee',
        }),

        customSort: function (items, index, isDesc) {
            const _this = this

            items.sort((a, b) => {
                if (index[0] === 'date') {
                    // Sorts the column 'date' based on day
                    if (!isDesc[0]) {
                        return _this.compare(a.from, b.from)
                    } else {
                        return _this.compare(b.from, a.from)
                    }
                } else {
                    if (!isDesc[0]) {
                        return a[index] < b[index] ? -1 : 1
                    } else {
                        return b[index] < a[index] ? -1 : 1
                    }
                }
            })
            return items
        },
        compare: (start, end) => {
            return start === end ? 0 : start < end ? -1 : 1
        },
        getShiftDate (dateStr) {
            return this.$moment(dateStr).format('dd, DD MMM YYYY')
        },
        onSelect (shift) {
            if (shift.hasOpenRequest) {
                return
            }
            this.$emit('on-select', shift)
        },
        async getWeekDepartmentsForComingPeriod () {
            // fetch weekDepartments for coming 4 weeks
            let startOfWeek = this.$moment().startOf('week')
            for (let n = 0; n < 4; n++) {
                const payload = { date: startOfWeek, accountId: this.user.accountId }
                await this.getWeekDepartmentsForEmployee(payload)
                startOfWeek = startOfWeek.add(1, 'week')
            }
        },
        fetchDepartment (departmentId, date) {
            const departments = this.employeeWeekDepartments({
                accountId: this.user.accountId,
                year: this.$moment(date).isoWeekYear(),
                week: this.$moment(date).isoWeek(),
            })

            if (!departments) return null
            return departments.find(d => d.department_id === departmentId) || null
        },
    },
}
</script>

<style lang="scss" scoped>
    #shift-step {
        position: relative;

        table tbody tr.open {
            background-color: lighten( #e6eef1, 6% );

            cursor: not-allowed;
        }

        .legenda {
            margin-top: .5em;

            font-size: 12px;

            .icon {
                margin: 0 .2em;
            }
        }
    }
    :deep() .v-data-table__wrapper {
        td:hover {
            cursor: pointer;
        }
    }
    .not-available-shift-icon {
        color: var(--grey-140);
    }
</style>
