import Vue from 'vue'
import stringHelper from '../libraries/stringHelper'

const newsHelper = {
    /**
     * Group the newsitems based on if they're sticky first, after group them on small_date
     * @param {Array} news
     * @returns {Array}
     */
    groupNews(news) {
        const groupedNews = []
        const stickyGrouped = stringHelper.groupBy(news, 'sticky')

        groupedNews.push(typeof stickyGrouped.true !== 'undefined' ? stickyGrouped.true : stickyGrouped.false)
        if (typeof stickyGrouped.false !== 'undefined' && typeof stickyGrouped.true !== 'undefined' && stickyGrouped.true.length > 0) {
            const dateGrouped = stringHelper.groupBy(stickyGrouped.false, 'small_date')
            groupedNews.push(dateGrouped)
        } else if (typeof stickyGrouped.false === 'undefined' && typeof stickyGrouped.true !== 'undefined' && stickyGrouped.true.length > 0) {
            const dateGrouped = stringHelper.groupBy(stickyGrouped.true, 'small_date')
            groupedNews.push(dateGrouped)
            groupedNews[0] = []
        } else {
            const dateGrouped = stringHelper.groupBy(stickyGrouped.false, 'small_date')
            groupedNews.push(dateGrouped)
            groupedNews[0] = []
        }
        return groupedNews
    },

    /**
     * Returns the item with some extra checks to it
     *
     * @param {Object} item
     * @param {Boolean} bodyFetched
     */
    formatItemForCard(item, bodyFetched) {
        if (item.roles) {
            item.roles.forEach(element => {
                element.id = element.role_id
            })
        }
        item.small_date = Vue.moment(item.create_date).apiFormat()
        item.news_title = stringHelper.sanityHTML(item.news_title)
        item.news_intro = stringHelper.sanityHTML(item.news_intro)
        item.body_fetched = bodyFetched
        item.read = item.news_track && item.news_track.read_date

        return item
    },

    /**
     * Checks if a news item is visible (appear_date must be before today and available_until must be after today)
     * @param newsItem
     * @returns {boolean}
     */
    isNewsItemVisible(newsItem) {
        if (newsItem.appear_date !== null || newsItem.available_until !== null) {
            if (Vue.moment().isBeforeOrSameDayTimeAs(Vue.moment(newsItem.appear_date)) ||
                Vue.moment().isAfterOrSameDayTimeAs(Vue.moment(newsItem.available_until))) {
                return false
            }
        }

        return true
    },
}

export default newsHelper
