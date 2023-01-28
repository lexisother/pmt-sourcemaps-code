<template>
    <div>
        <TopBar
            ref="topbar"
            :loading="loading"
            :show="{ search: true, filters: true }"
            show-search
            show-fly-out-filters
            :search="search"
            @search="search = $event"
        >
            <template #right>
                <BarButton
                    ref="createAccount"
                    cy_id="create-account"
                    icon="plus"
                    icon-size="16"
                    primary
                    outline
                    :text="$t('pages.manageAccounts.topbar.createAccount', [''])"
                    @click="createAccount()"
                />
            </template>
        </TopBar>
        <PmtLayout
            ref="layout"
            fixed-height
            :loading="loading"
            hide-loading-content
        >
            <PmtContent>
                <VContainer>
                    <VRow>
                        <VCol class="col-12">
                            <VCard class="pa-0">
                                <VDataTable
                                    ref="accountsTable"
                                    :headers="headers"
                                    :items="filteredAccounts"
                                    :items-per-page="10"
                                    sort-by="name"
                                    :disable-sort="IS_MOBILE"
                                    class="pmt-data-table"
                                    :single-expand="true"
                                    :expanded.sync="expanded"
                                    item-key="account_id"
                                    :mobile-breakpoint="0"
                                    :hide-default-header="PAGE_WIDTH < 992"
                                    @click:row="expandTableRow"
                                >
                                    <template #[`item.name`]="{ item }">
                                        <ChevronRight
                                            v-if="PAGE_WIDTH < 992"
                                            :size="16"
                                        />
                                        <strong>{{ item.name }}</strong>
                                    </template>
                                    <template #[`item.store_groups`]="{ item }">
                                        <span v-if="showAllStoreGroupsLabel(item)">
                                            {{ $t('pages.manageAccounts.allStoreGroups') }}
                                        </span>
                                        <EntityList
                                            v-else-if="item.role_priority !== 0 && item.store_groups !== null"
                                            :items="item.store_groups"
                                            :entities-name="$t('pages.manageAccounts.fields.storeGroups')"
                                            :class="{ 'entity-list': true, 'show-more': item.store_groups.length > 3 }"
                                        />
                                        <span v-else>
                                            {{ $t('pages.manageAccounts.noStoreGroupsAssigned') }}
                                        </span>
                                    </template>
                                    <template #[`item.actions`]="{ item }">
                                        <PmtButton
                                            v-if="ACTIVATE_ACCOUNT && !IS_MOBILE"
                                            ref="sendAccountActivation"
                                            v-ripple
                                            v-tooltip="$t('pages.manageAccounts.topbar.sendAccountActivation')"
                                            cy_id="send-account-activation"
                                            icon="email-send"
                                            round
                                            default
                                            @click="sendAccountActivation(item.account_id)"
                                        />
                                        <PmtButton
                                            v-if="RESET_ACCOUNT && !IS_MOBILE"
                                            ref="resetPassword"
                                            v-ripple
                                            v-tooltip="$t('pages.manageAccounts.topbar.resetPassword')"
                                            cy_id="reset-password"
                                            icon="lock-reset"
                                            round
                                            default
                                            @click="resetPassword(item.account_id)"
                                        />
                                        <PmtButton
                                            v-ripple
                                            v-tooltip="$t('ui.singles.edit')"
                                            round
                                            default
                                            icon="pencil"
                                            icon-size="16"
                                            @click="editAccount(item)"
                                        />

                                        <PopoverButton
                                            ref="deleteUserActivator"
                                            v-ripple
                                            v-tooltip="$t('ui.singles.delete')"
                                            cy_id="delete-user-activator"
                                            :is-open="removingAccount === item.account_id"
                                            icon="delete-forever"
                                            icon-size="16"
                                            default
                                            round
                                            @click="removingAccount = item.account_id"
                                            @hide="removingAccount = null"
                                        >
                                            <template #popover-content>
                                                <div>
                                                    <p>{{ $t('pages.manageAccounts.tableActions.deleteConfirmation') }}</p>
                                                    <div class="popover-buttons-right">
                                                        <PmtButton
                                                            ref="cancelDeleteAccount"
                                                            cy_id="cancel-delete-account"
                                                            default
                                                            outline
                                                            @click="removingAccount = null"
                                                        >
                                                            {{ $t('ui.singles.no') }}
                                                        </PmtButton>
                                                        <span class="mx-2" />
                                                        <PmtButton
                                                            ref="deleteAccount"
                                                            cy_id="delete-account"
                                                            primary
                                                            danger
                                                            @click="deleteAccount(item)"
                                                        >
                                                            {{ $t('ui.singles.yes') }}
                                                        </PmtButton>
                                                    </div>
                                                </div>
                                            </template>
                                        </PopoverButton>
                                    </template>
                                    <template
                                        v-if="IS_MOBILE"
                                        #expanded-item="{ item }"
                                    >
                                        <td :colspan="2">
                                            <div class="expanded-content">
                                                <ul>
                                                    <template v-for="(header, index) in headers.filter(o => o.cellClass.indexOf('secondary') > -1)">
                                                        <li :key="index">
                                                            <span class="label">{{ header.text }}</span>
                                                            <span class="value">{{ secondaryValueDisplay(item, header) }}</span>
                                                        </li>
                                                    </template>
                                                </ul>
                                                <PmtButton
                                                    v-if="ACTIVATE_ACCOUNT"
                                                    ref="sendAccountActivation"
                                                    v-ripple
                                                    cy_id="send-account-activation"
                                                    icon="email-send"
                                                    default
                                                    outline
                                                    @click="sendAccountActivation(item.account_id)"
                                                >
                                                    {{ $t('pages.manageAccounts.topbar.sendAccountActivation') }}
                                                </PmtButton>
                                                <PmtButton
                                                    v-if="RESET_ACCOUNT"
                                                    ref="resetPassword"
                                                    v-ripple
                                                    cy_id="reset-password"
                                                    icon="lock-reset"
                                                    default
                                                    outline
                                                    @click="resetPassword(item.account_id)"
                                                >
                                                    {{ $t('pages.manageAccounts.topbar.resetPassword') }}
                                                </PmtButton>
                                            </div>
                                        </td>
                                    </template>
                                </VDataTable>
                            </VCard>
                        </VCol>
                    </VRow>
                </VContainer>
            </PmtContent>
        </PmtLayout>
        <EditCreateAccountModal
            :edit-account="selectedAccount"
            :is-open="editCreateModalIsOpen"
            :is-saving="isSaving"
            :is-resetting="isResetting"
            :is-activating="isActivating"
            @save="save"
            @close-dialog="closeModal"
            @send-account-activation="sendAccountActivation"
            @reset-password="resetPassword"
        />
    </div>
