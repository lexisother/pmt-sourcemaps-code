<template>
    <PmtLayout>
        <PmtContent>
            <TopBar
                v-if="STORE_GROUPS_MANAGE"
                ref="topbar"
                show-search
                search-offset
                :search="SEARCH_STRING"
                @search="searchStoreGroups"
            >
                <template #right>
                    <BarButton
                        ref="createStoreGroup"
                        v-tooltip="{content: $t('pages.storeGroups.add'), hideOnTargetClick: true, placement: 'bottom', trigger: 'focus hover click'}"
                        :text="$t('pages.storeGroups.add')"
                        icon="plus"
                        @click="openStoreGroupDialog({}, 'add')"
                    />
                </template>
            </TopBar>
            <VContainer>
                <VRow v-if="STORE_GROUPS_MANAGE">
                    <VCol class="col-12 py-0">
                        <p
                            v-if="STORE_GROUPS_API_ERROR"
                            class="text-error"
                        >
                            {{ STORE_GROUPS_API_ERROR }}
                        </p>
                        <p
                            v-if="nameIsNotUnique"
                            ref="nameIsNotUnique"
                            class="text-error"
                        >
                            {{ $t('pages.storeGroups.nameIsNotUnique') }}
                        </p>
                        <p
                            v-if="SEARCH_STRING && SEARCH_STRING.length > 1"
                            ref="searchResultsNotification"
                        >
                            <strong>{{ storeGroups.length }}</strong>&nbsp;
                            {{ storeGroups.length === 1 ? $t('pages.storeGroups.storeGroup') : $t('pages.storeGroups.storeGroups') }}&nbsp;
                            {{ $t('pages.storeGroups.foundWith') }} '<span class="font-weight-bold">{{ SEARCH_STRING }}</span>'.&nbsp;
                            <a
                                ref="clearResults"
                                @click="searchStoreGroups('')"
                            >
                                {{ $t('pages.storeGroups.showAllStoreGroups') }}
                            </a>
                        </p>
                    </VCol>
                    <VCol>
                        <VCard class="p-2 p-md-3">
                            <VDataTable
                                ref="StoreGroupsTable"
                                :headers="dataTableHeaders"
                                :items="STORE_GROUPS"
                                :items-per-page="10"
                                calculate-widths
                                class="config-data-table"
                            >
                                <template #[`header.log_in`]="{ header }">
                                    <span v-tooltip="$t('pages.storeGroups.tableHeaderLabels.logInTooltip')">
                                        <span v-html="header.text" />&nbsp;
                                        <Information
                                            :size="16"
                                            class="d-inline-block"
                                        />
                                    </span>
                                </template>
                                <template #[`header.exchange`]="{ header }">
                                    <span v-tooltip="$t('pages.storeGroups.tableHeaderLabels.exchangeTooltip')">
                                        <span v-html="header.text" />&nbsp;
                                        <Information
                                            :size="16"
                                            class="d-inline-block"
                                        />
                                    </span>
                                </template>
                                <template #[`header.environment_sync`]="{ header }">
                                    <span v-tooltip="$t('pages.storeGroups.tableHeaderLabels.environmentSyncTooltip')">
                                        <span v-html="header.text" />&nbsp;
                                        <Information
                                            :size="16"
                                            class="d-inline-block"
                                        />
                                    </span>
                                </template>
                                <template #[`item.name`]="{ item }">
                                    <PmtCrudInput
                                        :full-object="item"
                                        identifier="name"
                                        type="text"
                                        @save="processCrudInputDataBeforeSave($event)"
                                        v-on="$listeners"
                                    >
                                        <span v-html="displayedValue(item.name)" />
                                    </PmtCrudInput>
                                </template>
                                <template #[`item.log_in`]="{ item }">
                                    <PmtSwitch
                                        v-model="item.log_in"
                                        label="&nbsp;"
                                        @input="changeSwitchvalue(item.id, 'log_in', $event)"
                                    />
                                </template>
                                <template #[`item.exchange`]="{ item }">
                                    <PmtSwitch
                                        v-model="item.exchange"
                                        label="&nbsp;"
                                        @input="changeSwitchvalue(item.id, 'exchange', $event)"
                                    />
                                </template>
                                <template #[`item.environment_sync`]="{ item }">
                                    <PmtSwitch
                                        v-model="item.environment_sync"
                                        label="&nbsp;"
                                        @input="changeSwitchvalue(item.id, 'environment_sync', $event)"
                                    />
                                </template>
                                <template #[`item.actions`]="{ item }">
                                    <PmtButton
                                        :ref="`editButton${item.id}`"
                                        :primary="hovered === `edit_${item.id}`"
                                        :default="hovered !== `edit_${item.id}`"
                                        round
                                        icon="pencil"
                                        icon-size="15"
                                        @click="openStoreGroupDialog(item, 'edit')"
                                        @mouseover="hovered = `edit_${item.id}`"
                                        @mouseout="hovered = ''"
                                    />
                                    <PmtButton
                                        :primary="hovered === `settings_${item.id}`"
                                        :default="hovered !== `settings_${item.id}`"
                                        round
                                        icon="cogs"
                                        icon-size="15"
                                        @click="goToStoreGroup(item.id)"
                                        @mouseover="hovered = `settings_${item.id}`"
                                        @mouseout="hovered = ''"
                                    />
                                    <popover-button
                                        ref="deleteStoreGroup"
                                        :danger="hovered === `delete_${item.id}`"
                                        :default="hovered !== `delete_${item.id}`"
                                        round
                                        :is-open="showDeletePopover && activeStoreGroupId === item.id"
                                        icon="delete-forever"
                                        icon-size="15"
                                        :disabled="item.store_count > 0"
                                        @click="showDeletePopover = true; activeStoreGroupId = item.id"
                                        @mouseover="hovered = `delete_${item.id}`"
                                        @mouseout="hovered = ''"
                                        @hide="showDeletePopover = false;"
                                    >
                                        <template slot="popover-content">
                                            <p v-if="showDeletePopover">
                                                {{ $t('pages.storeGroups.tableHeaderLabels.actions.deleteConfirm') }}
                                            </p>
                                            <div class="popover-buttons-right">
                                                <pmt-button
                                                    default
                                                    outline
                                                    custom-class="tooltip-target b1"
                                                    @click="showDeletePopover = false"
                                                >
                                                    {{ $t('ui.singles.no') }}
                                                </pmt-button>
                                                <span class="mx-2" />
                                                <pmt-button
                                                    v-if="showDeletePopover"
                                                    primary
                                                    danger
                                                    custom-class="tooltip-target b1"
                                                    @click="remove(item.id)"
                                                >
                                                    {{ $t('ui.singles.yes') }}
                                                </pmt-button>
                                            </div>
                                        </template>
                                    </popover-button>
                                </template>
                            </VDataTable>
                        </VCard>
                    </VCol>
                </VRow>
                <EmptyState
                    v-else
                    ref="noAccess"
                    :title="$t('pages.storeGroups.noAccess')"
                    :component="'four-o-four'"
                    :show="true"
                    :is-error="true"
                    no-padding
                />
            </VContainer>
        </PmtContent>
        <StoreGroupsModal
            ref="storeGroupsModal"
            :name-is-not-unique="nameIsNotUnique"
            @close="close"
            @save="save"
        />
    </PmtLayout>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import stringHelper from '@/libraries/stringHelper'

