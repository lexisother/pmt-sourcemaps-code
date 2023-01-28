<template>
    <PmtContent>
        <div class="sub-department-top-bar">
            <VContainer class="px-0 py-0">
                <VRow class="my-0">
                    <VCol
                        v-if="PAGE_WIDTH >= 768"
                        class="search py-0"
                    >
                        <PInput
                            id="searchInputh"
                            ref="searchInput"
                            v-model.trim="searchModel"
                            cy_id="searchInput"
                            name="Search"
                            :placeholder="$t('ui.singles.search')"
                            append-icon="magnify"
                            clearable
                            dense
                            input-style="background: 'white', border-color: var(--grey-30)"
                            class="my-2"
                            @clear="searchSubDepartments('')"
                        />
                    </VCol>
                    <VCol
                        v-if="SUBDEPARTMENTGROUPS_READ"
                        class="col-auto py-0"
                    >
                        <div class="select-container">
                            <PSelect
                                ref="subDepartmentSelect"
                                v-model="selectedSubDepartmentGroup"
                                cy_id="subDepartmentSelect"
                                :items="SUBDEPARTMENT_GROUPS"
                                item-value="id"
                                item-label="name"
                                searchable
                                :placeholder="$t('pages.subDepartments.selectSubdepartmentGroup')"
                                @input="fetchSubDepartments"
                            />
                        </div>
                    </VCol>
                    <VCol
                        v-if="SUBDEPARTMENTGROUPS_MANAGE"
                        class="col-auto py-2 px-1"
                    >
                        <PmtButton
                            round
                            default
                            :disabled="!SELECTED_SUBDEPARTMENT_GROUP"
                            icon="pencil"
                            icon-size="15"
                            @click="openSubDepartmentGroupModal(SELECTED_SUBDEPARTMENT_GROUP, 'edit')"
                        />
                    </VCol>
                    <VCol
                        v-if="SUBDEPARTMENTGROUPS_MANAGE"
                        class="col-auto py-2 px-1"
                    >
                        <PopoverButton
                            ref="deleteSubDepartmentGroup"
                            round
                            default
                            :is-open="showDeleteGroupPopover"
                            :disabled="!SELECTED_SUBDEPARTMENT_GROUP"
                            icon="delete-forever"
                            icon-size="15"
                            cy_id="deleteSubDepartmentGroup"
                            @click="showDeleteGroupPopover = true"
                            @hide="showDeleteGroupPopover = false"
                        >
                            <template slot="popover-content">
                                <p v-if="showDeleteGroupPopover">
                                    {{ $t('pages.subDepartments.deleteGroupConfirm') }}
                                </p>
                                <div class="popover-buttons-right">
                                    <PmtButton
                                        default
                                        outline
                                        custom-class="tooltip-target b1"
                                        @click="showDeleteGroupPopover = false"
                                    >
                                        {{ $t('ui.singles.no') }}
                                    </PmtButton>
                                    <span class="mx-2" />
                                    <PmtButton
                                        v-if="showDeleteGroupPopover"
                                        primary
                                        danger
                                        custom-class="tooltip-target b1"
                                        @click="removeSubDepartmentGroup(SELECTED_SUBDEPARTMENT_GROUP)"
                                    >
                                        {{ $t('ui.singles.yes') }}
                                    </PmtButton>
                                </div>
                            </template>
                        </PopoverButton>
                    </VCol>
                    <VCol
                        v-if="PAGE_WIDTH < 992 && SUBDEPARTMENTGROUPS_MANAGE"
                        class="col-auto py-2 px-1"
                    >
                        <PmtButton
                            round
                            default
                            icon="plus"
                            icon-size="15"
                            @click="openSubDepartmentGroupModal(null, 'add')"
                        />
                    </VCol>
                    <VCol
                        v-if="PAGE_WIDTH >= 992 && SUBDEPARTMENTGROUPS_MANAGE"
                        class="col-auto py-0"
                    >
                        <BarButton
                            ref="createSubDepartmentGroup"
                            icon="plus"
                            icon-size="20"
                            primary
                            inverted
                            class="ml-2 mr-4"
                            :text="$t('pages.subDepartments.addSubdepartmentGroup')"
                            @click="openSubDepartmentGroupModal(null, 'add')"
                        />
                    </VCol>
                    <VCol
                        v-if="PAGE_WIDTH >= 768 && SUBDEPARTMENTS_MANAGE"
                        class="col-auto py-0"
                    >
                        <BarButton
                            ref="createSubDepartment"
                            icon="plus"
                            icon-size="20"
                            primary
                            inverted
                            :disabled="!SELECTED_SUBDEPARTMENT_GROUP"
                            :text="$t('pages.subDepartments.addSubdepartment')"
                            @click="openSubDepartmentModal({}, 'add')"
                        />
                    </VCol>
                </VRow>
            </VContainer>
        </div>
        <div
            v-if="PAGE_WIDTH < 768"
            class="sub-department-top-bar"
        >
            <VContainer class="px-0 py-0">
                <VRow class="my-0">
                    <VCol class="search py-0">
                        <PInput
                            id="searchInputh"
                            ref="searchInput"
                            v-model.trim="searchModel"
                            cy_id="searchInput"
                            name="Search"
                            :placeholder="$t('ui.singles.search')"
                            append-icon="magnify"
                            clearable
                            dense
                            input-style="background: 'white', border-color: var(--grey-30)"
                            class="my-2"
                            @clear="searchSubDepartments('')"
                        />
                    </VCol>
                    <VCol
                        v-if="SUBDEPARTMENTS_MANAGE"
                        class="col-auto py-0"
                    >
                        <BarButton
                            ref="createSubDepartment"
                            icon="plus"
                            icon-size="20"
                            primary
                            inverted
                            :text="$t('pages.subDepartments.addSubdepartment')"
                            @click="openSubDepartmentModal({}, 'add')"
                        />
                    </VCol>
                </VRow>
            </VContainer>
        </div>

        <PmtLayout>
            <VContainer>
                <VRow v-if="SUBDEPARTMENTS_READ">
                    <VCol
                        v-if="SUBDEPARTMENT_API_ERROR || SEARCH_STRING"
                        class="col-12 my-0"
                    >
                        <VAlert
                            v-if="SUBDEPARTMENT_API_ERROR"
                            class="mb-0"
                            dense
                            outlined
                            type="error"
                        >
                            {{ SUBDEPARTMENT_API_ERROR }}
                        </VAlert>

                        <p
                            v-if="SEARCH_STRING"
                            ref="searchResultsNotification"
                        >
                            <strong>{{ SUBDEPARTMENTS.length }}</strong>
                            {{ SUBDEPARTMENTS.length === 1 ? $t('pages.subDepartments.subDepartment') : $t('pages.subDepartments.subDepartments') }}
                            {{ $t('pages.subDepartments.foundWith') }} '<span class="font-weight-bold">{{ SEARCH_STRING }}</span>'.
                            <a
                                ref="clearResults"
                                @click="searchSubDepartments('')"
                            >
                                {{ $t('pages.subDepartments.showAllSubDepartments') }}
                            </a>
                        </p>
                    </VCol>
                    <VCol class="col-12">
                        <VCard class="p-2 p-md-3">
                            <p v-if="!SELECTED_SUBDEPARTMENT_GROUP">
                                {{ $t('pages.subDepartments.selectSubdepartmentGroupFirst') }}
                            </p>
                            <VDataTable
                                v-else
                                :headers="dataTableHeaders"
                                :items="SUBDEPARTMENTS"
                                :items-per-page="10"
                                :disable-sort="IS_MOBILE"
                                class="config-data-table"
                                calculate-widths
                            >
                                <template #item="{ item }">
                                    <tr :class="{ animate: item.id === activeSubDepartmentId && isUpdating }">
                                        <td>
                                            <PmtCrudInput
                                                v-if="SUBDEPARTMENTS_MANAGE"
                                                :full-object="item"
                                                identifier="code"
                                                :type="'text'"
                                                @save="changeValue(item.id, 'code', $event.inputValue)"
                                                v-on="$listeners"
                                            >
                                                <span v-html="displayedValue(item.code)" />
                                            </PmtCrudInput>
                                            <span
                                                v-else
                                                v-html="displayedValue(item.code)"
                                            />
                                        </td>
                                        <td>
                                            <PmtCrudInput
                                                v-if="SUBDEPARTMENTS_MANAGE"
                                                :full-object="item"
                                                identifier="name"
                                                :type="'text'"
                                                @save="changeValue(item.id, 'name', $event.inputValue)"
                                                v-on="$listeners"
                                            >
                                                <span v-html="displayedValue(item.name)" />
                                            </PmtCrudInput>
                                            <span
                                                v-else
                                                v-html="displayedValue(item.name)"
                                            />
                                        </td>
                                        <td>
                                            <PmtSwitch
                                                v-model="item.visible"
                                                label="&nbsp;"
                                                :disabled="!SUBDEPARTMENTS_MANAGE"
                                                @input="changeValue(item.id, 'visible', $event)"
                                            />
                                        </td>
                                        <td>
                                            <PmtCrudInput
                                                v-if="SUBDEPARTMENTS_MANAGE"
                                                :full-object="item"
                                                identifier="subdepartment_type"
                                                :type="'select'"
                                                :items="subDepartmentTypeOptions"
                                                @save="changeValue(item.id, 'subdepartment_type', $event.inputValue)"
                                                v-on="$listeners"
                                            >
                                                <span>{{ subDepartmentTypeLabel(item.subdepartment_type) }}</span>
                                            </PmtCrudInput>
                                            <span v-else>{{ subDepartmentTypeLabel(item.subdepartment_type) }}</span>
                                        </td>
                                        <td>
                                            <PmtSwitch
                                                v-model="item.checkout"
                                                label="&nbsp;"
                                                :disabled="item.subdepartment_type === 'turnover' || !SUBDEPARTMENTS_MANAGE"
                                                @input="changeValue(item.id, 'checkout', $event)"
                                            />
                                        </td>
                                        <td>
                                            <PmtCrudInput
                                                v-if="SUBDEPARTMENTS_MANAGE"
                                                :full-object="item"
                                                identifier="wlp2_normcluster_id"
                                                :type="'text'"
                                                @save="changeValue(item.id, 'wlp2_normcluster_id', $event.inputValue)"
                                                v-on="$listeners"
                                            >
                                                <span v-html="displayedValue(item.wlp2_normcluster_id)" />
                                            </PmtCrudInput>
                                            <span
                                                v-else
                                                v-html="displayedValue(item.wlp2_normcluster_id)"
                                            />
                                        </td>
                                        <td>
                                            <template v-if="SUBDEPARTMENTS_MANAGE">
                                                <PmtButton
                                                    :ref="`editSubDepartment-${item.id}`"
                                                    :primary="hovered === `edit_${item.id}`"
                                                    :default="hovered !== `edit_${item.id}`"
                                                    round
                                                    icon="pencil"
                                                    icon-size="15"
                                                    @click="openSubDepartmentModal(item, 'edit')"
                                                    @mouseover="hovered = `edit_${item.id}`"
                                                    @mouseout="hovered = ''"
                                                />
                                                <PopoverButton
                                                    :ref="`deleteSubDepartment-${item.id}`"
                                                    :danger="hovered === `delete_${item.id}`"
                                                    :default="hovered !== `delete_${item.id}`"
                                                    round
                                                    :is-open="showDeletePopover && activeSubDepartmentId === item.id"
                                                    :disabled="item.in_use"
                                                    icon="delete-forever"
                                                    icon-size="15"
                                                    :cy_id="`deleteSubDepartment-${item.id}`"
                                                    @click="showDeletePopover = true; activeSubDepartmentId = item.id"
                                                    @mouseover="hovered = `delete_${item.id}`"
                                                    @mouseout="hovered = ''"
                                                    @hide="showDeletePopover = false"
                                                >
                                                    <template slot="popover-content">
                                                        <p v-if="showDeletePopover">
                                                            {{ $t('pages.subDepartments.deleteConfirm') }}
                                                        </p>
                                                        <div class="popover-buttons-right">
                                                            <PmtButton
                                                                default
                                                                outline
                                                                custom-class="tooltip-target b1"
                                                                @click="showDeletePopover = false"
                                                            >
                                                                {{ $t('ui.singles.no') }}
                                                            </PmtButton>
                                                            <span class="mx-2" />
                                                            <PmtButton
                                                                v-if="showDeletePopover"
                                                                primary
                                                                danger
                                                                custom-class="tooltip-target b1"
                                                                @click="removeSubDepartment(item.id)"
                                                            >
                                                                {{ $t('ui.singles.yes') }}
                                                            </PmtButton>
                                                        </div>
                                                    </template>
                                                </PopoverButton>
                                            </template>
                                        </td>
                                    </tr>
                                </template>
                            </VDataTable>
                        </VCard>
                    </VCol>
                </VRow>
                <EmptyState
                    v-else
                    ref="noAccess"
                    :title="$t('apiErrors.general.noAccess')"
                    component="four-o-four"
                    :show="true"
                    :is-error="true"
                    no-padding
                />
            </VContainer>
        </PmtLayout>
        <SubDepartmentModal
            v-if="SUBDEPARTMENTS_MANAGE"
            ref="subDepartmentModal"
            :sub-department-type-options="subDepartmentTypeOptions"
            @save="saveSubDepartment"
        />
        <SubDepartmentGroupModal
            v-if="SUBDEPARTMENTGROUPS_MANAGE"
            ref="subDepartmentGroupModal"
            @save="saveSubDepartmentGroup"
        />
    </PmtContent>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import stringHelper from '@/libraries/stringHelper'

