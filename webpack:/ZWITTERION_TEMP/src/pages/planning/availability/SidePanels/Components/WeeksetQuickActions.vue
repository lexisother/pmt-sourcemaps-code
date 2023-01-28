<template>
    <span
        v-if="!isMenu"
        class="actions d-inline-block"
    >
        <v-popover
            v-if="item.status === 'pending' || item.status === 'approved'"
            trigger="manual"
            :open="!!showReject"
            offset="1"
            :auto-hide="true"
            @apply-hide="$emit('hide-popover')"
        >
            <span v-tooltip="$moment(item.start_date).isBefore($moment(), 'isoWeek') ? $t('sidePanels.availabilityWeeklyOverview.actions.approveWeeksetInThePast') : ''">
                <PmtButton
                    v-if="isManager && item.status === 'pending'"
                    v-tooltip="$t('sidePanels.availabilityWeeklyOverview.actions.approve')"
                    success
                    outline
                    icon="done"
                    medium
                    :block="blockButtons"
                    :icon-size="15"
                    :loading="approving"
                    custom-class="tooltip-target b1"
                    :disabled="loading || $moment(item.start_date).isBefore($moment(), 'isoWeek')"
                    @click="approve(item)"
                >
                    {{ $t('sidePanels.availabilityWeeklyOverview.actions.approve') }}
                </PmtButton>
            </span>
            <PmtButton
                v-if="(isManager && (item.status === 'pending' || item.status === 'approved')) || (isEmployee && item.status === 'pending')"
                ref="rejectBtnPopover"
                danger
                outline
                icon="close"
                medium
                :block="blockButtons"
                :loading="rejecting"
                :icon-size="15"
                custom-class="tooltip-target b1"
                :disabled="loading"
                @click="$emit('show-reject'); showReject = true"
            >
                {{ $t(`sidePanels.availabilityWeeklyOverview.actions.${isManager ? 'reject' : 'revoke'}`) }}
            </PmtButton>
            <template slot="popover">
                <div class="reject-form">
                    <p>
                        <AlertOutline
                            :size="18"
                            class="text-error"
                        /> {{ $t('sidePanels.availabilityWeeklyOverview.rejectQuestion') }}
                    </p>
                    <label for="text">{{ $t('sidePanels.availabilityWeeklyOverview.rejectLabel') }}</label><small style="color: pink">*</small>
                    <PInput
                        v-model="rejectRemark"
                        @input="error = ''"
                    />
                    <span
                        v-if="error"
                        class="text-warning"
                    >{{ error }}</span>
                    <br>
                    <PmtButton
                        ref="rejectBtn"
                        danger
                        outline
                        custom-class="tooltip-target b1"
                        :disabled="rejectRemark.length < 5 || loading"
                        @click="reject()"
                    >
                        {{ $t('sidePanels.availabilityWeeklyOverview.actions.reject') }}
                    </PmtButton>
                    <PmtButton
                        normal
                        custom-class="tooltip-target b1"
                        @click="$emit('hide-popover'); rejectRemark = ''; showReject = false"
                    >
                        {{ $t('sidePanels.availabilityWeeklyDetails.sections.cancel') }}
                    </PmtButton>
                </div>
            </template>
        </v-popover>
    </span>
    <VMenu
        v-else
        ref="quickActionsMenu"
        bottom
        left
        max-width="270"
        min-width="150"
        :close-on-content-click="!showReject && !confirmSaveAlreadyApprovedWeekset"
        :value="menuIsOpen"
        close-on-click
        @click="menuIsOpen = !menuIsOpen"
    >
        <template #activator="{ on }">
            <PmtButton
                ref="quickActionsButton"
                primary
                inverted
                round
                icon="dots-vertical"
                icon-size="18"
                cy_id="quickActionsButton"
                v-on="on"
            />
        </template>
        <VList
            ref="quickActionsList"
            dense
        >
            <VListItem
                v-if="($route.meta.manager && isManager) || isEmployee"
                ref="viewEdit"
                @click="edit(item)"
            >
                <VListItemContent>
                    <VListItemTitle>
                        <component
                            :is="item.status === 'pending' || item.status === 'rejected' ? 'pencil' : 'eye-outline'"
                            :class="'text-success'"
                            :size="18"
                        />
                        {{ $t(`sidePanels.availabilityWeeklyOverview.actions.${item.status === 'pending' || item.status === 'rejected' ? 'edit' : 'view'}`) }}
                    </VListItemTitle>
                </VListItemContent>
            </VListItem>
            <VListItem
                v-if="$route.meta.manager && isOverview && !!item.availabilities.length"
                ref="compare"
                @click="compare"
            >
                <VListItemContent>
                    <VListItemTitle>
                        <component
                            :is="comparing ? 'close' : 'swap-horizontal'"
                            :class="comparing ? 'text-error' : 'text-primary'"
                            :size="18"
                        />
                        {{ $t(`sidePanels.availabilityWeeklyOverview.tooltips.${comparing ? 'uncompare' : 'compare'}`) }}
                    </VListItemTitle>
                </VListItemContent>
            </VListItem>
            <VListItem
                v-if="isManager && item.status === 'pending'"
                ref="approve"
                :disabled="loading || disabledApproving"
                @click.prevent="!disabledApproving ? approveWeekset() : false"
            >
                <VListItemContent>
                    <VListItemTitle>
                        <Done
                            :class="disabledApproving ? 'text-default' : 'text-success'"
                            :size="18"
                        />
                        {{ $t('sidePanels.availabilityWeeklyOverview.actions.approve') }}
                    </VListItemTitle>
                    <VListItemSubtitle v-if="disabledApproving">
                        {{ $t('sidePanels.availabilityWeeklyOverview.actions.approveWeeksetInThePastShort') }}
                    </VListItemSubtitle>
                </VListItemContent>
                <PopoverButton
                    medium
                    :is-open="confirmSaveAlreadyApprovedWeekset"
                    style="position: relative; top: -9999px"
                    text=""
                    @hide="confirmSaveAlreadyApprovedWeekset = false;"
                >
                    <template slot="popover-content">
                        <p v-if="confirmSaveAlreadyApprovedWeekset">
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.alreadyApprovedWeeksetDetected') }}
                        </p>
                        <PmtButton
                            v-if="confirmSaveAlreadyApprovedWeekset"
                            danger
                            outline
                            custom-class="tooltip-target b1"
                            @click="approve()"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.yes') }}
                        </PmtButton>
                        <PmtButton
                            normal
                            custom-class="tooltip-target b1"
                            @click="confirmSaveAlreadyApprovedWeekset = false"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.no') }}
                        </PmtButton>
                        <PmtButton
                            v-tooltip="$t('sidePanels.availabilityWeeklyDetails.sections.viewTooltip')"
                            normal
                            custom-class="tooltip-target b1"
                            @click="checkApprovedWeeksets()"
                        >
                            {{ $t('sidePanels.availabilityWeeklyDetails.sections.view') }}
                        </PmtButton>
                    </template>
                </PopoverButton>
            </VListItem>
            <VListItem
                v-if="(isManager && (item.status === 'pending' || item.status === 'approved')) || (isEmployee && item.status === 'pending')"
                ref="reject"
                :disabled="loading"
                @click="showReject = true"
            >
                <VListItemContent>
                    <VListItemTitle>
                        <Close
                            :class="loading ? 'text-default' : 'text-error'"
                            :size="18"
                        />
                        <v-popover
                            trigger="manual"
                            :open="!!showReject"
                            offset="50"
                            placement="left"
                            :auto-hide="true"
                            @apply-hide="$emit('hide-popover'); showReject = false; menuIsOpen = false"
                            @apply-show="menuIsOpen = true"
                        >
                            <span class="tooltip-target b1">{{ $t(`sidePanels.availabilityWeeklyOverview.actions.${isManager ? 'reject' : 'revoke'}`) }}</span>
                            <template slot="popover">
                                <div class="reject-form">
                                    <p>
                                        <alert-outline
                                            :size="18"
                                            class="text-error"
                                        /> {{ $t('sidePanels.availabilityWeeklyOverview.rejectQuestion') }}
                                    </p>
                                    <label for="text">{{ $t('sidePanels.availabilityWeeklyOverview.rejectLabel') }}</label><small style="color: pink">*</small>
                                    <PInput
                                        v-model="rejectRemark"
                                        @input="error = ''"
                                    />
                                    <span
                                        v-if="error"
                                        class="text-warning"
                                    >{{ error }}</span>
                                    <br>
                                    <PmtButton
                                        ref="rejectBtn"
                                        danger
                                        outline
                                        custom-class="tooltip-target b1"
                                        :disabled="rejectRemark.length < 5 || loading"
                                        @click="reject()"
                                    >
                                        {{ $t('sidePanels.availabilityWeeklyOverview.actions.reject') }}
                                    </PmtButton>
                                    <PmtButton
                                        normal
                                        custom-class="tooltip-target b1"
                                        @click="$emit('hide-popover'); rejectRemark = ''; showReject = false"
                                    >
                                        {{ $t('sidePanels.availabilityWeeklyDetails.sections.cancel') }}
                                    </PmtButton>
                                </div>
                            </template>
                        </v-popover>
                    </VListItemTitle>
                </VListItemContent>
            </VListItem>
        </VList>
    </VMenu>
