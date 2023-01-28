const mutations = {
    setNews (state, news) {
        state.news = news
    },
    reset (state) {
        state.news = []
        state.pageNumber = 1
    },
    incrementPage (state) {
        state.pageNumber += 1
    },

    setNewsCategories (state, data) {
        state.categories = data
    },

    setNewsDepartments (state, data) {
        state.departments = data
    },

    removeSendNewsLetterItem (state) {
        state.newsLetterItem = {}
    },

    setUnreadNewsCounter (state, count) {
        state.unreadNewsCounter = count
    },

    addNewsTrack (state, payload) {
        state.newsTracks[payload.newsTrackId] = payload.newsTrackData
    },

    SET_EDITING_NEWS_ITEM (state, item) {
        state.editingNewsItem = item
    },

    UPDATE_NEWS_ITEM (state, item) {
        const newsIndex = state.news.findIndex(o => o.news_id === item.news_id)

        if (newsIndex > -1) {
            const newsClone = JSON.parse(JSON.stringify(state.news))
            newsClone[newsIndex] = item
            state.news = newsClone
        }
    },

    CREATE_NEWS_ITEM (state, item) {
        const newsClone = JSON.parse(JSON.stringify(state.news))
        newsClone.unshift(item)
        state.news = newsClone
    },
}
export default mutations
