<template>
    <div class="availability-entry-form">
        <pmt-side-panel
            ref="sidePanel"
            :title="!IS_MOBILE ? $t('forms.availabilityEntry.titles.newWeekset') : ''"
            border-left
            padding
            :show-close="showClose"
            :confirm-close="!!availabilityTimeBlocks.length"
            header-icon="pencil"
            :confirm-message="$t('sidePanels.availabilityWeeklyDetails.sections.unsavedChanges') + $t('sidePanels.availabilityWeeklyDetails.sections.closeAnyway')"
            @close="goBack"
        >
            <edit-weekset-form
                v-if="weekset"
                :key="editFormKey"
                ref="editWeeksetForm"
                :weekset="weekset"
                :week-finalized="weekFinalized"
                :weekset-employee="weeksetEmployee"
                @cancel="goBack"
                @save="goBack"
            />
        </pmt-side-panel>
    </div>
</template>

<script>
import SidePanel from '@/components/ui/side-panels/SidePanel.vue'
import EditWeeksetForm from '../Forms/EditWeeksetForm.vue'
import WeeksetMixin from '@/pages/planning/availability/Views/WeeksetMixin'
import { mapState, mapGetters } from 'vuex'
export default {
    name: 'NewWeeksetSidePanel',
    components: {
        'pmt-side-panel': SidePanel,
        EditWeeksetForm,
    },
    mixins: [WeeksetMixin],
    props: {
        mode: {
            type: String,
            default: 'new',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        showClose: {
            type: Boolean,
            default: true,
        },
        weekset: {
            type: Object,
            default: () => ({}),
        },
        weekFinalized: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            editFormKey: 0,
        }
    },
    computed: {
        ...mapState('account', {
            employees: 'employees',
        }),
        ...mapState('availability', {
            availabilityTimeBlocks: 'availabilityTimeBlocks',
        }),
        weeksetEmployee () {
            return this.employees.find(user => user.account_id === this.$route.params.account_id)
        },
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';

    .availability-entry-form {
        .button.delete-btn {
            float: right;
            color: $fail-color;

            &:not(:disabled):hover {
                color: darken( $fail-color, 15% );
            }
        }
    }
</style>
