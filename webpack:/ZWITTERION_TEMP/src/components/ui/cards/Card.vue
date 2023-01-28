<template>
    <div
        v-click-outside="unFlip"
        class="card elevation-2"
        :class="{cardClass, flipped, sticky}"
        :style="cardStyle"
    >
        <div
            v-if="!flipped"
            class="front"
            :class="frontClass"
            :style="frontStyle"
        >
            <div
                v-if="!!$slots.header"
                class="card-header"
                :class="headerClass"
                :style="headerStyle"
            >
                <slot name="header" />
            </div>
            <div
                class="card-body"
                :style="bodyStyle"
                :class="bodyClass"
            >
                <slot name="body" />
                <slot name="empty-body" />
            </div>
            <div
                v-if="!!$slots.actions"
                class="card-actions d-print-none"
                :style="actionsStyle"
                :class="actionsClass"
            >
                <slot name="actions" />
            </div>
            <span
                v-if="flipable"
                v-tooltip="flipableTextOpen"
                class="flip-btn elevation-2"
                @click="flipped = !flipped"
            >
                <dots-horizontal :size="20" />
            </span>
        </div>
        <div
            v-if="flipped && !!$slots.back"
            class="back"
        >
            <div
                v-if="!!$slots.header"
                class="card-header"
                :class="headerClass"
                :style="headerStyle"
            >
                <slot name="header" />
            </div>
            <slot name="back" />
            <span
                v-if="flipable"
                v-tooltip="flipableTextClose"
                class="flip-btn elevation-2 backwards"
                @click="flipped = !flipped"
            >
                <backburger :size="20" />
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Card',
    props: {
        cardClass: [String, Object],
        cardStyle: [String, Object],
        frontClass: [String, Object],
        frontStyle: [String, Object],
        headerClass: [String, Object],
        headerStyle: [String, Object],
        bodyClass: [String, Object],
        bodyStyle: [String, Object],
        actionsClass: [String, Object],
        actionsStyle: [String, Object],
        flipable: Boolean,
        autoClose: Boolean,
        flipableTextOpen: {
            type: String,
            default: 'click for more',
        },
        flipableTextClose: {
            type: String,
            default: 'click for less',
        },
        sticky: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            flipped: false,
        }
    },
    methods: {
        unFlip () {
            if (this.autoClose) this.flipped = false
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/shaddows.scss';
    .card {
        position: relative;
        overflow: inherit;
        -webkit-transform-style: preserve-3d;
        transform-style: preserve-3d;
        -webkit-transition: -webkit-transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transition: -webkit-transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), -webkit-transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        .card-header {
            border-bottom:1px solid $hit-gray;
            padding: 5px 10px;
            &.highlight .day-number {
                background-color: var(--blue-60);
                color: white;
                border-radius: 50%;
                padding: 5px;
                &.single {
                    padding: 16px;
                    line-height: 20px;
                }
            }
            &.bold {
                font-weight: 700;
            }
            & h1, h2, h3, h4, h5, h6 {
                color: inherit;
                margin:initial;
                font-weight: inherit;
            }
        }
        .card-body {
            padding-bottom: 40px;
            h1 {
                font-weight: 700;
            }
        }
        .card-actions {
            width: 100%;
            position: absolute;
            bottom: 0;
            border-top: 1px solid $hit-gray;
        }
        div{
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            overflow: visible;
        }
    }
    .card .back, .card .front{
        backface-visibility: visible;
        height: 100%;
        min-height: 250px;
        clear: both;
    }
    .back {
        background: white;
        -webkit-transform: rotateY(180deg);
        transform: rotateY(180deg);
        z-index:-1;
    }
    .front {
        background: white;
        z-index:0;
    }
    .card.flipped {
        -webkit-transform: rotateY(180deg);
        transform: rotateY(180deg);
    }
    .flip-btn {
        background-color: white;
        border-radius: 50%;
        color: #6B778C;
        cursor: pointer;
        padding: 2px;
        position: absolute;
        top: 16px;
        right: -23px;
        -webkit-transition: background-color 100ms linear, color 100ms linear, opacity 300ms cubic-bezier(0.2,0,0,1), transform 300ms cubic-bezier(0.2,0,0,1);
        transition: background-color 100ms linear, color 100ms linear, opacity 300ms cubic-bezier(0.2,0,0,1), transform 300ms cubic-bezier(0.2,0,0,1);
        -webkit-transform: translate(-50%);
        -ms-transform: translate(-50%);
        transform: translate(-50%);
        &.backwards {
            background-color: $fail-color;
            color: white;
        }
        svg {
            display: block;
            margin: 0 auto;
        }
        &:hover {
            background-color: $primary-color;
            color: white;
        }
    }
    .card {
        &.sticky {
            position: sticky;
            top: 0;
        }
    }
    @media only screen and (max-width: 420px) {
        .flip-btn {
            padding: 10px;
            top: 5px;
            right: -11px;
        }
    }
</style>
