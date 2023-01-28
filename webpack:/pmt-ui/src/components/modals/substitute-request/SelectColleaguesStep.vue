<template>
    <div id="select-colleague-step">
        <template v-if="!isLoading">
            <Chip
                v-if="!rowItems.length"
                warning
                outline
                :text="$t( 'modals.substituteRequest.selectColleagueStep.noColleaguesAvailableForShift' )"
            />
            <VDataTable
                v-if="rowItems.length"
                v-model="selected"
                :headers="headers"
                :items="rowItems"
                :items-per-page="10"
                :hide-default-footer="rowItems.length < 10"
                :footer-props="{
                    'items-per-page-options': [5, 10, 25, 50]
                }"
                :sort-by="['name']"
                :sort-desc="[false]"
                show-select
                item-key="id"
                :dense="true"
                mobile-breakpoint="1000"
                calculate-widths
            />
            <PmtInfo
                gray
                class="mt-5"
            >
                <p>{{ $t( 'modals.substituteRequest.selectColleagueStep.info' ) }}</p>
                <p>{{ $t( 'modals.substituteRequest.selectColleagueStep.otherColleagueSection.info' ) }}</p>
                <PSelect
                    ref="colleagueDropdown"
                    cy_id="colleagueDropdown"
                    :placeholder="$t( 'modals.substituteRequest.selectColleagueStep.otherColleagueSection.selectField.placeholder' )"
                    searchable
                    :items="otherEmployeesSelectOptions.filter(o => !o.hidden)"
                    :menu-width="288"
                    @input="onOtherColleagueSelect"
                >
                    <template #activator="{ on }">
                        <PmtButton
                            primary
                            inverted
                            icon="plus"
                            v-on="on"
                        >
                            {{ $t( 'modals.substituteRequest.selectColleagueStep.otherColleagueSection.selectField.label' ) }}
                        </PmtButton>
                    </template>
                </PSelect>
            </PmtInfo>
            <div class="button-group mt-5">
                <PmtButton
                    default
                    icon="arrow-left"
                    icon-size="15"
                    @on-click="$emit( 'on-back-nav' )"
                >
                    {{ $t( 'modals.substituteRequest.prevBtn.label' ) }}
                </PmtButton>
                <PmtButton
                    primary
                    icon="arrow-right"
                    icon-size="15"
                    right-icon
                    :disabled="!selected.length"
                    @on-click="onSelect"
                >
                    {{ $t( 'modals.substituteRequest.nextBtn.label' ) }}
                </PmtButton>
            </div>
        </template>
        <RoundSpinner
            v-if="isLoading"
            :block="true"
            :loading="true"
            default-loading-text
        />
    </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'

