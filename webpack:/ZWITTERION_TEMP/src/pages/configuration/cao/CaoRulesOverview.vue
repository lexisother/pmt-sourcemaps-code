<template>
    <div>
        <TopBar ref="topbar" show-search search-offset :search="searchString" @search="searchInRules">
            <template v-if="RECALCULATE" #right>
                <BarButton v-if="isEnvironmentCao" ref="recalculateButton" default
                    :text="$t('pages.cao.recalculateButtonLabel')" :dropdown-width="288" icon="sync" icon-size="20">
                    <template #dropdown>
                        <div class="px-3 py-3">
                            <p>
                                {{ $t('pages.cao.recalculateConfirm') }}
                            </p>
                            <PmtButton default outline :disabled="relaculationIsProcessing"
                                @click="$refs.recalculateButton.close()">
                                {{ $t('ui.singles.cancel') }}
                            </PmtButton>
                            <PmtButton primary :loading="relaculationIsProcessing" @click="recalculate(false)">
                                {{ $t('ui.singles.ok') }}
                            </PmtButton>
                        </div>
                    </template>
                </BarButton>
                <BarButton v-else ref="recalculateButton" default :text="$t('pages.cao.recalculateButtonLabel')"
                    :loading="relaculationIsProcessing" icon="sync" icon-size="20" @click="recalculate(true)" />
            </template>
        </TopBar>
        <PmtLayout fixed-height>
            <PmtContent>
                <VContainer>
                    <VRow>
                        <VCol class="col-12 py-0">
                            <p v-if="caoRulesApiError" class="text-error">
                                {{ caoRulesApiError }}
                            </p>
                            <p v-if="searchString && searchString.length > 2" ref="searchResultsNotification">
                                <strong>{{ rulesCount }}</strong>&nbsp;
                                {{ rulesCount === 1 ? $t('pages.cao.rule') : $t('pages.cao.rules') }}&nbsp;
                                {{ $t('pages.cao.foundWith') }} <strong>{{ searchString }}</strong>.&nbsp;
                                <a ref="clearResults" @click="searchInRules('')">
                                    {{ $t('pages.cao.showAllRules') }}
                                </a>.
                            </p>
                        </VCol>
                        <VCol>
                            <VExpansionPanels multiple>
                                <VExpansionPanel v-for="caoRulesCluster in caoRules" :key="caoRulesCluster.cao_id"
                                    :class="{ hidden: (isEnvironmentCao && !caoRulesCluster.available) || !caoRulesCluster.rules.length }"
                                    class="cao-rules-panel">
                                    <VExpansionPanelHeader class="cao-rules-panel-header">
                                        <div class="headings">
                                            <h4>{{ caoRulesCluster.name }}</h4>
                                            <VBadge v-if="Boolean(caoRulesCluster.rules.length)" color="grey" bottom
                                                :offset-x="-16" :offset-y="20"
                                                :content="caoRulesCluster.rules.length" />
                                        </div>
                                        <div v-if="ORG_CAO_EDIT && isEnvironmentCao"
                                            class="panel-header-button-container">
                                            <PmtButton v-if="IS_MOBILE" default icon="plus" no-margin
                                                @click="createCaoRule(caoRulesCluster.cao_id)" />
                                            <PmtButton v-else default icon="plus" no-margin class="text-capitalize"
                                                @click="createCaoRule(caoRulesCluster.cao_id)">
                                                {{ $t('pages.cao.rule') }}
                                            </PmtButton>
                                        </div>
                                    </VExpansionPanelHeader>
                                    <VExpansionPanelContent class="cao-rules-panel-content">
                                        <VRow no-gutters>
                                            <VCol>
                                                <VDataTable :headers="dataTableHeaders" :items="caoRulesCluster.rules"
                                                    hide-default-footer :items-per-page="1000"
                                                    class="cao-rules-table config-data-table">
                                                    <template #[`item.status`]="{ item }">
                                                        <CaoStatusContextMenu :status="caoRuleStatus(item)" :rule="item"
                                                            :is-environment-cao="isEnvironmentCao" />
                                                    </template>
                                                    <template #[`item.type`]="{ item }">
                                                        <div style="min-width: 120px">
                                                            <PmtCrudInput :full-object="item" :identifier="'type'"
                                                                :type="'text'"
                                                                :disabled="!ORG_CAO_EDIT || !isEnvironmentCao"
                                                                @save="saveRuleInput($event)" v-on="$listeners">
                                                                <span v-html="displayedValue(item.type)" />
                                                            </PmtCrudInput>
                                                        </div>
                                                    </template>
                                                    <template #[`item.reference`]="{ item }">
                                                        <span v-html="displayedValue(item.reference)" />
                                                    </template>
                                                    <template #[`item.description`]="{ item }">
                                                        <PmtCrudInput :full-object="item" :identifier="'description'"
                                                            :type="'textarea'"
                                                            :disabled="!ORG_CAO_EDIT || !isEnvironmentCao"
                                                            @save="saveRuleInput($event)" v-on="$listeners">
                                                            <span v-html="displayedValue(item.description)" />
                                                        </PmtCrudInput>
                                                    </template>
                                                    <template v-if="ORG_CAO_EDIT && isEnvironmentCao"
                                                        #[`item.action`]="{ item }">
                                                        <PmtButton v-tooltip="$t('pages.cao.modal.edit')" default round
                                                            icon="pencil" :icon-size="15" @click="editCaoRule(item)" />
                                                    </template>
                                                </VDataTable>
                                            </VCol>
                                        </VRow>
                                    </VExpansionPanelContent>
                                </VExpansionPanel>
                            </VExpansionPanels>
                        </VCol>
                    </VRow>
                </VContainer>
            </PmtContent>
        </PmtLayout>
        <EditCreateCaoRuleModal ref="editCreateCaoRuleModal" :rule="selectedRule" @close="selectedRule = {}" />
    </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import stringHelper from '../../libraries/stringHelper'

