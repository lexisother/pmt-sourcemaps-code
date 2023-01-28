<template>
    <side-panel-section
        v-if="changes.length"
        :title="$t('sidePanels.availabilityWeeklyDetails.sections.changes')"
    >
        <ul class="changes-list">
            <li
                v-for="(item, index) in changes"
                :key="index"
                class="list-item"
                :class="item.type"
            >
                <div class="list-item-title">
                    <span style="line-height: 0px">
                        <component
                            :is="icon(item.type)"
                            :size="16"
                        />
                        {{ $t(`components.timeBlock.types.${item.type}`) }}
                        <chip
                            :text="$t(`sidePanels.availabilityWeeklyDetails.sections.${item.action}`)"
                            :error="item.action === 'deleted'"
                            :warning="item.action === 'modified'"
                            :success="item.action === 'created'"
                            :success-light="item.action === 'imported'"
                            small
                            outline
                            raised
                        />
                    </span>
                </div>
                <div class="list-item-body">
                    <div>
                        {{ $moment(item.date).format('dddd') }}
                    </div>
                    <small>
                        {{ `${item.timeFrom} - ${item.timeTo}` }}
                    </small>
                </div>
                <!-- This functionality is disabled (v-if="false") as of now. If required
                ---- to be enabled needs some code refinement in the mutation -->
                <div
                    v-if="false"
                    v-tooltip="$t('sidePanels.availabilityWeeklyDetails.sections.undo')"
                    class="list-item-action"
                >
                    <pmt-button
                        normal
                        small
                        @click="undoWeeksetChange(item)"
                    >
                        <undo-variant :size="20" />
                    </pmt-button>
                </div>
            </li>
        </ul>
    </side-panel-section>
</template>

<script>
import SidePanelSection from '@/components/ui/side-panels/SidePanelSection.vue'
import timeBlockHelper from '@/libraries/timeBlockHelper'
import { mapMutations } from 'vuex'
export default {
    name: 'WeeksetChanges',
    components: {
        SidePanelSection,
    },
    props: {
        changes: {
            type: Array,
            default: () => ([]),
        },
    },
    methods: {
        ...mapMutations('availability', {
            undoWeeksetChange: 'undoWeeksetChange',
        }),
        icon (type) {
            return timeBlockHelper.getTimeBlockTypeIcon({ type: type })
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/mixins/time-block.scss';
    .changes-list {
        font-size: 90%;
        line-height: 2em;
        .list-item {
            &.preferred,
            &.agreed {
                color: darken( $tb-preferred-color, 25% );
            }

            &.school,
            &.other,
            &.sport {
                color: darken( $tb-not-availible-color, 25% );
            }
            .list-item-title {
                font-weight: 700;
            }
            .list-item-body {
                display: inline-block;
                line-height: 17px;
            }
            .list-item-action {
                float: right;
                margin-top: -15px;
                svg {
                    color: $primary-color;
                }
            }
        }
    }
</style>
