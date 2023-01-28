<template>
    <VCard
        v-if="employee && (employmentWarnings.length || employeeClaValidationOutcomes.length)"
        ref="employeeWarnings"
    >
        <VCardTitle
            ref="cardTitle"
            class="grey-200 border card-title"
        >
            {{ $t('pages.scheduling.warnings.notificationsFor') }} {{ employee.name }}
            <PmtButton
                ref="close"
                v-ripple
                default
                round
                medium
                icon="close"
                icon-size="20"
                class="close"
                @click="$emit('close')"
            />
        </VCardTitle>
        <VCardText
            class="pa-1"
            :clas="{'max-height': !IS_MOBILE}"
        >
            <div>
                <VRow
                    v-for="(warning, index) in employmentWarnings"
                    :key="`employment_${index}`"
                    no-gutters
                    class="border py-2"
                >
                    <VCol class="col-1 text-center">
                        <AlertCircle
                            :size="20"
                            class="d-block"
                            fill-color="var(--grey-80)"
                        />
                    </VCol>
                    <VCol
                        v-if="!isDayView && employeeClaValidationOutcomes.length"
                        class="col-1 text-capitalize"
                    />
                    <VCol :class="isDayView ? 'col-10' : 'col-9'">
                        <span class="bold grey-140">{{ warning }}</span>
                    </VCol>
                </VRow>
                <VRow
                    v-for="(rule, index) in employeeClaValidationOutcomes"
                    :key="`rule_${index}`"
                    no-gutters
                    class="border py-2"
                >
                    <VCol class="col-1 text-center">
                        <AlertCircle
                            :size="20"
                            class="d-block"
                            :fill-color="warningColor(rule)"
                        />
                    </VCol>
                    <VCol
                        v-if="!isDayView && hasValidationsOnDay"
                        class="col-1 text-capitalize"
                    >
                        <span v-if="rule.validation_date !== '0000-00-00'">{{ displayedDay(rule.validation_date) }}</span>
                    </VCol>
                    <VCol :class="isDayView ? 'col-10' : 'col-9'">
                        <span class="bold grey-140">{{ claRuleDescription(rule.cla_rule_id).reference }}</span> | {{ claRuleDescription(rule.cla_rule_id).description }}
                    </VCol>
                </VRow>
            </div>
        </VCardText>
        <VCardActions v-if="IS_MOBILE">
            <VSpacer />
            <PmtButton
                default
                outline
                @click="$emit('close')"
            >
                {{ $t('ui.singles.close') }}
            </PmtButton>
        </VCardActions>
    </VCard>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import stringHelper from '@/libraries/stringHelper'

export default {
    name: 'EmployeeWarnings',
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            default: () => undefined,
        },
    },
    computed: {
        employeeClaValidationOutcomes () {
            let output = []
            const groupedValidationOutcomes = stringHelper.groupBy(this.employeeClaValidations(this.employee), 'validation_date')
            Object.keys(groupedValidationOutcomes).forEach(function (key) {
                output = output.concat(groupedValidationOutcomes[key].filter(o => o.error))
                output = output.concat(groupedValidationOutcomes[key].filter(o => o.warn))
            })
            return output
        },
        weekStart () {
            return this.weekDays[0].apiFormat()
        },
        weekEnd () {
            return this.weekDays[6].apiFormat()
        },
        showEmploymentDateWarning () {
            if (!this.isDayView) {
                return this.$moment(this.employee.details.date_of_employment).isBetween(this.weekStart, this.weekEnd, undefined, '[]')
            }
            return this.$moment(this.employee.details.date_of_employment).isSame(this.SELECTED_DATE.apiFormat(), 'day')
        },
        showUnemploymentDateWarning () {
            if (!this.isDayView) {
                return this.$moment(this.employee.details.date_of_unemployment).isBetween(this.weekStart, this.weekEnd, undefined, '[]')
            }
            return this.$moment(this.employee.details.date_of_unemployment).isSame(this.SELECTED_DATE.apiFormat(), 'day')
        },
        showContractEndWarning () {
            return this.employee.signalBeforeEndOfContractDate().isSameOrBefore(this.SELECTED_DATE.apiFormat(), 'week')
        },
        employmentWarnings () {
            const output = []
            const warnings = ['employmentDateWarning', 'unemploymentDateWarning', 'contractEndWarning']
            warnings.forEach(warning => {
                if (this[`show${stringHelper.capitalize(warning)}`]) {
                    output.push(this.$t(`pages.scheduling.warnings.${warning}`) + ' ' + this.warningDate(warning))
                }
            })
            return output
        },
        hasValidationsOnDay () {
            return this.employeeClaValidationOutcomes.filter(r => r.validation_date && r.validation_date !== '0000-00-00').length
        },
    },
    mounted () {
        document.addEventListener('keydown', this.keyListeners)
    },
    destroyed () {
        document.removeEventListener('keydown', this.keyListeners)
    },
    methods: {
        keyListeners (e) {
            if (e.code === 'Escape') {
                this.$emit('close')
            }
        },
        claRuleDescription (id) {
            let output = {}
            for (let cIndex = 0; cIndex < this.weekStoreData.cao_rules.length; cIndex++) {
                const rule = this.weekStoreData.cao_rules[cIndex].rules.find(o => o.cao_rule_id === id)
                if (rule) {
                    output = {
                        reference: rule.reference,
                        description: rule.description,
                    }
                    break
                }
            }
            return output
        },
        warningDate (warningType) {
            if (warningType === 'contractEndWarning' && this.employee.contractEndDate) {
                return this.$moment(this.employee.contractEndDate).shortReadableDateFormat()
            }
            const identifier = warningType === 'employmentDateWarning' ? 'date_of_employment' : 'date_of_unemployment'
            return this.$moment(this.employee.details[identifier]).shortReadableDateFormat()
        },
        displayedDay (validationDate) {
            return validationDate === '0000-00-00' || !validationDate ? '' : this.$moment(validationDate).format('dd')
        },
    },

}
</script>

<style lang="scss" scoped>
    .close {
        position: absolute;
        right: 8px;
        top: 12px;
    }

    :deep() .container {
        max-height: calc(100vh - 96px);
        overflow: auto;
    }

    .border {
        border-bottom: 1px solid var(--grey-30);

        &:last-child {
            border-bottom: none;
        }
    }

    .max-height {
        max-height: 600px;
        overflow: auto;
    }

    .card-title {
        position: sticky;
        top: 0;
        background-color: white;
    }
</style>
