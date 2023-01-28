<template>
    <div
        v-show="loading"
        :class="{'full-screen-loading': fullScreen, 'd-inline-block': !block || !fullScreen, 'loader-container': block, 'absolute': absolute, 'relative': relative}"
    >
        <div
            v-if="!isInternetExplorer"
            class="loader"
            :class="{'no-margin': noMargin}"
        >
            <span
                v-if="loadingText && !fullScreen"
                class="label label-default"
            >{{ loadingText }}</span>
            <span
                v-if="loadingText && fullScreen"
                class="btn btn-default btn-raised btn-sm marginbtn-sm margin"
            >
                {{ loadingText }}
            </span>
            <span
                v-if="defaultLoadingText"
                class="label label-default"
            >{{ $t('components.spinner.defaultLoadingMessage') }}</span>
            <div>
                <svg
                    class="spinner"
                    :width="loaderWidth"
                    :height="loaderHeight"
                    viewBox="0 0 66 66"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        class="path"
                        fill="none"
                        stroke-width="6"
                        stroke-linecap="round"
                        cx="33"
                        cy="33"
                        r="30"
                    />
                </svg>
            </div>
        </div>
        <div
            v-else
            class="loader"
        >
            <!-- IE < 11 fallback spinner -->
            <span
                v-if="loadingText && !fullScreen"
                class="label label-default"
            >{{ loadingText }}</span>
            <span
                v-if="loadingText && fullScreen"
                class="btn btn-default btn-raised btn-sm marginbtn-sm margin"
            >
                {{ loadingText }}
            </span>
            <span
                v-if="defaultLoadingText"
                class="label label-default"
            >{{ $t('components.spinner.defaultLoadingMessage') }}</span>
            <span
                class="ie-spinner"
                :style="{width: loaderWidth, height: loaderHeight}"
            />
        </div>
    </div>
</template>

<script>
import browserHelper from '@/libraries/browserHelper'
export default {
    props: {
        loading: Boolean,
        loadingText: String,
        defaultLoadingText: Boolean,
        size: [String, Number],
        fullScreen: Boolean,
        block: Boolean,
        noMargin: Boolean,
        absolute: Boolean,
        relative: Boolean,
    },
    computed: {
        loaderWidth () {
            return (this.size ? this.size : '35') + 'px'
        },
        loaderHeight () {
            return (this.size ? this.size : '35') + 'px'
        },
        isInternetExplorer () {
            return browserHelper.isInternetExplorer()
        },
    },
}
</script>

<style scoped lang="scss">
    @import '@/assets/scss/_colors.scss';
    .loader-container {
        padding: 15px;
        width: 100%;
        &.absolute {
            position: absolute;
            top: 0;
        }
    }
    .loader {
        text-align: center;
        &:not(.no-margin){
            margin-right: 5px;
        }
    }

    .spinner {
        vertical-align: middle;
        -webkit-animation: rotator 1.4s linear infinite;
        animation: rotator 1.4s linear infinite;
    }

    @-webkit-keyframes rotator {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(270deg);
            transform: rotate(270deg);
        }
    }

    @keyframes rotator {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }

        100% {
            -webkit-transform: rotate(270deg);
            transform: rotate(270deg);
        }
    }

    .path {
        stroke-dasharray: 187;
        stroke-dashoffset: 0;
        -webkit-transform-origin: center;
        transform-origin: center;
        -webkit-animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
        animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
    }

    @-webkit-keyframes colors {
        0% {
            stroke: $primary-color;
        }

        25% {
            stroke: $fail-color;
        }

        50% {
            stroke: $pending-color;
        }

        75% {
            stroke: $success-color;
        }

        100% {
            stroke: $primary-color;
        }
    }

    @keyframes colors {
        0% {
            stroke: $primary-color;
        }

        25% {
            stroke: $fail-color;
        }

        50% {
            stroke: $pending-color;
        }

        75% {
            stroke: $success-color;
        }

        100% {
            stroke: $primary-color;
        }
    }

    @-webkit-keyframes dash {
        0% {
            stroke-dashoffset: 187;
        }

        50% {
            stroke-dashoffset: 46.75;
            -webkit-transform: rotate(135deg);
            transform: rotate(135deg);
        }

        100% {
            stroke-dashoffset: 187;
            -webkit-transform: rotate(450deg);
            transform: rotate(450deg);
        }
    }

    @keyframes dash {
        0% {
            stroke-dashoffset: 187;
        }

        50% {
            stroke-dashoffset: 46.75;
            -webkit-transform: rotate(135deg);
            transform: rotate(135deg);
        }

        100% {
            stroke-dashoffset: 187;
            -webkit-transform: rotate(450deg);
            transform: rotate(450deg);
        }
    }

    .full-screen-loading {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        display: block !important;
        transform: translate(-50%, -50%) !important;
        margin: 0 !important;
        z-index: 2;
        width: 100%;
        &.relative {
            position: relative !important;
        }
    }

    $spinner-size: 20px;
    $spinner-color: $primary-color;
    $spinner-border-size: 2px;
    .ie-spinner,
    .ie-spinner:after {
        position: relative;
        box-sizing: border-box;
    }

    .ie-spinner {
        width: $spinner-size;
        height: $spinner-size;
        display: block;
        color: $spinner-color;
        text-align: center;
        left: 50%;
        &:not(.no-margin){
            margin-right: 5px;
        }
        &:after {
            content: "";
            width: 100%;
            height: 100%;
            display: inline-block;
            border: $spinner-border-size solid currentColor;
            border-bottom-color: transparent;
            border-radius: 100%;
            background: transparent;
            animation: ball-clip-rotate .75s linear infinite;
        }
    }

    @keyframes ball-clip-rotate {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
