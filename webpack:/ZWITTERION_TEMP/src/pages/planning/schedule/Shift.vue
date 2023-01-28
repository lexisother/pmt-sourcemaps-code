<template>
    <div>
        <DepartmentCard
            :shift="shift"
            class="shadow-2dp"
            :class="{'shift': shift.isProductive, 'non-productive-shift': !shift.isProductive}"
        />
    </div>
</template>

<script>
export default {
    components: {
        DepartmentCard: () => import('./DepartmentCard.vue'),
    },
    props: {
        shift: {
            type: Object,
            default: () => ({}),
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/mixins/shift.scss';
    @import '@/assets/scss/mixins/remark.scss';
    @import '@/assets/scss/shaddows.scss';

    .shift, .non-productive-shift {
        @include shift;

    }
    @media screen and (min-width: 800px) {
        .cards .card {
            .shift .department {
                width: 100%;
                font-size: .9rem;
            }
        }
    }
</style>