export default {
    name: 'Cao',
    components: {
        CaoStatusContextMenu: () => import('../../pages/configuration/cao/CaoStatusContextMenu.vue'),
        EditCreateCaoRuleModal: () => import('../../pages/configuration/cao/EditCreateCaoRuleModal.vue'),
    },
    props: {
        isEnvironmentCao: Boolean,
    },
    data() {
        return {
            stores: [],
            activeForOrganisation: true,
            activeForStore: true,
            dataTableHeaders: [
                { text: this.$t('pages.cao.panel.tableHeaderLabels.environmentStatus'), value: 'status', cellClass: 'status' },
                { text: this.$t('pages.cao.panel.tableHeaderLabels.type'), value: 'type', cellClass: 'type' },
                { text: this.$t('pages.cao.panel.tableHeaderLabels.reference'), value: 'reference', cellClass: 'reference' },
                { text: this.$t('pages.cao.panel.tableHeaderLabels.description'), value: 'description', cellClass: 'description' },
                { text: '', value: 'action', cellClass: 'action' },
            ],
            activeTypeInput: null,
            activeDescriptionInput: null,
            statusLabels: {
                ignore: this.$t('pages.cao.panel.statusLabels.ignore'),
                warn: this.$t('pages.cao.panel.statusLabels.warn'),
                apply: this.$t('pages.cao.panel.statusLabels.apply'),
                obly: this.$t('pages.cao.panel.statusLabels.obly'),
            },
            relaculationIsProcessing: false,
            selectedRule: {},
        }
    },
    computed: {
        ...mapGetters(['IS_MOBILE']),
        ...mapGetters('auth', ['ORG_CAO_EDIT']),
        ...mapGetters('configuration/cao', {
            environmentCaoRules: 'ENVIRONMENT_CAO_RULES',
            storeCaoRules: 'STORE_CAO_RULES',
            caoRulesApiError: 'CAO_RULES_API_ERROR',
            searchString: 'SEARCH_STRING',
        }),
        ...mapGetters('auth', ['EDIT_CAO_ENV_CONFIG', 'STORE_CAO_EDIT', 'ORG_CAO_EDIT', 'RECALCULATE']),
        caoRules() {
            let caoRules = this.storeCaoRules
            if (this.isEnvironmentCao) {
                caoRules = this.environmentCaoRules
            }

            return caoRules
        },
        rulesCount() {
            let count = 0
            this.caoRules.forEach((cao) => {
                count = count + cao.rules.length
            })
            return count
        },
    },
    watch: {
        $route(to, from) {
            if (to.path !== from.path) {
                this.SET_CAO_RULES_API_ERROR(null)
            }
        },
    },
    mounted() {
        this.getCaoRules(this.isEnvironmentCao)
        this.SET_CAO_STATUS_LABELS(this.statusLabels)
    },
    updated() {
        this.getCaoRules(this.isEnvironmentCao)
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('configuration/cao', ['getCaoRules', 'updateCaoRule', 'recalculateCaoRules']),
        ...mapMutations('configuration/cao', ['SET_CAO_RULES_API_ERROR', 'SET_SEARCH_STRING', 'SET_CAO_STATUS_LABELS']),
        saveRuleInput(event) {
            const payload = event.object
            if (event.identifier === 'type' || event.identifier === 'description') {
                payload[event.identifier] = stringHelper.escapeString(event.inputValue)
            }

            delete payload.allow_statuses

            this.isUpdating = true
            this.updateCaoRule(payload)
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.cao.dataHaveBeenUpdated'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.cao.dataUpdateFailed'), error: true })
                })
                .finally(() => {
                    this.isUpdating = false
                    this.$emit('closeRuleInput')
                })
        },
        caoRuleStatus(rule) {
            if (this.isEnvironmentCao) {
                return rule.status
            } else if (rule.store_status) {
                return rule.store_status
            } else {
                return rule.default_status
            }
        },
        toggleTypeInput(caoRuleId) {
            if (this.activeTypeInput !== caoRuleId && this.EDIT_CAO_ENV_CONFIG && this.isEnvironmentCao) {
                this.activeTypeInput = caoRuleId
            } else {
                this.activeTypeInput = null
            }
            this.activeDescriptionInput = null
        },
        toggleDescriptionInput(caoRuleId) {
            if (this.activeDescriptionInput !== caoRuleId && this.EDIT_CAO_ENV_CONFIG && this.isEnvironmentCao) {
                this.activeDescriptionInput = caoRuleId
            } else {
                this.activeDescriptionInput = null
            }
            this.activeTypeInput = null
        },
        searchInRules(searchString) {
            this.SET_SEARCH_STRING(searchString)
        },
        recalculate(forStore) {
            this.relaculationIsProcessing = true

            this.recalculateCaoRules({ forStore, module: 'cla' })
                .then(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.cao.recalculationHasBeenInitiated'), success: true })
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('pages.cao.recalculationFailed'), error: true })
                })
                .finally(() => {
                    this.$refs.recalculateButton.close()
                    this.relaculationIsProcessing = false
                })
        },
        editCaoRule(rule) {
            if (!this.ORG_CAO_EDIT) return
            this.selectedRule = rule
            this.$refs.editCreateCaoRuleModal.open()
        },
        createCaoRule(caoId) {
            if (!this.ORG_CAO_EDIT) return
            this.selectedRule = { cao_id: caoId }
            this.$refs.editCreateCaoRuleModal.open()
        },
        displayedValue(string) {
            return stringHelper.highlight(string, this.searchString)
        },
    },
}

