<template>
    <div data-upvoty />
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters('auth', ['user']),
    },
    async created () {
        await this.upvotyIdentify(this.user)
    },
    methods: {
        upvotyIdentify (user) {
            // Script to build the upvoty in the head so we don't need it globally. This is to make sure customers don't get any whitelisting issues onLoad
            this.$nextTick(() => {
                const script = document.createElement('script')
                script.type = 'text/javascript'
                script.async = true
                script.src = 'https://retailsolutions.upvoty.com/javascript/upvoty.embed.js'
                document.getElementsByTagName('head')[0].appendChild(script)
            })
            // Log user into Upvoty
            const upvotyId = `${user.contact.email}_${user.personnelNumber}`
            setTimeout(() => {
                // upvoty is not defined because the variable is never set, it is being received through the embed.js above
                window.upvoty.init('identify', {
                    user: {
                        id: upvotyId,
                        name: user.fullname,
                        email: user.contact.email,
                    },
                    baseUrl: 'retailsolutions.upvoty.com',
                    publicKey: '2e2c064d22f30a619e5896f2317b6a97',
                })
                window.upvoty.init('render', {
                    ssoToken: null,
                    baseUrl: 'retailsolutions.upvoty.com',
                })
            }, 1000)
        },
    },
}
</script>
