<template>
    <div>
        <PmtContent class="my-account-information">
            <tabs
                :key="reloadTabsComponent"
                :tabs="tabs"
                :tab-loading="calendarLoading"
            >
                <template slot="tabs-content">
                    <div
                        v-if="!$route.query.path || $route.query.path === 'account_information'"
                        class="inner-tab-content"
                    >
                        <Chip
                            v-if="user.passwordWillExpire"
                            :text="$t('generalMessages.info.passwordWillExpire', [user.daysUntilPasswordExpired])"
                            warning
                            large
                            icon="alert-outline"
                            inverted
                        />
                        <simple-list-item
                            :id="'username'"
                            :ref="'username'"
                            :title="employeeInfo.accountInfo.username.label"
                            :sub-title="employeeInfo.accountInfo.username.value"
                            class="account-info"
                        >
                            <template slot="right">
                                <PmtButton
                                    primary
                                    outline
                                    no-margin
                                    :round="IS_MOBILE"
                                    :small="!IS_MOBILE"
                                    icon="pencil"
                                    :icon-size="15"
                                    class="edit-username"
                                    @click="openEditAccount('username')"
                                >
                                    <span v-if="!IS_MOBILE">{{ $t('pages.myAccountInformation.editBtn.label') }}</span>
                                </PmtButton>
                            </template>
                        </simple-list-item>
                        <simple-list-item
                            :id="'password'"
                            :ref="'password'"
                            :title="employeeInfo.accountInfo.password.label"
                            :sub-title="employeeInfo.accountInfo.password.value"
                            class="account-info"
                        >
                            <template slot="right">
                                <PmtButton
                                    primary
                                    outline
                                    :round="IS_MOBILE"
                                    :small="!IS_MOBILE"
                                    icon="pencil"
                                    :icon-size="15"
                                    class="edit-password"
                                    @click="openEditAccount('password')"
                                >
                                    <span v-if="!IS_MOBILE">{{ $t('pages.myAccountInformation.editBtn.label') }}</span>
                                </PmtButton>
                            </template>
                        </simple-list-item>
                    </div>
                    <div
                        v-if="$route.query.path === 'personal_information'"
                        class="inner-tab-content"
                    >
                        <simple-list-item
                            v-for="(info, index) in employeeInfo.personalInfo"
                            :id="info.id"
                            :key="index"
                            :ref="info.id"
                            :title="info.label"
                            :sub-title="info.value"
                            class="personal-info"
                        />
                    </div>
                    <div
                        v-if="$route.query.path === 'contact_information'"
                        class="inner-tab-content"
                    >
                        <simple-list-item
                            v-for="(info, index) in employeeInfo.contactInfo"
                            :id="info.id"
                            :key="index"
                            :ref="info.id"
                            :title="info.label"
                            :sub-title="info.value"
                            class="contact-info"
                        />
                    </div>
                    <div
                        v-if="$route.query.path === 'contract_information' && canViewBasicContractInfo"
                        class="inner-tab-content"
                    >
                        <simple-list-item
                            v-for="(info, index) in contractInfo"
                            :id="info.id"
                            :key="index"
                            :ref="info.id"
                            :title="info.label"
                            :sub-title="info.value"
                            class="contract-info"
                        />
                        <simple-list-item
                            v-for="(info, index) in employeeInfo.employmentInfo"
                            :id="info.id"
                            :key="index"
                            :ref="info.id"
                            :title="info.label"
                            :sub-title="info.value"
                            class="contract-info"
                        />
                    </div>
                    <div
                        v-if="$route.query.path === 'settings' && !calendarLoading"
                        class="text-sm inner-tab-content"
                    >
                        <h4> {{ $t( 'pages.myAccountInformation.settingsOptions.calendarHeader' ) }} </h4>
                        <a @click="updateCalendarSettings">
                            <pmt-switch
                                id="CalendarIntegrationSwitch"
                                :value="myCalendarSettings.activated"
                                :label="myCalendarSettings.activated ?
                                    $t( 'pages.myAccountInformation.settingsOptions.title.enabled' ) :
                                    $t( 'pages.myAccountInformation.settingsOptions.title.disabled' )"
                            />
                        </a>
                        <div
                            v-if="myCalendarSettings.activated"
                            class="calendar-info"
                        >
                            <a
                                id="ical-button"
                                :href="myCalendarSettings.iCalCalendar"
                            >{{ $t( 'pages.myAccountInformation.settingsOptions.ical' ) }}</a>
                            <br>
                            <a
                                v-if="IS_MOBILE"
                                id="ical-button"
                                :href="myCalendarSettings.iCalCalendarMobile"
                            >{{ $t( 'pages.myAccountInformation.settingsOptions.icalMobile' ) }}</a>
                            <br v-if="IS_MOBILE">
                            <a
                                id="google-button"
                                :href="myCalendarSettings.googleCalendar"
                                target="_blank"
                            >{{ $t( 'pages.myAccountInformation.settingsOptions.google' ) }}</a>
                            <v-menu
                                offset-y
                                :close-on-content-click="false"
                            >
                                <template #activator="{ on }">
                                    <PmtButton
                                        primary
                                        inverted
                                        round
                                        icon="account-question"
                                        icon-size="20"
                                        v-on="on"
                                    />
                                </template>
                                <div class="explanation">
                                    {{ $t( 'pages.myAccountInformation.settingsOptions.explanation[0]') }}
                                    <ol>
                                        <li>{{ $t( 'pages.myAccountInformation.settingsOptions.explanation[1]') }}</li>
                                        <li>{{ $t( 'pages.myAccountInformation.settingsOptions.explanation[2]') }} {{ myCalendarSettings.googleCalendar }}</li>
                                        <li>{{ $t( 'pages.myAccountInformation.settingsOptions.explanation[3]') }}</li>
                                        <li>{{ $t( 'pages.myAccountInformation.settingsOptions.explanation[4]') }}</li>
                                        <span>{{ $t( 'pages.myAccountInformation.settingsOptions.optional') }}</span>
                                        <li>{{ $t( 'pages.myAccountInformation.settingsOptions.explanation[5]') }}</li>
                                        <li>{{ $t( 'pages.myAccountInformation.settingsOptions.explanation[6]') }}</li>
                                        <li>{{ $t( 'pages.myAccountInformation.settingsOptions.explanation[7]') }}<v-icon>mdi-menu</v-icon></li>
                                        <li>{{ $t( 'pages.myAccountInformation.settingsOptions.explanation[8]') }}</li>
                                        <li>{{ $t( 'pages.myAccountInformation.settingsOptions.explanation[9]') }}</li>
                                    </ol>
                                    {{ $t( 'pages.myAccountInformation.settingsOptions.explanation[10]') }}
                                </div>
                            </v-menu>
                            <div v-html="$t( 'pages.myAccountInformation.settingsOptions.enabled' )" />
                        </div>
                        <div
                            v-else
                            class="calendar-not-active"
                            v-html="$t('pages.myAccountInformation.settingsOptions.notActivatedMessage')"
                        />

                        <br>
                        <h4>{{ $t( 'pages.myAccountInformation.settingsOptions.languageHeader' ) }}</h4>
                        <span>{{ $t( 'pages.myAccountInformation.settingsOptions.languageDescription' ) }}</span>
                        <language-selector @select-language="reloadTabs()" />
                    </div>
                    <div
                        v-else-if="$route.query.path === 'settings' && calendarLoading"
                        class="text-sm inner-tab-content"
                    >
                        <round-spinner
                            :block="true"
                            :loading="true"
                            default-loading-text
                        />
                    </div>
                </template>
            </tabs>
        </PmtContent>

        <PmtModal
            ref="calendarDisabled"
            :title="$t('pages.myAccountInformation.settingsOptions.title.disabled')"
        >
            <p
                class="pa-5 text-justify"
                v-html="$t( 'pages.myAccountInformation.settingsOptions.disabled' )"
            />
        </PmtModal>

        <PmtModal
            ref="changeAccountInfo"
            :title="changeAccountInfoTitle"
            :hide-on-overlay-click="false"
            :show-close="!user.expiredPassword"
            @manual-close="$refs.editAccountInfoForm.reset()"
        >
            <EditAccountInfoForm
                ref="editAccountInfoForm"
                :update-type="updateType"
                @success="onChangeSuccess"
                @show-modal="$refs.changeAccountInfo.show()"
                @hide-modal="$refs.changeAccountInfo.hide()"
            />
        </PmtModal>
    </div>
