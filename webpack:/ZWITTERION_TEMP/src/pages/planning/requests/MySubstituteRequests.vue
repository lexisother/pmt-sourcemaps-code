<template>
    <div>
        <PmtContent v-if="!isLoading && substituteRequests.length">
            <MyRequestsTopBar
                ref="topbar"
                show-search
                :search="search"
                style="border-top: none;"
                @search="search = $event"
            >
                <PSelect
                    id="ssr-statuses"
                    ref="statuses"
                    cy_id="statuses"
                    :items="ssrStatuses"
                    item-value="key"
                    dense
                    width="auto"
                    @input="updateSelectedStatus($event)"
                >
                    <template #selected-label>
                        <div class="selected-label">
                            {{ $t('ui.singles.status') }}:
                            <strong> {{ selectedStatus.label }}</strong>
                        </div>
                    </template>
                </PSelect>
            </MyRequestsTopBar>
            <VDataTable
                ref="ssrTable"
                :headers="headers"
                :items="rowItems"
                :items-per-page="!IS_MOBILE ? 10 : 1000"
                :hide-default-footer="IS_MOBILE"
                :fixed-header="!IS_MOBILE"
                :custom-sort="customSort"
                mobile-breakpoint="1000"
                calculate-widths
                single-expand
                :search="search"
                :expanded="expanded"
                item-key="id"
                @click:row="clickedRow"
            >
                <template
                    v-if="IS_MOBILE"
                    #item="{item}"
                >
                    <tr @click="clickedRow(item)">
                        <td class="pt-2 pb-2">
                            <SubstituteRequestsActions
                                v-if="item.requester_id != user.accountId && item.reply === 0 && $moment(item.rawDate).isAfterOrSameDayAs($moment()) && isPending(item.status)"
                                tag="span"
                                class="float-right"
                                @click="setAsInterested(item.id, $event)"
                            />
                            <Department :department="item.department" />
                            <Chip
                                :text="getStatus(item.status)"
                                :error="item.status.toLowerCase() === 'rejected'"
                                :success="item.status.toLowerCase() === 'approved'"
                                :warning="item.status.toLowerCase() === 'pending'"
                                outline
                            />
                            <div class="request-schedule">
                                <span>
                                    {{ item.date }} |
                                </span>
                                <span>
                                    {{ item.time_start }} -
                                </span>
                                <span>
                                    {{ item.time_end }} ({{ item.duration }})
                                </span>
                                <span v-if="item.break">
                                    | <Coffee
                                        :size="12"
                                        class="break-icon"
                                    /> {{ item.break }}
                                </span>
                            </div>
                            <div class="remark">
                                <div>
                                    <strong>{{ $t('entities.requests.substitutes.requesterName') }}:</strong> {{ item.requester }}
                                </div>
                                <div>
                                    <strong>{{ $t('entities.requests.substitutes.requestedFor') }}</strong>: <component
                                        :is="item.fullObject.length > 1 ? 'a' : 'span'"
                                        :class="{expander: item.fullObject.length > 1}"
                                    >
                                        {{ item.substitutee }}
                                    </component>
                                </div>
                            </div>
                            <div
                                v-if="item.remark"
                                class="remark"
                            >
                                <MessageTextOutline :size="16" /> {{ item.remark }}
                            </div>
                        </td>
                    </tr>
                </template>
                <!-- Templates to set v-expander -->
                <template #expanded-item="{ item }">
                    <td
                        v-if="item.fullObject.length > 1"
                        :colspan="headers.length"
                    >
                        <ReplyStatus
                            :key="item.fullObject.length"
                            :items="item.fullObject"
                        />
                    </td>
                </template>
                <!---->
                <template
                    v-if="!IS_MOBILE"
                    #[`item.department_name`]="{ item }"
                >
                    <Department :department="item.department" />
                </template>
                <template
                    v-if="!IS_MOBILE"
                    #[`item.remark`]="{ item }"
                >
                    <div v-if="item.remark !== '-'">
                        <span v-tooltip="item.remark"> {{ cutRemarkString(item.remark) }} </span>
                    </div>
                </template>
                <template
                    v-if="!IS_MOBILE"
                    #[`item.substitutee`]="{ item }"
                >
                    <span
                        :style="item.fullObject.length <= 1 ? getReplyColor(item.reply) : ''"
                        :class="{expander: item.fullObject.length > 1}"
                    >{{ item.substitutee }}</span>
                </template>
                <template
                    v-if="!IS_MOBILE"
                    #[`item.status`]="{ item }"
                >
                    <div>
                        <Chip
                            :text="getStatus(item.status)"
                            :error="item.status.toLowerCase() === 'rejected'"
                            :success="item.status.toLowerCase() === 'approved'"
                            :warning="item.status.toLowerCase() === 'pending'"
                            outline
                        />
                    </div>
                </template>
                <template #[`item.action`]="{ item }">
                    <SubstituteRequestsActions
                        v-if="item.requester_id != user.accountId && item.reply === 0 && $moment(item.rawDate).isAfterOrSameDayAs($moment()) && isPending(item.status)"
                        @click="setAsInterested(item.id, $event)"
                    />
                </template>
            </VDataTable>
        </PmtContent>
        <PmtContent v-else-if="!isLoading">
            <EmptyState
                :title="$t( 'entities.requests.substitutes.noRequestsFound' )"
                component="no-substitute-requests"
                :size="IS_MOBILE ? 250 : 400"
                no-padding
                show
                :action-text="canFindSubstitutes ? $t('pages.mySchedule.topbar.substituteRequestBtn.label') : ''"
                @action-click="$emit('find-substitutes')"
            />
        </PmtContent>

        <RoundSpinner
            v-else
            :block="true"
            :loading="true"
        />
    </div>
