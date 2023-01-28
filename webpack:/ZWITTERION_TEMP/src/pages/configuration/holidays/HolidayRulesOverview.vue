<template>
    <div>
        <HolidayRulesTopBar
            @open-modal="openEditCreateHolidayRulesModal"
            @search="setHolidayRulesForDataTable"
        />
        <PmtLayout fixed-height>
            <PmtContent>
                <VContainer>
                    <VRow>
                        <VCol
                            v-if="HOLIDAY_RULES_READ"
                            class="col-12 py-0"
                        >
                            <VAlert
                                v-if="HOLIDAYS_API_ERROR"
                                class="mb-0"
                                dense
                                outlined
                                type="error"
                            >
                                {{ HOLIDAYS_API_ERROR }}
                            </VAlert>
                            <p
                                v-if="SEARCH_STRING && SEARCH_STRING.length > 2"
                                ref="searchResultsNotification"
                            >
                                <strong>{{ holidayRulesForDataTable.length }}</strong>&nbsp;
                                {{ holidayRulesForDataTable.length === 1 ? $t('pages.holidayRules.holidayHourProfile') : $t('pages.holidayRules.holidayHourProfiles') }}&nbsp;
                                {{ $t('pages.holidayRules.foundWith') }} '<span class="font-weight-bold">{{ SEARCH_STRING }}</span>'.&nbsp;
                                <a
                                    ref="clearResults"
                                    @click="clearSearchString()"
                                >
                                    {{ $t('pages.holidayRules.showAllHolidayHourProfiles') }}
                                </a>
                            </p>
                        </VCol>
                        <VCol>
                            <VCard class="p-2 p-md-3">
                                <VDataTable
                                    v-if="HOLIDAY_RULES_READ"
                                    :headers="dataTableHeaders"
                                    :items="holidayRulesForDataTable"
                                    :items-per-page="10"
                                    :single-expand="true"
                                    :expanded.sync="expanded"
                                    item-key="id"
                                    :show-expand="!IS_MOBILE"
                                    class="config-data-table"
                                >
                                    <template
                                        v-for="(mainParameter, index) in mainParameters"
                                        #[`item.${mainParameter}`]="{ item }"
                                    >
                                        <div
                                            :key="index"
                                            :class="{ 'label-with-badge': mainParameter !== 'name' }"
                                        >
                                            <PmtCrudInput
                                                v-if="HOLIDAY_RULES_MANAGE && crudInputIsEnabled(mainParameter, item)"
                                                :full-object="item"
                                                :identifier="`${mainParameter}_selected`"
                                                :type="mainParameter === 'name' ? 'text' : 'select'"
                                                :value-identifier="mainParameter !== 'name' ? indentifier(mainParameter, 'value') : null"
                                                :label-identifier="mainParameter !== 'name' ? indentifier(mainParameter, 'label') : null"
                                                :multiselect="mainParameter !== 'name' ? true : false"
                                                :items="mainParameter !== 'name' ? options(mainParameter): null"
                                                :required="isRequired(mainParameter)"
                                                @save="processCrudInputDataBeforeSave($event)"
                                                v-on="$listeners"
                                            >
                                                <span
                                                    :class="{ 'label-aside-badge': mainParameter !== 'name' }"
                                                    v-html="item[mainParameter]"
                                                />
                                            </PmtCrudInput>
                                            <span
                                                v-else
                                                :class="{ 'label-aside-badge': mainParameter !== 'name' }"
                                                v-html="item[mainParameter]"
                                            />
                                            <VBadge
                                                v-if="item[mainParameter + '_amount'] && mainParameter !== 'name'"
                                                :content="item[mainParameter + '_amount']"
                                                color="grey lighten-1"
                                                class="badge-aside-label"
                                            />
                                        </div>
                                    </template>
                                    <template #[`item.actions`]="{ item }">
                                        <PmtButton
                                            v-if="HOLIDAY_RULES_MANAGE"
                                            round
                                            default
                                            icon="pencil"
                                            icon-size="15"
                                            @click="openEditCreateHolidayRulesModal(item.id, 'edit')"
                                        />
                                        <PopoverButton
                                            v-if="HOLIDAY_RULES_MANAGE"
                                            round
                                            default
                                            :is-open="showDeletePopover && activeHolidayRuleId === item.id"
                                            icon="delete-forever"
                                            icon-size="15"
                                            @click="showDeletePopover = true; activeHolidayRuleId = item.id"
                                            @hide="showDeletePopover = false;"
                                        >
                                            <template slot="popover-content">
                                                <p>
                                                    {{ $t('pages.holidayRules.deleteConfirm') }}
                                                </p>
                                                <div class="popover-buttons">
                                                    <PmtButton
                                                        normal
                                                        custom-class="tooltip-target b1"
                                                        @click="showDeletePopover = false"
                                                    >
                                                        {{ $t('ui.singles.no') }}
                                                    </PmtButton>
                                                    <PmtButton
                                                        danger
                                                        custom-class="tooltip-target b1"
                                                        @click="removeHolidayRule(item.id)"
                                                    >
                                                        {{ $t('ui.singles.yes') }}
                                                    </PmtButton>
                                                </div>
                                            </template>
                                        </PopoverButton>
                                    </template>
                                    <template
                                        v-if="!IS_MOBILE"
                                        #expanded-item="{ headers, item }"
                                    >
                                        <td :colspan="headers.length + 1">
                                            <template v-for="n in 3">
                                                <h6
                                                    :key="`heading-${n}`"
                                                    :class="{ hidden: n > visibleSubTables(item.id) }"
                                                >
                                                    {{ translatedParameterGroupHeading(ruleModel.parameters[n].parameterName) }}
                                                </h6>
                                                <VSimpleTable
                                                    :key="`table-${n}`"
                                                    class="sub-table"
                                                    :class="{ hidden: n > visibleSubTables(item.id) }"
                                                >
                                                    <thead>
                                                        <tr>
                                                            <th
                                                                v-for="(formElement, index) in ruleModel.parameters[n].formElements"
                                                                :key="index"
                                                            >
                                                                {{ translatedLabel(formElement.model) }}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                v-for="(formElement, index) in ruleModel.parameters[n].formElements"
                                                                :key="index"
                                                            >
                                                                <template v-if="formElement.type === 'Switch'">
                                                                    <PmtSwitch
                                                                        v-if="HOLIDAY_RULES_MANAGE"
                                                                        v-model="item[`${ruleModel.parameters[n].parameterName}_${formElement.model}_selected`]"
                                                                        class="mt-1"
                                                                        @input="processCrudInputDataBeforeSave({ object: item, inputValue: $event, identifier: `${ruleModel.parameters[n].parameterName}_${formElement.model}` })"
                                                                    />
                                                                    <template v-else>
                                                                        <Done v-if="item[`${ruleModel.parameters[n].parameterName}_${formElement.model}_selected`]" />
                                                                        <Close v-else />
                                                                    </template>
                                                                </template>
                                                                <template v-else>
                                                                    <PmtCrudInput
                                                                        v-if="HOLIDAY_RULES_MANAGE"
                                                                        :full-object="item"
                                                                        :identifier="`${ruleModel.parameters[n].parameterName}_${formElement.model}_selected`"
                                                                        type="select"
                                                                        :items="options(formElement.model)"
                                                                        dense
                                                                        @save="processCrudInputDataBeforeSave($event)"
                                                                        v-on="$listeners"
                                                                    >
                                                                        <span v-html="item[`${ruleModel.parameters[n].parameterName}_${formElement.model}`]" />
                                                                    </PmtCrudInput>
                                                                    <span
                                                                        v-else
                                                                        v-html="item[`${ruleModel.parameters[n].parameterName}_${formElement.model}`]"
                                                                    />
                                                                </template>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </VSimpleTable>
                                            </template>
                                        </td>
                                    </template>
                                </VDataTable>
                                <EmptyState
                                    v-else
                                    ref="noAccess"
                                    :title="$t('ui.singles.noAccess')"
                                    :component="'four-o-four'"
                                    :show="true"
                                    :is-error="true"
                                    no-padding
                                />
                            </VCard>
                        </VCol>
                    </VRow>
                </VContainer>
            </PmtContent>
        </PmtLayout>
        <EditCreateHolidayRulesModal
            ref="editCreateHolidayRulesModal"
            :rule-model="ruleModel"
            :rule-model-options="ruleModelOptions"
            @save="prepareForSave"
        />
    </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import stringHelper from '@/libraries/stringHelper'
