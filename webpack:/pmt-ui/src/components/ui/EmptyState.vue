<template>
    <div
        v-if="show"
        class="empty-state"
        :class="{padding: !noPadding}"
    >
        <component
            :is="component"
            v-if="!isIcon"
            :size="parseInt(size)"
            :empty-search-result="emptySearchResult"
        />
        <component
            :is="icon"
            v-else
            :size="parseInt(size)"
        />
        <div
            class="empty-state-title"
            :style="{color: textColor || '', 'font-size': titleFontSize + 'px'}"
            :class="{'text-error': isError}"
        >
            <alert-outline
                v-if="isError"
                :size="35"
            />
            <span class="title-text"> {{ title != '' ? title : $t('ui.emptyState.defaultText') }} </span>
        </div>
        <div
            v-if="subTitle"
            class="text-center"
            :style="textColor ? `color: ${textColor}` : false"
        >
            <p
                class="empty-state-sub-title"
                :class="{'text-justify': justifySubtitle, dense}"
                v-html="subTitle"
            />
        </div>
        <slot name="custom-action" />
        <i18n
            v-if="actionText != ''"
            path="ui.emptyState.actionTag"
            tag="p"
            class="empty-state-sub-title"
        >
            <template #action>
                <a
                    class="action-link"
                    @click="$emit('action-click')"
                >{{ actionText.toLowerCase() }}</a>
            </template>
        </i18n>
        <!-- Anything else needed can go in the default slot.
        In the parent componet buttons or links can be
        added that have no behavior representation by
        this empty-state component -->
        <slot />
    </div>
</template>

<script>
import EmptyStates from '@/components/ui/EmptyStates'
export default {
    name: 'EmptyState',
    components: { ...EmptyStates },
    props: {
        title: {
            type: String,
            default: '',
        },
        titleFontSize: {
            type: [String, Number],
            default: 18,
        },
        subTitle: {
            type: String,
            default: '',
        },
        actionText: {
            type: String,
            default: '',
        },
        show: {
            type: Boolean,
            default: false,
        },
        isIcon: Boolean,
        icon: String,
        component: String,
        size: {
            type: [Number, String],
            default: 200,
        },
        noPadding: {
            type: Boolean,
            default: false,
        },
        justifySubtitle: {
            type: Boolean,
            default: false,
        },
        textColor: String,
        dense: {
            type: Boolean,
            default: false,
        },
        isError: Boolean,
        emptySearchResult: Boolean,
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .empty-state {
        text-align: center;
        font-size: 17px;
        font-weight: bold;
        color: $disabled-color;
        &.padding {
            padding: 4em 1.5em;
        }
        .empty-state-title {
            color: $dark-text-color;
            font-size: 18px;
            padding-bottom: 15px;

            .title-text {
                vertical-align: middle;
            }
        }
        .empty-state-sub-title {
            font-size: 14px;
            font-weight: 500;
            padding-bottom: 20px;
            &.dense {
                font-weight: 400;
                line-height: 20px;
            }
        }
        a {
            text-decoration: none;
            opacity: 0.7;
        }
        .empty-state-image {
            position: relative;
            display: table;
            margin: auto;
            max-width: 70%;
            opacity: 0.4;;
        }
    }
</style>