export default {
    name: 'StoreGroupsOverview',
    components: {
        StoreGroupsModal: () => import('@/pages/configuration/store-groups/StoreGroupsModal'),
    },
    data () {
        return {
            dataTableHeaders: [
                { text: this.$t('pages.storeGroups.tableHeaderLabels.name'), value: 'name', cellClass: 'data-table-cell' },
                { text: this.$t('pages.storeGroups.tableHeaderLabels.loginGroup'), value: 'log_in', cellClass: 'data-table-cell', align: 'center' },
                { text: this.$t('pages.storeGroups.tableHeaderLabels.exchangeGroup'), value: 'exchange', cellClass: 'data-table-cell', align: 'center' },
                { text: this.$t('pages.storeGroups.tableHeaderLabels.environmentSync'), value: 'environment_sync', cellClass: 'data-table-cell', align: 'center' },
                { text: this.$t('pages.storeGroups.tableHeaderLabels.stores'), value: 'store_count', cellClass: 'data-table-cell', align: 'center' },
                { text: this.$t('pages.storeGroups.tableHeaderLabels.users'), value: 'user_count', cellClass: 'data-table-cell', align: 'center' },
                { text: '', value: 'actions', cellClass: 'data-table-actions-cell', align: 'right' },
            ],
            activeStoreGroupId: null,
            showDeletePopover: false,
            hovered: null,
            isUpdating: false,
            testToggle: false,
            nameIsNotUnique: false,
        }
    },
    computed: {
        ...mapGetters('configuration/storeGroups', ['STORE_GROUPS', 'SEARCH_STRING', 'STORE_GROUPS_API_ERROR']),
        ...mapGetters('auth', ['STORE_GROUPS_MANAGE']),
        storeGroups () {
            return this.STORE_GROUPS
        },
    },
    mounted () {
        this.SET_SEARCH_STRING('')
        this.getStoreGroups()
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('configuration/storeGroups', ['getStoreGroups', 'updateStoreGroup', 'insertStoreGroup', 'deleteStoreGroup']),
        ...mapMutations('configuration/storeGroups', ['SET_SEARCH_STRING']),
        searchStoreGroups (searchString) {
            this.SET_SEARCH_STRING(searchString)
        },
        openStoreGroupDialog (item, action) {
            this.nameIsNotUnique = false
            this.activeStoreGroupId = item.id
            this.$refs.storeGroupsModal.open(item, action)
        },
        goToStoreGroup (storeGroupId) {
            this.$router.push('/configuration/store-group-settings/' + storeGroupId)
        },
        /**
        * save new or existing store group
        * create body first and then determine which api call to be executed
        */
        save (args) {
            this.nameIsNotUnique = false
            let storeGroup = {}
            if (args.action === 'edit') {
                storeGroup = this.STORE_GROUPS.find(o => o.id === this.activeStoreGroupId)
            }
            const body = this.createBody(args.payload, args.action, storeGroup)

            if (!this.nameIsUnique(body.name)) {
                this.nameIsNotUnique = true
                return
            }

            if (storeGroup && body) {
                this.isUpdating = true
                let apiMethod = 'insertStoreGroup'
                let apiPayload = body
                if (args.action === 'edit') {
                    apiMethod = 'updateStoreGroup'
                    apiPayload = { storeGroupId: this.activeStoreGroupId, body: body }
                }

                this[apiMethod](apiPayload)
                    .then(() => {
                        this.SET_SNACKBAR({ message: this.$t('pages.storeGroups.dataHaveBeenUpdated'), success: true })
                    })
                    .catch(() => {
                        this.SET_SNACKBAR({ message: this.$t('pages.storeGroups.dataUpdateFailed'), error: true })
                    })
                    .finally(() => {
                        this.isUpdating = false
                        this.activeStoreGroupId = null
                        this.$refs.storeGroupsModal.close()
                    })
            }
        },
        /**
        * create body for put or post call
        */
        createBody (payload, action, storeGroup) {
            let body = {
                name: '',
                log_in: false,
                exchange: false,
                environment_sync: false,
            }

            if (action === 'edit') {
                body = {
                    name: storeGroup.name,
                    log_in: storeGroup.log_in,
                    exchange: storeGroup.exchange,
                    environment_sync: storeGroup.environment_sync,
                }
            }

            if (payload && payload.length) {
                payload.forEach((item) => {
                    body[item.identifier] = item.value
                })
            }

            return body
        },
        nameIsUnique (name) {
            if (this.storeGroups.find(o => o.name === name && o.id !== this.activeStoreGroupId) === undefined) {
                return true
            }
            return false
        },
        /**
        * value of name has been changed inline
        * new value will be saved directly
        */
        processCrudInputDataBeforeSave (data) {
            this.activeStoreGroupId = data.object.id
            const payload = [
                {
                    value: stringHelper.escapeString(data.inputValue),
                    identifier: data.identifier,
                },
            ]
            this.save({ payload: payload, action: 'edit' })
        },
        /**
        * one of the toggles in the table has been swithched
        * new value will be saved directly
        */
        changeSwitchvalue (storeGroupId, identifier, event) {
            this.activeStoreGroupId = storeGroupId
            const payload = [
                {
                    value: event,
                    identifier: identifier,
                },
            ]
            this.save({ payload: payload, action: 'edit' })
        },
        remove (storeGroupId) {
            this.deleteStoreGroup(storeGroupId)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.storeGroups.storeGroupHasBeenDeleted'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.storeGroups.storeGroupRemovalFailed'), error: true })
                })
                .finally(() => {
                    this.showDeletePopover = false
                })
        },
        close () {
            this.nameIsNotUnique = false
            this.activeStoreGroupId = null
        },
        displayedValue (string) {
            return stringHelper.highlight(string, this.SEARCH_STRING)
        },
    },
}
</script>

<style lang="scss" scoped>
    :deep() .highlighted {
        color: var(--primary-color);
        font-weight: 600 !important;
    }

</style>