import objectHelper from '@/libraries/objectHelper'

export default {
    name: 'HolidayRulesOverview',
    components: {
        HolidayRulesTopBar: () => import('@/pages/configuration/holidays/HolidayRulesTopBar.vue'),
        EditCreateHolidayRulesModal: () => import('@/pages/configuration/holidays/EditCreateHolidayRulesModal.vue'),
    },
    data () {
        return {
            isUpdating: false,
            expanded: [],
            activeHolidayRuleId: null,
            showDeletePopover: false,
            dataTableHeaders: [
                { text: this.$t('pages.holidayRules.tableHeaderLabels.name'), value: 'name' },
                { text: this.$t('pages.holidayRules.tableHeaderLabels.stores'), value: 'stores' },
                { text: this.$t('pages.holidayRules.tableHeaderLabels.storeGroups'), value: 'store_groups' },
                { text: this.$t('pages.holidayRules.tableHeaderLabels.cao'), value: 'cao' },
                { text: this.$t('pages.holidayRules.tableHeaderLabels.contractType'), value: 'contract_type' },
                { text: this.$t('pages.holidayRules.tableHeaderLabels.contractTypeForCao'), value: 'contract_type_for_cao' },
                { text: '', value: 'actions', cellClass: 'data-table-actions-cell', align: 'right' },
                { text: '', value: 'data-table-expand' },
            ],
            holidayRulesForDataTable: [],
            mainParameters: ['name', 'stores', 'store_groups', 'cao', 'contract_type', 'contract_type_for_cao'],
            ruleModel: {
                formElements: [
                    { model: 'name', type: 'TextInput', required: true },
                    { model: 'stores', type: 'Select', multiselect: true, valueIdentifier: 'id', labelIdentifier: 'name' },
                    { model: 'store_groups', type: 'Select', multiselect: true, valueIdentifier: 'id', labelIdentifier: 'name' },
                ],
                parameters: [
                    {
                        tabIndex: 0,
                        parameterName: 'selection_criteria',
                        formElements: [
                            { model: 'cao', type: 'Select', multiselect: true, valueIdentifier: 'cao_id', labelIdentifier: 'name', required: true },
                            { model: 'contract_type', type: 'Select', multiselect: true, required: true },
                            { model: 'contract_type_for_cao', type: 'Select', multiselect: true, required: false },
                        ],
                    },
                    {
                        tabIndex: 1,
                        parameterName: 'calculation_type',
                        formElements: [
                            { model: 'calculation_source', type: 'Select', required: true },
                            { model: 'disregard_holiday_bookings_on_sundays', type: 'Switch' },
                            { model: 'disregard_holiday_bookings_on_may_5', type: 'Switch' },
                            { model: 'subtract_productive_hours', type: 'Switch' },
                        ],
                    },
                    {
                        tabIndex: 2,
                        parameterName: 'calculation_of_right',
                        formElements: [
                            { model: 'payroll_categories', type: 'Select', required: true },
                            { model: 'min_weeks_for_average_calculation', type: 'Select', required: true },
                            { model: 'weeks_history_for_calculation', type: 'Select', required: true },
                        ],
                    },
                    {
                        tabIndex: 3,
                        parameterName: 'calculation_of_value',
                        formElements: [
                            { model: 'payroll_categories', type: 'Select', required: true },
                            { model: 'divide_by', type: 'Select', required: true },
                        ],
                    },
                ],
            },
            defaultRuleModelOptions: {
                contractTypeOptions: [
                    { value: 'Fulltime', label: this.$t('pages.holidayRules.contractTypeOptions.fulltime') },
                    { value: 'Parttime', label: this.$t('pages.holidayRules.contractTypeOptions.parttime') },
                    { value: 'Hulpkracht', label: this.$t('pages.holidayRules.contractTypeOptions.aide') },
                    { value: 'Vakantiewerker', label: this.$t('pages.holidayRules.contractTypeOptions.holidayWorker') },
                    { value: 'Oproepkracht', label: this.$t('pages.holidayRules.contractTypeOptions.onCallWorker') },
                    { value: 'Uitzendkracht', label: this.$t('pages.holidayRules.contractTypeOptions.temporaryWorker') },
                    { value: 'Ondernemer', label: this.$t('pages.holidayRules.contractTypeOptions.entrepreneur') },
                ],
                calculationSourceOptions: [
                    { value: 'standard_schedule', label: this.$t('pages.holidayRules.calculationSourceOptions.standardSchedule') },
                    { value: 'n_week_average', label: this.$t('pages.holidayRules.calculationSourceOptions.nWeekAverage') },
                    { value: 'contract', label: this.$t('pages.holidayRules.calculationSourceOptions.contract') },
                ],
                payrollCategoriesOptions: [
                    { value: 'worked_hours', label: this.$t('pages.holidayRules.payrollCategoryOptions.workedHours') },
                    { value: 'holiday_12week', label: this.$t('pages.holidayRules.payrollCategoryOptions.holiday12week') },
                ],
                minWeeksForAverageCalculationOptions: [
                    { value: '0', label: '0' },
                    { value: '6', label: '6' },
                    { value: '8', label: '8' },
                ],
                weeksHistoryForCalculationOptions: [
                    { value: '12', label: '12' },
                    { value: '13', label: '13' },
                ],
                divideByOptions: [
                    { value: 'full_weeks_history', label: this.$t('pages.holidayRules.divideByOptions.fullWeeksHistory') },
                    { value: 'number_of_weeks_with_data', label: this.$t('pages.holidayRules.divideByOptions.numberOfWeeksWithData') },
                ],
            },
        }
    },
    computed: {
        ...mapGetters(['IS_MOBILE']),
        ...mapGetters('configuration/holidays', ['HOLIDAY_RULES', 'HOLIDAYS_API_ERROR', 'SEARCH_STRING']),
        ...mapGetters('stores', ['getAllStores']),
        ...mapGetters('configuration/storeGroups', ['STORE_GROUPS']),
        ...mapGetters('configuration/cao', ['ENVIRONMENT_CAO_RULES']),
        ...mapGetters('auth', ['HOLIDAY_RULES_READ', 'HOLIDAY_RULES_MANAGE']),
        storesOptions () {
            const options = []
            this.getAllStores.forEach(store => {
                options.push({ id: store.id.toString(), name: store.name })
            })
            return options
        },
        storeGroupsOptions () {
            const options = []
            this.STORE_GROUPS.forEach(group => {
                options.push({ id: group.id.toString(), name: group.name })
            })
            return options
        },
        caoOptions () {
            return this.ENVIRONMENT_CAO_RULES
        },
        ruleModelOptions () {
            return { ...this.defaultRuleModelOptions, contractTypeForCaoOptions: this.defaultRuleModelOptions.contractTypeOptions }
        },
    },
    watch: {
        HOLIDAY_RULES: {
            handler () {
                this.setHolidayRulesForDataTable()
            },
            deep: true,
        },
    },
    async mounted () {
        await this.getStoreGroups()
        await this.getCaoRules(true)
        this.getHolidayRules()
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapMutations('configuration/holidays', ['SET_SEARCH_STRING']),
        ...mapActions('configuration/holidays', [
            'getHolidayRules',
            'addHolidayRule',
            'editHolidayRule',
            'deleteHolidayRule',
            'recalculateHolidayRules',
        ]),
        ...mapActions('configuration/storeGroups', ['getStoreGroups']),
        ...mapActions('configuration/cao', ['getCaoRules']),
        openEditCreateHolidayRulesModal (ruleId, action) {
            let processedRule = {}
            if (ruleId) {
                const rule = this.HOLIDAY_RULES.find(o => o.id === ruleId)
                processedRule = this.buildRuleObjectForModal(rule)
            }
            this.$refs.editCreateHolidayRulesModal.open(processedRule, action)
        },
        visibleSubTables (ruleId) {
            const rule = this.HOLIDAY_RULES.find(o => o.id === ruleId)
            if (rule.parameters.calculation_type.calculation_source !== 'n_week_average') {
                return 1
            }
            return 3
        },
        /**
         * Create array for displaying holiday rules in data table with subtable, ready for inline editing
         */
        setHolidayRulesForDataTable () {
            let rulesForDataTable = []
            this.HOLIDAY_RULES.forEach(rule => {
                rulesForDataTable.push(this.buildRuleObject(rule))
            })

            rulesForDataTable = objectHelper.filterOnSearchString(rulesForDataTable, this.SEARCH_STRING, this.mainParameters)

            this.holidayRulesForDataTable = rulesForDataTable
        },
        clearSearchString () {
            this.SET_SEARCH_STRING(null)
            this.setHolidayRulesForDataTable()
        },
        /**
         * Create string from multiple selected stores or store groups
         */
        storesOrStoreGroupsLabel (array, isStoresLabel) {
            return array.map(item => item[`${isStoresLabel ? 'store_name' : 'name'}`]).join(', ')
        },
        /**
         * Create string from multiple selected parameters, like cao, contract types
         */
        selectionCriteriaLabel (model, array) {
            const labelArray = []
            let defaultOptions = []
            let valueIdentifier = 'value'
            let labelIdentifier = 'label'
            if (model === 'cao') {
                defaultOptions = this.caoOptions
                valueIdentifier = 'name'
                labelIdentifier = 'name'
            } else {
                defaultOptions = this.defaultRuleModelOptions.contractTypeOptions
            }
            defaultOptions.forEach(option => {
                if (array && array.includes(option[valueIdentifier])) {
                    labelArray.push(option[labelIdentifier])
                }
            })
            return labelArray.map(i => i).join(', ')
        },
        save (body) {
            let apiMethod = 'addHolidayRule'
            if (body.id) {
                apiMethod = 'editHolidayRule'
            }
            this[apiMethod](body)
                .then(() => {
                    this.setHolidayRulesForDataTable()
                    this.SET_SNACKBAR({ message: this.$t('pages.holidayRules.dataUpdated'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.holidayRules.dataUpdateFailed'), error: true })
                })
                .finally(() => {
                    this.$refs.editCreateHolidayRulesModal.close()
                })
        },
        removeHolidayRule (id) {
            this.deleteHolidayRule(id)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.holidayRules.ruleHasBeenDeleted'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.holidayRules.ruleDeletionFailed'), error: true })
                })
                .finally(() => {
                    this.showDeletePopover = false
                })
        },
        /**
         * Object coming from modal needs to be reworked before it can be used for PUT or POST call
         */
        prepareForSave (rule) {
            const reworkedRule = JSON.parse(JSON.stringify(rule))
            if (rule.stores.length) {
                reworkedRule.stores = this.getArrayOfIds(rule.stores)
            } else if (rule.store_groups.length) {
                reworkedRule.store_groups = this.getArrayOfIds(rule.store_groups)
            }
            reworkedRule.parameters.selection_criteria.cao = this.getArrayOfValues(rule.parameters.selection_criteria.cao, 'name')
            reworkedRule.parameters.selection_criteria.contract_type = this.getArrayOfValues(rule.parameters.selection_criteria.contract_type, 'value')
            reworkedRule.parameters.selection_criteria.contract_type_for_cao = this.getArrayOfValues(rule.parameters.selection_criteria.contract_type_for_cao, 'value')
            reworkedRule.parameters.calculation_type.calculation_source = this.singleValue(rule.parameters.calculation_type.calculation_source)

            if (reworkedRule.parameters.calculation_type.calculation_source === 'n_week_average') {
                this.ruleModel.parameters.slice(2, 4).forEach(parameter => {
                    parameter.formElements.forEach(formElement => {
                        reworkedRule.parameters[parameter.parameterName][formElement.model] = this.singleValue(rule.parameters[parameter.parameterName][formElement.model])
                    })
                })
            } else {
                this.ruleModel.parameters.slice(2, 4).forEach(parameter => {
                    parameter.formElements.forEach(formElement => {
                        reworkedRule.parameters[parameter.parameterName][formElement.model] = ''
                    })
                })
            }

            this.save(reworkedRule)
        },
        /**
         * Object coming from CrudInput needs to be processed and injected in rule before it can be used for PUT or POST call
         */
        processCrudInputDataBeforeSave (event) {
            const rules = JSON.parse(JSON.stringify(this.HOLIDAY_RULES))
            const processedRule = rules.find(o => o.id === event.object.id)
            let value = ''
            let activeParameter = ''
            let model = event.identifier.replace('_selected', '')
            // detect if model has parameter prefix...
            this.ruleModel.parameters.forEach(parameter => {
                if (model.startsWith(parameter.parameterName)) {
                    model = model.replace(`${parameter.parameterName}_`, '')
                    activeParameter = parameter.parameterName
                }
            })

            processedRule.stores = this.getArrayOfIds(processedRule.stores)
            processedRule.store_groups = this.getArrayOfIds(processedRule.store_groups)

            if (model === 'name' || model === 'disregard_holiday_bookings_on_sundays' || model === 'disregard_holiday_bookings_on_may_5') {
                value = model === 'name' ? stringHelper.escapeString(event.inputValue) : event.inputValue
            } else if (model === 'stores' || model === 'store_groups') {
                value = this.getArrayOfIds(event.inputValue)
            } else if (model === 'cao') {
                value = this.getArrayOfValues(event.inputValue, 'name')
            } else if (model === 'contract_type' || model === 'contract_type_for_cao') {
                value = this.getArrayOfValues(event.inputValue, 'value')
            } else {
                value = event.inputValue[0].value.toString()
            }

            if (processedRule.hasOwnProperty(model)) {
                processedRule[model] = value
            } else if (processedRule.parameters.selection_criteria.hasOwnProperty(model)) {
                processedRule.parameters.selection_criteria[model] = value
            } else if (processedRule.parameters[activeParameter].hasOwnProperty(model)) {
                processedRule.parameters[activeParameter][model] = value
            }

            // if values for third and fourth tab are not set, set them with default data if needed
            if (processedRule.parameters.calculation_type.calculation_source === 'n_week_average' && processedRule.parameters.calculation_of_right.payroll_categories === '') {
                this.ruleModel.parameters.slice(2, 4).forEach(parameter => {
                    parameter.formElements.forEach(formElement => {
                        const camelCaseModel = stringHelper.camelize(formElement.model, '_')
                        processedRule.parameters[parameter.parameterName][formElement.model] = this.ruleModelOptions[`${camelCaseModel}Options`][0].value
                    })
                })
            }

            delete processedRule.rule_profiles_id

            this.save(processedRule)
        },
        /**
         * Get an array of ids, derived from an array of selected stores or store groups
         */
        getArrayOfIds (fullArray) {
            const arrayOfIds = []
            fullArray.forEach(item => {
                if (item.id) {
                    arrayOfIds.push(item.id.toString())
                } else if (item.store_id) {
                    arrayOfIds.push(item.store_id.toString())
                }
            })
            return arrayOfIds
        },
        /**
         * Create an array with multiple selected items in object format ({ value: ..., label: ... }) derived from array of strings
         */
        getFullArrayFromValueArray (rule, model) {
            const arrayOfObjects = []
            const camelCaseModel = stringHelper.camelize(model, '_')
            const labelIdentifier = this.indentifier(model, 'label')
            const valueIdentifier = this.indentifier(model, 'value')

            if (this[`${camelCaseModel}Options`]) {
                rule.parameters.selection_criteria[model].forEach(value => {
                    arrayOfObjects.push(this[`${camelCaseModel}Options`].find(o => o[labelIdentifier] === value))
                })
            } else if (this.ruleModelOptions[`${camelCaseModel}Options`]) {
                rule.parameters.selection_criteria[model].forEach(value => {
                    arrayOfObjects.push(this.ruleModelOptions[`${camelCaseModel}Options`].find(o => o[valueIdentifier] === value))
                })
            }
            return arrayOfObjects
        },
        /**
         * Create object ({ value: ..., label: ... }) from string value
         */
        getObjectFromValue (rule, parameter, model) {
            const camelCaseModel = stringHelper.camelize(model, '_')

            if (this.ruleModelOptions[`${camelCaseModel}Options`]) {
                if (rule.parameters[parameter].hasOwnProperty(model)) {
                    return this.ruleModelOptions[`${camelCaseModel}Options`].find(o => o.value === rule.parameters[parameter][model])
                }
            }
            return {}
        },
        /**
         * Create array of strings derived from select
         */
        getArrayOfValues (fullArray, identifier) {
            return fullArray.map(item => item[identifier])
        },
        /**
         * Get value of single select
         */
        singleValue (fullObject) {
            return fullObject.value
        },
        /**
         * Get translated label of parameter group (for tabs)
         */
        translatedParameterGroupHeading (parameterName) {
            const camelCaseName = stringHelper.camelize(parameterName, '_')
            return this.$t(`pages.holidayRules.modalTabLabels.${camelCaseName}`)
        },
        /**
         * Get translated label of form element
         */
        translatedLabel (model) {
            const camelCaseModel = stringHelper.camelize(model, '_')
            return this.$t(`pages.holidayRules.modalFormLabels.${camelCaseModel}`)
        },
        labelFromOptions (model, value) {
            const camelCaseModel = stringHelper.camelize(model, '_')
            return this.ruleModelOptions[`${camelCaseModel}Options`].find(o => o.value === value).label
        },
        options (model) {
            const camelizedModel = stringHelper.camelize(model, '_')
            if (this[`${camelizedModel}Options`]) {
                return this[`${camelizedModel}Options`]
            }
            return this.ruleModelOptions[`${camelizedModel}Options`]
        },
        /**
         * Fetch identifier (value or label) for given model
         */
        indentifier (model, type) {
            let identifier = type

            this.ruleModel.formElements.forEach(element => {
                if (element.model === model && element[`${type}Identifier`]) {
                    identifier = element[`${type}Identifier`]
                }
            })
            this.ruleModel.parameters.forEach(parameter => {
                parameter.formElements.forEach(element => {
                    if (element.model === model && element[`${type}Identifier`]) {
                        identifier = element[`${type}Identifier`]
                    }
                })
            })
            return identifier
        },
        isRequired (model) {
            let isRequired = false
            this.ruleModel.formElements.forEach(element => {
                if (element.model === model && element.required) {
                    isRequired = true
                }
            })
            this.ruleModel.parameters.forEach(parameter => {
                parameter.formElements.forEach(element => {
                    if (element.model === model && element.required) {
                        isRequired = true
                    }
                })
            })
            return isRequired
        },
        /**
         * Convert store_id and store_name property names to id and name or back (for stores list) because api output is not consistent
         */
        reworkPropertyNames (array) {
            const clonedArray = JSON.parse(JSON.stringify(array))
            clonedArray.forEach(item => {
                if (item.hasOwnProperty('store_id')) {
                    item.id = item.store_id
                    item.name = item.store_name
                    delete item.store_id
                    delete item.store_name
                } else {
                    item.store_id = item.id
                    item.store_name = item.name
                    delete item.id
                    delete item.name
                }
            })
            return clonedArray
        },
        /**
         * Convert value in rule object to actual selection as array of objects (for select form element)
         */
        getSelectedAsArray (rule, parameter, model) {
            const selection = []
            // get selected value(s) as array for cao
            if (model === 'cao' && this.caoOptions.length) {
                this.caoOptions.forEach(option => {
                    if (rule.parameters.selection_criteria.cao.includes(option.name)) {
                        selection.push(option)
                    }
                })
            } else if (rule.parameters[parameter][model] && rule.parameters[parameter][model].length) { // get selected value(s) as array for other parameters
                const valueIdentifier = this.indentifier(model, 'value')
                const camelizedModel = stringHelper.camelize(model, '_')

                if (this.ruleModelOptions[`${camelizedModel}Options`]) {
                    this.ruleModelOptions[`${camelizedModel}Options`].forEach(option => {
                        if (rule.parameters[parameter][model].includes(option[valueIdentifier])) {
                            selection.push(option)
                        }
                    })
                }
            }
            return selection
        },
        /**
         * Create rule object for display of data in data table
         */
        buildRuleObject (rule) {
            const ruleObject = { id: rule.id }

            ruleObject.name = rule.name
            ruleObject.name_selected = rule.name

            ruleObject.stores = this.storesOrStoreGroupsLabel(rule.stores, true)
            ruleObject.stores_selected = this.reworkPropertyNames(rule.stores)
            ruleObject.stores_amount = rule.stores.length

            ruleObject.store_groups = this.storesOrStoreGroupsLabel(rule.store_groups, false)
            ruleObject.store_groups_selected = rule.store_groups
            ruleObject.store_groups_amount = rule.store_groups.length

            this.ruleModel.parameters.forEach(parameter => {
                parameter.formElements.forEach(element => {
                    let identifier = element.model
                    if (!this.mainParameters.includes(element.model)) {
                        identifier = `${parameter.parameterName}_${element.model}`
                    }
                    if (element.multiselect && rule.parameters[parameter.parameterName] && rule.parameters[parameter.parameterName][element.model]) {
                        ruleObject[identifier] = this.selectionCriteriaLabel(element.model, rule.parameters[parameter.parameterName][element.model])
                        ruleObject[`${identifier}_selected`] = this.getSelectedAsArray(rule, parameter.parameterName, element.model)
                        ruleObject[`${identifier}_amount`] = this.getSelectedAsArray(rule, parameter.parameterName, element.model).length
                    } else if (element.type === 'Select' && rule.parameters[parameter.parameterName] && rule.parameters[parameter.parameterName][element.model]) {
                        ruleObject[`${identifier}`] = this.labelFromOptions(element.model, rule.parameters[parameter.parameterName][element.model])
                        ruleObject[`${identifier}_selected`] = this.getSelectedAsArray(rule, parameter.parameterName, element.model)
                    } else if (rule.parameters[parameter.parameterName]) {
                        ruleObject[identifier] = rule.parameters[parameter.parameterName][element.model]
                        ruleObject[`${identifier}_selected`] = rule.parameters[parameter.parameterName][element.model]
                    }
                })
            })

            return ruleObject
        },
        /**
         * Convert rule object for editing in modal
         */
        buildRuleObjectForModal (rule) {
            const ruleObject = { id: rule.id }

            ruleObject.name = rule.name
            ruleObject.stores = this.reworkPropertyNames(rule.stores)
            ruleObject.store_groups = rule.store_groups
            ruleObject.parameters = {}

            this.ruleModel.parameters.forEach(parameter => {
                ruleObject.parameters[parameter.parameterName] = {}
                parameter.formElements.forEach(element => {
                    if (element.multiselect) {
                        ruleObject.parameters[parameter.parameterName][element.model] = this.getFullArrayFromValueArray(rule, element.model)
                    } else if (element.type === 'Select') {
                        ruleObject.parameters[parameter.parameterName][element.model] = this.getObjectFromValue(rule, parameter.parameterName, element.model)
                    } else if (element.type === 'Switch') {
                        ruleObject.parameters[parameter.parameterName][element.model] = rule.parameters[parameter.parameterName][element.model]
                    }
                })
            })

            return ruleObject
        },
        /**
         * Crud input is enabled (for store or store_groups input); either one of them can be set
         */
        crudInputIsEnabled (model, rule) {
            if (model === 'stores' && rule.store_groups_selected.length) {
                return false
            } else if (model === 'store_groups' && rule.stores_selected.length) {
                return false
            }
            return true
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/mixins/_breakpoints.scss';
    @import '@/assets/scss/mixins/_ellipsis.scss';
    @import '@/assets/scss/shaddows.scss';

    .bar-plus-button {
        position: relative;
        top: 6px !important;
    }

    .label-with-badge {
        display: flex;
        justify-content: space-between;

        .label-aside-badge {
            max-width: 50vw;
            @include ellipsis();
            vertical-align: bottom;

            @include bp-sm {
                max-width: 80px;
            }

            @include bp-lg {
                max-width: 112px;
            }
        }
    }

    h6 {
        margin: 16px 0 4px;
        color: $grey-140;
        font-size: 12px;
        font-weight: 700;
        &.hidden {
            display: none;
        }
    }

    .sub-table {
        box-shadow: $shaddow-2p;

        &.hidden {
            display: none;
        }

        th, td {
            @include bp-sm {
                height: 32px !important;
                padding: 0 16px !important;
                border: none;
            }
        }
    }

    .popover-buttons {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }

    .crud-input.active + .v-badge {
        display: none;
    }

    :deep() {
        .data-table-actions-cell {
            @include bp-sm {
                min-width: 104px !important;
                width: 104px;
                padding-right: 0 !important;
            }
        }

        .badge-aside-label {
            position: relative;
            display: block;
            width: 20px;
            height: 20px;
            margin-left: -4px;

            &> .v-badge__wrapper {
                position: relative;
                display: block;
                top: 0;
                left: auto;
                right: 24px;

                @include bp-sm {
                    right: 12px;
                }

                .v-badge__badge {
                    top: 0 !important;
                    font-size: 10px !important;
                    font-weight: 700 !important;
                }
            }
        }

        .v-data-table__wrapper > table > tbody > tr > td {
            @include bp-sm {
                border-bottom: 1px solid $grey-40 !important;
            }
        }

        tr.v-data-table__expanded.v-data-table__expanded__row td {
            background: rgba($primary-color, 0.05) !important;
            border-bottom: none !important;
        }

        tr.v-data-table__expanded.v-data-table__expanded__content td {
            padding-bottom: 16px;
            background: rgba($primary-color, 0.05) !important;

            .sub-table td {
                background: white !important;
            }
        }

        .theme--light.v-data-table > .v-data-table__wrapper > table > tbody > tr:hover {
            background: transparent !important;
        }

        .v-alert {
            font-size: 12px;
            font-weight: 700;

            .v-icon {
                font-size: 16px;
            }
        }
    }
</style>
