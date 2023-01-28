<template>
    <div
        ref="topbar"
        class="rdo-top-bar d-print-none"
    >
        <slot />
        <PInput
            v-if="showSearch"
            id="pageSearchInput"
            ref="pageSearchInput"
            :value="search.trim()"
            cy_id="pageSearchInput"
            name="Search"
            :placeholder="$t('ui.singles.search')"
            append-icon="magnify"
            clearable
            dense
            has-value
            @input="$emit('search', $event)"
        />
        <VProgressLinear
            v-if="loading"
            ref="loadingIndicator"
            :active="loading"
            :indeterminate="loading"
            absolute
            bottom
            height="2"
        />
    </div>
</template>

<script>
export default {
    name: 'MyRequestsTopBar',
    props: {
        loading: Boolean,
        showSearch: Boolean,
        search: {
            type: String,
            default: '',
        },
    },
}
</script>

<style lang="scss" scoped>
.rdo-top-bar {
    position: relative;
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    justify-content: start;
    padding-inline: 15px;
    padding-block: 7px;
    border-block: 1px solid var(--grey-40);
    gap: 10px;
}
</style>