</template>

<script>

import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import objectHelper from '@/libraries/objectHelper'
import accountHelper from '@/libraries/accountHelper'
import service from '@/services/AccountService'

export default {
    name: 'AccountsManagementPage',

    components: {
        TopBar: () => import('@/components/ui/top-bar/TopBar.vue'),
        EntityList: () => import('@/components/ui/EntityList.vue'),
        EditCreateAccountModal: () => import('@/pages/configuration/organisational-accounts/EditCreateAccountModal.vue'),
    },

    data () {
        return {
            loading: false,
            search: '',
            headers: [
                { text: this.$t('pages.manageAccounts.fields.name'), value: 'name', cellClass: 'primary' },
                { text: this.$t('pages.manageAccounts.fields.username'), value: 'username', cellClass: 'secondary' },
                { text: this.$t('pages.manageAccounts.fields.personnelNumber'), value: 'personnel_number', cellClass: 'secondary' },
                { text: this.$t('pages.manageAccounts.fields.role'), value: 'role_name', cellClass: 'secondary', filterable: false },
                { text: this.$t('pages.manageAccounts.fields.storeGroups'), value: 'store_groups', cellClass: 'secondary', sortable: false, filterable: false },
                { text: '', value: 'actions', cellClass: 'primary actions text-end', sortable: false, filterable: false },
            ],
            expanded: [],
            editCreateModalIsOpen: false,
            selectedAccount: {},
            removingAccount: null,
            isSaving: false,
            isResetting: false,
            isActivating: false,
        }
    },

    computed: {
        ...mapState('account', ['organisationalAccounts']),
        ...mapState({ selectedFilters: 'pageFilters' }),
        ...mapGetters('auth', ['STORE_GROUPS', 'canManageSAUser', 'RESET_ACCOUNT', 'ACTIVATE_ACCOUNT', 'IS_SUPER_ADMIN']),
        ...mapGetters(['IS_MOBILE', 'PAGE_WIDTH']),

        /**
         * Accounts filtered by selected filters in the sidepanel
         *
         * @returns {*[]}
         */
        filteredAccounts () {
            return this.organisationalAccounts.filter(account => {
                if ((this.selectedFilters.active[0] === 'active' && !account.active) ||
                    (this.selectedFilters.active[0] === 'inactive' && account.active)) {
                    return false
                }

                if (this.selectedFilters.roles.length > 0 && !this.selectedFilters.roles.includes(account.role_id)) {
                    return false
                }

                if ((this.selectedFilters.storeGroups.length === 0 || !account.store_groups) && this.matchesSearchString(account)) {
                    return true
                }

                const userGroups = account.store_groups ? account.store_groups.map(item => parseInt(item.id)) : []
                return !(this.selectedFilters.storeGroups.filter(groupId => userGroups.includes(groupId)).length === 0) && this.matchesSearchString(account)
            })
        },

        roles () {
            if (this.organisationalAccounts.length < 1) {
                return []
            }

            const roles = this.organisationalAccounts.map(user => {
                return {
                    id: user.role_id,
                    identifier: user.role_identifier,
                    role_name: user.role_name,
                    role_priority: user.role_priority,
                }
            })

            return objectHelper.getUniqueListByKey(roles, 'id')
        },
    },

    async created () {
        if (!this.organisationalAccounts.length || this.$route.params.refresh) {
            await this.getAccounts()
        }
        await this.setCustomStoreRoles(this.roles)
        this.UPDATE_ENABLED_FILTERS({
            storeGroups: true,
            roles: true,
            active: true,
        })
    },

    methods: {
        ...mapMutations(['SET_SNACKBAR', 'CLEAR_PAGE_FILTERS', 'UPDATE_ENABLED_FILTERS', 'UPDATE_PAGE_FILTER']),
        ...mapActions('account', ['GET_ORGANISATIONAL_ACCOUNTS', 'DELETE_ACCOUNT', 'SAVE_ACCOUNT']),
        ...mapMutations('stores', ['setCustomStoreRoles']),
        ...mapMutations('account', ['UPDATE_ACCOUNT', 'CREATE_ACCOUNT', 'REMOVE_ACCOUNT']),

        async getAccounts () {
            this.loading = true
            await this.GET_ORGANISATIONAL_ACCOUNTS({
                forceReload: true,
                role_priority: this.canManageSAUser ? '0,1' : '1',
            })
            this.loading = false
        },
        expandTableRow (value) {
            if (this.PAGE_WIDTH < 992) {
                const index = this.expanded.indexOf(value)
                if (index === -1) {
                    this.expanded.push(value)
                } else {
                    this.expanded.splice(index, 1)
                }
            }
        },
        /**
         * Secondary value displayed on mobile screens (in expanded panel)
         */
        secondaryValueDisplay (item, header) {
            if (header.value === 'store_groups') {
                if (this.showAllStoreGroupsLabel(item)) {
                    return this.$t('pages.manageAccounts.allStoreGroups')
                } else if (item.role_priority !== 0 && item.store_groups !== null) {
                    return item[header.value].map(o => o.name).join(', ')
                } else {
                    return this.$t('pages.manageAccounts.noStoreGroupsAssigned')
                }
            }
            return item[header.value]
        },
        /**
         * Determine if 'all storegroups' should be displayed
         */
        showAllStoreGroupsLabel (item) {
            return (item.role_priority === 0 && item.store_groups === null) || (item.store_groups && item.store_groups.length === this.roles.length)
        },
        matchesSearchString (item) {
            if (this.search && this.search.length >= 2) {
                const needle = this.search.toLowerCase()
                const fields = ['name', 'username', 'role_name']
                let match = 0
                fields.forEach(field => {
                    if (item[field] && item[field] !== null && item[field].toString().toLowerCase().includes(needle)) {
                        match++
                    }
                })
                if (match > 0) {
                    return true
                }
                return false
            }
            return true
        },
        createAccount () {
            this.selectedAccount = {}
            this.editCreateModalIsOpen = true
        },
        editAccount (account) {
            if (!account) return false
            this.selectedAccount = account
            this.editCreateModalIsOpen = true
        },
        closeModal () {
            this.selectedAccount = {}
            this.editCreateModalIsOpen = false
        },
        deleteAccount (item) {
            this.DELETE_ACCOUNT(item.account_id)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.manageAccounts.messages.success.accountDeleted'), success: true })
                    this.REMOVE_ACCOUNT(item.account_id)
                })
                .catch(error => {
                    this.removingAccount = null
                    const message = error.code === 'general.notFound' ? this.$t('pages.manageAccounts.messages.error.accountNotFound') : error.message
                    this.SET_SNACKBAR({ message: message, error: true })
                })
        },
        /**
         * Payload for saving call
         */
        payload (account) {
            return {
                account_id: account.account_id,
                username: account.username,
                email: account.email,
                first_name: account.employee_first_name,
                middle_name: account.employee_middle_name,
                last_name: account.employee_last_name,
                date_of_employment: account.date_of_employment,
                date_of_unemployment: account.date_of_unemployment?.length ? account.date_of_unemployment : null,
                store_group_ids: (account.store_groups || []).map(item => item.id),
                role_id: account.role.id,
                blocked_context_ids: Array.isArray(account.blocked_contexts) ? account.blocked_contexts.map(item => item.id) : [],
            }
        },
        save (account) {
            this.isSaving = true
            const payload = this.payload(account)

            this.SAVE_ACCOUNT(payload)
                .then(response => {
                    const message = payload.account_id ? this.$t('pages.manageAccounts.messages.success.accountUpdated') : this.$t('pages.manageAccounts.messages.success.accountCreated')

                    // update or insert account in accounts list
                    const handledAccount = JSON.parse(JSON.stringify(account))
                    delete handledAccount.role
                    handledAccount.name = accountHelper.namePartsToFullName(account)
                    if (account.account_id) {
                        this.UPDATE_ACCOUNT(handledAccount)
                    } else {
                        this.CREATE_ACCOUNT({
                            ...handledAccount,
                            account_id: response.account_id,
                            role_id: account.role.id,
                            role_name: account.role_name,
                            role_priority: account.role_priority,
                        })
                    }

                    this.SET_SNACKBAR({ message: message, success: true })
                })
                .catch(error => {
                    this.SET_SNACKBAR({ message: error.message, error: true })
                })
                .finally(() => {
                    this.isSaving = false
                    this.closeModal()
                })
        },
        sendAccountActivation (accountId) {
            this.isActivating = true
            return service.sendAccountActivation(accountId)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.manageAccounts.messages.success.accountActivationSent'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.manageAccounts.messages.error.sendingAccountActivationFailed'), error: true })
                })
                .finally(() => {
                    this.isActivating = false
                })
        },
        resetPassword (accountId) {
            this.isResetting = true
            return service.resetPassword(accountId)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.manageAccounts.messages.success.passwordReset'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.manageAccounts.messages.error.passwordResetFailed'), error: true })
                })
                .finally(() => {
                    this.isResetting = false
                })
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixins/_breakpoints.scss';

.container {
    max-width: 100vw;
    margin: 0 !important;

    &:not(.full-width) {
        @include bp-xl {
            max-width: 1872px;
            margin: 0 auto !important;
        }
    }
}

:deep() {
    tr {
        width: 100%;

        td.secondary {
            display: none;

            @include bp-md {
                display: table-cell;
            }
        }

        td.primary {
            cursor: pointer;

            @include bp-lg {
                cursor: default;
            }

            .material-design-icon {
                width: 16px;
                margin-right: 8px;
                color: var(--grey-100);

                &> svg {
                    vertical-align: top;
                    transition: all 0.15s;
                }
            }
        }

        &.v-data-table__expanded {

            td {
                border: none !important;
            }

            .chevron-right-icon svg {
                transform: rotate(90deg);
                transition: all 0.3s;
            }

            &.v-data-table__expanded__content td {
                border-bottom: 1px solid var(--grey-40) !important;
            }
        }
    }

    .v-data-table__expanded.v-data-table__expanded__content td {
        padding: 0 !important;
    }
}

.expanded-content {
    padding: 8px 16px 8px 40px;
}
</style>
