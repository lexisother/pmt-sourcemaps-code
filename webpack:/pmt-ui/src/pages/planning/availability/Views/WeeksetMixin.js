const weeksetMixin = {
    methods: {
        goBack () {
            if (this.$route.params.activation) {
                this.$router.push({
                    name: 'activate-account-finalize',
                    params: this.$route.params,
                    query: {
                        path: 'availability',
                    },
                })
            } else {
                const isManager = this.$route.meta.manager
                const selectedAccount = this.$route.params.account_id && isManager ? `/${this.$route.params.account_id}` : ''
                const startDate = this.$route.params.start_date
                let params = ''
                if (startDate) {
                    params = startDate.month
                        ? `/month/${parseInt(startDate.month)}-${parseInt(startDate.year)}${selectedAccount}`
                        : `/week/${parseInt(startDate.week)}-${parseInt(startDate.year)}${selectedAccount}`
                }

                const path = isManager ? '/planning' : '/my-overview'
                this.$router.push({ path: `${path}/availability${params}` })
            }
        },
    },
}

export default weeksetMixin
