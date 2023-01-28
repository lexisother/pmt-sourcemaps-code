<template>
    <pmt-side-panel
        v-if="weekset.start_date"
        :title="!IS_MOBILE ? $t('sidePanels.availabilityWeeklyDetails.titles.new') : ''"
        :border-left="borderLeft"
        :padding="false"
        :show-close="showClose"
        :confirm-close="!!weeksetChanges.length"
        :confirm-message="$t('sidePanels.availabilityWeeklyDetails.sections.unsavedChanges') + $t('sidePanels.availabilityWeeklyDetails.sections.closeAnyway')"
        header-icon="clock-check-outline"
        class="availability-weekly-details-side-panel"
        @close="$emit('close')"
    >
        <div
            v-if="weeksetCopy && !isEditingMode"
            class="padding"
        >
            <pmt-transition
                ref="viewWeeksetDetails"
                name="slide"
                mode="in-out"
                :direction="'right'"
            >
                <div>
                    <simple-list-item
                        v-if="titleUsername"
                        ref="user"
                        :title="$t('entities.common.employee')"
                    >
                        <template #subtitle>
                            {{ titleUsername }}
                        </template>
                    </simple-list-item>
                    <simple-list-item
                        ref="weeksetName"
                        :title="$t( 'forms.availabilityWeeklyEntry.title.label' )"
                        :sub-title="weeksetName"
                    />
                    <simple-list-item
                        v-if="weekset.created.account_id"
                        ref="changeBy"
                        :title="$t( 'forms.availabilityWeeklyEntry.submittedField.label' )"
                    >
                        <template #subtitle>
                            <changed-by
                                show-created
                                :show-icon="false"
                                :account_id="weekset.created.account_id"
                                :modified_date="weekset.created.datetime"
                                :no-padding="true"
                            />
                        </template>
                    </simple-list-item>
                    <simple-list-item
                        v-if="showModifiedField"
                        ref="modifiedBy"
                        :title="$t( 'forms.availabilityWeeklyEntry.modifiedField.label' )"
                    >
                        <template #subtitle>
                            <changed-by
                                show-modified
                                :show-icon="false"
                                :account_id="weekset.last_modified.account_id"
                                :modified_date="weekset.last_modified.datetime"
                                :no-padding="true"
                            />
                        </template>
                    </simple-list-item>
                    <simple-list-item
                        ref="weeksetStartDate"
                        :title="$t('forms.availabilityWeeklyEntry.fromField.label')"
                        :sub-title="weekset.start_date ? $moment(weekset.start_date).longDayFormat() : '-'"
                    />
                    <simple-list-item
                        ref="weeksetEndDate"
                        :title="$t('forms.availabilityWeeklyEntry.toField.label')"
                        :sub-title="weekset.end_date ? $moment(weekset.end_date).longDayFormat() : '-'"
                    />
                    <simple-list-item
                        ref="weeksetStatus"
                        :title="$t('forms.availabilityWeeklyEntry.statusField.label')"
                    >
                        <template #subtitle>
                            <weekset-status
                                :status="weeksetCopy.status"
                                :status-name="$t('entities.weekset.status.' + weeksetCopy.status)"
                            />
                        </template>
                    </simple-list-item>
                    <simple-list-item
                        ref="weeksetEmployeeRemark"
                        :title="$t('forms.availabilityWeeklyEntry.remarkField.label')"
                        :sub-title="weekset.employee_comment || '-'"
                    />
                    <simple-list-item
                        ref="weeksetManagerRemark"
                        :title="$t('forms.availabilityWeeklyEntry.remarkManagerField.label')"
                        :sub-title="weekset.manager_comment || '-'"
                    />
                </div>
            </pmt-transition>
        </div>
        <div
            v-if="isEditingMode"
            class="padding"
        >
            <pmt-transition
                name="slide"
                mode="in-out"
                :direction="'left'"
            >
                <edit-weekset-form
                    v-if="!!weeksetCopy"
                    :key="editFormKey"
                    ref="editWeeksetForm"
                    :weekset="weeksetCopy"
                    :week-finalized="weekFinalized"
                    :weekset-employee="weeksetEmployee"
                    @cancel="cancel"
                    @save="$emit('close')"
                    @status-updated="updateStatus($event); $emit('close')"
                />
            </pmt-transition>
        </div>
        <div
            v-if="weekset"
            class="padding"
        >
            <pmt-transition
                name="slide"
                mode="in-out"
                :direction="'left'"
            >
                <div>
                    <pmt-button
                        v-if="isEditable && !isEditingMode"
                        primary
                        medium
                        icon="calendar-edit"
                        icon-size="15"
                        @click="replaceRoute('edit-weekset')"
                    >
                        {{ $t('sidePanels.availabilityWeeklyDetails.sections.edit') }}
                    </pmt-button>
                    <weekset-quick-actions
                        v-if="!isEditingMode"
                        :item="weeksetCopy"
                        big
                        :show-reject="showReject"
                        @showReject="showReject = weeksetCopy.id"
                        @hidePopover="showReject = 0"
                        @statusUpdated="updateStatus($event)"
                    />
                </div>
            </pmt-transition>
        </div>
    </pmt-side-panel>
</template>

