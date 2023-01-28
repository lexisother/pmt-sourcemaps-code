<template>
    <div>
        <TopBar :loading="isLoading">
            <DatePicker
                ref="datepicker"
                :options="datepickerOptions"
                @on-select="getWeekAssessments($event)"
            />
        </TopBar>
        <PmtLayout fixed-height>
            <pmt-content
                v-if="departments.length && !isLoading"
                ref="content"
            >
                <div class="container-fluid animated slideInLeft">
                    <v-row :justify="'space-between'">
                        <v-col
                            v-if="!fullscreenChart"
                            class="assessments-tables"
                            cols="12"
                            xs="12"
                            md="12"
                            sm="12"
                            :lg="assessmentHistory.length ? 8 : 12"
                        >
                            <v-expansion-panels
                                v-if="assessments.length"
                                :key="selectedDate.isoWeek()"
                                v-model="activePanel"
                                multiple
                                :inset="!IS_MOBILE"
                                class="animated slideInLeft"
                                :class="{'slideInRight': direction === 'left', 'slideInLeft': direction === 'right'}"
                                :tile="true"
                            >
                                <v-expansion-panel
                                    v-for="assessment in assessments"
                                    :key="assessment.department_id"
                                    :style="departmentStyle(assessment)"
                                >
                                    <v-expansion-panel-header>
                                        <div class="expansion-panel-header">
                                            <span class="expansion-panel-header--name">
                                                {{ departmentById(assessment.department_id).department_name }}
                                            </span>
                                            <span
                                                class="expansion-panel-header--total"
                                                :class="{'float-right': IS_MOBILE}"
                                            >
                                                <chip
                                                    :text="assessment.totals.total"
                                                    primary
                                                    outline
                                                />
                                            </span>
                                        </div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <!-- ASSESSMENTS TABLE -->
                                        <assessments-table
                                            ref="assessmentsTable"
                                            :assessment="assessment"
                                            :selected-date="selectedDate"
                                        />
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                            <component
                                :is="assessmentHistory.length && !isLoading ? 'card' : 'div'"
                                v-else
                                :key="selectedDate.isoWeek()"
                                class="animated"
                                :class="{'slideInRight': direction === 'left', 'slideInLeft': direction === 'right'}"
                            >
                                <template v-if="assessmentHistory.length">
                                    <empty-state
                                        slot="body"
                                        ref="assessmentsHistoryEmpty"
                                        :title="$t('pages.myAssessments.noAssessmentsForSelectedTitle')"
                                        :sub-title="$t('pages.myAssessments.noAssessmentsForSelectedText')"
                                        component="no-assessments"
                                        :show="true"
                                        :size="IS_MOBILE ? 250 : 500"
                                        no-padding
                                    />
                                </template>
                                <template v-else>
                                    <empty-state
                                        ref="assessmentsEmpty"
                                        :title="$t('pages.myAssessments.noAssessmentsForSelectedTitle')"
                                        :sub-title="$t('pages.myAssessments.noAssessmentsForSelectedText')"
                                        component="no-assessments"
                                        :show="true"
                                        :size="IS_MOBILE ? 250 : 500"
                                        no-padding
                                    />
                                </template>
                            </component>
                        </v-col>
                        <v-col
                            v-if="assessmentHistory.length"
                            class="assessments-chart"
                            cols="12"
                            xs="12"
                            md="12"
                            sm="12"
                            :lg="fullscreenChart ? 12 : 4"
                            :class="{'fullscreen-chart': fullscreenChart}"
                        >
                            <card
                                :header-class="{bold: true}"
                                :front-style="{minHeight: '180px'}"
                            >
                                <template #header>
                                    <h4
                                        class="text-center d-inline-block"
                                        style="vertical-align: sub;"
                                    >
                                        {{ $t('pages.myAssessments.chartTitle', [13]) }}
                                    </h4>
                                    <pmt-button
                                        v-if="!IS_MOBILE"
                                        v-tooltip="$t(`pages.myAssessments.${fullscreenChart ? 'collapseChart' : 'expandChart'}`)"
                                        normal
                                        round
                                        :icon="fullscreenChart ? 'perspective-more' : 'perspective-less'"
                                        icon-size="18"
                                        class="float-right expand-button"
                                        @click="fullscreenChart = !fullscreenChart; direction = 'right'"
                                    />
                                </template>
                                <template #body>
                                    <div class="text-center animated slideInRight">
                                        <!-- ASSESSMENTS CHART -->
                                        <template v-if="chartType === 'Line'">
                                            <assessments-chart
                                                ref="assessmentsChart"
                                                :style="{padding: '10px'}"
                                                :assessments="assessmentHistory"
                                                chart-type="Line"
                                                @week-view="goToWeek($event)"
                                            />
                                        </template>
                                    </div>
                                </template>
                            </card>
                        </v-col>
                    </v-row>
                </div>
            </pmt-content>
            <empty-state
                v-else-if="!departments.length && !isLoading"
                ref="mainEmptyState"
                :title="$t('pages.myAssessments.noAssessmentsForSelectedTitle')"
                :sub-title="$t('pages.myAssessments.noAssessmentsForSelectedText')"
                component="no-assessments"
                :show="true"
                no-padding
            />
            <round-spinner
                v-if="isLoading"
                full-screen
                :loading="isLoading"
            />
        </PmtLayout>
    </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
