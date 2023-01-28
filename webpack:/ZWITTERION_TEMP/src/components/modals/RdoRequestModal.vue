<template>
    <div class="rdo-request-modal">
        <pmt-modal
            ref="rdoRequestModal"
            :hide-on-overlay-click="false"
            no-padding
            :title="$t('modals.rdoRequest.title')"
        >
            <tabs
                :tabs="tabs"
                :active-tab="activeTab"
                class="rdo-request-tabs"
                @on-click="activeTab = $event"
            >
                <template slot="tabs-content">
                    <div
                        v-if="activeTab === 'request_rdo'"
                        class="inner-tab-content"
                    >
                        <pmt-info
                            v-if="$cookies.get('rdoModalClosed') === null"
                            :key="updateInfo"
                            gray
                            closable
                            @close-info-text="setInfoCookie('rdoModalClosed')"
                        >
                            {{ $t('modals.rdoRequest.info') }}
                        </pmt-info>
                        <pmt-rdo-request-form
                            @on-cancel="close"
                            @after-send="onSuccess"
                            @after-send-error="onError($event)"
                        />
                    </div>
                    <div
                        v-if="activeTab === 'rdo_balance'"
                        class="inner-tab-content"
                    >
                        <div class="leave-balance-tab">
                            <leave-balance />
                            <div class="button-group">
                                <pmt-button
                                    default
                                    icon="close"
                                    icon-size="15"
                                    @click="close"
                                >
                                    {{ $t('forms.rdoRequest.cancelBtn.label') }}
                                </pmt-button>
                            </div>
                        </div>
                    </div>
                </template>
            </tabs>
        </pmt-modal>
    </div>
</template>

<script>
import RdoRequestForm from '../forms/RdoRequestForm.vue'
import LeaveBalance from '@/components/modals/LeaveBalance.vue'
import { mapGetters, mapMutations, mapActions } from 'vuex'
export default {
    components: {
        'pmt-rdo-request-form': RdoRequestForm,
        LeaveBalance,
    },
    data () {
        return {
            activeTab: 'request_rdo',
            updateInfo: false,
        }
    },
    computed: {
        ...mapGetters('auth', {
            hasVak: 'hasVak',
            hasTvt: 'hasTvt',
            hasAtv: 'hasAtv',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        tabs () {
            const tabs = [
                { name: this.$t('modals.rdoRequest.titleShort'), id: 'request_rdo' },
            ]
            if (this.hasVak || this.hasTvt || this.hasAtv) {
                tabs.push({ name: this.$t('modals.leaveBalance.title'), id: 'rdo_balance' })
            }
            return tabs
        },
    },
    methods: {
        ...mapMutations({
            SET_SNACKBAR: 'SET_SNACKBAR',
        }),
        ...mapActions(['SET_COOKIE']),
        setActiveTab (event) {
            this.activeTab = event
        },
        open () {
            this.$refs.rdoRequestModal.show()
        },
        close () {
            this.$refs.rdoRequestModal.hide()
        },
        setInfoCookie (cookie) {
            this.SET_COOKIE({ name: cookie, value: cookie, expiration: Infinity })
            this.updateInfo = true
        },
        onSuccess () {
            this.close()
            this.SET_SNACKBAR({ message: this.$t('modals.rdoRequest.success.message'), success: true })
            this.$emit('on-success')
        },
        onError (error) {
            if (this.IS_MOBILE) this.SET_SNACKBAR({ message: error, error: true })
        },
    },
}
</script>
<style lang="scss" scoped>
    .modal {
        padding: 0 !important;
    }
    .tabs-container {
        margin: 0 !important;
    }
</style>
