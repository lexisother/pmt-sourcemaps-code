<template>
    <div class="mx-5 animated slideInUp">
        <VRow justify="space-around">
            <VCol
                cols="12"
                lg="4"
                md="8"
                xs="12"
            >
                <ContextEditForm ref="createEditForm" />
            </VCol>
        </VRow>
    </div>
</template>

<script>
export default {

    name: 'ContextRoutesEditCreateContext',

    components: {
        ContextEditForm: () => import('./ContextRoutesEditCreateContextForm'),
    },

}

</script>
