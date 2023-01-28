<template>
    <pmt-content>
        <news
            v-show="news.length && !isAuthenticated"
            home-page
        />
        <empty-state
            :show="isAuthenticated"
            component="no-rdo-requests"
            no-padding
            dense
            :title="$t('pages.dashboard.emptyDasboard.title')"
            :sub-title="$t('pages.dashboard.emptyDasboard.body')"
            :size="IS_MOBILE ? 220 : 500"
        />
    </pmt-content>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import News from '@/pages/communication/NewsOverview.vue'
export default {
    name: 'Dasboard',
    components: {
        News,
    },
    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('auth', [
            'isAuthenticated',
        ]),
        ...mapState('news', {
            news: 'news',
        }),
    },
}

</script>
