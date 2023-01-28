<template>
    <PmtContent>
        <TopBar
            ref="topbar"
            show-search
            search-offset
            :search="searchString"
            @search="searchDepartments"
        >
            <template #right>
                <BarButton
                    ref="createDepartment"
                    v-tooltip="{content: $t('pages.departments.add'), hideOnTargetClick: true, placement: 'bottom', trigger: 'focus hover click'}"
                    :text="$t('pages.departments.add')"
                    icon="plus"
                    icon-size="20"
                    @click="openDepartmentDialog({}, 'new')"
                />
            </template>
        </TopBar>
        <PmtLayout>
            <VContainer>
                <VRow v-if="DEPARTMENTS_MANAGE">
                    <VCol class="col-12 my-0">
                        <PmtSwitch
                            id="active-department"
                            :value="departmentsActiveFilter"
                            :label="$t('pages.departments.showOnlyActiveDepartments')"
                            class="mt-0 mt-md-2"
                            @input="showActiveDepartments($event)"
                        />
                    </VCol>
                    <VCol class="col-12 py-0">
                        <p
                            v-if="departmentsApiError"
                            class="text-error"
                        >
                            {{ departmentsApiError }}
                        </p>
                        <p
                            v-if="searchString && searchString.length > 2"
                            ref="searchResultsNotification"
                        >
                            <strong>{{ departments.length }}</strong>&nbsp;
                            {{ departments.length === 1 ? $t('pages.departments.department') : $t('pages.departments.departments') }}&nbsp;
                            {{ $t('pages.departments.foundWith') }} '<span class="font-weight-bold">{{ searchString }}</span>'.&nbsp;
                            <a
                                ref="clearResults"
                                @click="searchDepartments('')"
                            >
                                {{ $t('pages.departments.showAllRules') }}
                            </a>.
                        </p>
                    </VCol>
                    <VCol>
                        <VCard class="p-2 p-md-3">
                            <VDataTable
                                :headers="dataTableHeaders"
                                :items="departments"
                                :items-per-page="10"
                                :disable-sort="IS_MOBILE"
                                class="departments-table config-data-table"
                                calculate-widths
                            >
                                <template #[`item.department_shortname`]="{ item }">
                                    <PmtCrudInput
                                        :full-object="item"
                                        :identifier="'department_shortname'"
                                        :type="'text'"
                                        :max-length="10"
                                        @save="save($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="displayedValue(item.department_shortname)" />
                                    </PmtCrudInput>
                                </template>
                                <template #[`item.department_name`]="{ item }">
                                    <PmtCrudInput
                                        :full-object="item"
                                        :identifier="'department_name'"
                                        :type="'text'"
                                        :max-length="100"
                                        @save="save($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="displayedValue(item.department_name)" />
                                    </PmtCrudInput>
                                </template>
                                <template #[`item.wlp2_department_id`]="{ item }">
                                    <PmtCrudInput
                                        :full-object="item"
                                        :identifier="'wlp2_department_id'"
                                        :type="'text'"
                                        @save="save($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="displayedValue(item.wlp2_department_id)" />
                                    </PmtCrudInput>
                                </template>
                                <template #[`item.bi_api_code`]="{ item }">
                                    <PmtCrudInput
                                        :full-object="item"
                                        :identifier="'bi_api_code'"
                                        :type="'text'"
                                        :max-length="10"
                                        @save="save($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="displayedValue(item.bi_api_code)" />
                                    </PmtCrudInput>
                                </template>
                                <template #[`item.in_use`]="{ item }">
                                    <VIcon
                                        v-if="item.in_use"
                                        color="green"
                                        :size="20"
                                        v-text="'mdi-check'"
                                    />
                                </template>
                                <template #[`item.actions`]="{ item }">
                                    <PmtButton
                                        :primary="hovered === `edit_${item.department_id}`"
                                        :default="hovered !== `edit_${item.department_id}`"
                                        round
                                        icon="pencil"
                                        icon-size="15"
                                        @click="openDepartmentDialog(item, 'edit')"
                                        @mouseover="hovered = `edit_${item.department_id}`"
                                        @mouseout="hovered = ''"
                                    />
                                    <PopoverButton
                                        ref="deleteDepartment"
                                        :danger="hovered === `delete_${item.department_id}`"
                                        :default="hovered !== `delete_${item.department_id}`"
                                        round
                                        :is-open="showDeletePopover && activeDepartmentId === item.department_id"
                                        :disabled="item.in_use"
                                        icon="delete-forever"
                                        icon-size="15"
                                        :cy_id="`DeleteDepartment-${item.department_id}`"
                                        @click="showDeletePopover = true; activeDepartmentId = item.department_id"
                                        @mouseover="hovered = `delete_${item.department_id}`"
                                        @mouseout="hovered = ''"
                                        @hide="showDeletePopover = false;"
                                    >
                                        <template slot="popover-content">
                                            <p v-if="showDeletePopover">
                                                {{ $t('pages.departments.tableHeaderLabels.actions.deleteConfirm') }}
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
                                                    @click="deleteDep(item.department_id)"
                                                >
                                                    {{ $t('ui.singles.yes') }}
                                                </PmtButton>
                                            </div>
                                        </template>
                                    </PopoverButton>
                                </template>
                            </VDataTable>
                        </VCard>
                    </VCol>
                </VRow>
                <EmptyState
                    v-else
                    ref="noAccess"
                    :title="$t('pages.departments.noAccess')"
                    :component="'four-o-four'"
                    :show="true"
                    :is-error="true"
                    no-padding
                />
            </VContainer>
        </PmtLayout>
        <EditCreateDepartmentsModal ref="editCreateDepartmentsModal" />
    </PmtContent>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import stringHelper from '@/libraries/stringHelper'

