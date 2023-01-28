<template>
    <li
        :id="timeBlock.id || 0"
        ref="timeBlock"
        :style="getTimeBlockStyle"
        :class="classList"
        :data-id="timeBlock.id || 0"
        :cy_id="cyId"
        @click="handleClick($event)"
        @mouseover="$emit('block-hover')"
    >
        <div
            v-if="timeBlock.travel && timeBlock.travel.before !== null && timeBlock.type.toLowerCase() === 'school'"
            class="travel-before tb-color"
            :style="getTbTravelBeforeStyle()"
        >
            <bike-fast
                v-if="timeBlock.travel ? timeBlock.travel.before > '00:15' : false"
                :size="22"
                class="travel-icon before"
            />
        </div>

        <div class="time-block-info">
            <div class="time-block-label">
                <span
                    v-if="icon"
                    class="time-block-type-icon"
                >
                    <component
                        :is="icon"
                        :size="16"
                    />
                </span>
                <span class="time-block-label-text">{{ getTimeBlockType() }}</span>
            </div>
            <time
                v-if="timeBlock.type !== 'placeholder-add'"
                class="time-block-time"
            >
                {{ timeBlock.timeFrom }} <small class="d-xs-none">-</small>
                {{ timeBlock.timeTo }}
            </time>
        </div>

        <ul
            v-if="!timeBlock.editable || timeBlock.repeat"
            class="time-block-options"
        >
            <li
                v-if="timeBlock.repeat"
                :title="$t( 'components.timeBlock.options.repeat' )"
            >
                <UndoVariant :size="18" />
            </li>
        </ul>

        <div
            v-if="timeBlock.travel && timeBlock.travel.after !== null && timeBlock.type.toLowerCase() === 'school'"
            class="travel-after tb-color"
            :style="getTravelAfterStyle()"
        >
            <bike-fast
                v-if="timeBlock.travel ? timeBlock.travel.after > '00:15' : false"
                :size="22"
                class="travel-icon after"
            />
        </div>
    </li>
</template>

<script>
import timeBlockHelper from '@/libraries/timeBlockHelper'
import scrollHelper from '@/libraries/scrollHelper'

export default {
    props: {
        timeBlock: {
            type: Object,
            required: true,
        },
        travelBeforeStyle: {
            type: Function,
        },
        travelAfterStyle: {
            type: Function,
        },
        timeBlockClasses: {
            type: Function,
        },
        timeBlockStyle: {
            type: Function,
        },
        overlapsWithTimeblock: {
            type: Boolean,
            default: false,
        },
        cyId: [String, Number],
    },
    computed: {
        classList () {
            let classList = [
                'time-block',
                this.timeBlock.type.toLowerCase(),
                {
                    travel: this.timeBlock.travel,
                    placeholder: this.isPlaceholder,
                    active: this.isActive,
                    editable: this.canEdit && !this.isNewWeekset,
                    recurring: this.timeBlock.repeat && !this.isNewWeekset,
                    onetime: !this.timeBlock.repeat,
                    overlaps: this.overlapsWithTimeblock,
                },
            ]

            if (this.timeBlockClasses) {
                classList = classList.concat(this.timeBlockClasses(this.timeBlock))
            }
            return classList
        },
        getTimeBlockStyle () {
            if (this.timeBlockClasses) {
                return this.timeBlockStyle(this.timeBlock)
            }
            return {}
        },
        isPlaceholder () {
            return this.timeBlock.placeholder || false
        },
        isActive () {
            return !!this.timeBlock.active
        },
        canEdit () {
            return !!this.timeBlock.editable
        },
        isNewWeekset () {
            return this.$cfg.specialAvailabilityRoutes.includes(this.$route.name)
        },
        icon () {
            return timeBlockHelper.getTimeBlockTypeIcon(this.timeBlock)
        },
    },
    watch: {
        timeBlock: {
            immediate: true,
            deep: true,
            handler (val) {
                // scroll to timeblock if the time is set and the timeblock is out of the view port
                // only for placeholder timeblocks
                if (val.placeholder) {
                    setTimeout(() => {
                        const elem = document.getElementById(val.id)
                        const container = document.getElementById('main')
                        if (!scrollHelper.isInViewport(elem) && elem) {
                            container.scrollTop = elem.offsetTop - 50
                        }
                    }, 50)
                }
            },
        },
    },
    methods: {
        handleClick (event) {
            this.$emit('on-click', event)
        },
        getTbTravelBeforeStyle () {
            if (this.travelBeforeStyle) {
                return this.travelBeforeStyle(this.timeBlock)
            }

            return {}
        },
        getTravelAfterStyle () {
            if (this.travelAfterStyle) {
                return this.travelAfterStyle(this.timeBlock)
            }

            return {}
        },
        getTimeBlockType () {
            let type = this.timeBlock.type.toLowerCase()

            if (!this.isPlaceholder && !~timeBlockHelper.getTimeBlockTypes().indexOf(type)) {
                type = 'other'
            }

            return this.$t('components.timeBlock.types.' + type)
        },

    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/helpers.scss';
    @import '@/assets/scss/shaddows.scss';
    @import '@/assets/scss/mixins/time-block.scss';

    .time-block {
        box-shadow: $shaddow-2p;
        transition: box-shadow .2s ease-in-out;
        @include time-block;
        position: relative;
        text-align: left;
        list-style: none;
        margin: 0 3px;
    }

    @media only screen and (max-width: 900px) {
        .time-block {
            .time-block-info {
                display: block;
            }
        }
    }
    @media only screen and (max-width: 600px) {
        .time-block {
            padding: 2px;
            .time-block-info {
                .time-block-label {
                    white-space: unset;
                    overflow: unset;
                    word-wrap: break-word;
                    text-transform: unset;
                    font-size: 10px;
                    .time-block-label-text {
                        display: none;
                    }
                }
            }
            .time-block-options {
                font-size: 10px;
            }
        }
    }
    .recurring {
        left: 20% !important;
        //right: 10% !important;
        z-index: 2!important;
        // &:hover {
        //     z-index: 2;
        // }
    }
    .placeholder {
        z-index: 4!important;
    }
    // .onetime {
    //     left: 20% !important;
    //     right: 10% !important;
    // }
    .onetime.placeholder {
        left: 0!important;
        right: 0!important;

    }
    .overlaps .time-block-time {
        max-width: 50px;
    }
    @media (max-width: 576px) {
        .time-block-time {
            font-size: 75%;
            font-weight: 500;
            overflow: hidden;
        }
    }
</style>
