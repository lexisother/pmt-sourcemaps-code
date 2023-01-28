<!-- eslint-disable vue/no-v-html -->
<template>
    <div ref="productiveShift">
        <PmtInfo
            v-if="hasWabWarning"
            warning
        >
            {{ baseTranslate('warnings.extraPayout') }}
            <div
                v-tooltip="wabWarningInfoTooltip(employee, false, $moment(localShift.start_datetime))"
                class="float-right"
            >
                <InformationOutline
                    :size="16"
                    title=""
                    class="shift-cla-info"
                />
            </div>
        </PmtInfo>
        <!-- SHIFT TAB HEADERS -->
        <VTabs
            v-if="showTabsHeaders && !isNonProductive && !localShift.notAssigned && !isStandard"
            v-model="selectedShiftTab"
            background-color="transparent"
            hide-slider
            fixed-tabs
            height="40"
            class="shift-tabs"
        >
            <VTab
                v-for="(tab, index) in shiftTabs"
                :key="index"
                :ref="tab.ref"
            >
                <div class="tab-text">
                    <VBadge
                        class="count-badge"
                        inline
                        :color="tab.color"
                        :content="tab.badge"
                        :value="tab.badge > 0"
                    >
                        <div>{{ tab.text }} <span v-if="tab.additionalText">{{ tab.additionalText }}</span></div>
                    </VBadge>
                </div>
            </VTab>
        </VTabs>
        <!-- SHIFT AND INDIRECT TASKS TAB ITEMS -->
        <VTabsItems
            v-model="selectedShiftTab"
            class="shift-tabs-items"
            :class="{'no-header-tabs': isNew || !CAN_READ_INDIRECT_HOURS_OR_TASKS || (isLentOut && !CAN_ADD_INDIRECT_HOURS_ON_EXCHANGE_SHIFT) || isNonProductive || localShift.notAssigned || isStandard}"
            :style="tabItemsStyle"
        >
            <VTabItem class="px-1">
                <Chip
                    v-if="indirectHoursExceedShift(employee, shift)"
                    ref="indirectTasksError"
                    outline
                    error
                    text-left
                    style="text-align: left;"
                >
                    {{ $t('apiErrors.shifts.indirectHoursExceedsWork') }}
                </Chip>
                <ShiftFormInputs
                    ref="shiftFormInputs"
                    :shift="localShift"
                    :employee="employee"
                    :saving="saving"
                    :over-the-night="overTheNight"
                    :backup-shift="originalShift"
                    :is-new-from-grid="isNewFromGrid"
                    :is-new-from-topbar="isNewFromTopbar"
                    @enter="$emit('enter', $event)"
                    @update="localShift = $event; $emit('update', $event)"
                    @overlap="hasShiftsOverlap = $event"
                    @duration-blur="durationBlur($event)"
                    @break-blur="breakBlur($event)"
                >
                    <template #shift-duration>
                        {{ shiftDuration(localShift).format('HH:mm') }}
                    </template>
                </ShiftFormInputs>
                <div
                    v-if="!isNonProductive"
                    class="overlaps-non-plannable-info"
                >
                    <ShiftOverlapInfo
                        :shift="localShift"
                        :has-shifts-overlap="hasShiftsOverlap"
                    />
                    <PmtButton
                        v-if="!isDayView && !IS_MOBILE && !isCheckHours && shiftHasNonPlannableOverlap(localShift) && !settings.alwaysShowAvailabilityWeekViewEmployeeClick"
                        primary
                        inverted
                        small
                        tab-index="-1"
                        @click="$emit('toggle:availability')"
                    >
                        <span v-if="hasExpandedAvailability">
                            {{ $t('ui.singles.hide') }}
                        </span>
                        <span v-else>
                            {{ $t('ui.singles.show') }}
                        </span>
                    </PmtButton>
                </div>
                <Chip
                    v-if="exceeds24Hours"
                    error
                    inverted
                    :text="baseTranslate('warnings.cannotBeLongerThan24Hours')"
                />
                <!-- STORE SELECT -->
                <div
                    v-if="showStoreDropdown"
                    v-tooltip="!canExhangeWithIndirectHours ? baseTranslate('warnings.cannotExchangeWithIndirectTasks') : ''"
                    class="form-field pt-3"
                >
                    <PSelect
                        ref="storeSelect"
                        v-model="selectedExchangeStoreOption"
                        cy_id="storeSelect"
                        :label="$t('ui.singles.store')"
                        :searchable="exchangeStoreOptions.length > 10"
                        :items="exchangeStoreOptions"
                        item-value="key"
                        :placeholder="!localSelectedStore.store_name ? baseTranslate('placeholders.selectStore') : ''"
                        :disabled="!canExhangeWithIndirectHours || saving"
                        @input="storeSelected($event)"
                    >
                        <template
                            v-if="localSelectedStore"
                            #selected-label
                        >
                            <div class="selected-title">
                                {{ localSelectedStore.store_name }}
                            </div>
                            <div class="selected-sub-title">
                                <template v-if="localSelectedStore.store_name && !localSelectedStore.store_name.includes(localSelectedStore.retail_store_number)">
                                    {{ baseTranslate('shiftPopover.storeNumber') }}: {{ localSelectedStore.retail_store_number }}
                                </template>
                                <template v-else-if="!localSelectedStore.store_name">
                                    {{ baseTranslate('shiftPopover.storeNotAvailableForExchange') }} ID: <strong>{{ localShift.exchange_store_id }}</strong>
                                </template>
                            </div>
                        </template>
                        <template #item="{ item }">
                            <VListItemTitle>
                                {{ item.label }}
                            </VListItemTitle>
                            <VListItemSubtitle v-if="item.value.store_name && !item.value.store_name.includes(item.value.retail_store_number)">
                                {{ baseTranslate('shiftPopover.storeNumber') }}: {{ item.subTitle }}
                            </VListItemSubtitle>
                        </template>
                    </PSelect>
                    <a
                        v-if="!!localSelectedStore.store_name && (isLentOut || localShift.type === 'EXCH')"
                        ref="clearStoreSelection"
                        cy_id="clearStoreSelection"
                        class="cancel-lend-out"
                        tabindex="0"
                        @click="clearStore()"
                        @keyup.enter="clearStore()"
                    >
                        {{ baseTranslate('shiftPopover.clearStore') }}
                    </a>
                </div>
                <div
                    v-else-if="!isNonProductive && !localShift.nonProductive"
                    class="form-field pt-3"
                >
                    <label>{{ $t('ui.singles.store') }}</label>
                    <SingleStore
                        tag="div"
                        :store="localSelectedStore"
                        show-subtitle
                        class="store-name"
                    />
                </div>

                <!-- DEPARTMENT SELECT -->
                <div
                    v-if="showDepartmentDropdown"
                    class="form-field pt-3"
                >
                    <PSelect
                        ref="departmentField"
                        v-model="selectedDepartmentOption"
                        cy_id="departmentField"
                        :items="departmentOptions"
                        item-value="key"
                        :label="$t('ui.singles.department')"
                        :placeholder="!localSelectedStore.store_id ? baseTranslate('placeholders.selectStoreFirst') : baseTranslate('placeholders.selectDepartment')"
                        :disabled="saving"
                        :loading="loading.employeeDepartments"
                        @input="departmentSelected($event)"
                    >
                        <template
                            v-if="Object.keys(localSelectedDepartment).length"
                            #selected-label="{ selected }"
                        >
                            <div class="selected-title">
                                {{ selected ? selected.label : '' }}
                            </div>
                            <div class="selected-sub-title">
                                <template v-if="isLentOut && localSelectedStore.store_name">
                                    {{ localSelectedStore.store_name }}
                                </template>
                                <template v-else>
                                    {{ departmentSubTitle(localSelectedDepartment, localSelectedStore, localShift) || null }}
                                </template>
                            </div>
                        </template>
                        <template #item="{ item }">
                            <VListItemTitle>
                                {{ item.label }}
                            </VListItemTitle>
                            <VListItemSubtitle
                                v-if="item.subTitle"
                            >
                                {{ item.subTitle }}
                            </VListItemSubtitle>
                        </template>
                    </PSelect>
                </div>
                <div
                    v-else-if="!isNonProductive"
                    class="form-field pt-3"
                >
                    <label>{{ $t('ui.singles.department') }}</label>
                    <Department
                        tag="div"
                        :department="localSelectedDepartment"
                        class="department-name"
                    />
                </div>

                <!-- EMPLOYEE SELECT -->
                <div
                    v-if="!fromTopBar && (originalShift.notAssigned || (isNew && localShift.notAssigned))"
                    class="form-field pt-3"
                >
                    <PSelect
                        ref="employeeField"
                        v-model="localSelectedEmployee"
                        cy_id="employeeField"
                        :label="$t('ui.singles.employee')"
                        item-label="name"
                        item-value="account_id"
                        :placeholder="baseTranslate('contextMenu.assignEmployee')"
                        :disabled="saving"
                    >
                        <template #items>
                            <QuickEmployeesSuggestions
                                ref="quickEmployeeSuggestion"
                                :shift="localShift"
                                :for-non-productive="localShift.nonProductive"
                                :known-foreign-type="localShift.foreign_type"
                                auto-load-employees
                                :employee="employee"
                                @select-employee="employeeSelected($event.newEmployee)"
                                @another-employee="$emit('another-employee')"
                            />
                        </template>
                    </PSelect>
                </div>

                <div class="pt-3">
                    <BookableHoursCascadeSelect
                        v-if="isNonProductive"
                        :key="Object.keys(selectedBookableHourType).length && Object.keys(selectedBookableHourForeignType).length"
                        :hour-type-options="bookableHourTypesOptions(selectedBookableHourType)"
                        :hour-foreign-type-options="bookableHourForeignTypeOptions(selectedBookableHourType, selectedBookableHourForeignType)"
                        :selected-bookable-hour-type="selectedBookableHourType"
                        :selected-bookable-hour-foreign-type="selectedBookableHourForeignType"
                        @update-bookable-hour-type="updateBookableHourType($event)"
                    />
                </div>

                <!-- SHIFT REMARK -->
                <div
                    v-if="!isNonProductive && CAN_READ_REMARKS"
                    class="form-field pt-3"
                >
                    <PTextArea
                        ref="shiftRemark"
                        v-model="localShift.remark"
                        name="shift-remark"
                        cy_id="shiftRemark"
                        :label="$t('ui.singles.remark')"
                        :disabled="!CAN_MANAGE_REMARKS || saving"
                        :rows="2"
                        class="shift-remark"
                        @enter="$emit('enter')"
                        @input="updateRemark"
                    />
                    <a
                        v-if="CAN_MANAGE_REMARKS"
                        :class="{'delete-remark': true, 'disabled': localShift.remark === ''}"
                        @click="localShift.remark = ''"
                    >
                        {{ baseTranslate('shiftPopover.deleteRemark') }}
                    </a>
                </div>
            </VTabItem>
            <VTabItem v-if="!isStandard && (!isLentOut || (isLentOut && CAN_ADD_INDIRECT_HOURS_ON_EXCHANGE_SHIFT))">
                <IndirectTasks
                    ref="indirectTasks"
                    :shift="localShift"
                    :employee="employee"
                    @update="indirectHoursUpdate"
                />
            </VTabItem>
        </VTabsItems>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'ProductiveShift',
    components: {
        QuickEmployeesSuggestions: () => import('@/pages/planning/scheduling/components/QuickEmployeesSuggestions'),
        IndirectTasks: () => import('@/pages/planning/scheduling/components/popovers/IndirectTasks'),
        ShiftFormInputs: () => import('@/pages/planning/scheduling/components/popovers/ShiftFormInputs'),
        ShiftOverlapInfo: () => import('@/pages/planning/scheduling/components/ShiftOverlapInfo'),
        BookableHoursCascadeSelect: () => import('@/components/ui/form/BookableHoursCascadeSelect'),
    },
    mixins: [mixins],
    props: {
        overTheNight: Boolean,
        shift: {
            type: Object,
            required: true,
        },
        employee: {
            type: Object,
            required: true,
        },
        originalShift: {
            type: Object,
            required: true,
        },
        isNewFromGrid: Boolean,
        isNewFromTopbar: Boolean,
        selectedEmployee: {
            type: Object,
            default: () => ({}),
        },
        selectedDepartment: {
            type: Object,
            default: () => ({}),
        },
        selectedStore: {
            type: Object,
            default: () => ({}),
        },
        minHeight: {
            type: Number,
            default: 350,
        },
        isNonProductive: {
            type: Boolean,
            default: false,
        },
        nonProductiveType: {
            type: String,
            default: 'start-end-times',
        },
        selectedBookableHourType: {
            type: Object,
            default: () => ({}),
        },
        selectedBookableHourForeignType: {
            type: Object,
            default: () => ({}),
        },
        hasWabWarning: {
            type: Boolean,
            default: false,
        },
        fromTopBar: {
            type: Boolean,
            default: false,
        },
        saving: {
            type: Boolean,
            default: false,
        },
        hasExpandedAvailability: Boolean,
    },
    data () {
        return {
            remark: '',
            selectedShiftTab: 0,
            hasShiftsOverlap: false,
            localShift: null,
            localSelectedEmployee: {},
            localSelectedDepartment: {},
            localSelectedStore: {},
            employeeSelectorMenu: false,
            selectedExchangeStoreOption: {},
            selectedDepartmentOption: {},
        }
    },
    computed: {
        isLentOut () {
            return this.localShift?.exchange_store_id && this.localShift?.store_id === this.currentStore.id
        },
        isNew () {
            return this.localShift?.isNew
        },
        canAddIndirectTasks () {
            return this.CAN_READ_INDIRECT_HOURS_OR_TASKS && (!this.isNew || this.isNewFromGrid)
        },
        canAddIndirectTasksOnExchange () {
            return !this.isLentOut || (this.isLentOut && this.CAN_ADD_INDIRECT_HOURS_ON_EXCHANGE_SHIFT)
        },
        canExhangeWithIndirectHours () {
            if (this.CAN_ADD_INDIRECT_HOURS_ON_EXCHANGE_SHIFT) return true
            const hasHours = !!this.shiftIndirectHours(this.localShift).length
            return !hasHours || (!this.canAddIndirectTasksOnExchange && hasHours)
        },
        exceeds24Hours () {
            const from = this.$moment(this.localShift.start_datetime)
            const to = this.$moment(this.localShift.end_datetime)
            return this.$moment.duration(to.diff(from)).asMinutes() > (24 * 60)
        },
        showStoreDropdown () {
            if (this.isNonProductive) return false
            const showInStandardOrPlanning = this.isStandard ? this.isNew : true
            return this.canExchange && showInStandardOrPlanning
        },
        canExchange () {
            return !this.localShift.notAssigned && this.CAN_EXCHANGE_TO_OTHER_STORES && this.exchangeStores.length
        },
        shiftTabs () {
            const tabs = []
            if ((!this.isNew) || this.isNewFromGrid) {
                tabs.push({
                    text: this.baseTranslate('shiftPopover.shiftTabs.productive'),
                    color: 'primary',
                    ref: 'productiveShiftTab',
                    additionalText: this.selectedShiftTab !== 0 ? `(${this.shiftDuration(this.shift).format('HH:mm')})` : '',
                })
            }
            if (this.canAddIndirectTasks && this.canAddIndirectTasksOnExchange) {
                const indirectHours = !this.employee.notAssigned ? this.localShift.indirect_hours : []
                tabs.push({
                    text: this.baseTranslate('shiftPopover.shiftTabs.indirectTasks'),
                    badge: indirectHours.filter(h => !h.toDelete).length,
                    color: this.indirectHoursExceedShift(this.employee, this.localShift) && this.selectedShiftTab === 0 ? 'error' : 'primary',
                    ref: 'indirectTasksTabHeader',
                })
            }
            return tabs
        },
        exchangeStoreOptions () {
            return this.exchangeStores.filter(s => s.store_id !== this.currentStore.id).map(store => {
                return {
                    label: `${store.store_name}`,
                    subTitle: !store.store_name.includes(store.retail_store_number) ? `${this.baseTranslate('shiftPopover.storeNumber')}: ${store.retail_store_number}` : '',
                    key: store.store_id,
                    selected: this.localSelectedStore.store_id === store.store_id,
                    value: store,
                    disabled: false,
                    hidden: false,
                    simple: true,
                }
            })
        },
        /**
         * List of departments for the departments select component
         * @return {Array}
         */
        departmentOptions () {
            return this.departmentSelectOptions({
                selectedDepartment: this.localSelectedDepartment,
                selectedStore: this.localSelectedStore,
                shift: this.localShift,
            })
        },
        showTabsHeaders () {
            return this.canAddIndirectTasks && this.canAddIndirectTasksOnExchange
        },
        tabItemsStyle () {
            const style = {
                minHeight: this.minHeight + 'px',
            }
            if (this.selectedShiftTab === 1) {
                style.maxHeight = this.minHeight + 'px'
                style.overflowY = 'auto'
            } else if (this.localShift.nonProductive && this.nonProductiveType === 'start-end-times') {
                style.minHeight = this.minHeight - 60 + 'px'
                style.maxHeight = this.minHeight - 60 + 'px'
            } else if (this.nonProductiveType === 'duration') {
                style.minHeight = this.minHeight - 100 + 'px'
                style.maxHeight = this.minHeight - 100 + 'px'
            }
            return style
        },
        otherOverlaps () {
            return this.shiftHasOverlap(this.localShift)
        },
        showDepartmentDropdown () {
            if (!this.localShift.isNew && this.isStandard) return false
            if (this.fromTopBar) return true
            if (this.isNonProductive) return false
            // for standard shifts only show the dropdown if the shift is new
            if (this.isLentOut || this.originalShift.lentOut) return true
            return true
        },
        forNonProductive () {
            return this.shift?.nonProductive
        },
        knownForeignType () {
            return this.shift?.foreign_type
        },
    },
    watch: {
        selectedEmployee: {
            handler (newVal) {
                this.localSelectedEmployee = newVal
            },
            deep: true,
        },
        selectedStore: {
            handler (newVal) {
                this.localSelectedStore = newVal
            },
            deep: true,
        },
        selectedDepartment: {
            handler (newVal) {
                this.localSelectedDepartment = newVal
            },
            deep: true,
        },
        isNonProductive: {
            handler (newVal) {
                if (newVal) {
                    this.selectedShiftTab = 0
                }
                this.localShift.nonProductive = newVal
                this.$emit('update', this.localShift)
            },
        },
    },
    created () {
        this.localShift = { ...this.shift }
        this.localSelectedEmployee = this.selectedEmployee
        this.localSelectedDepartment = this.selectedDepartment
        this.localSelectedStore = this.selectedStore

        if (this.localShift.editIndirectTasks) {
            this.selectedShiftTab = 1
        } else {
            this.selectedShiftTab = 0
        }
    },
    async mounted () {
        setTimeout(() => {
            // force focus on time-from text input and select all text within
            const inputId = this.isNonProductive && this.nonProductiveType === 'duration' ? 'shift-duration-time-input' : 'time-range-time-from-input'
            const timeInput = document.getElementById(inputId)
            if (timeInput && timeInput.focus) {
                timeInput.focus()
                timeInput.setSelectionRange(0, timeInput.value.length)
            }

            // set dedicated v-models to handle PSelect interaction properly
            this.selectedExchangeStoreOption = this.defaultSelectedExchangeStoreOption()
            this.selectedDepartmentOption = this.defaultSelectedDepartmentOption()
        }, this.localShift.isNew ? 300 : 0)

        if (this.localShift.isNew && this.isStandard && this.selectedGridAccount()) {
            const row = this.employee.frequencyRows.find(r => r.id === this.localShift.frequencyId)
            if (!row) return false // fail safe when row is not found.
            const from = row.from.startOf('isoWeek').clone()
            const to = row.to?.startOf('isoWeek').clone() || null
            const employeeDepartments = await this.getEmployeeDepartments({
                account_id: this.selectedGridAccount().account_id,
                date: from,
                from,
                to,
            })

            const departmentAvailable = employeeDepartments.find(dep => dep.department_id === this.localShift.department_id)
            const selectedDepartment = !departmentAvailable ? employeeDepartments[0] : departmentAvailable

            this.localShift.department_id = selectedDepartment.department_id
            this.$emit('update-department', selectedDepartment)
            this.$emit('update', this.localShift)
            this.localSelectedDepartment = selectedDepartment
            this.selectedDepartmentOption = {
                key: selectedDepartment.department_id,
                label: selectedDepartment.department_name,
                value: selectedDepartment,
            }
        }
    },
    methods: {
        async durationBlur (event) {
            this.localShift.duration = event
            this.$emit('update', this.localShift)
        },
        disabledMiniDateNavigation (prop) {
            const amount = this.CAN_ADD_OVERNIGHT_SHIFTS ? 1 : 0
            const dateGuide = this.SELECTED_DATE.clone()
            if (prop === 'from') {
                return this.$moment(this.localShift.start_datetime)
                    .isSame(dateGuide.startOf('isoWeek').subtract(amount, 'days'), 'day')
            } else {
                return this.$moment(this.localShift.end_datetime)
                    .isAfterOrSameDayAs(dateGuide.endOf('isoWeek').add(amount, 'days'))
            }
        },
        defaultSelectedExchangeStoreOption () {
            return {
                value: this.selectedStore,
                label: this.selectedStore.store_name,
                key: this.selectedStore.store_id,
            }
        },
        storeSelected (event) {
            if (!event.value.store_id) {
                this.clearStore()
                return
            }
            this.selectedExchangeStoreOption = event
            this.localShift.lentOut = !!event.value.store_name
            this.localShift.exchange_store_id = event.value.store_id
            this.localSelectedStore = event.value
            this.$emit('update-store', event.value)
            this.$emit('update', this.localShift)
            if (this.$refs.departmentField) {
                this.$refs.departmentField.setFocus()
            } else if (this.$refs.employeeField) {
                this.$refs.employeeField.setFocus()
            } else if (this.$refs.shiftRemark) {
                this.$refs.shiftRemark.focus()
            }
        },
        defaultSelectedDepartmentOption () {
            return {
                value: this.selectedDepartment,
                label: this.selectedDepartment.department_name,
                key: this.selectedDepartment.department_id,
            }
        },
        /**
         * Called when a department is selected from the department select component
         */
        departmentSelected (event) {
            this.selectedDepartmentOption = event
            this.localShift.department_id = event.value.id || event.value.department_id
            this.localSelectedDepartment = event.value
            this.$emit('update-department', event.value)
            this.$emit('update', this.localShift)
            if (this.$refs.employeeField) {
                this.$refs.employeeField.setFocus()
            } else if (this.$refs.shiftRemark) {
                this.$refs.shiftRemark.focus()
            }
        },
        /**
         * Called when an employee is selected from the employee select component
         */
        employeeSelected (employee) {
            this.localShift.assignNotAssignedShiftToEmployee = true
            this.localSelectedEmployee = employee
            this.localShift.account_id = employee.account_id
            this.localShift.notAssigned = false
            this.$emit('update-employee', employee)
            this.$emit('update', this.localShift)
            if (this.$refs.shiftRemark) {
                this.$refs.shiftRemark.focus()
            }
        },

        updateRemark () {
            this.$emit('update-remark', this.localShift.remark)
        },

        async clearStore () {
            this.selectedExchangeStoreOption = this.defaultSelectedExchangeStoreOption()
            this.$emit('update-store', {})
            this.localShift.exchange_store_id = null
            const departmentOptions = this.departmentSelectOptions({
                selectedDepartment: this.localSelectedDepartment,
                selectedStore: this.localSelectedStore,
                shift: this.localShift,
            })
            const found = departmentOptions.find(dep => dep.key === this.localShift.department_id)
            if (found) {
                this.localSelectedDepartment = found.value
                this.$emit('update-department', this.localSelectedDepartment)
            }
        },
        updateBookableHourType (event) {
            this.$emit('update-bookable-hour-type', event.selectedType)
            this.$emit('update-bookable-hour-foreign-type', event.selectedForeignType)
            this.localShift.type = event.selectedType.type || 'G'
            this.localShift.foreign_type = event.selectedForeignType.foreign_type
            this.localShift.nonProductive = true
            this.localShift.nonProductiveSimple = true
            this.$emit('update', this.localShift)
        },
        breakBlur (breakDuration) {
            this.localShift.breaks = [{ duration: breakDuration }]
            this.$emit('break-blur', breakDuration)
            this.$emit('update', this.localShift)
        },

        indirectHoursUpdate (shift) {
            this.localShift = shift
            this.$emit('update-indirect-hours', shift)
        },
    },
}
</script>
<style lang="scss" scoped>
@import './styling/scheduling-grid-form.scss';
.shift-cla-info {
    vertical-align: initial;
}
.department-name, .store-name {
    margin-top: 5px;
    padding: 0 9px !important;
    height: 38px;
    line-height: 36px;
    background-color: var(--grey-10) !important;
}

.store-name {
    padding: 2px 9px !important;
}

.from-date-label, .to-date-label {
    text-align: center;
}
.sub-title {
    font-size: 12px;
    color: var(--grey-80);
}
.overlaps-non-plannable-info {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
}

:deep(.selected-title) {
    line-height: 18px;
    color: var(--grey-200);
}

:deep(.selected-sub-title) {
    color: var(--grey-100) !important;
    font-size: 12px;
    line-height: 12px;
}

.v-list-item__title {
    line-height: 16px;
}

.v-list-item__subtitle {
    color: var(--grey-80) !important;
    font-size: 12px;
    line-height: 12px;
}

</style>