export default {
    name: 'SubDepartments',
    components: {
        SubDepartmentModal: () => import('@/pages/configuration/departments/SubDepartmentModal'),
        SubDepartmentGroupModal: () => import('@/pages/configuration/departments/SubDepartmentGroupModal'),
    },
    data () {
        return {
            selectedSubDepartmentGroup: {},
            dataTableHeaders: [
                { text: this.$t('pages.subDepartments.tableHeaderLabels.code'), value: 'code' },
                { text: this.$t('pages.subDepartments.tableHeaderLabels.name'), value: 'name' },
                { text: this.$t('pages.subDepartments.tableHeaderLabels.visible'), value: 'visible' },
                { text: this.$t('pages.subDepartments.tableHeaderLabels.subdepartment_type'), value: 'subdepartment_type' },
                { text: this.$t('pages.subDepartments.tableHeaderLabels.checkout'), value: 'checkout' },
                { text: this.$t('pages.subDepartments.tableHeaderLabels.wlp2_normcluster_id'), value: 'wlp2_normcluster_id' },
                { text: '', value: 'actions', cellClass: 'actions' },
            ],
            activeSubDepartmentId: null,
            hovered: '',
            showDeletePopover: false,
            showDeleteGroupPopover: false,
            action: null,
            groupAction: null,
            subDepartmentTypeOptions: [
                { value: 'turnover', label: this.$t('pages.subDepartments.subDepartmentTypes.turnover') },
                { value: 'dependent', label: this.$t('pages.subDepartments.subDepartmentTypes.dependent') },
            ],
            isUpdating: false,
            searchTimeout: null,
        }
    },
    computed: {
        ...mapGetters(['IS_MOBILE', 'PAGE_WIDTH']),
        ...mapGetters('configuration/departments', ['SEARCH_STRING', 'SUBDEPARTMENT_GROUPS', 'SELECTED_SUBDEPARTMENT_GROUP', 'SUBDEPARTMENTS', 'SUBDEPARTMENT_API_ERROR']),
        ...mapGetters('auth', ['SUBDEPARTMENTGROUPS_READ', 'SUBDEPARTMENTGROUPS_MANAGE', 'SUBDEPARTMENTS_READ', 'SUBDEPARTMENTS_MANAGE']),
        searchModel: {
            get () {
                return this.SEARCH_STRING
            },
            set (newVal) {
                if (this.searchTimeout) clearTimeout(this.searchTimeout)
                this.searchTimeout = setTimeout(() => {
                    this.searchSubDepartments(newVal)
                }, 300)
            },
        },
    },
    mounted () {
        // get available subdepartment groups
        this.getSubDepartmentGroups()

        // preselect subdepartment groups dropdown
        if (this.SELECTED_SUBDEPARTMENT_GROUP && this.SUBDEPARTMENT_GROUPS) {
            this.selectedSubDepartmentGroup = this.SUBDEPARTMENT_GROUPS.find(o => o.id === this.SELECTED_SUBDEPARTMENT_GROUP)
        }
    },
    methods: {
        ...mapActions('configuration/departments', [
            'getSubDepartmentGroups',
            'getSubDepartments',
            'createSubDepartment',
            'updateSubDepartment',
            'deleteSubDepartment',
            'createSubDepartmentGroup',
            'updateSubDepartmentGroup',
            'deleteSubDepartmentGroup',
        ]),
        ...mapMutations('configuration/departments', ['SET_SELECTED_SUBDEPARTMENT_GROUP', 'SET_SEARCH_STRING']),
        ...mapMutations(['SET_SNACKBAR']),
        searchSubDepartments (searchString) {
            this.SET_SEARCH_STRING(searchString)
        },
        fetchSubDepartments (event) {
            const subDepartmentGroupId = event?.id ? event.id : null
            this.getSubDepartments({ subDepartmentGroupId })
        },
        subDepartmentTypeLabel (subDepartmentType) {
            return this.$t('pages.subDepartments.subDepartmentTypes')[subDepartmentType]
        },
        /**
        * one of the values is changed inline
        * new value will be saved directly
        */
        changeValue (subDepartmentId, identifier, event) {
            this.action = 'edit'
            this.activeSubDepartmentId = subDepartmentId
            const subDepartment = JSON.parse(JSON.stringify(this.SUBDEPARTMENTS.find(o => o.id === subDepartmentId)))
            if (identifier === 'subdepartment_type') {
                subDepartment[identifier] = event[0].value
            } else {
                subDepartment[identifier] = event
            }
            if (this.valueIsUnique(identifier, subDepartment)) {
                this.saveSubDepartment(subDepartment)
            }
        },
        valueIsUnique (identifier, subDepartment) {
            const fields = ['code', 'name', 'wlp2_normcluster_id']
            if (fields.includes(identifier) &&
                subDepartment[identifier].length &&
                this.SUBDEPARTMENTS.length &&
                this.SUBDEPARTMENTS.find(o => o[identifier] === subDepartment[identifier] && o.id !== subDepartment.id)
            ) {
                return false
            }
            return true
        },
        openSubDepartmentModal (item, action) {
            this.action = action
            this.activeSubDepartmentId = item.id
            this.$refs.subDepartmentModal.open(item, action)
        },
        openSubDepartmentGroupModal (subDepartmentGroupId, action) {
            this.groupAction = action
            this.$refs.subDepartmentGroupModal.open(subDepartmentGroupId, action)
        },
        removeSubDepartment (id) {
            this.action = 'delete'
            this.saveSubDepartment(id)
        },
        /**
         * Save or delete subdepartment
         */
        saveSubDepartment (payload) {
            let action = 'createSubDepartment'
            let apiSuccessMessage = this.$t('pages.subDepartments.dataHaveBeenUpdated')

            if (this.action === 'edit') {
                action = 'updateSubDepartment'
            } else if (this.action === 'delete') {
                action = 'deleteSubDepartment'
                apiSuccessMessage = this.$t('pages.subDepartments.subDepartmentHasBeenRemoved')
            }
            this.isUpdating = true

            this[action](payload)
                .then(() => {
                    this.SET_SNACKBAR({ message: apiSuccessMessage, success: true })
                    setTimeout(() => {
                        this.activeSubDepartmentId = null
                        this.isUpdating = false
                    }, 2000)
                })
                .catch(() => {
                    this.activeSubDepartmentId = null
                    this.isUpdating = false
                    this.SET_SNACKBAR({ message: this.$t('pages.subDepartments.dataUpdateFailed'), error: true })
                })
                .finally(() => {
                    this.action = null
                })
        },
        removeSubDepartmentGroup (id) {
            this.groupAction = 'delete'
            this.saveSubDepartmentGroup(id)
        },
        /**
         * Save or delete subdepartment group
         */
        saveSubDepartmentGroup (payload) {
            let action = 'createSubDepartmentGroup'
            let apiSuccessMessage = this.$t('pages.subDepartments.subDepartmentGroupHasBeenAdded')

            if (this.groupAction === 'edit') {
                action = 'updateSubDepartmentGroup'
                apiSuccessMessage = this.$t('pages.subDepartments.subDepartmentGroupHasBeenUpdated')
            } else if (this.groupAction === 'delete') {
                action = 'deleteSubDepartmentGroup'
                apiSuccessMessage = this.$t('pages.subDepartments.subDepartmentGroupHasBeenRemoved')
            }

            this[action](payload)
                .then(result => {
                    this.SET_SNACKBAR({ message: apiSuccessMessage, success: true })
                    // select created subdepartment group if no other group is selected
                    if (this.groupAction === 'add' && !this.SELECTED_SUBDEPARTMENT_GROUP) {
                        this.selectedSubDepartmentGroup = result
                        this.fetchSubDepartments(result)
                    }
                    if (this.groupAction === 'edit') {
                        this.selectedSubDepartmentGroup = this.SUBDEPARTMENT_GROUPS.find(o => o.id === this.SELECTED_SUBDEPARTMENT_GROUP)
                    }
                    // empty screen after active subdepartment group has been deleted
                    if (this.groupAction === 'delete') {
                        this.getSubDepartments({ subDepartmentGroupId: null })
                        this.selectedSubDepartmentGroup = {}
                    }
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.subDepartments.dataUpdateFailed'), error: true })
                })
                .finally(() => {
                    this.groupAction = null
                    this.showDeleteGroupPopover = false
                })
        },
        displayedValue (string) {
            return stringHelper.highlight(string, this.searchModel)
        },
    },
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/main.scss';
    @import '@/assets/scss/layout.scss';
    @import '@/assets/scss/mixins/_breakpoints.scss';
    @import '@/assets/scss/_colors.scss';

    .sub-department-top-bar {
        height: 48px; /* IE <= 11 fallback */
        height: var(--top-bar-height);
        border-bottom-width: var(--top-bar-border-width);
        border-bottom-style: solid;
        border-bottom-color: $border-color;
        background-color: $white;
        position: sticky;
        top: 0;
        z-index: 4;
        display: flex;
        justify-content: space-between;
        box-shadow: var(--top-bar-shadow);
        padding: 0;
        transition: margin $side-bar-speed;

        .search {
            width: auto;

            @include bp-md {
                width: 160px;
            }

            @include bp-lg {
                width: 240px;
            }
        }

        .select-container {
            width: calc(100vw - 160px);
            margin: 4px 0;

            @include bp-sm {
                width: 224px;
            }
        }

        .top-bar-round-buttons {
            width: 112px;
            display: flex;
            justify-content: space-between;
            margin: 6px 4px;

            @include bp-md {
                width: 80px;
            }
        }

    }

    .bar-search {
        width: inherit !important;
        height: 48px !important; /* IE <= 11 fallback */
        height: var(--top-bar-height) !important;
        border-left: 1px solid $border-color;
    }

    :deep() .actions {
        @include bp-md {
            width: 112px;
            text-align: right !important;
        }
    }

    :deep() .v-alert {
        font-size: 12px;
        font-weight: 700;

        .v-icon {
            font-size: 16px;
        }
    }

    :deep() .v-data-table tbody tr.animate::after {
        position: absolute;
        content: "";
        width: calc(100% - 2rem);
        height: 1px;
        left: 0;
        margin: 48px 16px 0 16px;
        background: linear-gradient(270deg, transparent 0%, transparent 45%, $primary-color 50%);
        background-size: 200% 100%;
        background-repeat: no-repeat;
        animation: gradient 1s ease-out 1 reverse;
    }
    :deep() .highlighted {
        color: var(--primary-color);
        font-weight: 600 !important;
    }

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        100% {
            background-position: 100% 50%;
        }
    }
</style>