export default {
    props: {
        shift: {
            type: Object,
            required: true,
        },
    },
    data () {
        return {
            colleagues: [],
            otherColleagues: [],
            selectedColleaguesIds: [],
            initColleaguesIds: [],
            isLoading: true,
            selectAllColleaguesChecked: false,
            headers: [
                { text: this.$t('entities.requests.substitutes.selectColleague.name'), value: 'name' },
                { text: this.$t('entities.requests.substitutes.selectColleague.department'), value: 'department' },
            ],
            selected: [],
        }
    },
    computed: {
        ...mapGetters('auth', ['user', 'canYou']),
        ...mapGetters('stores', ['currentStore']),
        ...mapGetters('departments', {
            departmentById: 'getById',
            allDepartments: 'all',
            currentDepartments: 'current',
        }),
        ...mapState('account', {
            storeEmployeesForWeek: 'storeEmployeesForWeek',
        }),
        rowItems () {
            return this.colleagues.map(item => {
                return {
                    // Data used to build the headers
                    name: item.name,
                    department: item.department,
                    id: item.id,
                    account_id: item.id,
                }
            })
        },
        otherEmployeesSelectOptions () {
            let options = []
            if (!this.storeEmployeesForWeek.length) {
                options = this.otherColleagues
            } else {
                options = this.storeEmployeesForWeek.map(item => {
                    item.id = item.account_id
                    return {
                        label: item.name,
                        value: item,
                        key: item.id,
                        department_id: item.department_id,
                    }
                })
            }
            return options.map(item => {
                item.hidden = this.selectedColleaguesIds.includes(item.value.id)
                item.simple = false
                return item
            })
        },
    },
    async created () {
        await this.initColleaguesSelectbox()
        await this.initColleaguesList()
        await this.initSelectedColleagues()
    },
    methods: {
        ...mapActions('account', {
            getColleaguesForWeek: 'getColleaguesForWeek',
        }),
        ...mapActions('departments', {
            getDepartments: 'get',
        }),
        ...mapActions('substituteRequests', ['getAvailableColleaguesForShift']),
        allColleaguesSelected () {
            return this.selectedColleaguesIds.length === this.colleagues.length
        },
        selectAllColleagues () {
            this.selectedColleaguesIds = this.colleagues.map(item => item.id)
        },
        onSelect () {
            this.$emit('on-colleagues-select', this.selected.filter(item => {
                return this.selectedColleaguesIds.indexOf(item.id) > -1
            }))
        },
        onOtherColleagueSelect (option) {
            const foundDepartment = option.department_id ? this.departmentById(option.department_id) : false
            if (foundDepartment) {
                option.value.department = foundDepartment.department_name
            }
            this.colleagues.push(option.value)
            this.selected.push(option.value)

            this.selectedColleaguesIds.push(option.value.id || option.value.account_id)
        },
        setSelectedColleagues (colleagueIds) {
            // TODO: See if this can be done in another way.
            // this is not working as intended and has a couple of BUGs.
            // DISABLED it for now as it is not vital to the functionality
            // this.initColleaguesIds = colleagueIds
        },
        initColleaguesList () {
            return this.getAvailableColleaguesForShift(this.shift.shiftInstanceId).then(ids => {
                const mapColleagues = ids.map(id => {
                    return {
                        name: this.storeEmployeesForWeek.find(emp => emp.account_id === id).name,
                        department: this.departmentById(this.storeEmployeesForWeek.find(emp => emp.account_id === id).department_id).department_name,
                        id: this.storeEmployeesForWeek.find(emp => emp.account_id === id).id,
                    }
                })
                this.colleagues = mapColleagues
                return mapColleagues
            }).catch(error => {
                this.$emit('on-error', error)
            }).finally(() => {
                this.isLoading = false
            })
        },

        /**
         * Fills the selector with all store employees.
         */
        async initColleaguesSelectbox () {
            const payload = {
                storeId: this.currentStore.id,
                year: this.$moment(this.shift.from).isoWeekYear(),
                week: this.$moment(this.shift.from).isoWeek(),
                exchange: false,
            }
            if (!this.storeEmployeesForWeek.length) {
                await this.getDepartments({ date: this.$moment(), allDepartments: true })
                return this.getColleaguesForWeek(payload)
                    .then((colleagues) => {
                        const currentUserIndex = colleagues.findIndex(item => item.id === this.user.accountId)
                        if (currentUserIndex !== -1) {
                            colleagues.splice(currentUserIndex, 1)
                        }
                        this.otherColleagues = colleagues.map(item => {
                            item.id = item.account_id
                            return {
                                label: item.name,
                                value: item,
                                key: item.id,
                                department_id: item.department_id,
                            }
                        })
                    })
            }
        },
        initSelectedColleagues () {
            if (!this.initColleaguesIds.length) {
                this.selectAllColleagues()
            } else {
                this.selectedColleaguesIds = this.initColleaguesIds
                this.initColleaguesIds.forEach(id => {
                    const found = this.colleagues.findIndex(item => {
                        return id === item.id || item.account_id
                    })
                    // add the colleague from the other list if not found
                    if (found === -1) {
                        const otherEmployee = this.otherColleagues.find(item => item && (item.key !== '-' && id === (item.value.id || item.value.account_id)))
                        if (otherEmployee) {
                            this.colleagues.push(otherEmployee)
                        }
                    }
                })
            }
        },
    },
}
</script>
