<template>
    <PmtContent>
        <TopBar ref="topbar">
            <template #right>
                <BarButton
                    v-if="SCHOOL_HOLIDAYS_MANAGE"
                    ref="createSchoolHoliday"
                    v-tooltip="{content: $t('pages.schoolHolidays.add'), hideOnTargetClick: true, placement: 'bottom', trigger: 'focus hover click'}"
                    :text="$t('pages.schoolHolidays.add')"
                    icon="plus"
                    @click="openSchoolHolidayDialog({}, 'new')"
                />

                <BarButton
                    v-if="SCHOOL_HOLIDAY_REGIONS_READ || SCHOOL_HOLIDAY_REGIONS_MANAGE"
                    ref="openSchoolHolidayRegionsModal"
                    v-tooltip="{content: $t('pages.schoolHolidays.manageRegion'), hideOnTargetClick: true, placement: 'bottom', trigger: 'focus hover click'}"
                    :text="$t('pages.schoolHolidays.manageRegion')"
                    icon="earth"
                    @click="openSchoolHolidayRegionsDialog()"
                />
            </template>
        </TopBar>
        <PmtLayout>
            <VContainer>
                <VRow>
                    <VCol>
                        <VAlert
                            v-if="HOLIDAYS_API_ERROR"
                            outlined
                            type="error"
                        >
                            {{ HOLIDAYS_API_ERROR }}
                        </VAlert>
                        <VCard class="p-4">
                            <VDataTable
                                v-if="SCHOOL_HOLIDAYS_READ"
                                ref="schoolHolidaysOverviewTable"
                                :headers="dataTableHeaders"
                                :items="SCHOOL_HOLIDAYS"
                                :items-per-page="10"
                                :disable-sort="IS_MOBILE"
                                sort-by="year"
                                sort-desc
                            >
                                <template #[`header`]>
                                    <tr class="filter-header-row">
                                        <th
                                            class="filter-header"
                                            style="max-width: 50px"
                                        >
                                            <PInput
                                                id="description"
                                                v-model="description"
                                                cy_id="description"
                                                full-border
                                                dense
                                                clearable
                                            />
                                        </th>
                                        <th class="filter-header">
                                            <DatePicker
                                                ref="fromPicker"
                                                :key="dateChanged"
                                                :options="fromDatepickerOptions"
                                                @on-select="from = $event; dateChanged = !dateChanged"
                                                @deselect-date="from = null; dateChanged = !dateChanged"
                                            >
                                                <template #activator="{ on, date }">
                                                    <PInput
                                                        id="fromPicker"
                                                        :value="date.shortDayFormat()"
                                                        cy_id="fromPicker"
                                                        append-icon="calendar-today"
                                                        dense
                                                        full-border
                                                        readyonly
                                                        input-style="cursor: pointer"
                                                        v-on="on"
                                                    />
                                                </template>
                                            </DatePicker>
                                        </th>
                                        <th class="filter-header">
                                            <DatePicker
                                                ref="toPicker"
                                                :key="dateChanged"
                                                :options="toDatepickerOptions"
                                                @on-select="to = $event; dateChanged = !dateChanged"
                                                @deselect-date="to = null; dateChanged = !dateChanged"
                                            >
                                                <template #activator="{ on, date }">
                                                    <PInput
                                                        id="toPicker"
                                                        :value="date.shortDayFormat()"
                                                        cy_id="toPicker"
                                                        append-icon="calendar-today"
                                                        dense
                                                        full-border
                                                        readyonly
                                                        input-style="cursor: pointer"
                                                        v-on="on"
                                                    />
                                                </template>
                                            </DatePicker>
                                        </th>
                                        <th
                                            class="filter-header"
                                            style="max-width: 128px"
                                        >
                                            <div class="select-container">
                                                <PSelect
                                                    ref="regionSelect"
                                                    v-model="region"
                                                    cy_id="regionSelect"
                                                    :items="SCHOOL_HOLIDAY_REGIONS"
                                                    item-value="id"
                                                    item-label="name"
                                                    dense
                                                    full-border
                                                    clearable
                                                />
                                            </div>
                                        </th>
                                        <th class="filter-header" />
                                    </tr>
                                </template>
                                <template #[`item.description`]="{ item }">
                                    <PmtCrudInput
                                        v-if="SCHOOL_HOLIDAYS_MANAGE"
                                        :full-object="item"
                                        identifier="description"
                                        type="text"
                                        @save="processCrudInputDataBeforeSave($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="item.description" />
                                    </PmtCrudInput>
                                    <span
                                        v-else
                                        v-html="item.description"
                                    />
                                </template>
                                <template #[`item.from`]="{ item }">
                                    <span v-html="$moment(item.from).format('dd DD MMM YYYY')" />
                                </template>
                                <template #[`item.to`]="{ item }">
                                    <span v-html="$moment(item.to).format('dd DD MMM YYYY')" />
                                </template>
                                <template #[`item.actions`]="{ item }">
                                    <PmtButton
                                        v-if="SCHOOL_HOLIDAYS_MANAGE"
                                        :primary="hovered === `edit_${item.id}`"
                                        :default="hovered !== `edit_${item.id}`"
                                        round
                                        icon="pencil"
                                        icon-size="15"
                                        @click="openSchoolHolidayDialog(item, 'edit')"
                                        @mouseover="hovered = `edit_${item.id}`"
                                        @mouseout="hovered = ''"
                                    />
                                    <PopoverButton
                                        v-if="SCHOOL_HOLIDAYS_MANAGE"
                                        :ref="`deleteSchoolHoliday_${item.id}`"
                                        :danger="hovered === `delete_${item.id}`"
                                        :default="hovered !== `delete_${item.id}`"
                                        round
                                        :is-open="showDeletePopover && activeSchoolHolidayId === item.id"
                                        :disabled="item.in_use"
                                        icon="delete-forever"
                                        icon-size="15"
                                        :cy_id="`DeleteSchoolHoliday-${item.id}`"
                                        @click="showDeletePopover = true; activeSchoolHolidayId = item.id"
                                        @mouseover="hovered = `delete_${item.id}`"
                                        @mouseout="hovered = ''"
                                        @hide="showDeletePopover = false;"
                                    >
                                        <template slot="popover-content">
                                            <p>{{ $t('pages.schoolHolidays.tableHeaderLabels.actions.deleteConfirm') }}</p>
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
                                                    @click="deleteHoliday(item.id)"
                                                >
                                                    {{ $t('ui.singles.yes') }}
                                                </PmtButton>
                                            </div>
                                        </template>
                                    </PopoverButton>
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
        </PmtLayout>
        <EditCreateSchoolHolidaysModal
            ref="editCreateSchoolHolidaysModal"
            :key="isUpdating"
            @save="createBodyBeforeSave"
        />
        <EditCreateSchoolHolidayRegionsModal
            ref="editCreateSchoolHolidayRegionsModal"
        />
    </PmtContent>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
    name: 'SchoolHolidays',
    components: {
        EditCreateSchoolHolidaysModal: () => import('@/pages/configuration/holidays/EditCreateSchoolHolidaysModal.vue'),
        EditCreateSchoolHolidayRegionsModal: () => import('@/pages/configuration/holidays/EditCreateSchoolHolidayRegionsModal.vue'),
    },
    data () {
        return {
            stores: [],
            dataTableHeaders: [
                {
                    text: this.$t('pages.schoolHolidays.tableHeaderLabels.description'),
                    value: 'description',
                    cellClass: 'description',
                    filter: value => { return (value + '').toLowerCase().includes(this.description.toLowerCase()) },
                },
                {
                    text: this.$t('pages.schoolHolidays.tableHeaderLabels.from'),
                    value: 'from',
                    cellClass: 'from',
                    filter: value => {
                        if (!this.from) return true
                        if (value) {
                            return this.from.isBeforeOrSameDayAs(this.$moment(value))
                        }
                    },
                },
                {
                    text: this.$t('pages.schoolHolidays.tableHeaderLabels.to'),
                    value: 'to',
                    cellClass: 'to',
                    filter: value => {
                        if (!this.to) return true
                        if (value) {
                            return this.to.isAfterOrSameDayAs(this.$moment(value))
                        }
                    },
                },
                {
                    text: this.$t('pages.schoolHolidays.tableHeaderLabels.regionName'),
                    value: 'region_name',
                    cellClass: 'region_name',
                    filter: value => {
                        if (!this.region.id) return true
                        if (value) {
                            return value.toString() === this.region.name.toString()
                        }
                    },
                },
                { text: '', value: 'actions', cellClass: 'actions' },
            ],
            activeSchoolHolidayId: null,
            isUpdating: false,
            showDeletePopover: false,
            hovered: '',
            description: '',
            to: this.$moment().add(1, 'year').endOf('year'),
            from: this.$moment().startOf('year'),
            region: {},
            editType: null,
            dateChanged: false,
        }
    },
    computed: {
        ...mapGetters(['IS_MOBILE']),
        ...mapGetters('configuration/holidays', ['SCHOOL_HOLIDAYS', 'SCHOOL_HOLIDAY_REGIONS', 'HOLIDAYS_API_ERROR']),
        ...mapGetters('auth', ['SCHOOL_HOLIDAYS_READ', 'SCHOOL_HOLIDAYS_MANAGE', 'SCHOOL_HOLIDAY_REGIONS_READ', 'SCHOOL_HOLIDAY_REGIONS_MANAGE']),
        fromDatepickerOptions () {
            return {
                id: 'from-datepicker',
                mode: 'day',
                disabled: this.loading,
                showResetFilter: true,
                overrideReset: true,
                emitSelectOnMounted: false,
                selectedDate: this.from,
                showSidebar: false,
                activator: {
                    block: true,
                    default: true,
                    outline: true,
                },
            }
        },
        toDatepickerOptions () {
            return {
                id: 'to-datepicker',
                mode: 'day',
                disabled: this.loading,
                showResetFilter: true,
                overrideReset: true,
                emitSelectOnMounted: false,
                selectedDate: this.to,
                showSidebar: false,
                activator: {
                    block: true,
                    default: true,
                    outline: true,
                },
            }
        },
    },
    created () {
        this.SET_HOLIDAYS_API_ERROR(null)
        this.getSchoolHolidays()
        this.getSchoolHolidayRegions()
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('configuration/holidays', ['getSchoolHolidays', 'addSchoolHoliday', 'editSchoolHoliday', 'deleteSchoolHoliday', 'getSchoolHolidayRegions']),
        ...mapMutations('configuration/holidays', ['SET_HOLIDAYS_API_ERROR']),
        openSchoolHolidayDialog (item, type) {
            this.editType = type
            this.activeSchoolHolidayId = item.id
            this.$refs.editCreateSchoolHolidaysModal.open(item, type)
        },
        save (body) {
            const apiPayload = {
                body: body,
            }

            this.isUpdating = true
            let apiMethod = 'addSchoolHoliday'
            if (this.editType === 'edit') {
                apiMethod = 'editSchoolHoliday'
                apiPayload.schoolHolidayId = this.activeSchoolHolidayId
            }
            this[apiMethod](apiPayload)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.schoolHolidays.dataHaveBeenUpdated'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.schoolHolidays.dataUpdateFailed'), error: true })
                })
                .finally(() => {
                    this.isUpdating = false
                    this.activeSchoolHolidayId = null
                })
        },
        createBodyBeforeSave (payload) {
            const body = {
                description: payload[0].value,
                from: payload[1].value,
                to: payload[2].value,
                region_id: this.SCHOOL_HOLIDAY_REGIONS.find(o => o.name === payload[3].value).id,
            }
            this.save(body)
        },
        processCrudInputDataBeforeSave (data) {
            this.activeSchoolHolidayId = data.object.id
            this.editType = 'edit'

            const schoolHolidays = JSON.parse(JSON.stringify(this.SCHOOL_HOLIDAYS))
            const body = schoolHolidays.find(o => o.id === this.activeSchoolHolidayId)

            body.description = data.inputValue
            delete body.region_name
            delete body.id

            this.save(body)
        },
        deleteHoliday (id) {
            this.deleteSchoolHoliday(id)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.schoolHolidays.dataHaveBeenDeleted'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.schoolHolidays.dataDeletionFailed'), error: true })
                })
                .finally(() => {
                    this.showDeletePopover = false
                })
        },
        openSchoolHolidayRegionsDialog () {
            this.$refs.editCreateSchoolHolidayRegionsModal.open()
        },
    },
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/mixins/_breakpoints.scss';

    .v-input {
        padding: 0 !important;
        margin: 0 !important;
    }

    :deep() .v-data-table > .v-data-table__wrapper > table {
        & > thead {
            & > tr {
                display: none;

                @include bp-md {
                    display: table-row;
                }

                & > th.text-start {
                    height: 32px;
                    border-bottom: none !important;
                }
            }
        }

        & > tbody > tr > td.actions {
            width: 112px;
        }

        .filter-header-row {
            display: none;

            @include bp-md {
                display: table-row;
            }

            & > th {
                font-size: 12px;
                font-weight: 400;
            }
        }
    }

    :deep() .btn {
        margin: 0px !important;
    }

    :deep() input {
        font-size: 12px;
    }

    :deep() .v-alert {
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 700;

        .v-icon {
            font-size: 16px;
        }
    }

    .filter-header {
        padding: 0 16px 4px !important;
        border-bottom: thin solid rgba(0, 0, 0, 0.12);

        .select-container {
            display: flex;
        }
    }
</style>
