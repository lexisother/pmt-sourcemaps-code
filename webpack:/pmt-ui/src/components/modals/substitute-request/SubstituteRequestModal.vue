<template>
    <div class="substitute-request-modal">
        <pmt-modal
            ref="substituteRequestModal"
            :title="$t( 'modals.substituteRequest.title' )"
            :hide-on-overlay-click="false"
        >
            <div class="pa-5">
                <step-select-shift
                    v-if="step === 1"
                    @on-select="onShiftSelect"
                    @on-cancel="close"
                />
                <step-select-colleagues
                    v-if="step === 2"
                    ref="stepSelectColleagues"
                    :shift="getSelectedShift()"
                    @on-back-nav="step = 1"
                    @on-colleagues-select="onColleaguesSelect"
                />
                <step-overview
                    v-if="step === 3"
                    :shift="selectedShift"
                    :colleagues="selectedColleagues"
                    @on-back-nav="onReselectColleagues"
                    @on-change-date="reset"
                    @on-request-sended="close"
                />
            </div>
        </pmt-modal>
    </div>
</template>

<script>
import SelectShiftStep from './SelectShiftStep.vue'
import SelectColleaguesStep from './SelectColleaguesStep.vue'
import OverviewStep from './OverviewStep.vue'

export default {
    components: {
        'step-select-shift': SelectShiftStep,
        'step-select-colleagues': SelectColleaguesStep,
        'step-overview': OverviewStep,
    },
    data () {
        return {
            step: 1,
            selectedShift: null,
            selectedColleagues: [],
        }
    },
    methods: {
        open () {
            this.reset()
            this.$refs.substituteRequestModal.show()
        },
        close () {
            this.$refs.substituteRequestModal.hide()
        },
        reset () {
            this.selectedColleagues = []
            this.selectedShift = null
            this.step = 1
        },
        getSelectedShift () {
            if (this.selectedShift === null) {
                return
            }

            return this.selectedShift
        },
        onShiftSelect (shift) {
            this.selectedShift = shift
            this.step = 2
        },
        onColleaguesSelect (colleagues) {
            colleagues.sort((a, b) => a.name.localeCompare(b.name))
            this.selectedColleagues = colleagues
            this.step = 3
        },
        onReselectColleagues () {
            this.step = 2

            // wait until the step element is created
            this.$nextTick(() => {
                this.$refs.stepSelectColleagues.setSelectedColleagues(this.selectedColleagues.map(item => item.id))
            })
        },
    },
}
</script>
