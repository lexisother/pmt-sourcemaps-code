import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
export default {
    computed: {
        ...mapState({
            filters: 'pageFilters',
        }),
        ...mapGetters('auth', {
            currentUser: 'user',
        }),
    },
    methods: {
        ...mapMutations(['UPDATE_ENABLED_FILTERS']),
        ...mapActions('news', {
            fetchNewsCategories: 'getNewsCategories',
            fetchNewsDepartments: 'getNewsDepartments',
        }),
        async getNewsData () {
            await this.fetchNewsCategories().catch(err => { throw err })
            if (this.currentUser && this.currentUser.accountId !== null) {
                await this.fetchNewsDepartments(this.currentUser.accountId).catch(err => { throw err })
            }

            this.UPDATE_ENABLED_FILTERS({
                // Filters
                departments: true,
                newsCategories: true,
                // Groups
                showOrganisationalNews: true,
                showActiveNewsItems: true,
                showInactiveNewsItems: true,
            })
        },
        filterNews (news) {
            const result = []
            if (this.filters) {
                for (let index = 0; index < news.length; index++) {
                    const element = news[index]

                    // Check if departments are matched
                    let checkDepartmentId = false
                    if (this.filters.departments.length && element.department_ids) {
                        for (let index = 0; index < element.department_ids.length; index++) {
                            const id = element.department_ids[index]
                            if (this.filters.departments.includes(id)) {
                                checkDepartmentId = true
                                break
                            }
                        }
                    }
                    if (this.filters.departments.length && !checkDepartmentId) continue

                    // Check if categories are matched
                    const checkCategory = this.filters.newsCategories.includes(element.news_category ? element.news_category.news_category_id : '')
                    if (this.filters.newsCategories.length && !checkCategory) continue

                    // Check if org news check is matched
                    if (this.filters.showOrganisationalNews && element.store_group !== this.filters.showOrganisationalNews) continue

                    // Check the active filters
                    if (!this.filters.showActiveNewsItems || !this.filters.showInactiveNewsItems) {
                        if (this.filters.showInactiveNewsItems === element.active) continue
                        if (this.filters.showActiveNewsItems === !element.active) continue
                    }

                    result.push(element)
                }
            }
            return result
        },
    },
}