export default {
    name: 'Departments',
    components: {
        EditCreateDepartmentsModal: () => import('@/pages/configuration/departments/EditCreateDepartmentsModal.vue'),
    },
    data () {
        return {
            stores: [],
            dataTableHeaders: [
                { text: this.$t('pages.departments.tableHeaderLabels.id'), value: 'department_id', cellClass: 'department_id' },
                { text: this.$t('pages.departments.tableHeaderLabels.department_shortname'), value: 'department_shortname', cellClass: 'department_shortname' },
                { text: this.$t('pages.departments.tableHeaderLabels.department_name'), value: 'department_name', cellClass: 'department_name' },
                { text: this.$t('pages.departments.tableHeaderLabels.wlp2'), value: 'wlp2_department_id', cellClass: 'wlp2_department_id' },
                { text: this.$t('pages.departments.tableHeaderLabels.bi_api_code'), value: 'bi_api_code', cellClass: 'bi_api_code' },
                { text: this.$t('pages.departments.tableHeaderLabels.in_use'), value: 'in_use', cellClass: 'in_use' },
                { text: '', value: 'actions', cellClass: 'actions' },
            ],
            activeDepartmentId: null,
            isUpdating: false,
            department: [],
            showDeletePopover: false,
            hovered: '',
        }
    },
    computed: {
        ...mapGetters('configuration/departments', {
            envDepartments: 'ENV_DEPARTMENTS',
            searchString: 'SEARCH_STRING',
            departmentsActiveFilter: 'DEPARTMENTS_ACTIVE_FILTER',
            departmentsApiError: 'DEPARTMENTS_API_ERROR',
        }),
        ...mapGetters('auth', ['isUserAdmin', 'DEPARTMENTS_MANAGE']), // a special right will be implemented for this in the future,
        ...mapGetters(['IS_MOBILE']),
        departments () {
            return this.envDepartments
        },
    },
    mounted () {
        this.SET_DEPARTMENTS_API_ERROR(null)
        this.SET_SEARCH_STRING('')
        this.getEnvDepartments()
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('configuration/departments', ['getEnvDepartments', 'editDepartment', 'deleteDepartment']),
        ...mapMutations('configuration/departments', ['SET_SEARCH_STRING', 'SET_ACTIVE_DEPARTMENTS_FILTER', 'SET_DEPARTMENTS_API_ERROR']),
        searchDepartments (searchString) {
            this.SET_SEARCH_STRING(searchString)
        },
        showActiveDepartments (value) {
            this.SET_ACTIVE_DEPARTMENTS_FILTER(value)
        },
        openDepartmentDialog (item, type) {
            this.$refs.editCreateDepartmentsModal.open(item, type)
        },
        save (payload) {
            const department = this.departments.find(o => o.department_id === payload.object.department_id)
            const data = JSON.parse(JSON.stringify(department || null))
            data[payload.identifier] = payload.inputValue

            this.isUpdating = true
            this.editDepartment(data)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.departments.dataHaveBeenUpdated'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.departments.dataUpdateFailed'), error: true })
                })
                .finally(() => {
                    this.isUpdating = false
                })
        },
        deleteDep (id) {
            this.deleteDepartment(id)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.departments.dataHaveBeenUpdated'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.departments.dataUpdateFailed'), error: true })
                })
                .finally(() => {
                    this.showDeletePopover = false
                })
        },
        displayedValue (string) {
            return stringHelper.highlight(string, this.searchString)
        },
    },
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/mixins/_breakpoints.scss';

    .department_shortname, .department_name, .wlp2_department_id, .bi_api_code {
        position: relative;

        strong {
            font-weight: 600 !important;
        }
    }

    .search-bar-spacer {
        position: relative;
        width: 0 ;
        height: 48px;

        @include bp-sm {
            width: calc((100vw - 516px)/2);
        }

        @include bp-md {
            width: calc((100vw - 936px)/2);
        }

        @include bp-lg {
            width: calc((100vw - 1116px)/2);
        }
    }

    :deep() .highlighted {
        color: var(--primary-color);
        font-weight: 600 !important;
    }

</style>
