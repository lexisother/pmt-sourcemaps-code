<template>
    <VCard>
        <VCardTitle ref="assessSSRTitle">
            {{ baseTranslate('assessSubtituteRequest.title') }}
            <VSpacer />
            <PmtButton
                ref="close"
                v-ripple
                default
                round
                medium
                icon="close"
                icon-size="20"
                class="close"
                @click="$emit('close')"
            />
        </VCardTitle>
        <VCardSubtitle v-if="request">
            {{ baseTranslate('tooltips.substituteRequestsCount', [request.sent_to.length]) }}
        </VCardSubtitle>
        <VDivider />
        <AssessSubstituteRequestSubtitle
            ref="assessSSRSubtitle"
            :request="request"
            :shift="assesSubstituteRequest.shift"
        />
        <VDivider />
        <VCardText class="pa-0">
            <AssessSubstituteRequestContent
                ref="assessSSRContent"
                :selected-substitute="selectedSubstitute"
                :request="request"
                :shift="assesSubstituteRequest.shift"
                :employee="employee"
                @select-substitute="selectedSubstitute = $event"
            />
        </VCardText>
        <VDivider />
        <VCardActions>
            <AssessSubstituteRequestActions
                ref="assessSSRActions"
                :request="request"
                :shift="assesSubstituteRequest.shift"
                :selected-substitute="selectedSubstitute"
                :employee="employee"
                @close="$emit('close')"
            />
        </VCardActions>
    </VCard>
</template>
<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'AssessSubstituteRequestLayout',
    components: {
        AssessSubstituteRequestSubtitle: () => import('@/pages/planning/scheduling/components/popovers/Assessments/AssessSubstituteRequestSubtitle'),
        AssessSubstituteRequestContent: () => import('@/pages/planning/scheduling/components/popovers/Assessments/AssessSubstituteRequestContent'),
        AssessSubstituteRequestActions: () => import('@/pages/planning/scheduling/components/popovers/Assessments/AssessSubstituteRequestActions'),
    },
    mixins: [mixins],
    props: {
        assesSubstituteRequest: {
            type: Object,
            required: true,
        },
        employee: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            selectedSubstitute: null,
        }
    },
    computed: {
        request () {
            return this.shiftPendingSubstituteRequest(this.assesSubstituteRequest.shift)
        },
    },
}
</script>
<style lang="scss" scoped>
:deep() .v-card__subtitle {
    font-size: 0.95rem !important;
    display: inline-flex;
    padding: 0 24px 8px !important;
}
:deep() .v-card__actions {
    display: block;
    height: 64px;
}
.close {
    position: absolute;
    right: 15px;
    top: 15px;
}
</style>
