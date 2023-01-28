<template>
    <PmtContent>
        <TopBar ref="topbar">
            <template #right>
                <BarButton
                    ref="createPublicHoliday"
                    v-tooltip="{content: $t('pages.publicHolidays.add'), hideOnTargetClick: true, placement: 'bottom', trigger: 'focus hover click'}"
                    :text="$t('pages.publicHolidays.add')"
                    icon="plus"
                    @click="openPublicHolidayDialog({}, 'new')"
                />
            </template>
        </TopBar>
        <PmtLayout>
            <VContainer>
                <VRow v-if="HOLIDAYS_MANAGE">
                    <VCol class="col-12 py-0">
                        <p
                            v-if="holidaysApiError"
                            class="text-error"
                        >
                            {{ holidaysApiError }}
                        </p>
                    </VCol>
                    <VCol>
                        <VCard class="p-2 p-md-3">
                            <VDataTable
                                :headers="dataTableHeaders"
                                :items="holidays"
                                :items-per-page="10"
                                sort-by="year"
                                sort-desc
                                class="public-holidays-table config-data-table"
                            >
                                <template #[`header`]>
                                    <tr>
                                        <th
                                            class="filter-header"
                                            style="max-width: 50px"
                                        >
                                            <PInput
                                                id="name"
                                                v-model="name"
                                                cy_id="name"
                                                clearable
                                                full-border
                                                dense
                                            />
                                        </th>
                                        <th class="filter-header" />
                                        <th class="filter-header" />
                                        <th
                                            class="filter-header"
                                            style="max-width: 96px"
                                        >
                                            <PSelect
                                                ref="yearSelector"
                                                v-model="year"
                                                cy_id="yearSelector"
                                                :items="availableYears"
                                                clearable
                                                dense
                                                full-border
                                                emit-value
                                            />
                                        </th>
                                        <th class="filter-header" />
                                        <th class="filter-header" />
                                    </tr>
                                </template>
                                <template #[`item.name`]="{ item }">
                                    <PmtCrudInput
                                        :full-object="item"
                                        identifier="name"
                                        type="text"
                                        @save="processCrudInputDataBeforeSave($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="item.name" />
                                    </PmtCrudInput>
                                </template>
                                <template #[`item.is_christian`]="{ item }">
                                    <VIcon
                                        v-if="item.is_christian"
                                        color="green"
                                        :size="20"
                                        v-text="'mdi-check'"
                                    />
                                </template>
                                <template #[`item.actions`]="{ item }">
                                    <PmtButton
                                        :primary="hovered === `edit_${item.id}`"
                                        :default="hovered !== `edit_${item.id}`"
                                        round
                                        icon="pencil"
                                        icon-size="15"
                                        @click="openPublicHolidayDialog(item, 'edit')"
                                        @mouseover="hovered = `edit_${item.id}`"
                                        @mouseout="hovered = ''"
                                    />
                                    <PopoverButton
                                        :ref="`deletePublicHoliday_${item.id}`"
                                        :danger="hovered === `delete_${item.id}`"
                                        :default="hovered !== `delete_${item.id}`"
                                        round
                                        :is-open="showDeletePopover && activePublicHolidayId === item.id"
                                        :disabled="item.in_use"
                                        icon="delete-forever"
                                        icon-size="15"
                                        :cy_id="`DeletePublicHoliday-${item.id}`"
                                        @click="showDeletePopover = true; activePublicHolidayId = item.id"
                                        @mouseover="hovered = `delete_${item.id}`"
                                        @mouseout="hovered = ''"
                                        @hide="showDeletePopover = false;"
                                    >
                                        <template slot="popover-content">
                                            <p v-if="showDeletePopover">
                                                {{ $t('pages.publicHolidays.tableHeaderLabels.actions.deleteConfirm') }}
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
                                                    @click="deleteHoliday(item.id)"
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
        <EditCreatePublicHolidaysModal
            ref="editCreatePublicHolidaysModal"
            :key="isUpdating"
            @save="save"
        />
    </PmtContent>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import stringHelper from '@/libraries/stringHelper'
import objectHelper from '@/libraries/objectHelper'

