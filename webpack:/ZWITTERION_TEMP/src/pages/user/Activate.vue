<template>
    <div class="activation">
        <pmt-layout>
            <pmt-content class="container-fluid">
                <v-row v-if="!checkingUsername">
                    <v-col
                        cols="12"
                        xs="12"
                        sm="8"
                        offset-sm="2"
                        md="6"
                        offset-md="2"
                        lg="4"
                        offset-lg="3"
                        xl="3"
                        offset-xl="4"
                    >
                        <!-- Invalid hash -->
                        <div
                            v-if="invalidAccessCode && currentstep === 1"
                            style="padding: 20px;"
                            class="p-xl-5 slideInLeft"
                        >
                            <empty-state
                                :show="true"
                                component="four-o-four"
                                no-padding
                                :justify-subtitle="IS_MOBILE"
                                dense
                                :text-color="theme.primaryColor"
                                :title="$t('forms.editAccount.errors.invalidActivationCodeExtendedTitle')"
                                :sub-title="$t('forms.editAccount.errors.invalidActivationCodeExtendedBody')"
                                :size="IS_MOBILE ? 300 : 500"
                            />
                        </div>
                        <!-- Welcome -->
                        <div
                            v-if="!invalidAccessCode && currentstep === 1"
                            style="padding: 20px;"
                            class="p-xl-5 slideInLeft"
                        >
                            <empty-state
                                :show="true"
                                component="empty-employee-selection"
                                no-padding
                                :justify-subtitle="IS_MOBILE"
                                dense
                                :text-color="theme.primaryColor"
                                :title="$t('forms.editAccount.activate.steps.welcome.title', [currentStore.banner_heading1 || currentStore.orgName])"
                                :sub-title="$t('forms.editAccount.activate.steps.welcome.text')"
                                :size="IS_MOBILE ? 300 : 500"
                            />
                            <div class="text-center my-3">
                                <div class="logo">
                                    <img
                                        :src="logo"
                                        alt="logo"
                                    >
                                </div>
                                <pmt-button
                                    primary
                                    icon="arrow-right"
                                    icon-size="18"
                                    @click="gotToAccountActivateStep"
                                >
                                    {{ $t('forms.editAccount.activate.steps.welcome.button') }}
                                </pmt-button>
                            </div>
                        </div>
                        <!-- Create user and password -->
                        <pmt-modal
                            ref="activateAccountModal"
                            :title="$t('forms.editAccount.activate.steps.create.modalTitle')"
                            :hide-on-overlay-click="false"
                            :header-style="{backgroundColor: theme.primaryBackgroundColor, color: theme.primaryColor}"
                            :show-close="false"
                            small
                        >
                            <reset-password-form
                                ref="resetPassword"
                                :theme="theme"
                                @success="createAccountSuccess"
                                @error="apiError = $event"
                                @invalid-hash="setInvalidAccessCode"
                                @loaded="createFormLoaded = true"
                            />
                        </pmt-modal>
                        <!-- User is created -->
                        <div
                            v-if="currentstep === 3 && !$route.query.path"
                            style="padding: 10px; margin-bottom:80px;"
                            class="slideInLeft"
                        >
                            <div class="p-xl-5 p-sm-2">
                                <empty-state
                                    :show="true"
                                    component="schedules-not-finalized"
                                    no-padding
                                    :justify-subtitle="IS_MOBILE"
                                    dense
                                    :text-color="theme.primaryColor"
                                    :title="$t('forms.editAccount.activate.steps.created.title')"
                                    :sub-title="$t('forms.editAccount.activate.steps.created.text')"
                                    :size="IS_MOBILE ? 250 : 400"
                                />
                            </div>
                            <div class="text-center my-3">
                                <pmt-button
                                    primary
                                    icon="arrow-right"
                                    icon-size="18"
                                    @click="userIsCreatedClick"
                                >
                                    {{ $t('forms.editAccount.activate.steps.created.button') }}
                                </pmt-button>
                            </div>
                        </div>
                        <!-- Availability -->
                        <div
                            v-if="currentstep === 3 && $route.query.path === 'availability'"
                            style="padding: 20px; margin-bottom:80px;"
                            class="p-xl-5 p-sm-2 slideInLeft"
                        >
                            <round-spinner
                                v-if="weeksetsLoading || loadingAvailability"
                                :full-screen="true"
                                :loading="true"
                                default-loading-text
                            />
                            <template v-else>
                                <empty-state
                                    :show="true"
                                    component="no-schedule"
                                    no-padding
                                    :justify-subtitle="IS_MOBILE"
                                    dense
                                    :text-color="theme.primaryColor"
                                    :title="$t(`forms.editAccount.activate.steps.${hasAvailability ? 'availabilityCreated' : 'availability'}.title`)"
                                    :sub-title="$t(`forms.editAccount.activate.steps.${hasAvailability ? 'availabilityCreated' : 'availability'}.text`)"
                                    :size="IS_MOBILE ? 250 : 300"
                                />
                                <div
                                    v-if="hasAvailability"
                                    class="text-center my-3"
                                >
                                    <pmt-button
                                        primary
                                        icon="arrow-right"
                                        icon-size="18"
                                        @click="availabilityIsCreatedClick"
                                    >
                                        {{ $t('forms.editAccount.activate.steps.availabilityCreated.next') }}
                                    </pmt-button>
                                </div>
                                <div
                                    v-else
                                    class="text-center my-3"
                                >
                                    <pmt-button
                                        primary
                                        icon="plus"
                                        icon-size="18"
                                        @click="goToCreateWeekset"
                                    >
                                        {{ $t('forms.editAccount.activate.steps.availability.button') }}
                                    </pmt-button>
                                </div>
                            </template>
                        </div>
                        <!-- RDO -->
                        <div
                            v-if="$route.query.path === 'rdo'"
                            style="padding: 20px; margin-bottom:80px;"
                            class="slideInLeft"
                        >
                            <div class="p-xl-5 p-sm-2">
                                <empty-state
                                    :show="true"
                                    component="no-rdo-requests"
                                    no-padding
                                    :justify-subtitle="IS_MOBILE"
                                    dense
                                    :text-color="theme.primaryColor"
                                    :title="$t('forms.editAccount.activate.steps.rdo.title')"
                                    :sub-title="$t('forms.editAccount.activate.steps.rdo.text')"
                                    :size="IS_MOBILE ? 250 : 400"
                                />
                                <div class="text-center my-3">
                                    <pmt-button
                                        primary
                                        icon="plus"
                                        icon-size="18"
                                        @click="$refs.rdoRequestModal.show()"
                                    >
                                        {{ singleRdos.length > 0 || multiRdos.length > 0 ? $t('forms.editAccount.activate.steps.rdo.buttonAnother') : $t('forms.editAccount.activate.steps.rdo.button') }}
                                    </pmt-button>
                                    <pmt-button
                                        normal
                                        :b-style="!hoveredNext ? `color: ${theme.primaryColor};` : ''"
                                        icon="arrow-right"
                                        icon-size="18"
                                        @mouseover="hoveredNext = !hoveredNext"
                                        @mouseout="hoveredNext = !hoveredNext"
                                        @click="currentstep = 5;
                                                $router.push({query: {path: 'done'}})"
                                    >
                                        <span>
                                            {{ $t('forms.editAccount.activate.steps.rdo.next') }}
                                        </span>
                                    </pmt-button>
                                </div>
                                <pmt-modal
                                    ref="rdoRequestModal"
                                    :title="$t('modals.rdoRequest.title')"
                                    :hide-on-overlay-click="false"
                                    :header-style="{backgroundColor: theme.primaryBackgroundColor, color: theme.primaryColor}"
                                >
                                    <rdo-request-form
                                        :key="rdoFormKey"
                                        class="pa-5"
                                        @after-send-single="singleRdo($event)"
                                        @after-send-multi="multiRdo($event)"
                                    />
                                </pmt-modal>
                            </div>
                        </div>
                        <!-- Done -->
                        <div
                            v-if="$route.query.path === 'done'"
                            style="padding: 20px; margin-bottom:80px;"
                            class="slideInLeft"
                        >
                            <div class="p-xl-5 p-sm-2">
                                <animated-success />
                                <empty-state
                                    :show="true"
                                    component=""
                                    no-padding
                                    :text-color="theme.primaryColor"
                                    :title="$t('forms.editAccount.activate.steps.done.title')"
                                    :sub-title="$t('forms.editAccount.activate.steps.done.text')"
                                    :size="IS_MOBILE ? 250 : 400"
                                />
                                <div class="text-center my-3">
                                    <pmt-button
                                        success
                                        icon="arrow-right"
                                        icon-size="18"
                                        @click="currentstep = 5; $router.push({name: 'home'})"
                                    >
                                        {{ $t('forms.editAccount.activate.steps.done.button') }}
                                    </pmt-button>
                                </div>
                            </div>
                        </div>
                        <!-- Steps -->
                        <div
                            v-if="(!invalidAccessCode && createFormLoaded) || currentstep >= 3"
                            class="steps"
                            :class="IS_MOBILE ? 'footer' : 'p-xl-5 p-sm-2'"
                        >
                            <v-stepper v-if="currentstep > 1">
                                <v-stepper-header>
                                    <v-stepper-step
                                        :complete="currentstep > 2"
                                        step="1"
                                    />
                                    <v-stepper-step
                                        v-if="hasAvailabilityModule"
                                        :complete="hasAvailability"
                                        step="2"
                                    />
                                    <v-stepper-step
                                        v-if="canRequestTimeOff && hasTimeOffAccess"
                                        :complete="currentstep > 4"
                                        :step="hasAvailabilityModule ? 3 : 2"
                                    />
                                </v-stepper-header>
                            </v-stepper>
                        </div>
                    </v-col>
                </v-row>
                <round-spinner
                    v-else
                    :full-screen="true"
                    :loading="true"
                    default-loading-text
                />
            </pmt-content>
        </pmt-layout>
    </div>
