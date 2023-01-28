<!-- eslint-disable vue/no-v-html -->
<template>
    <span v-html="displayValue" />
</template>

<script>
export default {
    name: 'PHighlightSearch',
    props: {
        value: {
            type: [String, Number],
            default: '',
        },
        search: {
            type: [String, Number],
            default: '',
        },
        color: {
            type: String,
            default: 'var(--blue-100)',
        },
    },
    computed: {
        displayValue () {
            if (!this.search) return this.value
            if (!this.value.toString().toLowerCase().includes(this.search.toString().toLowerCase())) return this.value
            const newElement = (str) => {
                return `<span style="color:${this.color}!important;font-weight:700!important;">${str}</span>`
            }
            return this.value.replace(new RegExp(this.search, 'gi'), (match) => newElement(match))
        },
    },
}
</script>
