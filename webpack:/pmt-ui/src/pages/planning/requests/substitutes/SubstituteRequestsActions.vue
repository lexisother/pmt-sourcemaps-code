<template>
    <component :is="tag">
        <pmt-button
            success
            outline
            icon="done"
            mini
            :round="true"
            :icon-size="15"
            @click="$emit('click', true)"
        />

        <pmt-button
            danger
            outline
            icon="close"
            mini
            :round="true"
            :icon-size="15"
            @click="$emit('click', false)"
        />
    </component>
</template>

<script>
export default {
    name: 'SubstituteRequestsActions',
    props: {
        tag: {
            type: String,
            default: 'div',
        },
    },
}
</script>
