<template>
    <PmtLayout>
        <PmtContent>
            <TopBar ref="topbar">
                <BarButton
                    v-if="STORE_GROUPS_MANAGE || ORG_USER_MANAGE"
                    ref="returnToOverview"
                    :text="$t('pages.storeGroups.returnToOverview')"
                    icon="arrow-left"
                    @click="$router.replace('/configuration/store-groups')"
                />
            </TopBar>
            <VContainer>
                <VRow v-if="STORE_GROUPS_MANAGE || ORG_USER_MANAGE">
                    <VCol
                        v-if="STORE_GROUPS_MANAGE"
                        class="col-12 col-md-6"
                    >
                        <SelectionCard
                            ref="stores"
                            :title="$t('pages.storeGroups.tableHeaderLabels.stores')"
                            :store-group-id="storeGroupId"
                            :data="STORE_GROUP_STORES"
                            collection="stores"
                            @add-store-to-store-group="ADD_STORE_TO_STORE_GROUP"
                            @remove-store-from-store-group="REMOVE_STORE_FROM_STORE_GROUP"
                        />
                    </VCol>
                    <VCol
                        v-if="ORG_USER_MANAGE"
                        class="col-12 col-md-6"
                    >
                        <SelectionCard
                            ref="users"
                            :title="$t('pages.storeGroups.tableHeaderLabels.users')"
                            :store-group-id="storeGroupId"
                            :data="STORE_GROUP_USERS"
                            collection="users"
                            @add-user-to-store-group="ADD_USER_TO_STORE_GROUP"
                            @remove-user-from-store-group="REMOVE_USER_FROM_STORE_GROUP"
                        />
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
    </PmtLayout>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
    name: 'StoreGroupSettings',
    components: {
        SelectionCard: () => import('@/pages/configuration/store-groups/SelectionCard'),
    },
    data () {
        return {
            storeGroupId: this.$route.params.id,
        }
    },
    computed: {
        ...mapGetters('configuration/storeGroups', ['STORE_GROUPS', 'STORE_GROUP_STORES', 'STORE_GROUP_USERS']),
        ...mapGetters('auth', ['STORE_GROUPS_MANAGE', 'ORG_USER_MANAGE']),
        storeGroupName () {
            const storeGroup = this.STORE_GROUPS.find(o => o.id.toString() === this.storeGroupId)
            if (storeGroup && storeGroup.name) {
                return storeGroup.name
            }
            return null
        },
    },
    mounted () {
        this.getStoreGroupStores(this.storeGroupId)
        this.getStoreGroupUsers(this.storeGroupId)
    },
    methods: {
        ...mapActions('configuration/storeGroups', ['getStoreGroupStores', 'getStoreGroupUsers']),
        ...mapMutations('configuration/storeGroups', [
            'ADD_STORE_TO_STORE_GROUP',
            'REMOVE_STORE_FROM_STORE_GROUP',
            'ADD_USER_TO_STORE_GROUP',
            'REMOVE_USER_FROM_STORE_GROUP',
        ]),
    },
}
</script>
