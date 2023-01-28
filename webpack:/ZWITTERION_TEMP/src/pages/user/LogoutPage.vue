<script>
import { mapActions } from 'vuex'
export default {
    created () {
        this.logout({ forceLogout: true })
    },

    methods: {
        ...mapActions('auth', ['logout']),
    },

    render () {
        return false
    },
}
</script>
