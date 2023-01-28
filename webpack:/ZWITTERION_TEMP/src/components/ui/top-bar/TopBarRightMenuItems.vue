<template>
    <div
        v-if="buttons.length"
        class="action-items"
    >
        <span
            v-if="!IS_MOBILE"
            class="bar-actions"
        >
            <template v-for="(btn, index) in buttons">
                <PmtButton
                    :id="btn.id"
                    :key="index"
                    :ref="btn.id"
                    v-tooltip="{content: btn.label, hideOnTargetClick: true, placement: 'bottom', trigger: 'focus hover click'}"
                    primary
                    inverted
                    :round="!btn.text"
                    default-loading-icon-size
                    disabled-simple
                    :class="btn.class"
                    :cy_id="btn.id"
                    :icon="btn.icon"
                    :loading="btn.loading"
                    @click="btn.otherAction"
                >
                    <span v-if="btn.text && !IS_MOBILE"> {{ btn.label }}</span>
                </PmtButton>
            </template>
        </span>
        <span
            v-else
            class="bar-actions"
        >
            <BarMenuButton
                :items="buttons"
                is-menu
            />
        </span>
        <SubstituteRequestModal ref="substituteRequestModal" />
        <RdoRequestModal ref="rdoRequestModal" />
        <BirthdayModal ref="birthdayModal" />
    </div>
</template>

