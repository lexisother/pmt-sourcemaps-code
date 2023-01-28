<template>
    <div
        :class="{'col col-12': block, 'd-inline-block mr-3': !block}"
        class="simple-list-item"
    >
        <div :class="{'row align-start justify-start list-item': block, 'text-center': center}">
            <div
                v-if="$slots.left && !icon"
                class="mr-2"
            >
                <slot name="left" />
            </div>
            <div class="list-item-content">
                <div
                    v-if="title"
                    class="list-item-title"
                >
                    {{ title }}
                </div>
                <slot name="title" />
                <span
                    v-if="subTitle"
                    class="list-item-subtitle"
                    v-html="subTitle"
                />
                <slot name="subtitle" />
            </div>
            <div
                v-if="$slots.right"
                class="ml-2 list-item-right"
            >
                <slot name="right" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SimpleListItem',
    props: {
        icon: {
            type: String,
            default: '',
        },
        iconSize: {
            type: [String, Number],
            default: 30,
        },
        title: {
            type: [String, Number],
            default: '',
        },
        subTitle: {
            type: [String, Number],
            default: '',
        },
        block: {
            type: Boolean,
            default: true,
        },
        center: Boolean,
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .list-item {
        line-height: 18px;
        width: 100%;
        margin-bottom: 5px;
        .list-item-title {
            font-weight: 600;
        }
        .list-item-subtitle {
            font-size: 90%;
            white-space: pre-line;
        }
        .list-item-content {
            min-width: 120px;
        }
    }
    @media screen and ( max-width: 450px ) {
        .list-item {
            border-bottom: 1px solid $border-color;
            .list-item-content {
                margin-bottom: 10px;
            }
            .list-item-right {
                right: 50px;
                position: absolute;
            }
        }
    };
</style>