export default {
    name: 'MyAssessments',
    components: {
        TopBar: () => import('@/components/ui/top-bar/TopBar.vue'),
        DatePicker: () => import('@/components/ui/pickers/DatePicker.vue'),
        AssessmentsTable: () => import('@/pages/user/assessments/components/AssessmentsTable'),
        AssessmentsChart: () => import('@/pages/user/assessments/components/AssessmentsChart'),
    },
    data () {
        return {
            isLoading: true,
            activePanel: [0],
            weekTotalInHeaders: true,
            error: '',
            selectedDate: this.$moment(),
            direction: 'right',
            fullscreenChart: false,
            chartType: 'Line',
        }
    },
    computed: {
        ...mapGetters('auth', {
            user: 'user',
        }),
        ...mapGetters('account', {
            weekAssessments: 'assessments',
            employeeAssessmentHistory: 'assessmentHistory',
        }),
        ...mapGetters('departments', {
            departmentById: 'getById',
        }),
        ...mapState('departments', {
            departments: 'currentDepartments',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
            PAGE_SIZE: 'PAGE_SIZE',
        }),
        assessments () {
            return this.weekAssessments[this.weekIndex] || []
        },
        assessmentHistory () {
            return this.employeeAssessmentHistory[`'${this.user.accountId}'`] || []
        },
        weekIndex () {
            return `'${this.selectedDate.isoWeekYear()}-${this.selectedDate.isoWeek()}'`
        },
        datepickerOptions () {
            return {
                id: 'assessments-datepicker',
                maxDate: this.$moment(),
                selectedDate: this.selectedDate,
                showNavigation: true,
            }
        },
    },
    mounted () {
        this.getAssessmentHistory({ account_id: this.user.accountId })
        this.getDepartments()
    },
    methods: {
        ...mapActions('account', {
            getAssessments: 'getAssessments',
            getAssessmentHistory: 'getAssessmentHistory',
        }),
        ...mapActions('departments', {
            getDepartments: 'getCurrentDepartments',
        }),
        departmentStyle (assessment) {
            const department = this.departmentById(assessment.department_id)
            return department ? { borderLeft: `6px solid ${this.departmentById(assessment.department_id).color}`, marginBottom: '10px', padding: 0 } : false
        },
        goToWeek (week) {
            if (this.selectedDate.isoWeek() !== week) {
                this.selectedDate = this.$moment().isoWeek(week)
            }
        },
        async getWeekAssessments (day) {
            this.selectedDate = day
            if (!this.assessments.length) {
                this.isLoading = true
                await this.getAssessments({ account_id: this.user.accountId, week: `${day.isoWeekYear()}-${day.isoWeek()}` }).then((result) => {
                    if (this.selectedDate.isBefore(day, 'isoWeek')) {
                        this.direction = 'left'
                    } else {
                        this.direction = 'right'
                    }
                }).catch(error => {
                    this.error = error.message
                }).finally(() => {
                    this.fullscreenChart = false
                    this.isLoading = false
                })
            } else {
                this.isLoading = false
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/mixins/expansion-panels.scss';
    @include expansion-panel-header;
    .fullscreen-chart {
        position: fixed;
        width: 100%;
        z-index: 50;
    }
</style>