export default {
    name: 'PublicHolidays',
    components: {
        EditCreatePublicHolidaysModal: () => import('@/pages/configuration/holidays/EditCreatePublicHolidaysModal.vue'),
    },
    data () {
        return {
            stores: [],
            dataTableHeaders: [
                {
                    text: this.$t('pages.publicHolidays.tableHeaderLabels.description'),
                    value: 'name',
                    cellClass: 'name',
                    filter: f => { return (f + '').toLowerCase().includes(this.name.toLowerCase()) },
                },
                { text: this.$t('pages.publicHolidays.tableHeaderLabels.day'), value: 'day', cellClass: 'day' },
                { text: this.$t('pages.publicHolidays.tableHeaderLabels.month'), value: 'month', cellClass: 'month' },
                {
                    text: this.$t('pages.publicHolidays.tableHeaderLabels.year'),
                    value: 'year',
                    cellClass: 'year',
                    filter: value => {
                        if (!this.year) return true
                        if (value) {
                            return value.toString() === this.year.toString()
                        }
                    },
                },
                { text: this.$t('pages.publicHolidays.tableHeaderLabels.christian'), value: 'is_christian', cellClass: 'is_christian' },
                { text: '', value: 'actions', cellClass: 'data-table-actions-cell', align: 'right' },
            ],
            activePublicHolidayId: null,
            isUpdating: false,
            showDeletePopover: false,
            hovered: '',
            name: '',
            year: '',
            editType: null,
        }
    },
    computed: {
        ...mapGetters('configuration/holidays', {
            publicHolidays: 'PUBLIC_HOLIDAYS',
            holidaysApiError: 'HOLIDAYS_API_ERROR',
        }),
        ...mapGetters('auth', ['HOLIDAYS_MANAGE']),
        holidays () {
            return this.publicHolidays
        },
        availableYears () {
            const availableYears = []
            this.holidays.forEach(holiday => {
                if (holiday.year && !availableYears.find(o => o.value === holiday.year)) {
                    availableYears.push({ value: holiday.year, label: holiday.year })
                }
            })
            return objectHelper.sortByKey(availableYears, 'value', false)
        },
    },
    created () {
        this.SET_HOLIDAYS_API_ERROR(null)
        this.getPublicHolidays()
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('configuration/holidays', ['getPublicHolidays', 'addPublicHoliday', 'editPublicHoliday', 'deletePublicHoliday']),
        ...mapMutations('configuration/holidays', ['SET_HOLIDAYS_API_ERROR']),
        openPublicHolidayDialog (item, type) {
            this.editType = type
            this.activePublicHolidayId = item.id
            this.$refs.editCreatePublicHolidaysModal.open(item, type)
        },
        save (payload) {
            const publicHoliday = this.publicHolidays.find(o => o.id === this.activePublicHolidayId)
            const body = this.createBody(payload, publicHoliday)

            this.isUpdating = true
            let apiMethod = 'editPublicHoliday'
            if (this.editType === 'new') {
                apiMethod = 'addPublicHoliday'
            }
            this[apiMethod](body)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.publicHolidays.dataHaveBeenUpdated'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.publicHolidays.dataUpdateFailed'), error: true })
                })
                .finally(() => {
                    this.isUpdating = false
                    this.activePublicHolidayId = null
                })
        },
        createBody (payload, holiday) {
            let body = {}
            if (holiday) {
                body = {
                    name: holiday.name,
                    day: holiday.day,
                    month: holiday.month,
                    year: holiday.year,
                    is_christian: holiday.is_christian,
                    id: this.activePublicHolidayId,
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
            this.activePublicHolidayId = data.object.id
            this.editType = 'edit'
            const payload = [
                {
                    value: stringHelper.escapeString(data.inputValue),
                    identifier: data.identifier,
                },
            ]
            this.save(payload)
        },
        deleteHoliday (id) {
            this.deletePublicHoliday(id)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.publicHolidays.dataHaveBeenUpdated'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.publicHolidays.dataUpdateFailed'), error: true })
                })
                .finally(() => {
                    this.showDeletePopover = false
                })
        },
    },
}

</script>

<style lang="scss" scoped>
    @import '@/assets/scss/mixins/_breakpoints.scss';
    :deep(.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr:last-child > th) {
        border-bottom: none;
    }

    th {
        display: none;

        @include bp-md {
            display: table-cell;
        }
    }

    .v-input {
        padding: 0 !important;
        margin: 0 !important;
    }

    .filter-header {
        padding: 0 16px !important;
        border-bottom: thin solid rgba(0, 0, 0, 0.12);
        padding-bottom: 4px !important;
    }

    .name, .day, .month, .year, .is_christian {
        position: relative;

        strong {
            font-weight: 600 !important;
        }
    }

</style>
