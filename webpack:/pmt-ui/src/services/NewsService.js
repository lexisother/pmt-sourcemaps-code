import pmtApi from '../libraries/pmtApi'
import moment from 'moment'
import axios from 'axios'
const apiVersion = 'v2'

const zendeskApi = axios.create({
    // transformRequest is needed to remove the default header x-api-user, Zendesk doesn't allow this
    transformRequest: [(data, headers) => {
        delete headers.common['x-api-user']
        return data
    }],
    baseURL: 'https://support.personeelstool.nl' + '/api/' + apiVersion + '/',
    headers: {
        Authorization: 'Basic c3VwcG9ydEByd3JzLm5sL3Rva2VuOk9tUmdCYW5uYnQ0dGNUSWRzdEV4VUw3alk5ZWZEeEJWa0JRMHRnczM=',
    },
})

class NewsService {
    /**
     * Returns the filtered news
     *
     * @param {Object} params
     * @returns {Promise}
     */
    getNews(params) {
        return pmtApi.get('/news', { params, data: { set403SnackBar: false } }).then((response) => {
            return response.data.result
        }, (error) => {
            throw error
        })
    }

    getFullNews(newsId) {
        return pmtApi.get(`/news/${newsId}`).then((response) => {
            return response.data.result
        })
    }

    getNewsCategories() {
        return pmtApi.get('/newsCategories').then((response) => {
            return response.data.result
        })
    }

    getDepartments(accountId) {
        return pmtApi.get('/employeeDepartments', {
            params: {
                account_id: accountId,
                date: moment().apiFormat(),
            },
        }).then((response) => {
            return response.data ? response.data.result : []
        })
    }

    /**
     * Returns news track information for a news item.
     *
     * @param newsId
     * @returns {Promise<*>}
     */
    getNewsTrack(newsId) {
        return pmtApi.get(`/news/${newsId}/track`).then((response) => {
            return response.data.result
        })
    }

    sendNewsletter(payload) {
        return pmtApi.post(`/news/${payload.id}/sendNewsletter`, payload)
            .then((response) => {
                return response.status
            })
            .catch((error) => {
                throw error
            })
    }

    createNews(payload) {
        return pmtApi.post('/news', payload).then((response) => {
            return response
        }).catch((error) => {
            throw error
        })
    }

    updateNews(payload) {
        return pmtApi.put(`/news/${payload.news_id}`, payload).then((response) => {
            return response
        }).catch((error) => {
            throw error
        })
    }

    deleteNewsItem(id) {
        return pmtApi.delete(`/news/${id}`)
            .then((response) => {
                return response
            })
            .catch((error) => {
                throw error
            })
    }

    // Zendesk Methods
    // ZENDESK METHODS USE ANOTHER API

    /**
     * Get the what's new items based on version
     *
     * @param {String} version
     * @returns {Array}
     */
    getWhatsNew(version) {
        return zendeskApi.get('/help_center/nl/articles.json', {
            params: {
                sort_by: 'position',
                sort_order: 'asc',
                label_names: version,
            },
        }).then((response) => {
            return response.data.articles
        }).catch((error) => {
            throw error
        })
    }

    /**
     * Get the articles needed based on the provided label
     *
     * @param {String} version
     * @returns {Array}
     */
    getHelperArticles(label) {
        return zendeskApi.get('/help_center/nl/articles.json', {
            params: {
                sort_by: 'position',
                sort_order: 'asc',
                label_names: label,
            },
        }).then((response) => {
            return response.data.articles
        })
    }
}

export default new NewsService()
