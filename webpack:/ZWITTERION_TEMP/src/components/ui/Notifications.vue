<template>
    <div class="notifications">
        <TransitionGroup
            name="list"
            tag="div"
        >
            <VSnackbar
                v-for="(s, i) in snackbars"
                :key="s.id"
                value="true"
                :style="{'margin-bottom':((i + .2) * 60) + 'px'}"
                :timeout="-1"
                right
                bottom
                max-height="50"
                min-width="250"
                class="notification-snackbar"
                color="white"
            >
                <div
                    class="info-icon"
                    :style="{'background-color': notificationColor(s.type, true)}"
                >
                    <Component
                        :is="notificationIcon(s.type)"
                        :size="32"
                        :fill-color="notificationColor(s.type)"
                    />
                </div>
                <div class="info-text">
                    <div>
                        {{ s.text }}
                    </div>
                    <div :style="{color: notificationColor(s.type)}">
                        {{ s.link }}
                    </div>
                </div>
                <PmtButton
                    small
                    icon="close"
                    class="close-button"
                    :b-style="{
                        'margin': '0 !important',
                        'padding': '0 !important',
                    }"
                    fill-color="var(--grey-100)"
                    @click="removeNotification(i)"
                />
            </VSnackbar>
        </TransitionGroup>
    </div>
</template>

<script>
import stringHelper from '@/libraries/stringHelper'
export default {
    data () {
        return {
            snackbars: [],
            connection: null,
        }
    },
    created () {
        // open the websocket connection to start receiving the notifications
        this.openWebsocketConnection()

        // open the browser notifications connection
        this.openBrowserNotificationConnection()
    },
    methods: {
        notificationIcon (type) {
            if (type === 'info') return 'Information'
            if (type === 'error') return 'Alert'
            if (type === 'reload') return 'Refresh'
        },
        notificationColor (type, shade = false) {
            if (type === 'info' || type === 'reload') {
                let color = '--blue-100'
                let shadeColor = this.$helpers.hexToRgb(getComputedStyle(document.body).getPropertyValue(color).trim(), true, true)
                return !shade ? `var(${color})` : shadeColor
            }
            if (type === 'error') {
                let color = '--red-100'
                let shadeColor = this.$helpers.hexToRgb(getComputedStyle(document.body).getPropertyValue(color).trim(), true, true)
                return !shade ? `var(${color})` : shadeColor
            }
        },
        removeNotification (index) {
            this.snackbars.splice(index, 1)
        },
        openWebsocketConnection () {
            this.connection = new WebSocket('wss://socketsbay.com/wss/v2/2/demo/')

            this.connection.onmessage = (event) => {
                if (event.data !== 'Connect' && event.data !== 'New Message' && event.data !== 'Hello onopen') {
                    // this.snackbars.push({ text: event.data, type: 'info', link: 'View all requests', id: Math.floor(Math.random() * 10000) })
                }
                // this.notifyMe(event.data)
            }

            this.connection.onopen = function (event) {
                console.log('Successfully connected to the PMT websocket server...')
            }
        },
        openBrowserNotificationConnection () {
            document.addEventListener('DOMContentLoaded', function () {
                if (!Notification) {
                    alert('Desktop notifications not available in your browser. Try Chromium.')
                    return
                }

                if (Notification.permission !== 'granted') { Notification.requestPermission() }
            })
        },
        notifyMe (message) {
            const translationProp = `pageTitles.${stringHelper.camelCaseHyphenString(this.$route.name)}`
            if (Notification.permission !== 'granted') { Notification.requestPermission() } else {
                var notification = new Notification(`PMT - ${this.$t(translationProp)}`, {
                    icon: 'https://tenbrinkfood.pmtstaging.nl/favicon_5.ico',
                    body: message,
                })
                notification.onclick = function () {
                    window.open('http://google.com')
                }
            }
        },
        // addNotification () {
        //     let randomItem = [
        //         {
        //             text: 'Rdo request denied :(',
        //             link: 'See all requests',
        //             type: 'error',
        //         },
        //         {
        //             text: 'SSR request approved :)',
        //             link: 'See all requests',
        //             type: 'info',
        //         },
        //         {
        //             text: 'Rules engine reloaded',
        //             type: 'reload',
        //         },
        //     ]
        //     var randomNumber = Math.floor(Math.random() * randomItem.length)
        //     this.snackbars.push({ ...randomItem[randomNumber], id: Math.floor(Math.random() * 10000) })
        // },
    },
}
</script>

<style lang="scss" scoped>
    .info-icon {
        display: flex;
        height: 44px;
        width: 44px;
        border-radius: 50%;
        justify-content: center;
        align-items: center;
    }
    .info-text {
        color: var(--grey-100);
        margin-left: 8px;
        align-self: center;
        font-weight: 600;
    }
    .v-snack__wrapper {
        border-radius: 25px !important;
    }
    .v-snack__content {
        padding: 4px;
        display: grid;
        grid-template-columns: 50px 1fr 20px;
    }

    .list-move, /* apply transition to moving elements */
    .list-enter-active,
    .list-leave-active {
        transition: all 0.5s ease;
        position: absolute;
    }

    .list-enter,
    .list-leave-to {
        opacity: 0;
        transform: translateX(30px);
    }

    /* ensure leaving items are taken out of layout flow so that moving
    animations can be calculated correctly. */
    .list-leave-active {
        position: absolute;
    }
</style>