<script>
import myScheduleService from '@/services/MyScheduleService'
import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
    name: 'TopbarRightMenuItems',
    components: {
        BarMenuButton: () => import('./BarMenuButton'),
        RdoRequestModal: () => import('@/components/modals/RdoRequestModal.vue'),
        SubstituteRequestModal: () => import('@/components/modals/substitute-request/SubstituteRequestModal.vue'),
        BirthdayModal: () => import('@/components/modals/BirthdayModal.vue'),
    },
    props: {
        showInfo: {
            type: Boolean,
            default: false,
        },
        showBirthdays: {
            type: Boolean,
            default: false,
        },
        showFindSubstitutes: {
            type: Boolean,
            default: false,
        },
        showRequestTimeOff: {
            type: Boolean,
            default: false,
        },
        showPrint: {
            type: Boolean,
            default: false,
        },
        openPrint: {
            type: Boolean,
            default: true,
        },
        printOrientationLandscape: {
            type: Boolean,
            default: false,
        },
        showFullScreenButton: {
            type: Boolean,
            default: false,
        },
        showPrintExcelDepartmentSchedule: {
            type: Boolean,
            default: false,
        },
        showEmailScheduleButton: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        birthdayArray: [],
        queueConfetti: false,
        infoActive: false,
        fullScreen: false,
        loadingPrint: false,
    }),
    computed: {
        ...mapGetters('auth', {
            currentUser: 'user',
            canRequestTimeOff: 'canRequestTimeOff',
            hasTimeOffAccess: 'hasTimeOffAccess',
            canFindSubstitutes: 'canFindSubstitutes',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('schedules', ['showScheduleRemarks', 'weekRemarks']),
        hasBirthdays () {
            return this.birthdayArray.length
        },
        buttons () {
            const buttons = []
            if (this.canFindSubstitutes && this.showFindSubstitutes) {
                buttons.push({
                    otherAction: this.findReplacement,
                    class: 'ssr-btn',
                    icon: 'account-switch',
                    id: 'ssrBtn',
                    text: true,
                    label: this.$t('pages.mySchedule.topbar.substituteRequestBtn.label'),
                    simple: true,
                })
            }
            if (this.hasTimeOffAccess && this.canRequestTimeOff && this.showRequestTimeOff) {
                buttons.push({
                    otherAction: this.requestDayOff,
                    class: 'rdo-btn',
                    icon: 'timer-sand',
                    id: 'rdoBtn',
                    text: true,
                    label: this.$t('pages.mySchedule.topbar.rdoBtn.label'),
                    simple: true,
                })
            }
            if (this.hasBirthdays && this.showBirthdays) {
                buttons.push({
                    otherAction: this.getBirthdays,
                    icon: 'cake-variant',
                    id: 'birthDayBtn',
                    label: this.$t('pages.mySchedule.topbar.birthdaysButton.label'),
                    simple: true,
                })
            }
            if (this.showPrintExcelDepartmentSchedule) {
                buttons.push({
                    otherAction: this.printDepartmentScheduleToExcel,
                    icon: 'microsoft-excel',
                    id: 'excelBtn',
                    loading: this.loadingPrint,
                    label: this.$t('pages.mySchedule.topbar.excelDeptScheduleBtn.label'),
                    simple: true,
                })
            }
            if (this.showPrint) {
                buttons.push({
                    otherAction: this.printPage,
                    icon: 'printer',
                    id: 'printBtn',
                    label: this.$t('pages.mySchedule.topbar.print.label'),
                    simple: true,
                })
            }
            if (this.showEmailScheduleButton) {
                buttons.push({
                    otherAction: this.emailWeekSchedule,
                    icon: 'email',
                    id: 'emailBtn',
                    label: this.$t('pages.mySchedule.topbar.email.label'),
                    simple: true,
                })
            }
            if (this.showFullScreenButton) {
                buttons.push({
                    otherAction: this.fullScreenClick,
                    icon: !this.fullScreen ? 'fullscreen' : 'fullscreen-exit',
                    id: 'fullscreenBtn',
                })
            }
            if (this.showInfo) {
                buttons.push({
                    otherAction: this.showInfoClick,
                    icon: 'information-outline',
                    id: 'infoBtn',
                    label: this.$t('pages.mySchedule.topbar.info.label'),
                    simple: true,
                })
            }
            return buttons
        },
    },
    mounted () {
        if (this.showBirthdays) {
            this.getBirthdaysList()
        }
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('communication', {
            getTodaysBirthdays: 'getBirthdays',
        }),
        showInfoClick () {
            this.$emit('info')
            this.infoActive = !this.infoActive
        },
        findReplacement () {
            this.$refs.substituteRequestModal.open()
            this.$emit('findReplacement')
        },
        requestDayOff () {
            this.$refs.rdoRequestModal.open()
            this.$emit('requestDayOff')
        },
        printPage () {
            this.$emit('print', true)
            if (this.printOrientationLandscape) {
                this.SET_SNACKBAR({ message: this.$t('pages.myDepartmentSchedule.print') })
            }
            if (this.openPrint) {
                setTimeout(() => {
                    window.print()
                    this.$emit('print', false)
                }, 100)
            }
        },
        getBirthdays () {
            const payload = {
                confetti: this.queueConfetti,
                employees: this.birthdayArray,
            }
            this.$refs.birthdayModal.open(payload)
            this.$emit('birthdaysClick')
        },
        getBirthdaysList () {
            const payload = {
                start: this.$moment().apiFormat(),
                end: this.$moment().apiFormat(),
            }
            this.getTodaysBirthdays(payload).then(response => {
                if (response && response.length) {
                    this.birthdayArray = response
                    const getCurrentEmp = this.birthdayArray.find(emp => emp.account_id === this.currentUser.accountId)
                    if (typeof getCurrentEmp !== 'undefined') {
                        getCurrentEmp.employee_name = this.$t('modals.birthdayOverview.employeeBirthday')
                        this.queueConfetti = true
                    }
                }
            })
        },
        fullScreenClick () {
            const query = Object.assign({}, this.$route.query)
            if (query.full_screen) {
                delete query.full_screen
                this.$router.replace({ query })
                this.fullScreen = false
            } else {
                this.fullScreen = true
                this.$router.replace({ query: { ...query, full_screen: this.fullScreen } })
            }
            this.$emit('full-screen', this.fullScreen)
        },

        /**
         * Downloads the department schedule excel from pmt1.
         */
        printDepartmentScheduleToExcel () {
            this.loadingPrint = true
            myScheduleService.downloadDepartmentScheduleExcel({ week_number: this.$route.params.week, year: this.$route.params.year }).then(() => {
                this.loadingPrint = false
            })
        },

        /**
         * Sends the week schedule of selected/current user via email.
         */
        emailWeekSchedule () {
            const payload = {
                account_id: this.$route.params.account_id ? this.$route.params.account_id : this.currentUser.accountId,
                week_number: this.$route.params.week,
                year: this.$route.params.year,
                show_remarks: this.showScheduleRemarks,
            }

            // Add remarks to the request if necessary.
            if (payload.show_remarks) {
                payload.remarks = {}
                Object.keys(this.weekRemarks).forEach(key => {
                    this.weekRemarks[key].map(remark => {
                        payload.remarks[remark.day] = remark.remark
                        return remark
                    })
                })

                payload.remarks = JSON.stringify(payload.remarks)
            }

            myScheduleService.emailWeekSchedule(payload).then(() => {
                this.SET_SNACKBAR({ message: this.$t('pages.mySchedule.emailSent'), success: true })
            }).catch(() => {
                this.SET_SNACKBAR({ message: this.$t('generalMessages.errors.emailNotSent'), error: true })
            })
        },
    },
}
</script>
