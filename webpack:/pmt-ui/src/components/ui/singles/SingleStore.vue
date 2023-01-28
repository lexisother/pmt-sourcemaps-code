<template>
    <component
        :is="tag"
        :class="{'store': true, 'has-subtitle': showLocalSubtitle}"
    >
        <span class="name">{{ store.store_name }}</span>
        <div
            v-if="showLocalSubtitle"
            class="sub-title"
        >
            {{ $t('pages.storeGroups.storeNumber') }}: {{ store.retail_store_number }}
        </div>
    </component>
</template>

<script>
export default {
    name: 'Store',
    props: {
        store: {
            type: Object,
            required: true,
        },
        tag: {
            type: String,
            default: 'span',
        },
        showSubtitle: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        showLocalSubtitle () {
            return this.showSubtitle && this.store.store_name && !this.store.store_name.includes(this.store.retail_store_number)
        },
    },
}
</script>

<style lang="scss" scoped>
    .store {
        min-height: 40px;
        background-color: transparent;
        box-shadow: none;
        border-radius: 2px;
        padding: 2px 16px !important;
        position: relative;
        color: var(--grey-200);
        &.has-subtitle {
            line-height: 1.2rem;
        }

        .name {
            font-size: 12px;
            line-height: 20px;
        }

        .sub-title {
            color: var(--grey-100);
            font-size: 10px;
            line-height: 12px;
}
    }
</style>