</script>

<style lang="scss" scoped>
// @import '@/assets/scss/mixins/_breakpoints.scss';
// @import '@/assets/scss/mixins/_ellipsis.scss';

.container {
    max-width: 100vw !important;
    margin: 0 !important;

    @include bp-xl {
        max-width: 1904px !important;
        margin: 0 auto !important;
    }
}

.cao-rules-panel {
    margin: 0 0 16px !important;

    &.transparent {
        opacity: 0.5;
    }

    &.hidden {
        display: none;
    }

    .v-expansion-panel-header {
        .headings {
            display: flex;

            h4 {
                max-width: 50vw;
                margin: 0;
                @include ellipsis;
                line-height: 24px;

                @include bp-sm {
                    max-width: auto;
                }
            }

            :deep(.v-badge__badge) {
                font-size: 10px;
                font-weight: 700;
            }
        }

        .panel-header-button-container {
            margin: -4px 0;
            padding: 0 16px 0 0;
            text-align: right;
        }
    }
}

.status,
.type,
.reference,
.description {
    position: relative;
    vertical-align: top !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
}

.status {
    min-width: 128px;

    @include bp-sm {
        padding-top: 3px !important;
    }
}

.type {
    min-width: 128px;
}

.reference {
    min-width: 112px;
}

.editable-rule-prop {
    cursor: pointer;
}

:deep(.highlighted) {
    color: var(--primary-color);
    font-weight: 700;
}
</style>
