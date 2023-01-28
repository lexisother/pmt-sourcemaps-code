<template>
    <PmtLayout>
        <PmtContent>
            <TopBar
                ref="topbar"
                show-search
                search-offset
                :search="searchString"
                @search="searchDepartments"
            />
            <VContainer>
                <VRow v-if="DEPARTMENT_MAPPING_SETTINGS">
                    <VCol class="col-12 py-0">
                        <p
                            v-if="departmentsApiError"
                            class="text-error"
                        >
                            {{ departmentsApiError }}
                        </p>
                        <p
                            v-if="searchString && searchString.length > 1"
                            ref="searchResultsNotification"
                        >
                            <strong>{{ departments.length }}</strong>&nbsp;
                            {{ departments.length === 1 ? $t('pages.departmentMapping.department') : $t('pages.departmentMapping.departments') }}&nbsp;
                            {{ $t('pages.departmentMapping.foundWith') }} '<span class="font-weight-bold">{{ searchString }}</span>'.&nbsp;
                            <a
                                ref="clearResults"
                                @click="searchDepartments('')"
                            >
                                {{ $t('pages.departmentMapping.showAllRules') }}
                            </a>.
                        </p>
                    </VCol>
                    <VCol>
                        <VCard class="p-2 p-md-3">
                            <VDataTable
                                :headers="dataTableHeaders"
                                :items="departments"
                                :items-per-page="10"
                                class="departments-table config-data-table"
                                calculate-widths
                            >
                                <template #[`item.department_id`]="{ item }">
                                    <span v-html="displayedValue(item.department_id)" />
                                </template>
                                <template #[`item.department_name`]="{ item }">
                                    <span v-html="displayedValue(item.department_name)" />
                                </template>
                                <template #[`item.foreign_department_code`]="{ item }">
                                    <PmtCrudInput
                                        :full-object="item"
                                        :identifier="'foreign_department_code'"
                                        :type="'text'"
                                        :max-length="10"
                                        :disabled="!DEPARTMENTS_MANAGE"
                                        @save="processCrudInputDataBeforeSave($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="displayedValue(item.foreign_department_code)" />
                                    </PmtCrudInput>
                                </template>
                                <template #[`item.administration`]="{ item }">
                                    <PmtCrudInput
                                        :full-object="item"
                                        :identifier="'administration'"
                                        :type="'text'"
                                        :max-length="32"
                                        :disabled="!DEPARTMENTS_MANAGE"
                                        @save="processCrudInputDataBeforeSave($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="displayedValue(item.administration)" />
                                    </PmtCrudInput>
                                </template>
                                <template #[`item.clock_department_code`]="{ item }">
                                    <PmtCrudInput
                                        :full-object="item"
                                        :identifier="'clock_department_code'"
                                        :type="'text'"
                                        :max-length="10"
                                        :disabled="!DEPARTMENTS_MANAGE"
                                        @save="processCrudInputDataBeforeSave($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="displayedValue(item.clock_department_code)" />
                                    </PmtCrudInput>
                                </template>
                                <template #[`item.color`]="{ item }">
                                    <VMenu offset-y>
                                        <template #activator="{ on }">
                                            <div v-on="on">
                                                <PmtColorSwatch
                                                    v-if="item.color"
                                                    :id="'color_' + item.department_id"
                                                    :color="item.color"
                                                    selectable
                                                />
                                            </div>
                                        </template>
                                        <PmtColorSelect
                                            v-model="item.color"
                                            class="mt-3 mr-2 mb-2 ml-3"
                                            @input="processColorChange($event, item.department_id)"
                                        />
                                    </VMenu>
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
                                        class="edit-department"
                                        :primary="hovered === `edit_${item.department_id}`"
                                        :default="hovered !== `edit_${item.department_id}`"
                                        round
                                        icon="pencil"
                                        icon-size="15"
                                        @click="openDepartmentMappingDialog(item)"
                                        @mouseover="hovered = `edit_${item.department_id}`"
                                        @mouseout="hovered = ''"
                                    />
                                </template>
                            </VDataTable>
                        </VCard>
                    </VCol>
                </VRow>
                <EmptyState
                    v-else
                    ref="noAccess"
                    :title="$t('pages.departmentMapping.noAccess')"
                    :component="'four-o-four'"
                    :show="true"
                    :is-error="true"
                    no-padding
                />
            </VContainer>
        </PmtContent>
        <DepartmentMappingModal
            ref="DepartmentMappingModal"
            @close="activeDepartmentId = null"
            @save="save"
        />
    </PmtLayout>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import stringHelper from '@/libraries/stringHelper'

