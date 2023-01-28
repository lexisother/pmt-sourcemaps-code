<template>
    <div id="substitute-overview">
        <pmt-info gray>
            {{ $t('modals.substituteRequest.overviewStep.info') }}
        </pmt-info>

        <ul class="overview">
            <li>
                <label>{{ $t('modals.substituteRequest.overviewStep.shiftLabel') }}</label>
                <div>
                    {{ shiftDate }}
                    <pmt-button
                        v-tooltip="$t('modals.substituteRequest.overviewStep.changeShiftBtn.label')"
                        primary
                        icon="calendar-edit"
                        icon-size="15"
                        outline
                        round
                        @click="$emit('on-change-date')"
                    />
                </div>
            </li>

            <li>
                <label>{{ $t('modals.substituteRequest.overviewStep.colleaguesLabel') }}</label>
                <ul>
                    <li
                        v-for="colleague in colleagues"
                        :key="colleague.id"
                    >
                        {{ colleague.name }} ({{ colleague.department }})
                    </li>
                </ul>
            </li>

            <li>
                <i18n
                    path="modals.substituteRequest.overviewStep.remarkField.label"
                    tag="label"
                >
                    <small
                        v-if="remark.length > 0 && remark.length < 10"
                        class="text-success"
                    >{{ remark.length }} / 10</small>
                </i18n>
                <PTextArea
                    v-model="remark"
                    name="remark"
                    :placeholder="$t('modals.substituteRequest.overviewStep.remarkField.minChars')"
                />
            </li>
        </ul>

        <div class="button-group">
            <pmt-button
                default
                icon="arrow-left"
                icon-size="15"
                :disabled="isSending"
                @click="$emit( 'on-back-nav' )"
            >
                {{ $t('modals.substituteRequest.prevBtn.label' ) }}
            </pmt-button>
            <pmt-button
                primary
                icon="content-save"
                icon-size="15"
                :disabled="remark.length < 10"
                :loading="isSending"
                @click="sendRequest"
            >
                {{ $t('modals.substituteRequest.overviewStep.sendBtn.label') }}
            </pmt-button>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
    props: {
        shift: {
            type: Object,
            required: true,
        },
        colleagues: {
            type: Array,
            required: true,
        },
    },
    data () {
        return {
            remark: '',
            isSending: false,
        }
    },
    computed: {
        ...mapGetters('locale', { locale: 'getLocale' }),
        shiftDate () {
            return this.$moment(this.shift.from).format('dddd, DD MMMM YYYY')
        },
    },
    methods: {
        ...mapActions('substituteRequests', {
            send: 'send',
        }),
        sendRequest () {
            const shiftInstanceId = this.shift.shiftInstanceId
            const colleaguesIds = this.colleagues.map(colleague => colleague.id)
            this.isSending = true
            this.send({ shiftInstanceId, colleaguesIds, remark: this.remark, cache: this.$route.name === 'my-requests' }).then(result => {
                if (typeof result === 'boolean' && result) {
                    this.$emit('on-request-sended')
                }
                this.isSending = false
            }).catch(error => {
                this.isSending = false
                this.$emit('on-error', error)
            })
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';

    #substitute-overview {
        .overview {
            > li {
                margin-bottom: 1.5em;
            }

            label {
                display: block;

                font-weight: 600;
                font-size: 14px;
                color: $dark-text-color;
            }

            .small {
                font-size: .8rem;
                color: $success-color;
            }
        }
    }
</style>
