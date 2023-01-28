<template>
    <div class="pmt-about-modal">
        <pmt-modal
            ref="pmtAboutModal"
            :title="$t( 'modals.pmtAbout.titles.main' )"
            class="pmt-about-modal"
        >
            <div class="deployment-info">
                <pmt-info
                    v-if="!isLocalDevelopment() && publicPmtItems.length"
                    gray
                >
                    <pmt-value-list :items="publicPmtItems" />
                </pmt-info>

                <template v-if="isTestEnvironment() && privatePmtItems.length">
                    <h4 class="section-title">
                        {{ $t( 'modals.pmtAbout.deployedComponents' ) }}
                    </h4>
                    <pmt-info gray>
                        <pmt-value-list :items="privatePmtItems" />
                    </pmt-info>
                </template>

                <pmt-info
                    v-if="isLocalDevelopment()"
                    gray
                >
                    {{ $t( 'modals.pmtAbout.localhostEnvironment' ) }}
                </pmt-info>
                <pmt-info
                    v-else-if="!publicPmtItems.length && !privatePmtItems.length"
                    gray
                >
                    {{ $t( 'modals.pmtAbout.noDataFound' ) }}
                </pmt-info>

                <PrivacyFooter @close-modal="close" />

                <div class="button-group">
                    <pmt-button
                        primary
                        class="repo-save-button"
                        @click="onRepoLinkSave"
                    >
                        {{ $t('modals.pmtAbout.closeBtn.label') }}
                    </pmt-button>
                </div>
            </div>
        </pmt-modal>

        <pmt-modal
            ref="pmtRepositoriesModal"
            :title="$t( 'modals.pmtAbout.titles.repo' )"
        >
            <pmt-repo-link-form
                class="repo-link-form"
                @on-save="open"
            />
        </pmt-modal>
    </div>
</template>

<script>
import dateHelper from '../../libraries/dateHelper'

import PrivacyFooter from '../PrivacyFooter.vue'
import PmtRepoLinkForm from '../forms/PmtRepoLinkForm.vue'

export default {
    components: {
        PrivacyFooter,
        'pmt-repo-link-form': PmtRepoLinkForm,
    },
    data () {
        return {
            repoUrl: '',
        }
    },
    computed: {
        publicPmtItems () {
            const items = []

            if (this.version) {
                items.push({
                    label: this.$t('modals.pmtAbout.version'),
                    value: this.version,
                })
            }

            if (this.deployedAt) {
                items.push({
                    label: this.$t('modals.pmtAbout.deployedAt'),
                    value: this.deployedAt,
                })
            }

            return items
        },
        privatePmtItems () {
            if (!this.pmtV1Hash) {
                return []
            }

            const items = [
                {
                    label: 'PMT1',
                    value: this.getRepoHtmlLink('PMT', this.pmtV1Hash),
                },
                {
                    label: 'PMT3',
                    value: this.getRepoHtmlLink('PMT3', this.pmtV2Hash),
                },
                {
                    label: 'PMT UI',
                    value: this.getRepoHtmlLink('PmtFront', this.uiHash),
                },
            ]

            if (!this.repoUrl) {
                return items.map(item => {
                    item.action = this.openRepoLinksModal

                    return item
                })
            }

            return items
        },
        version () {
            return this.getMetaContent('pmt-version')
        },
        deployedAt () {
            const deployedAt = this.getMetaContent('pmt-deployed-at')

            if (!deployedAt || !dateHelper.isValidUsDateString(deployedAt)) {
                return null
            }

            return dateHelper.getDateFromString(deployedAt).toDateString(this.$t('dates.shortFullDateFormat') + ' {hour}:{minute}:{second}')
        },
        pmtV1Hash () {
            return this.getMetaContent('pmt-system-pmt-v1')
        },
        pmtV2Hash () {
            return this.getMetaContent('pmt-system-pmt-v2')
        },
        uiHash () {
            return this.getMetaContent('pmt-system-ui')
        },
    },
    created () {
        this.refreshRepoUrl()

        window.pmt = this.open
    },
    methods: {
        isMetaDataValid (metaValue) {
            return !!metaValue && !/^[A-Z]/.test(metaValue)
        },
        isLocalDevelopment () {
            return window.location.hostname === 'localhost'
        },
        isTestEnvironment () {
            const baseLink = window.location.href
            if (baseLink.indexOf('shadow') > -1 || baseLink.indexOf('staging') > -1) {
                return true
            } else {
                return false
            }
        },
        getRepoHtmlLink (project, hash) {
            if (!this.repoUrl) {
                return '<a href="javascript:void(0)">' + hash + '</a>'
            }

            return '<a href="' + this.repoUrl + project + '/commit/' + hash + '" target="_blank">' + hash + '</a>'
        },
        getMetaContent (metaName) {
            const $meta = document.querySelector('meta[name="' + metaName + '"]')

            if (!$meta) {
                return null
            }

            const value = $meta.getAttribute('content')

            if (!this.isMetaDataValid(value)) {
                return null
            }

            return value
        },
        openRepoLinksModal () {
            this.$refs.pmtAboutModal.hide()
            this.$refs.pmtRepositoriesModal.show()
        },
        refreshRepoUrl () {
            this.repoUrl = localStorage.getItem('repo-base-url')
        },
        onRepoLinkSave () {
            this.refreshRepoUrl()
            this.open()
        },
        open () {
            this.refreshRepoUrl()

            this.$refs.pmtAboutModal.show()
        },
        close () {
            this.$refs.pmtAboutModal.hide()
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '../../assets/scss/_colors.scss';

    .pmt-about-modal {
        .section-title:not(:first-child) {
            margin-top: 2em;
        }

        .button-group {
            clear: both;
        }
    }
</style>