export default {
    components: {
        DepartmentMappingModal: () => import('@/pages/configuration/departments/DepartmentMappingModal.vue'),
    },
    data () {
        return {
            dataTableHeaders: [
                { text: this.$t('pages.departmentMapping.tableHeaderLabels.id'), value: 'department_id', cellClass: 'data-table-cell' },
                { text: this.$t('pages.departmentMapping.tableHeaderLabels.name'), value: 'department_name', cellClass: 'data-table-cell' },
                { text: this.$t('pages.departmentMapping.tableHeaderLabels.foreign_department_code'), value: 'foreign_department_code', cellClass: 'data-table-cell' },
                { text: this.$t('pages.departmentMapping.tableHeaderLabels.administration'), value: 'administration', cellClass: 'data-table-cell' },
                { text: this.$t('pages.departmentMapping.tableHeaderLabels.clock_code'), value: 'clock_department_code', cellClass: 'data-table-cell' },
                { text: this.$t('pages.departmentMapping.tableHeaderLabels.color'), value: 'color', cellClass: 'data-table-cell' },
                { text: this.$t('pages.departmentMapping.tableHeaderLabels.in_use'), value: 'in_use' },
                { text: '', value: 'actions', cellClass: 'data-table-actions-cell', align: 'right' },
            ],
            activeDepartmentId: null,
            isUpdating: false,
            department: [],
            hovered: '',
        }
    },
    computed: {
        ...mapGetters('configuration/departments', {
            storeDepartments: 'STORE_DEPARTMENTS',
            searchString: 'SEARCH_STRING',
            departmentsApiError: 'DEPARTMENTS_API_ERROR',
        }),
        ...mapGetters('auth', ['DEPARTMENT_MAPPING_SETTINGS', 'DEPARTMENTS_MANAGE']),
        ...mapGetters(['IS_MOBILE']),
        departments () {
            return this.storeDepartments
        },
    },
    mounted () {
        this.SET_DEPARTMENTS_API_ERROR(null)
        this.SET_SEARCH_STRING('')
        this.getStoreDepartments()
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('configuration/departments', ['getStoreDepartments', 'updateStoreDepartment']),
        ...mapMutations('configuration/departments', ['SET_SEARCH_STRING', 'SET_DEPARTMENTS_API_ERROR']),
        searchDepartments (searchString) {
            this.SET_SEARCH_STRING(searchString)
        },
        openDepartmentMappingDialog (item) {
            if (this.DEPARTMENT_MAPPING_SETTINGS || this.DEPARTMENTS_MANAGE) {
                this.activeDepartmentId = item.department_id
                this.$refs.DepartmentMappingModal.open(item)
            }
        },
        save (payload) {
            if (this.DEPARTMENT_MAPPING_SETTINGS || this.DEPARTMENTS_MANAGE) {
                const department = this.departments.find(o => o.department_id === this.activeDepartmentId)
                const body = this.createBody(payload, department)

                if (department && body) {
                    this.isUpdating = true
                    this.updateStoreDepartment({ departmentId: this.activeDepartmentId, body: body })
                        .then(() => {
                            this.SET_SNACKBAR({ message: this.$t('pages.departmentMapping.dataHaveBeenUpdated'), success: true })
                        })
                        .catch(() => {
                            this.SET_SNACKBAR({ message: this.$t('pages.departmentMapping.dataUpdateFailed'), error: true })
                        })
                        .finally(() => {
                            this.isUpdating = false
                            this.activeDepartmentId = null
                        })
                }
            }
        },
        createBody (payload, department) {
            let body = {}
            if (department) {
                body = {
                    foreign_department_code: department.foreign_department_code,
                    color: department.color,
                    clock_department_code: department.clock_department_code,
                    administration: department.administration,
                }
            }

            if (payload && payload.length) {
                payload.forEach((item) => {
                    body[item.identifier] = item.value
                })
            }

            return body
        },
        processCrudInputDataBeforeSave (data) {
            this.activeDepartmentId = data.object.department_id
            const payload = [
                {
                    value: stringHelper.escapeString(data.inputValue),
                    identifier: data.identifier,
                },
            ]
            this.save(payload)
        },
        processColorChange (color, departmentId) {
            this.activeDepartmentId = departmentId
            const payload = [
                {
                    value: color,
                    identifier: 'color',
                },
            ]
            this.save(payload)
        },
        displayedValue (string) {
            return stringHelper.highlight(string, this.searchString)
        },
    },
}
</script>

<style lang="scss" scoped>
    .data-table-cell {
        position: relative;

        .editable-prop {
            cursor: pointer;
        }
    }

    .data-table-actions-cell {
        min-width: 128px;
    }

    :deep() .highlighted {
        color: var(--primary-color);
        font-weight: 600 !important;
    }
</style>
