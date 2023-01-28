<template>
    <ul :class="getClassList()">
        <li
            v-for="item in items"
            :key="item.label"
            class="item"
            :class="item.class ? item.class.join(',') : ''"
        >
            <div class="label">
                {{ item.label }}
            </div>

            <div
                :class="getItemClassList( item )"
                @click="onClick( item )"
                v-html="getItemValue( item )"
            />
        </li>
    </ul>
</template>

<script>
export default {
    props: {
        items: {
            type: [Array, Object],
            required: true,
        },
        slim: {
            type: Boolean,
            default: false,
        },
        emptyPlaceholder: {
            type: String,
            default: '-',
        },
    },
    methods: {
        onClick (item) {
            if (typeof item.action === 'function') {
                item.action()
            }
        },
        getClassList () {
            return [
                'value-list',
                {
                    slim: this.slim,
                },
            ]
        },
        getItemValue (item) {
            if (!item.value) {
                return this.emptyPlaceholder
            }

            if (Array.isArray(item.value)) {
                let ul = '<ul>'

                item.value.forEach(value => {
                    ul += '<li>' + value + '</li>'
                })

                return ul + '</ul>'
            }

            return item.value
        },
        getItemClassList (item) {
            let list = [
                'value',
            ]

            if (item.classes) {
                if (typeof item.classes === 'string') {
                    list.push(item.classes)
                } else if (Array.isArray(item.classes)) {
                    list = list.concat(item.classes)
                }
            }

            return list
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .value-list {
        margin-bottom: 1.5em;
        .item {
            &:not(:last-child) {
                margin-bottom: 25px;
            }
            .label,
            .value {
                white-space: pre-line;
                line-height: 1.5em;
            }
            .label {
                margin-bottom: .8em;
                font-size: .9rem;
            }
            .value {
                font-size: 1rem;
                font-weight: 400;
                color: $dark-gray;
            }
            &.space {
                margin-bottom: 60px;
            }
        }
        &.slim .item{
            &:not(:last-child) {
                margin-bottom: 25px;
            }
            .label,
            .value {
                font-size: .8rem;
            }
        }
    }
</style>

<style lang="scss">
    .value-list .value ul > li {
        margin-bottom: .5em;
    }
</style>
