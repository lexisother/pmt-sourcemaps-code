<template>
    <PmtContent class="container">
        <h2 class="box-title">
            {{ $t('pages.sendNewsletter.title') }}
        </h2>
        <div class="newsBox">
            <div class="employees-selector">
                <span v-if="employeesToBeSend.length < 1 && storesToBeSend.length < 1" class="recipients"
                    style="color: #A4B0B6"> {{ $t('pages.sendNewsletter.recipients') }} </span>
                <div v-else class="employees-selected">
                    <div v-if="employeesToBeSend.length > 0">
                        <Chip class="employee-chip" rounded
                            :text="$t('pages.sendNewsletter.toBeSent', [employeesNotDisabled.length])" />
                    </div>
                    <div v-if="storesToBeSend.length > 0">
                        <span v-for="(store, index) in selectedStores" :key="index">
                            <Chip class="employee-chip" rounded :text="store.store_name" />
                        </span>
                    </div>
                </div>
            </div>
            <VMenu v-model="showMenu" offset-y :close-on-content-click="false" close-on-click :max-height="700">
                <template #activator="{ on }">
                    <div class="select-employees" v-on="on">
                        <PmtButton v-if="employeesToBeSend.length > 0 || storesToBeSend > 0"
                            v-tooltip="$t('pages.sendNewsletter.tooltips.deselect')" class="remove-selected-employees"
                            tab-index="-1" icon="close" icon-size="18" default round
                            @click="selectedEmployees = []; selectedStores = []" />
                    </div>
                </template>
                <div class="selectors">
                    <div v-if="!isOrganisational && !loading" class="employees-list">
                        <p>{{ $t('pages.sendNewsletter.recipientsSelectedInfo') }}</p>
                        <PInput v-model="search" append-icon="magnify" :label="$t('ui.singles.search')" />
                        <VDataTable v-model="selectedEmployees" :headers="employeesHeaders" :items="employees"
                            :search="search" :items-per-page="1000" height="480px" fixed-header hide-default-footer
                            :sort-by="['name']" :sort-desc="[false]" show-select item-key="account_id" calculate-widths
                            :item-class="itemRowBackground">
                            <template #[`item.data-table-select`]="{ item, isSelected, select }">
                                <VSimpleCheckbox :value="isSelected || item.disabled" :readonly="item.disabled"
                                    :disabled="item.disabled" :selected="true" @input="select($event)" />
                            </template>
                        </VDataTable>
                    </div>
                    <div v-if="isOrganisational && !loading" class="store-groups">
                        <VDataTable v-model="selectedStores" :headers="storesHeaders" :items="stores"
                            :items-per-page="1000" height="600px" fixed-header hide-default-footer
                            :sort-by="['store_name']" :sort-desc="[false]" show-select item-key="id" calculate-widths />
                    </div>

                    <PmtButton primary class="close-selector" @click="showMenu = false">
                        OK
                    </PmtButton>
                </div>
            </VMenu>

            <div class="title">
                <PInput ref="newsTitle" v-model="newsTitle" cy_id="newsTitle"
                    :placeholder="typeof newsItem.news_title !== 'undefined' ? `Subject: ${newsItem.news_title}` : ''"
                    :maxlength="75" :button-icon="newsTitle !== newsItem.news_title ? 'cached' : null"
                    :button-tooltip="$t('pages.sendNewsletter.tooltips.resetOriginalTitle')"
                    @click:button="newsTitle = newsItem.news_title" />
            </div>
            <div class="body">
                <h3>{{ $t('pages.sendNewsletter.body.preview') }}</h3>
                <div class="newsletter-content">
                    <p>{{ $t('pages.sendNewsletter.template.header') }} {{ currentUser !== null ? currentUser.fullname :
                    '' }},</p>
                    <div class="preloadNews" v-html="getNewsLetterBody" />
                    <router-link :key="newsId" tag="a" :to="{ name: 'news-item-view', params: { id: newsId } }">
                        {{ $t('pages.sendNewsletter.body.view') }}
                    </router-link>
                    <p>
                        <span style="display: block">{{ currentStore !== null ? currentStore.name : '' }}</span>
                        <span style="display: block"> {{ host }} </span>
                    </p>
                </div>
                <br>
            </div>
            <div class="actions">
                <PmtButton default icon="close" icon-size="16" class="cancelNewsletter" @click="goToNewsOverview()">
                    {{ $t('pages.sendNewsletter.cancel') }}
                </PmtButton>
                <PmtButton primary icon="send" icon-size="16" :disabled="checkDisabledCreate" :loading="loadSendButton"
                    class="sendNewsLetter" @click="sendNewsletter()">
                    {{ $t('pages.sendNewsletter.create') }}
                </PmtButton>
            </div>
        </div>
    </PmtContent>