<script>
import SidePanel from '@/components/ui/side-panels/SidePanel.vue'
import EditWeeksetForm from '../Forms/EditWeeksetForm.vue'
import WeeksetStatus from './Components/WeeksetStatus.vue'
import WeeksetQuickActions from './Components/WeeksetQuickActions.vue'
import * as vuex from 'vuex'
import availabilityHelper from '@/libraries/availabilityHelper'
export default {
    components: {
        'pmt-side-panel': SidePanel,
        WeeksetStatus,
        EditWeeksetForm,
        WeeksetQuickActions,
    },
    props: {
        borderLeft: {
            type: Boolean,
            default: true,
        },
        showClose: {
            type: Boolean,
            default: true,
        },
        weekset: {
            type: Object,
            default: () => ({}),
        },
        weekFinalized: {
            type: Boolean,
            default: true,
        },
    },
    data () {
        return {
            editFormKey: 0,
            showReject: 0,
            originalStartDate: '',
            weeksetHasChanges: false,
        }
    },
    computed: {
        ...vuex.mapState('account', {
            employees: 'employees',
        }),
        ...vuex.mapState('availability', {
            employeeId: 'availabilityEmployeeId',
            weeksetChanges: 'weeksetChanges',
        }),
        ...vuex.mapGetters('auth', ['user']),
        ...vuex.mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        weeksetName () {
            return availabilityHelper.getWeekSetName(this.weekset)
        },
        showModifiedField () {
            if (this.weekset.last_modified && this.weekset.last_modified.account_id) {
                return !this.$moment(this.weekset.created.datetime).isSame(this.$moment(this.weekset.last_modified.datetime), 'minute')
            }
            return false
        },
        titleUsername () {
            return this.weeksetEmployee ? this.weeksetEmployee.name : ''
        },
        isEditingMode () {
            return this.$route.name === 'edit-weekset' || this.$route.name === 'manager-edit-weekset'
        },
        isEditable () {
            return this.weekset.status !== 'approved'
        },
        weeksetCopy () {
            return { ...this.weekset }
        },
        weeksetEmployee () {
            return this.employees.find(user => user.account_id === this.weeksetCopy.account_id)
        },
        detailItems () {
            return [
                {
                    label: this.$t('forms.availabilityWeeklyEntry.title.label'),
                    value: this.weekset.weekset_name,
                },
                {
                    label: this.$t('forms.availabilityWeeklyEntry.submittedField.label'),
                    value: this.$moment(this.weekset.created.datetime).longDayFormat(),
                },
                {
                    label: this.$t('forms.availabilityWeeklyEntry.fromField.label'),
                    value: this.weekset.start_date ? this.$moment(this.weekset.start_date).longDayFormat() : '',
                },
                {
                    label: this.$t('forms.availabilityWeeklyEntry.toField.label'),
                    value: this.weekset.end_date ? this.$moment(this.weekset.end_date).longDayFormat() : '',
                },
                {
                    label: this.$t('forms.availabilityWeeklyEntry.statusField.label'),
                    value: this.$t('entities.weekset.status.' + this.weekset.status),
                    classes: this.status,
                },
                {
                    label: this.$t('forms.availabilityWeeklyEntry.remarkField.label'),
                    value: this.weekset.employee_comment,
                },
                {
                    label: this.$t('forms.availabilityWeeklyEntry.remarkManagerField.label'),
                    value: this.weekset.manager_comment,
                },
            ]
        },
    },
    mounted () {
        this.originalStartDate = this.$moment(this.weekset.start_date).longDayFormat()
        if (this.$route.name === 'edit-weekset' && !this.isEditable) {
            this.replaceRoute('view-weekset')
            this.SET_SNACKBAR({
                message: this.$t('sidePanels.availabilityWeeklyDetails.editingNotAllowed', [this.$t(`entities.weekset.status.${this.weekset.status}`)]),
                error: true,
            })
        } else {
            if (this.employees.length === 0) {
                this.getEmployees({ active: true })
            }
        }
    },
    methods: {
        ...vuex.mapMutations(['SET_SNACKBAR']),
        ...vuex.mapActions('account', {
            getEmployees: 'getEmployees',
        }),
        ...vuex.mapMutations('availability', {
            updateEmployeesWeeksetStatus: 'updateEmployeesWeeksetStatus',
        }),
        replaceRoute (name) {
            this.$router.replace({
                name: name,
                query: this.$route.query,
                params: this.$route.params,
            })
        },
        updateStatus (event) {
            this.updateEmployeesWeeksetStatus({ id: this.weekset.id, status: event.status })
            this.weekset.status = event.status
            this.showReject = 0
            if (event.manager_comment) {
                this.weekset.manager_comment = event.manager_comment
            }
            if (event.employee_comment) {
                this.weekset.employee_comment = event.employee_comment
            }
        },
        cancel () {
            this.editFormKey += 1
            this.$emit('close')
        },
    },
}
</script>

<style lang="scss">
    @import '@/assets/scss/_colors.scss';
    .availability-weekly-details-side-panel {
        .value-list .value {
            &.denied,
            &.cancelled {
                color: $fail-color !important;
            }

            &.approved {
                color: $success-color !important;
            }

            &.pending {
                color: $pending-color !important;
            }
        }
        .un-editable {
            padding: 5px;
            color: $fail-color;
        }
        .button {
            &.cancel-btn {
                margin-right: 15px;
            }
            &.save-btn {
                background-color: $primary-color !important;
                color: #fff !important;
            }
        }
    }
</style>