</template>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'
export default {
    name: 'QuickWeeksetActions',
    props: {
        item: Object,
        weeksets: Array,
        hoveredWeekset: {
            type: Number,
            default: 0,
        },
        isOverview: {
            type: Boolean,
            default: false,
        },
        isMenu: {
            type: Boolean,
            default: false,
        },
        blockButtons: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            rejectRemark: '',
            approving: false,
            rejecting: false,
            revoking: false,
            error: '',
            showReject: false,
            menuIsOpen: false,
            confirmSaveAlreadyApprovedWeekset: false,
        }
    },
    computed: {
        ...mapGetters('auth', ['canEditOthersAvailabilities', 'canYou', 'user', 'isUserEmployee']),
        ...mapGetters('availability', ['availabilityTimeBlocks']),
        ...mapState('availability', ['comparingWeekset']),
        loading () {
            return this.approving || this.rejecting || this.revoking
        },
        isEmployee () {
            return this.isUserEmployee
        },
        isManager () {
            return this.canEditOthersAvailabilities
        },
        weeksetIsInThePast () {
            return this.$moment(this.item.start_date).isBefore(this.$moment(), 'isoWeek')
        },
        approveTooltip () {
            if (this.weeksetIsInThePast) {
                return this.$t('sidePanels.availabilityWeeklyDetails.sections.weekFinalizedMessage')
            }
            return ''
        },
        disabledApproving () {
            return this.$moment(this.item.start_date).isBefore(this.$moment(), 'isoWeek')
        },
        comparing () {
            return this.comparingWeekset && this.comparingWeekset.id === this.item.id
        },
    },
    methods: {
        ...mapActions('availability', {
            saveExistingWeekset: 'saveExistingWeekset',
        }),
        ...mapMutations('availability', ['updateEmployeesWeeksetStatus', 'updateWeeksetStatus']),
        ...mapMutations(['SET_SNACKBAR', 'HIDE_SNACKBAR']),
        compare () {
            this.$emit('compare', !this.comparing)
        },
        edit (sentItem) {
            this.$emit('edit', sentItem)
        },
        rejectedWeeksetStartDate (status) {
            return this.$moment(this.item.start_date).apiFormat()
        },
        /**
         * The name might be somewhat confusing but it can 2 different things here.
         * First this method checks if the weekset already has another, already approved weekset.
         *
         * If that condition is true then it will open a confirm popover
         * If not it will just plainly approve it
         */
        approveWeekset () {
            const startDate = this.item.start_date
            const found = this.weeksets.filter(element => {
                return element.status === 'approved' && this.$moment(element.start_date).isSame(startDate, 'day')
            })
            if (found.length > 0) {
                this.confirmSaveAlreadyApprovedWeekset = true
            } else {
                this.approve()
            }
        },
        checkApprovedWeeksets () {
            const startDate = this.item.start_date
            const found = this.weeksets.filter(element => {
                return element.status === 'approved' && this.$moment(element.start_date).isSame(startDate, 'day')
            })
            this.edit(found[0])
        },
        saveWeekset (status) {
            const payload = {
                id: this.item.id,
                status: status,
                approveRejectDeny: true,
            }
            if (status !== 'rejected') {
                payload.start_date = this.rejectedWeeksetStartDate(status)
            }
            if (this.isEmployee) {
                payload.employee_comment = this.rejectRemark
            } else {
                payload.manager_comment = this.rejectRemark
            }
            this.saveExistingWeekset(payload).then(result => {
                if (result) {
                    const statusPayload = {
                        status,
                        id: this.item.id,
                    }
                    if (this.isEmployee) {
                        statusPayload.employee_comment = this.rejectRemark
                    } else {
                        statusPayload.manager_comment = this.rejectRemark
                    }
                    this.$emit('statusUpdated', statusPayload)
                }
                this.isOverview
                    ? this.updateEmployeesWeeksetStatus({
                        id: this.item.id,
                        status: status,
                        employee_comment: payload.employee_comment,
                        manager_comment: payload.manager_comment,
                    })
                    : this.updateWeeksetStatus({
                        id: this.item.id,
                        status: status,
                    })
                this.revoking = this.approving = this.rejecting = false
                this.rejectRemark = ''
                this.SET_SNACKBAR({ message: this.$t('sidePanels.availabilityWeeklyDetails.sections.saved'), success: true })
            }).catch(error => {
                this.error = error.message
                this.revoking = this.approving = this.rejecting = false
                this.rejectRemark = ''
                this.SET_SNACKBAR({ message: error.message, error: true })
            })
        },
        revoke () {
            this.revoking = true
            this.saveWeekset('rejected')
        },
        reject () {
            this.rejecting = true
            this.saveWeekset('rejected')
        },
        approve () {
            this.approving = true
            this.saveWeekset('approved')
        },
    },
}
</script>
