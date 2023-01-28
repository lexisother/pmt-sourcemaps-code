<template>
    <span
        itemscope
        itemtype="https://schema.org/LocalBusiness"
        class="phone-container"
        :title="$t('ui.singles.clickToCallPhone.extended')"
    >
        <div
            itemprop="telephone"
            class="phone-number"
        >
            <span class="icon">
                <Phone :size="15" />
            </span>
            <a
                :href="`tel:${phoneNumber}`"
                class="phone"
                @click="call"
            >
                {{ short ? $t('ui.singles.clickToCallPhone.short') : phoneNumber }}
            </a>
        </div>
    </span>
</template>

<script>
export default {
    name: 'PhoneNumber',
    props: {
        phoneNumber: {
            type: [Number, String],
            required: true,
        },
        short: Boolean,
    },
    methods: {
        call () {
            window.open(`tel:${this.phoneNumber}`, '_self')
        },
    },
}
</script>

<style lang="scss" scoped>
.phone-container {
    display: inline-flex;
    border: 1px solid currentColor;
    border-radius: 4px;
    transition: all .15s ease-in-out;
    .phone-number {
        display: flex;
        align-items: center;
        .icon {
            width: 100%;
            border-right: 1px solid currentColor;
            display: grid;
            place-content: center;
            padding-inline: 4px;
            transition: all .15s ease-in-out;
        }
        .phone {
            color: currentColor;
            text-decoration: none;
            padding-inline: 4px;
            transition: all .15s ease-in-out;
        }
    }
    &:hover {
        cursor: pointer;
        .phone {
            font-weight: 600;
        }
        background-color: var(--grey-20);
        .icon {
            background-color: var(--grey-80);
            color: white
        }
    }
}
</style>
