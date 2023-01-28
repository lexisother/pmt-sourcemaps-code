<template>
    <div>
        <TopBar ref="topbar" />
        <PmtLayout fixed-height>
            <PmtContent>
                <VContainer>
                    <VRow v-if="SMS_MESSAGES_READ">
                        <VCol class="col-12 col-md-8 col-lg-9">
                            <VCard v-if="SMS_MESSAGES_MANAGE" class="p-2 p-md-3 mb-4">
                                <SmsForm ref="smsForm" />
                                <SmsEmployeesOverview ref="smsEmployeesOverview" />
                            </VCard>
                        </VCol>
                        <VCol class="col-12 col-md-4 col-lg-3">
                            <VCard class="p-2 p-md-3">
                                <SmsHistory ref="smsHistory" />
                            </VCard>
                        </VCol>
                    </VRow>
                    <EmptyState v-else ref="noAccess" :title="$t('ui.singles.noAccess')" :component="'four-o-four'"
                        :show="true" :is-error="true" no-padding />
                </VContainer>
            </PmtContent>
        </PmtLayout>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'Sms',
    components: {
        SmsForm: () => import('../../pages/communication/SmsForm'),
        SmsEmployeesOverview: () => import('../../pages/communication/SmsEmployeesOverview'),
        SmsHistory: () => import('../../pages/communication/SmsHistory'),
    },
    computed: {
        ...mapGetters('auth', ['SMS_MESSAGES_READ', 'SMS_MESSAGES_MANAGE']),
    },
}
</script>

<style lang="scss" scoped>
// @import '@/assets/scss/mixins/_breakpoints.scss';

.container {
    max-width: 100vw;

    @include bp-lg {
        max-width: calc(100vw - 32px);
    }

    @include bp-xl {
        max-width: 1872px;
    }
}
</style>