</template>

<script>
import ReplyStatus from '@/pages/planning/requests/substitutes/ReplyStatus.vue'
import SubstituteRequestsActions from '@/pages/planning/requests/substitutes/SubstituteRequestsActions'
import MyRequestsTopBar from '@/pages/planning/requests/MyRequestsTopBar'
import stringHelper from '@/libraries/stringHelper.js'
import { mapGetters, mapActions } from 'vuex'

export default {
    name: 'SubstituteRequests',
    components: {
        ReplyStatus,
        SubstituteRequestsActions,
        MyRequestsTopBar,
    },
    data () {
        return {
            isLoading: false,
            expanded: [],
            selectedStatus: {},
            search: '',
        }
    },
    computed: {
        ...mapGetters('auth', {
            canFindSubstitutes: 'canFindSubstitutes',
            user: 'user',
        }),
        ...mapGetters('substituteRequests', {
            substituteRequests: 'all',
        }),
        ...mapGetters('locale', {
            lang: 'getLocale',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('departments', {
            departments: 'all',
            getDepartmentById: 'getById',
            getDepartmentByIdAtDate: 'getByIdAtDate',
        }),

        ssrStatuses () {
            return [
                {
                    label: 'Status',
                    key: '-',
                    simple: true,
                },
                {
                    label: this.$t('entities.rdo.statusOptions.all'),
                    key: 'all',
                    simple: true,
                },
                {
                    label: this.getStatus('rejected'),
                    key: 'rejected',
                    simple: true,
                },
                {
                    label: this.getStatus('approved'),
                    key: 'approved',
                    simple: true,
                },
                {
                    label: this.getStatus('pending'),
                    key: 'pending',
                    simple: true,
                },
            ]
        },

        headers () {
            return [
                { text: this.$t('entities.requests.substitutes.departmentName'), value: 'department_name' },
                { text: this.$t('entities.requests.substitutes.requesterName'), value: 'requester' },
                { text: this.$t('entities.requests.substitutes.requestedFor'), value: 'substitutee' },
                { text: this.$t('entities.requests.substitutes.requestedForDate'), value: 'date' },
                { text: this.$t('entities.requests.substitutes.requestedFromTime'), value: 'time_start' },
                { text: this.$t('entities.requests.substitutes.requestedToTime'), value: 'time_end' },
                { text: this.$t('entities.requests.substitutes.requestedDuration'), value: 'duration' },
                { text: this.$t('entities.requests.substitutes.requestBreak'), value: 'break' },
                { text: this.$t('entities.requests.substitutes.remark'), value: 'remark' },
                { text: this.$t('entities.requests.substitutes.reply'), value: 'status' },
                { text: this.$t('entities.requests.substitutes.actions.header'), value: 'action' },
            ]
        },

        /**
         * Fetches the rowItems to fill the table with based on the substitute requests.
         *
         * @returns {Object}
         */
        rowItems () {
            const rows = this.substituteRequests.map(item => {
                let request = item[0]
                for (let i = 0; i < item.length; i++) {
                    if (item[i].status === 'approved') {
                        request = item[i]
                    }
                }

                return {
                    // Data used to build the headers
                    department_name: request.department ? request.department.department_shortname : '',
                    department: request.department,
                    requester: this.getCurrentName(request.requester_name),
                    substitutee: item.length > 1 ? this.$t('entities.requests.substitutes.employees', [item.length, this.$t('entities.requests.substitutes.seeDetails')]) : this.getCurrentName(request.substitute_name),
                    date: this.$moment(request.schedule_time_from).euFormat(),
                    rawDate: this.$moment(request.schedule_time_from),
                    time_start: request.time_from,
                    time_end: request.time_to,
                    duration: request.duration,
                    break: request.schedule_break,
                    remark: request.remark,
                    status: request.status,

                    // Data used to filter/conditional show/etc.
                    fullObject: item,
                    id: request.id,
                    schedule_id: request.schedule_id,
                    isRequester: request.is_user_requester,
                    reply: request.reply,
                    requester_id: request.requester_id,
                }
            })

            if (this.selectedStatus.key && this.selectedStatus.key !== '-' && this.selectedStatus.key !== 'all') {
                return rows.filter(item => {
                    return item.status === this.selectedStatus.key
                })
            } else {
                return rows
            }
        },
        dateFormat () {
            return this.IS_MOBILE ? 'MMM DD, YYYY' : 'LL'
        },
    },

    async mounted () {
        this.$moment.locale(this.lang)
        if (!this.substituteRequests.length) {
            this.isLoading = true
            await this.getRequests()
            this.isLoading = false
        }
    },

    methods: {
        ...mapActions('substituteRequests', {
            getSubstituteRequests: 'getSubstituteRequests',
            interested: 'interested',
        }),
        ...mapActions('departments', {
            getDepartments: 'get',
            getWeekDepartments: 'getWeekDepartments',
        }),
        getReplyColor (reply) {
            switch (reply) {
                case -1:
                    return 'color: #ED4C67'
                case 0:
                    return 'color: #fdcb6e'
                case 1:
                    return 'color: #009432'
            }
        },

        isPending (status) {
            return status === 'pending'
        },

        customSort: function (items, index, isDesc) {
            const _this = this

            items.sort((a, b) => {
                if (index[0] === 'date') {
                    // Sorts the column 'date' based on day
                    if (!isDesc[0]) {
                        return _this.compare(a.rawDate.apiFormat(), b.rawDate.apiFormat())
                    } else {
                        return _this.compare(b.rawDate.apiFormat(), a.rawDate.apiFormat())
                    }
                } else {
                    if (!isDesc[0]) {
                        return a[index] < b[index] ? -1 : 1
                    } else {
                        return b[index] < a[index] ? -1 : 1
                    }
                }
            })
            return items
        },
        compare: (start, end) => {
            return start === end ? 0 : start < end ? -1 : 1
        },

        /**
            * Get the status in string format, translated based on the API status value
            *
            * @param {string} status
            *
            * @returns {string}
            */
        getStatus (status) {
            switch (status) {
                case 'pending':
                    return this.$t('entities.requests.substitutes.replyStatus.pending')
                case 'approved':
                    return this.$t('entities.requests.substitutes.replyStatus.accepted')
                case 'rejected':
                    return this.$t('entities.requests.substitutes.replyStatus.rejected')
            }
        },

        /**
            * Get the name of the user and return translated 'Me' if the param String is same as current username
            *
            * @param {string} name
            * @returns {string}
            */
        getCurrentName (name) {
            return this.user.fullname === name ? this.$t('entities.requests.substitutes.me') : name
        },

        /**
            * Refer to underlying stringHelper function to see how this works.
            */
        cutRemarkString (remark) {
            return stringHelper.textToElipsis(remark, 15)
        },

        /**
            * Get the clicked row based on the schedule_id in the sent object value
            *
            * @param {Object} value
            */
        clickedRow (value) {
            if (value.fullObject.length > 1) {
                if (this.expanded.length && this.expanded[0].schedule_id === value.schedule_id) {
                    this.expanded = []
                } else {
                    this.expanded = []
                    this.expanded.push(value)
                }
            }
        },

        /**
            * Set a status interested, or not, to a substitute request received from someone else
            *
            * @param {Number} requestId
            * @param {Boolean} reply
            */
        setAsInterested (requestId, reply) {
            this.isLoading = true
            const interested = {
                requestId: requestId,
                reply: reply,
            }
            this.interested(interested).then(() => {
                this.getRequests()
                this.isLoading = false
            })
        },

        /**
         * Gets the substitute requests for the user
         */
        async getRequests () {
            await this.getSubstituteRequests({ account_id: this.user.accountId })
            await this.getDepartments({ date: this.$moment(), allDepartments: true })

            // Fetch departments info for each request.
            return Promise.all(this.substituteRequests.map(async (item) => {
                const request = item[0]
                request.department = this.getDepartmentById(request.department_id)
                if (request.department) {
                    return item
                }

                // If not found in current and future structures, check departments from previous store structures.
                const date = this.$moment(request.schedule_time_from)
                request.department = this.getDepartmentByIdAtDate({ id: request.department_id, date: date.apiFormat() })
                if (request.department) {
                    return item
                }
                await this.getWeekDepartments({ allDepartments: true, date: date.apiFormat() })
                request.department = this.getDepartmentByIdAtDate({ id: request.department_id, date: date.apiFormat() })
                return item
            }))
        },

        /**
         * Sets the selected substitute request status
         * @param {Object} status
         */
        updateSelectedStatus (status) {
            this.selectedStatus = status
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .expander {
        color: $primary-color;
        text-decoration: none;
        cursor: pointer;
    }
    .request-schedule {
        margin: 10px 3px;
    }
    .remark {
        border-top: 1px solid $disabled-color;
        padding: 5px;
    }
    .no-underline {
        text-decoration: none;
    }
    .break-icon {
        line-height: 12px;
    }
</style>