</template>

<script>
import { mapMutations, mapGetters, mapActions, mapState } from 'vuex'
import urlHelper from '../../libraries/urlHelper'
import stringHelper from '../../libraries/stringHelper'
import newsService from '../../services/NewsService'
import storeService from '../../services/StoreService'
import newsHelper from '../../libraries/newsHelper'

export default {
    name: 'NewsLetterSend',

    props: {
        propNewsId: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            showMenu: false,
            newsId: 0,
            newsItem: {},
            newsTrack: [],

            availableStores: [],

            disabledCount: 0,
            openMenu: false,
            search: '',
            loading: false,
            loadSendButton: false,
            newsTitle: '',

            storeEmployees: [],
            selectedEmployees: [],
            selectedStores: [],
        }
    },
    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('auth', {
            canYou: 'canYou',
            isOrganisationalUser: 'isOrganisationalUser',
            currentUser: 'user',
            hasNewsLetterAccess: 'hasNewsLetterAccess',
        }),
        ...mapState('stores', {
            storeRoles: 'storeRoles',
        }),
        ...mapGetters('stores', {
            currentStore: 'currentStore',
        }),
        ...mapState('news', {
            newsLetterItem: 'newsLetterItem',
        }),
        ...mapGetters('news', {
            allDepartments: 'allDepartments',
        }),
        host() {
            return urlHelper.getHost()
        },
        checkDisabledCreate() {
            return !this.employeesToBeSend.length > 0 && !this.selectedStores.length > 0
        },
        isOrganisational() {
            return this.isOrganisationalUser && this.newsItem.store_group
        },
        /**
         * Format the body of the newsletter: the intro and optionally "..." if the news has a body.
         */
        getNewsLetterBody() {
            return stringHelper.sanityHTML(this.newsItem.news_intro) + (this.newsItem.news_story ? '...' : '')
        },
        employees() {
            let employeeList = this.storeEmployees
            if (this.newsTrack.length > 0) {
                employeeList = this.getNewsTrackFilteredEmployees
            }
            // If user received role id information, then filter by it. Check the first user: employeeList[0].role_id
            if (this.newsItem.roles !== null && employeeList[0] && !!employeeList[0].role_id) {
                const availableRoles = this.setAvailableRoles(this.newsItem.roles)
                const filteredOnRoleEmployees = []
                for (let index = 0; index < employeeList.length; index++) {
                    const element = employeeList[index]
                    if (typeof availableRoles !== 'undefined' && availableRoles.includes(element.role_id)) {
                        filteredOnRoleEmployees.push(element)
                    }
                }
                employeeList = filteredOnRoleEmployees
            }

            if (!this.loading) {
                return employeeList.map(item => {
                    return {
                        name: item.name,
                        account_id: item.account_id,
                        role_name: item.role_name,
                        personnel_number: item.personnel_number,
                        department: this.findDepartment(item.departments),
                        disabled: item.disabled,
                    }
                })
            }
            return []
        },
        employeesHeaders() {
            const employees = [
                { text: this.$t('pages.sendNewsletter.tableHeaders.name'), value: 'name' },
                { text: this.$t('pages.sendNewsletter.tableHeaders.department'), value: 'department' },
                { text: this.$t('pages.sendNewsletter.tableHeaders.personnelNumber'), value: 'personnel_number' },
            ]
            if (this.canYou('user', 'roles')) {
                employees.push({ text: this.$t('pages.sendNewsletter.tableHeaders.roleName'), value: 'role_name' })
            }
            return employees
        },
        stores() {
            return this.availableStores.map(item => {
                return {
                    id: item.store_id,
                    store_name: item.store_name,
                    location: item.city,
                    store_number: item.retail_store_number,
                }
            })
        },
        storesHeaders() {
            return [
                { text: this.$t('pages.sendNewsletter.tableHeaders.storeName'), value: 'store_name' },
                { text: this.$t('pages.sendNewsletter.tableHeaders.location'), value: 'location' },
                { text: this.$t('pages.sendNewsletter.tableHeaders.storeNumber'), value: 'store_number' },
            ]
        },
        getNewsTrackFilteredEmployees() {
            const track = this.newsTrack
            let employees = this.storeEmployees
            const self = this
            employees = employees.filter(cv => {
                return !track.find(e => {
                    if (Number(e.account_id) === Number(cv.account_id)) {
                        cv.disabled = true
                        self.selectedEmployees.push(cv)

                        if (self.newsItem.last_modified !== null) {
                            const lastEdit = self.$moment(self.newsItem.last_modified.datetime)
                            const employeeDate = e.sent_date !== null ? self.$moment(e.sent_date) : self.$moment(e.read_date)
                            if (lastEdit.isAfter(employeeDate) || lastEdit.isSame(employeeDate)) {
                                cv.disabled = false
                                const index = self.selectedEmployees.indexOf(cv)
                                self.selectedEmployees.splice(index, 1)
                            }
                        }
                    }
                })
            })
            return employees
        },
        employeesToBeSend() {
            const employees = []
            for (let index = 0; index < this.selectedEmployees.length; index++) {
                const element = this.selectedEmployees[index]
                if (!element.disabled) {
                    employees.push(element.account_id)
                }
            }
            return employees
        },
        employeesNotDisabled() {
            return this.employeesToBeSend.filter(element => !element.disabled)
        },
        storesToBeSend() {
            const stores = []
            for (let index = 0; index < this.selectedStores.length; index++) {
                const element = this.selectedStores[index]
                stores.push(element.id)
            }
            return stores
        },
    },
    async mounted() {
        if (!this.hasNewsLetterAccess) {
            this.SET_SNACKBAR({ message: this.$t('generalMessages.errors.pageNotFound'), error: true })
            return this.$router.push({ name: 'news-overview' })
        }

        this.newsId = parseInt(typeof this.$route.params.id !== 'undefined' ? this.$route.params.id : this.propNewsId)
        if (this.currentUser !== null) {
            await this.fetchDepartments(this.currentUser.accountId)
                .then(() => {
                    this.fetchNewsItem()
                })
        }
        if (this.currentStore !== null) {
            this.GET_STORE_ROLES()
        }
    },

    beforeDestroy() {
        this.removeSendNewsLetterItem()
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('account', {
            getStoreEmployeesForWeek: 'getStoreEmployeesForWeek',
            getEmployees: 'getEmployees',
        }),
        ...mapMutations('news', {
            removeSendNewsLetterItem: 'removeSendNewsLetterItem',
        }),
        ...mapActions('news', {
            getSendNewsLetterItem: 'getSendNewsLetterItem',
            sendNewsletterAction: 'sendNewsletter',
            fetchDepartments: 'getNewsDepartments',
        }),
        ...mapActions('stores', {
            GET_STORE_ROLES: 'GET_STORE_ROLES',
        }),

        async fetchNewsItem() {
            this.loading = true
            await this.getSendNewsLetterItem(this.newsId)
                .then(async () => {
                    if (!newsHelper.isNewsItemVisible(this.newsLetterItem)) {
                        throw new Error('invalid action')
                    }
                    this.newsItem = this.newsLetterItem
                    this.setNewsTitle()
                    this.getEmployeesForNewsItem()
                    this.getNewsTrack()

                    if (this.newsItem.store_groups !== null) {
                        const storeGroups = []

                        for (let index = 0; index < this.newsItem.store_groups.length; index++) {
                            const element = this.newsItem.store_groups[index]
                            storeGroups.push(element.id)
                        }

                        await storeService.getStoresFromStoreGroups(storeGroups.toString())
                            .then((response) => {
                                this.availableStores = response
                            })
                            .catch((error) => {
                                throw error
                            })
                    }
                })
                .catch(() => {
                    this.SET_SNACKBAR({ message: this.$t('generalMessages.errors.pageNotFound'), error: true })
                    this.$router.push({ name: 'news-overview' })
                })
                .finally(() => {
                    this.loading = false
                })
        },

        /**
         * Return the employees for each newsletter. The list contains an intersection
         * of GET /employees and GET /store/{store_id}/employees call until one of the calls will return the needed response.
         */
        getEmployeesForNewsItem() {
            this.getEmployees({
                active: true,
                department_id: this.newsItem.department_ids ? this.newsItem.department_ids.toString() : this.stripDepartments(this.allDepartments, true),
            })
                .then(employees => {
                    // Remove the employees that are not received in the store employees call to not show inactive employees in the list of recipients.
                    // This will be removed when the logic from GET /employees call will be modified - that call returns inactive employees
                    this.getStoreEmployeesForWeek({
                        store_id: this.currentStore.id,
                        year: this.$moment().isoWeekYear(),
                        week: this.$moment().isoWeek(),
                    })
                        .then(storeEmployees => {
                            const storeEmployeeIds = storeEmployees.map((item) => { return item.account_id })
                            this.storeEmployees = employees.filter(elem => {
                                return storeEmployeeIds.indexOf(elem.account_id) > -1
                            })
                        })
                })
        },

        itemRowBackground: function (item) {
            return item.disabled ? 'item-disabled' : ''
        },

        /**
         * Gets the available roles based on the roles call and the roles in the newsitem
         *
         * @param {Array} roles
         * @returns {Array}
         */
        setAvailableRoles(roles) {
            if (typeof roles !== 'undefined') {
                roles.forEach(element => {
                    element.id = element.role_id
                })
                const result = roles.filter(o1 => this.storeRoles.some(o2 => o1.id === o2.id))

                const newRolesArray = []
                for (let index = 0; index < result.length; index++) {
                    const element = result[index]
                    newRolesArray.push(element.id)
                }

                return newRolesArray
            }
        },
        setNewsTitle() {
            this.newsTitle = this.newsItem.news_title
        },
        /**
         * Sends the newsletter
         */
        sendNewsletter() {
            this.loadSendButton = true
            const payload = {
                id: this.newsId,
                store_id: this.currentStore.id,
                receivers: this.isOrganisational ? this.storesToBeSend : this.employeesToBeSend,
                title: this.newsTitle.length > 0 ? this.newsTitle : this.newsItem.news_title,
                subdomain: urlHelper.getSubdomain(),
                read_news_link: `${urlHelper.getHost()}/news/news-overview/${this.newsId}`,
            }
            this.sendNewsletterAction(payload).then((response) => {
                if (response === 204) {
                    this.loadSendButton = false
                    this.SET_SNACKBAR({ message: this.$t('pages.sendNewsletter.snackbars.sent'), success: true })
                    this.$router.push({ name: 'news-overview' })
                } else {
                    this.loadSendButton = false
                    this.SET_SNACKBAR({ message: this.$t('pages.sendNewsletter.snackbars.notSent', [response]), error: true })
                }
            })
                .catch((error) => {
                    this.loadSendButton = false
                    this.SET_SNACKBAR({ message: this.$t('pages.sendNewsletter.snackbars.notSent', [error.message]), error: true })
                })
                .finally(() => {
                    this.loadSendButton = false
                })
        },

        /**
         * This method pushed the news-overview into the router
         */
        goToNewsOverview() {
            this.$router.push({ name: 'news-overview' })
        },

        /**
         * Get the news track for the newsitem
         */
        getNewsTrack() {
            newsService.getNewsTrack(this.newsId).then(response => {
                this.newsTrack = response
            })
                .catch((error) => {
                    throw error
                })
        },

        /**
         * Strip the departments down
         *
         * @param {Array} deps
         * @param {Boolean} toString
         *
         * @returns {Array}
         */
        stripDepartments(deps, toString) {
            const depIds = []
            for (let index = 0; index < deps.length; index++) {
                const element = deps[index]
                depIds.push(element.department_id)
            }
            return toString ? depIds.toString() : depIds
        },

        /**
         * Finds a department
         *
         * @param {Object} item
         * @returns {Object}
         */
        findDepartment(item) {
            if (typeof this.newsItem.department_ids !== 'undefined') {
                const value = item.find(elem => this.newsItem.department_ids !== null ? this.newsItem.department_ids.includes(elem.id) : this.stripDepartments(this.allDepartments, false).includes(elem.id))

                if (typeof value !== 'undefined') {
                    return value.department_name
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
// @import '../../pages/communication/resources/newslettersend.scss';
</style>
