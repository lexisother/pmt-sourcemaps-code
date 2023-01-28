<template>
    <VPopover
        trigger="manual"
        :open="show"
        :auto-hide="true"
        offset="25"
        placement="bottom"
        @apply-hide="$emit('hide')"
    >
        <template slot="popover">
            <div class="popover-container">
                <slot name="default">
                    <p>{{ text }}</p>
                </slot>
                <PmtButton
                    ref="cancel"
                    default
                    medium
                    @click="$emit('cancel')"
                >
                    {{ $t('ui.singles.no') }}
                </PmtButton>
                <PmtButton
                    ref="confirm"
                    :disabled="disableOverrideConfirm"
                    primary
                    medium
                    @click="$emit('confirm')"
                >
                    {{ $t('ui.singles.yes') }}
                </PmtButton>
            </div>
        </template>
    </VPopover>
</template>

<script>
export default {
    name: 'ShiftConfirmationPopover',
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        text: {
            type: String,
            default: '',
        },
        disableOverrideConfirm: {
            type: Boolean,
            default: false,
        },
    },
}
</script>

<style lang="scss" scoped>
    .popover-container {
        max-width: 300px;
        white-space: pre-wrap;
    }
</style>