</template>

<script>
import RdoRequestForm from '@/components/forms/RdoRequestForm.vue'
import ResetPasswordForm from '@/components/forms/ResetPasswordForm.vue'
import AnimatedSuccess from '@/components/ui/form/AnimatedSuccess'
import urlHelper from '@/libraries/urlHelper'
import ApiError from '@/models/ApiError'
import { mapGetters, mapMutations, mapState, mapActions } from 'vuex'
export default {
    name: 'AccountActivation',
    components: {
        ResetPasswordForm, RdoRequestForm, AnimatedSuccess,
    },
    data () {
        return {
            currentstep: 1,
            rdoFormKey: 1,
            invalidAccessCode: false,
            singleRdos: [],
            multiRdos: [],
            createFormLoaded: false,
            hoveredNext: false,
            checkingUsername: true,
            loadingAvailability: false,
        }
    },
    computed: {
        ...mapGetters('auth', {
            isAuthenticated: 'isAuthenticated',
            canRequestTimeOff: 'canRequestTimeOff',
            user: 'user',
            permissions: 'permissions',
            hasAvailabilityModule: 'hasAvailabilityModule',
            hasTimeOffAccess: 'hasTimeOffAccess',
            hasWeeksetInActivationFlow: 'hasWeeksetInActivationFlow',
            isOrganisationalUser: 'isOrganisationalUser',
        }),
        ...mapGetters('stores', {
            currentStore: 'currentStore',
        }),
        ...mapGetters('availability', {
            weeksetsWithStatus: 'weeksetsWithStatus',
            availabilityTimeBlocks: 'availabilityTimeBlocks',
        }),
        ...mapState('availability', ['weeksetsLoading']),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        hasAvailability () {
            if (this.hasWeeksetInActivationFlow) {
                return this.weeksetsWithStatus('pending').length > 0
            } else {
                for (let i = 0; i < this.availabilityTimeBlocks.length; i++) {
                    if (!this.availabilityTimeBlocks[i].repeat) {
                        return true
                    }
                }
            }
            return false
        },
        theme () {
            return this.currentStore.theme || {}
        },
        logo () {
            return urlHelper.getHost() + this.theme.logo
        },
        availabilityModule () {
            return this.canYou('planning', 'availability')
        },
    },
    mounted () {
        if (this.$route.name === 'activate-account') {
            this.checkUsername('check_token_for user')
        } else {
            this.checkingUsername = false
        }
        if (this.$route.meta.finalize) {
            this.currentstep = 3
            this.loadingAvailability = true
            // get corect permission name from permissions call. (Marius?)
            // if user does not have weekset enabled in permissions get week availabilities and filter for singles.length > 0
            if (this.hasWeeksetInActivationFlow) {
                this.getWeeksets(this.user.accountId).then(result => {
                    this.loadingAvailability = false
                })
            } else {
                this.setAvailabilityDatePickerDate(this.$moment().apiFormat())
                this.setAvailabilityEmployee(this.user.accountId)
                this.getWeekAvailability().then(result => {
                    this.loadingAvailability = false
                })
            }
        }
        document.querySelector('body').style.backgroundColor = this.theme.primaryBackgroundColor
        document.getElementById('app').style.backgroundColor = this.theme.primaryBackgroundColor
        if (typeof zE === 'function') {
            window.zE(function () {
                window.zE.hide()
            })
        }
    },
    destroyed () {
        // TODO use this polyfill for IE 10 and lower http://jsfiddle.net/zznLm8c9/ to get :root variable declarations.
        const mainBackgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--main-background-color')
        document.querySelector('body').style.backgroundColor = mainBackgroundColor
        document.getElementById('app').style.backgroundColor = mainBackgroundColor
    },
    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('availability', ['getWeeksets', 'getWeekAvailability']),
        ...mapActions('account', {
            checkIfUserExists: 'checkIfUserExists',
        }),
        ...mapMutations('availability', {
            setAvailabilityDatePickerDate: 'setAvailabilityDatePickerDate',
            setAvailabilityEmployee: 'setAvailabilityEmployee',
        }),
        async checkUsername (username) {
            await this.checkIfUserExists({ username, activation_hash: this.$route.params.hash }).then(result => {
                this.checkingUsername = false
                if (result instanceof ApiError) {
                    this.invalidAccessCode = true
                }
            })
        },
        gotToAccountActivateStep () {
            this.currentstep = 2
            setTimeout(() => {
                this.$refs.activateAccountModal.show()
            }, 50)
        },
        userIsCreatedClick () {
            if (this.isOrganisationalUser) {
                this.$router.push({ query: { path: 'done' } })
            } else {
                if (this.hasAvailabilityModule) {
                    this.$router.push({ query: { path: 'availability' } })
                } else if (this.canRequestTimeOff && this.hasTimeOffAccess) {
                    this.$router.push({ query: { path: 'rdo' } })
                } else {
                    this.$router.push({ query: { path: 'done' } })
                }
            }
        },
        availabilityIsCreatedClick () {
            if (this.canRequestTimeOff && this.hasTimeOffAccess) {
                this.currentstep = 4
                this.$router.push({ query: { path: 'rdo' } })
            } else {
                this.currentstep = 5
                this.$router.push({ query: { path: 'done' } })
            }
        },
        setInvalidAccessCode () {
            this.invalidAccessCode = true
        },
        createAccountSuccess () {
            this.currentstep = 3
            this.$refs.activateAccountModal.hide()
            this.$router.push({ path: this.$route.path + '/finalize' })
        },
        rdoSuccess () {
            this.$refs.rdoRequestModal.hide()
            this.rdoFormKey += 1
            this.SET_SNACKBAR({
                message: this.$t('forms.editAccount.activate.steps.rdo.successSnackbar'),
                success: true,
            })
        },
        singleRdo (event) {
            this.singleRdos.push(event)
            this.rdoSuccess()
        },
        multiRdo (event) {
            this.multiRdos.push(event)
            this.rdoSuccess()
        },
        goToCreateWeekset () {
            this.$router.push({
                name: 'create-weekset',
                params: {
                    account_id: this.user.accountId,
                    addOnlySingles: false,
                    start_date: {
                        week: this.$moment().isoWeek(),
                        year: this.$moment().isoWeekYear(),
                    },
                    activation: true,
                    hash: this.$route.params.hash,
                },
            })
        },
    },
}
</script>

<style lang="scss" scoped>
    .activation {
        .footer {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
        }
        .steps {
            z-index: 10;
        }
        .logo {
            width: 100%;
            img {
                max-width: 90px;
            }
        }
    }
    .bg-white {
        background-color: white;
    }
    .rdo-step {
        padding: 15px;
    }
    .center {
        position: fixed;
        top: 50%;
        left: 50%;
        display: block;
        transform: translate(-50%, -50%);
        margin: 0;
        margin-top: 35px;
    }
    @keyframes slideInLeft {
        from {
            transform: translate3d(100%, 0, 0);
            visibility: visible;
        }
        to {
            transform: translate3d(0, 0, 0);
        }
    }
    .slideInLeft {
        animation-name: slideInLeft;
        animation-duration: 250ms;
        visibility: visible !important;
        transition: transform 1s;
    }
</style>
