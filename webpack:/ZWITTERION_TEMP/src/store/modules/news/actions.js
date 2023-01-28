import newsService from '../../../services/NewsService'
import departmentsService from '../../../services/DepartmentsService'
import stringHelper from '../../../libraries/stringHelper'
import newsHelper from '../../../libraries/newsHelper'

const actions = {

    /**
     * Gets the unread messages number which is returned in the sitemap call and saves it to state & ls
     *
     * @param context
     */
    setUnreadNewsCounter(context) {
        // Find number of unread news if any.
        let newsItem = null
        context.rootGetters['menu/getSitemapResponse'].mainNavigation.forEach(item => {
            if (item.type === 'Communication') {
                item.items.forEach(subItem => {
                    if (subItem.unread !== undefined) {
                        newsItem = subItem
                    }
                })
            }
        })

        const unreadCounter = newsItem ? newsItem.unread : 0

        context.commit('setUnreadNewsCounter', unreadCounter)
        localStorage.setItem('unreadNewsCounter', unreadCounter)
    },

    /**
     * Returns news filtered by filters stored in state.
     * Saves filtered news in state, but state is refreshed on each new fetch.
     *
     * @param context
     * @param payload
     * @returns {*}
     */
    getNewsAction(context, payload) {
        payload = payload || {}
        context.state.isLoading = true
        const filters = {
            limit: payload.limit ? payload.limit : context.state.recordsPerPage,
            page: payload.page ? payload.page : context.state.pageNumber,
        }

        return newsService.getNews(filters).then((result) => {
            // Reset state news if this is the first page because it means the filters were rest.
            // Otherwise add to existing pages.
            if (context.state.pageNumber === 1) {
                context.state.news = []
            }

            context.state.isLoading = false
            if (result.length) {
                result.forEach((item) => {
                    context.state.news.push(newsHelper.formatItemForCard(item, false))
                })
                return context.state.news
            }
            return []
        }).catch((error) => {
            context.state.isLoading = false
            if (error.code === 'general.forbidden') {
                context.state.news = []

                return []
            }

            throw error
        })
    },

    /**
     * Returns the news track data for a news item
     *
     * @param context
     * @param id
     * @returns {Promise<void>|*}
     */
    getNewsTrack(context, id) {
        if (context.state.newsTracks[id]) {
            return context.state.newsTracks[id]
        }

        return newsService.getNewsTrack(id).then(response => {
            context.commit('addNewsTrack', { newsTrackId: id, newsTrackData: response })

            return response
        }).catch((error) => {
            throw error
        })
    },

    /**
     * Sets "read" flag to true for a news item.
     *
     * @param context
     * @param newsId
     */
    markNewsItemAsRead(context, newsId) {
        for (let i = 0; i < context.state.news.length; i++) {
            if (context.state.news[i].news_id === newsId) {
                context.state.news[i].read = true
            }
        }
    },

    /**
     * Returns all information for a news item.
     *
     * @param context
     * @param newsId
     * @returns {Promise<*>}
     */
    getNewsItem(context, newsId) {
        context.state.isLoading = true
        return newsService.getFullNews(newsId).then((response) => {
            context.state.isLoading = false
            response = newsHelper.formatItemForCard(response, true)
            response.story = stringHelper.sanityHTML(response.news_story)

            return response
        }).catch(error => {
            context.state.isLoading = false
            throw error
        })
    },

    getSendNewsLetterItem(context, newsId) {
        return newsService.getFullNews(newsId).then((response) => {
            context.state.newsLetterItem = response
            return response
        })
    },

    getNewsCategories(context) {
        return newsService.getNewsCategories().then((result) => {
            result.forEach(item => {
                item.checked = false
            })

            context.commit('setNewsCategories', result)
        })
    },

    /**
     * Returns list of departments to be used for filtering.
     *
     * @param context
     * @param accountId
     * @returns {Promise<T>}
     */
    getNewsDepartments(context, accountId) {
        if (context.rootGetters['auth/canYou']('planning', 'all_departments')) {
            context.dispatch('getAllDepartments')

            return
        }
        // First try to fetch employee's departments. If there are no departments the current user might be
        // organisational/pmt, so fetch all
        return newsService.getDepartments(accountId).then((result) => {
            if (result.length) {
                const departments = result[0].departments
                departments.forEach(item => {
                    item.checked = false
                })
                context.commit('setNewsDepartments', departments)
            } else {
                context.dispatch('getAllDepartments')
            }
        })
            .catch((error) => {
                throw error
            })
    },

    /**
     * Fetches all store departments and formats them as expected by news module.
     *
     * @param context
     */
    getAllDepartments(context) {
        departmentsService.getAllCurrentDepartments().then((result) => {
            if (result.length) {
                const departments = result
                departments.forEach(item => {
                    item.checked = false
                })
                context.commit('setNewsDepartments', departments)
            }
        })
            .catch((error) => {
                throw error
            })
    },

    sendNewsletter(context, payload) {
        return newsService.sendNewsletter(payload)
            .then((response) => {
                delete context.state.newsTracks[payload.id]
                return response
            })
            .catch((error) => {
                throw error
            })
    },

    /**
     * Sets a news item
     *
     * @param context
     * @param payload
     * @returns {Promise<T>}
     */
    async createNews(context, payload) {
        return newsService.createNews(payload).then(async (response) => {
            // create new item at beginning of state.news array
            const item = newsHelper.formatItemForCard(response.data.result, true)
            context.commit('CREATE_NEWS_ITEM', item)
            return response
        }).catch((error) => {
            throw error
        })
    },

    /**
     * Updates a news item
     *
     * @param context
     * @param payload
     * @returns {Promise<T>}
     */
    async updateNews(context, payload) {
        return newsService.updateNews(payload).then(async (response) => {
            // update item in state.news array
            const item = newsHelper.formatItemForCard(response.data.result, true)
            context.commit('UPDATE_NEWS_ITEM', item)
            return response
        }).catch((error) => {
            throw error
        })
    },

    /**
     * Deletes a news item.
     * @param context
     * @param {Number} id
     */
    async deleteNewsItem(context, id) {
        return newsService.deleteNewsItem(id)
            .then(async (response) => {
                await context.dispatch('getNewsAction')
                return response
            })
            .catch((error) => {
                throw error
            })
    },
}

export default actions