</template>

<script>
import accountService from '@/services/AccountService'
import { mapGetters, mapActions } from 'vuex'

export default {
    components: {
        EditAccountInfoForm: () => import('@/components/forms/EditAccountInfoForm.vue'),
        LanguageSelector: () => import('@/components/LanguageSelector.vue'),
    },
    data () {
        return {
            calendarLoading: true,
            childActiveTab: 'One',
            childTwoActiveTab: 'One',
            reloadTabsComponent: false,
            showSettingsTab: true,
            updateType: '',
        }
    },
    computed: {
        ...mapGetters('auth', {
            user: 'user',
            canViewBasicContractInfo: 'canViewBasicContractInfo',
            canViewContactInformation: 'canViewContactInformation',
            canViewPersonalInformation: 'canViewPersonalInformation',
            employeeInfo: 'employeeInfo',
        }),
        ...mapGetters('account', {
            myCalendarSettings: 'myCalendarSettings',
        }),
        ...mapGetters('contracts', {
            contractInfo: 'contractInfo',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        tabs () {
            const tabs = [
                { name: this.$t('pages.myAccountInformation.accountSectionHeading'), id: 'account_information' },
            ]

            if (this.canViewPersonalInformation) {
                tabs.push({ name: this.$t('pages.myAccountInformation.personalSectionHeading'), id: 'personal_information' })
            }

            if (this.canViewContactInformation) {
                tabs.push({ name: this.$t('pages.myAccountInformation.contactSectionHeading'), id: 'contact_information' })
            }

            if (this.canViewBasicContractInfo) {
                tabs.push({ name: this.$t('pages.myAccountInformation.contractSectionHeading'), id: 'contract_information' })
            }

            if (this.showSettingsTab) {
                tabs.push({ name: this.$t('pages.myAccountInformation.settingsSectionHeading'), id: 'settings', showBadge: this.myCalendarSettings.activated, badgeText: this.myCalendarSettings.activated ? '!' : '' })
            }

            return tabs
        },
        changeAccountInfoTitle () {
            return this.updateType === 'username' ? this.$t('pages.myAccountInformation.changeUsernameModal.title') : this.$t('pages.myAccountInformation.changePasswordModal.title')
        },
    },
    mounted () {
        if (this.user.expiredPassword) {
            this.openEditAccount('password')
        }
        this.getCalendarSettings().then(() => {
            this.calendarLoading = false
        }).catch(() => {
            this.calendarLoading = false
            this.showSettingsTab = false
        })
        if (this.canViewBasicContractInfo) {
            const payload = {
                account_id: this.user.accountId,
                date: this.$moment().apiFormat(),
            }
            this.getMyContract(payload)
        }
    },
    methods: {
        ...mapActions('account', {
            getCalendarSettings: 'getCalendarSettings',
        }),
        ...mapActions('contracts', {
            getMyContract: 'getMyContract',
        }),
        onChangeSuccess () {
            this.employeeInfo.accountInfo.username.value = this.user.username
        },
        reloadTabs () {
            this.reloadTabsComponent = !this.reloadTabsComponent
        },
        updateCalendarSettings () {
            if (this.myCalendarSettings.activated) this.$refs.calendarDisabled.show()
            accountService.updateCalendarSettings(true, !this.myCalendarSettings.activated).then((response) => {
                this.getCalendarSettings().then(() => {
                    this.calendarLoading = false
                })
            })
        },
        openEditAccount (updateType) {
            this.updateType = updateType
            this.$refs.changeAccountInfo.show()
        },
    },
}
</script>
<style lang="scss" scoped>
    .calendarCheck {
        width: unset;
        margin: 2em 0.5em 0 0;
    }
    .page-header {
        padding: 15px;
    }
    .inner-tab-content {
        padding: 25px;
    }

    .explanation {
        background-color: white;
        padding: 10px;

        ul,ol {
            list-style: decimal;
            padding-left: 24px !important;
        }
    }
</style>
<style lang="scss">
    #app {
        background-color: #f5f5f5;
    }
</style>
