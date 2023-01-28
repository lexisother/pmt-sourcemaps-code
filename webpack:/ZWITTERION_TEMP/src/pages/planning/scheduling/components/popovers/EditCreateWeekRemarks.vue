<template>
    <VCard
        ref="formContainer"
        elevation="0"
    >
        <VCardTitle
            ref="cardTitle"
            class="grey-200"
        >
            {{ cardTitle }}
        </VCardTitle>
        <VCardSubtitle
            ref="cardSubTitle"
            class="grey-140"
        >
            <span>
                <span>{{ cardSubTitle }}</span>
            </span>
        </VCardSubtitle>
        <PmtButton
            ref="close"
            v-ripple
            default
            round
            medium
            icon="close"
            icon-size="20"
            class="close"
            @click="cancel()"
        />
        <VCardText
            v-if="localRemarks.length === 7"
            ref="cardContent"
        >
            <SimpleTabs
                ref="barTabs"
                :tabs="tabs"
                no-border
                @click="selectedTab = $event.index"
            >
                <template #default="{tab, index}">
                    <div
                        ref="tabText"
                        class="py-3 px-2"
                        :class="{'text-primary bold': localRemarks[index].remark.replace(/^\s+|\s+$/gm, '')}"
                    >
                        {{ tab.text }}
                        <div
                            v-if="!localRemarks[index].id && !localRemarks[index].isNew"
                            class="shift-frequency-container"
                        >
                            <CalendarSync
                                ref="recurringRemark"
                                :size="14"
                                name=""
                                title=""
                            />
                        </div>
                    </div>
                </template>
                <template #tab-item>
                    <div class="form-field pa-3">
                        <PTextArea
                            ref="shiftRemark"
                            :key="selectedTab"
                            v-model="localRemarks[selectedTab].remark"
                            :cy_id="`shiftRemark-${selectedTab}`"
                            name="shift-remark"
                            :label="$t('ui.singles.remark')"
                            :disabled="!CAN_MANAGE_REMARKS || weekIsClosed"
                            :rows="4"
                            autofocus
                        />
                        <a
                            v-if="CAN_MANAGE_REMARKS && !weekIsClosed && !SHOW_SENT_SCHEDULES && localRemarks[selectedTab].remark.replace(/^\s+|\s+$/gm, '')"
                            ref="emptyRemark"
                            :class="{'delete-remark': true, 'disabled': localRemarks[selectedTab].remark === ''}"
                            :tabindex="localRemarks[selectedTab].remark === '' ? '-1' : '0'"
                            @click="localRemarks[selectedTab].remark = ''"
                            @keyup.enter="localRemarks[selectedTab].remark = ''"
                            @keyup.space="localRemarks[selectedTab].remark = ''"
                        >
                            {{ baseTranslate('shiftPopover.deleteRemark') }}
                        </a>
                        <PmtInfo
                            v-if="!localRemarks[selectedTab].id && !localRemarks[selectedTab].isNew"
                            blue
                            inverted
                            rounded
                            class="mt-2"
                            info-style="padding: 5px 10px;"
                        >
                            <CalendarSync
                                ref="recurringRemark"
                                :size="14"
                                name=""
                                title=""
                            />
                            {{ baseTranslate('editCreateRemarkForm.recurringRemark') }}
                        </PmtInfo>
                    </div>
                </template>
            </SimpleTabs>
        </VCardText>
        <div
            v-if="!SHOW_SENT_SCHEDULES"
            ref="formActions"
            class="actions"
        >
            <PmtButton
                ref="cancelBtn"
                default
                outline
                tab-index="0"
                @click="cancel()"
            >
                {{ $t("ui.singles.cancel") }}
            </PmtButton>
            <PmtButton
                v-if="CAN_MANAGE_REMARKS && !weekIsClosed"
                ref="saveBtn"
                primary
                tab-index="0"
                :disabled="!changes.length"
                @click="save()"
            >
                {{ $t("ui.singles.save") }}
            </PmtButton>
        </div>
    </VCard>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'EditCreateWeekRemarks',
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            selectedTab: 0,
            localRemark: {
                account_id: this.employee.account_id,
                remark: '',
                isNew: true,
            },
            localRemarks: [],
        }
    },
    computed: {
        /**
         * Returns the title of the form card
         * @returns {String}
         */
        cardTitle () {
            return this.baseTranslate('editCreateRemarkForm.title')
        },
        cardSubTitle () {
            if (!this.tabs[this.selectedTab]) return ''
            return `${this.$t('ui.singles.for')} ${this.employee.name}, ${this.$t('ui.singles.on')} ${this.tabs[this.selectedTab].day.shortReadableDateFormat()}`
        },
        tabs () {
            return this.localRemarks.map((remark, index) => {
                const day = this.$moment(remark.date)
                return {
                    text: day.format('dd DD'),
                    day,
                    selected: this.selectedTab === index,
                    isDay: true,
                    value: remark,
                }
            })
        },
        changes () {
            return this.localRemarks.filter(r => {
                const weekRemarks = [...this.employeeDaysRemarks(this.employee)]
                const hasNew = r.remark.trim() !== '' && r.isNew
                const hasWeekRemarks = weekRemarks.length
                const remarkOnDate = weekRemarks.find(e => e.date === r.date)
                let hasDifferentRemarkOnDate = false
                if (remarkOnDate) {
                    hasDifferentRemarkOnDate = r.remark.trim() !== weekRemarks.find(e => e.date === r.date).remark.trim()
                }
                const hasExistingChanges = !r.isNew && hasWeekRemarks && hasDifferentRemarkOnDate
                return hasNew || hasExistingChanges
            })
        },
    },
    created () {
        this.selectedTab = this.isDayView ? this.SELECTED_DATE.isoWeekday() - 1 : 0
    },
    mounted () {
        this.setLocalDayRemarks()
    },
    methods: {
        setLocalDayRemarks () {
            this.localRemarks = this.employeeDaysRemarks(this.employee)
        },
        save () {
            if (this.weekIsClosed) return
            this.changes.forEach(remark => {
                this.saveDayRemark(remark, this.employee).then(result => {
                    this.setLocalDayRemarks()
                })
            })
            this.$emit('close')
        },
        cancel () {
            this.$emit('close')
        },
    },
}
</script>

<style lang="scss" scoped>
@import './styling/scheduling-grid-form.scss';
</style>
