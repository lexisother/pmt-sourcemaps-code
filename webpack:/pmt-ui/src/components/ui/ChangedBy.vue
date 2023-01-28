<template>
    <div
        class="list-item"
        :class="{'no-padding': noPadding}"
    >
        <div
            v-if="showIcon"
            class="list-item-icon"
        >
            <component
                :is="icon"
                :size="parseInt(iconSize)"
            />
        </div>
        <div
            v-if="showPrefix"
            class="list-item-prefix"
            :class="{inline}"
        >
            {{ prefix }}
        </div>
        <div
            v-tooltip="{
                content: name(true),
                hideOnTargetClick: true,
                placement: 'top',
                trigger: 'focus hover click'
            }"
            class="list-item-title"
            :class="{inline}"
        >
            {{ name() }},
        </div>
        <div
            class="list-item-subtitle"
            :class="{inline}"
        >
            <span
                v-tooltip="{
                    content: dateTooltip,
                    placement: 'top',
                    trigger: 'focus hover click'
                }"
            >
                {{ timeAgo }}
            </span>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'ModifiedBy',
    props: {
        showPrefix: Boolean,
        showIcon: {
            type: Boolean,
            default: false,
        },
        icon: {
            type: String,
            default: 'calendar-edit',
        },
        iconSize: {
            type: [String, Number],
            default: 18,
        },
        accountId: {
            type: [Number, String],
            default: null,
        },
        modifiedDate: {
            type: [Date, String, Object],
            default: () => {},
        },
        noPadding: {
            type: Boolean,
            default: false,
        },
        inline: {
            type: Boolean,
            default: true,
        },
        showModified: {
            type: Boolean,
            default: false,
        },
        showCreated: {
            type: Boolean,
            default: false,
        },
        showStatusChanged: {
            type: Boolean,
            default: false,
        },
        showFullName: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        ...mapGetters('account', ['getEmployeeById']),
        ...mapGetters('auth', ['user']),
        modifiedBy () {
            return this.getEmployeeById(this.accountId)
        },
        dateTooltip () {
            return this.$moment(this.modifiedDate).fullReadableDateFormat()
        },
        timeAgo () {
            const targetDate = this.$moment(this.modifiedDate)
            return this.$moment().diff(targetDate, 'hours') > 12
                ? this.$moment(this.modifiedDate).calendar()
                : this.$moment(this.modifiedDate).fromNow()
        },
        prefix () {
            if (this.showModified) {
                return this.$t('forms.availabilityEntry.modifiedBy')
            }
            if (this.showCreated) {
                return this.$t('forms.availabilityEntry.createdBy')
            }
            if (this.showStatusChanged) {
                return this.$t('forms.availabilityEntry.modifiedBy')
            } else {
                return ''
            }
        },
    },
    methods: {
        name (tooltip) {
            if (this.user && this.modifiedBy) {
                const username = this.modifiedBy.name || `${this.modifiedBy.employee_first_name} ${this.modifiedBy.employee_last_name}` || 'User'
                if (tooltip && this.showFullName) {
                    return ''
                }
                return tooltip || this.showFullName ? username : username.split(' ')[0]
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .list-item {
        margin-bottom: 3px;
        &:not(.no-padding) {
            padding-left: 5px;
        }
        line-height: 16px;
        .list-item-icon {
            display: inline;
            color: $primary-color;
            margin-right: 3px;
        }
        .list-item-prefix {
            display: block;
            font-size: 90%;
            &.inline {
                margin-right: 3px;
                display: inline-block;
            }
        }
        .list-item-title {
            display: block;
            font-weight: 600;
            &.inline {
                display: inline-block;
            }
        }
        .list-item-subtitle {
            display: inline-block;
            font-size: 90%;
            &.inline {
                margin-left: 3px;
            }
        }
    }
</style>
