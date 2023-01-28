<template>
    <div>
        <PmtButton
            :id="`nav-prev-${mode}`"
            :ref="`nav-prev-${mode}`"
            v-ripple
            primary
            inverted
            round
            icon="chevron-left"
            icon-size="18"
            :class="`prev-${mode}-btn`"
            :cy_id="`nav-prev-${mode}`"
            @click.prevent="$emit('navigate', -1)"
        />
        <PmtButton
            :id="`current-${mode}`"
            :ref="`current-${mode}`"
            v-ripple
            primary
            inverted
            :class="selectButtonClass"
            :cy_id="`current-${mode}`"
            @click="$emit('click')"
        >
            <slot />
        </PmtButton>
        <PmtButton
            :id="`nav-next-${mode}`"
            :ref="`nav-next-${mode}`"
            v-ripple
            primary
            inverted
            round
            icon="chevron-right"
            icon-size="18"
            :class="`next-${mode}-btn`"
            :cy_id="`nav-next-${mode}`"
            @click.prevent="$emit('navigate', 1)"
        />
    </div>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {

    name: 'DatepickerNavigation',

    mixins: [mixins],

    props: {
        mode: {
            type: String,
            default: 'week',
        },
        options: {
            type: Object,
            required: true,
        },
    },

    computed: {
        selectButtonClass () {
            return {
                'animated view-selector': true,
                zoomInUp: this.datepicker.direction === 'left',
                zoomInDown: this.datepicker.direction === 'right',
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    .view-selector {
        animation-duration: 0.2s;
        min-width:90px;
    }
</style>
