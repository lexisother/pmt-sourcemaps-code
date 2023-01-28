<template>
    <ContextRoutesLayout ref="contextRoutesLayout">
        <template #default="{ modules, search }">
            <div v-if="selectedContext" class="mx-5">
                <VRow :key="selectedContext.key" justify="space-around">
                    <VCol cols="12" lg="4" md="3" xs="12">
                        <ContextEditForm v-if="edit" ref="contextEditForm" edit
                            :selected-context="selectedContext.value" class="mt-3" @cancel="edit = false"
                            @save="edit = false" />
                        <ContextDetailsCard v-else ref="contextDetailsCard" :context="selectedContext.value"
                            :disabled="selectedContext.value.context_id === 1" @edit="edit = true" />
                    </VCol>
                    <VCol cols="12" lg="8" md="9" xs="12">
                        <ContextRoutesContent ref="contextModuleRoutes" :modules="modules" :search="search"
                            :disabled="selectedContext.value.context_id === 1" class="animated slideInRight" />
                    </VCol>
                </VRow>
            </div>
        </template>
    </ContextRoutesLayout>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'ContextRoutesManagement',
    components: {
        ContextRoutesLayout: () => import('../../pages/configuration/context-routes/ContextRoutesLayout.vue'),
        ContextRoutesContent: () => import('./ContextRoutesContent.vue'),
        ContextDetailsCard: () => import('../../pages/configuration/context-routes/ContextDetailsCard.vue'),
        ContextEditForm: () => import('../../pages/configuration/context-routes/ContextRoutesEditCreateContextForm.vue'),
    },
    data() {
        return {
            edit: false,
        }
    },
    computed: {
        ...mapState('configuration/contextRoutes', ['selectedContext']),
    },
}
</script>
