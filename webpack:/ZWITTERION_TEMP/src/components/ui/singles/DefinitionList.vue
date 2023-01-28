<template>
    <div class="list-details">
        <div class="list-details-title">
            {{ title }}
        </div>
        <div
            v-for="(detail, index) in details"
            :key="index"
            class="list-detail"
        >
            <div class="list-detail-title">
                {{ detail.title }}
            </div>
            <div class="list-detail-description">
                <template v-if="detail.type === 'phone'">
                    <PhoneNumber :phone-number="detail.description" />
                </template>
                <component
                    :is="detail.tag || 'b'"
                    v-else
                >
                    {{ detail.description }}
                </component>
                <span v-if="detail.extraDescription"> ({{ detail.extraDescription }})</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'ShiftSmallDetails',
    props: {
        title: {
            type: String,
            default: '',
        },
        details: {
            type: Array,
            required: true,
        },
    },
    computed: {
        ...mapGetters(['IS_MOBILE']),
    },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixins/_breakpoints.scss';
.list-details {
    color: var(--grey-100);
    border-right: 1px solid var(--grey-40);
    .list-details-title {
        font-size: 14px;
        font-weight: 600;
    }
    .list-detail {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 85px minmax(100px, 220px);
        gap: 10px;
        line-height: 20px;
        .list-detail-description {
            font-weight: 600;
        }
    }
}
</style>
