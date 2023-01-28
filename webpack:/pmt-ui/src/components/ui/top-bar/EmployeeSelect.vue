<template>
    <RoundSpinner
        v-if="employeesLoading"
        loading
        :size="16"
        class="my-2"
    />
    <PSelect
        v-else-if="employeesList.length"
        ref="employeeSelect"
        v-model="selectedEmployee"
        cy_id="employeeSelect"
        :items="employeesList"
        item-value="account_id"
        item-label="name"
        :placeholder="$t('topBars.availability.selectEmployee')"
        searchable
        width="auto"
        dense
        class="my-2"
        @input="$emit('input', selectedEmployee)"
    >
        <template #selected-label>
            <div class="selected-label">
                <Account
                    :size="16"
                    class="mr-2"
                />
                {{ selectedEmployee && selectedEmployee.name ? selectedEmployee.name : $t('topBars.availability.selectEmployee') }}
            </div>
        </template>
    </PSelect>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
    name: 'EmployeeSelect',

    props: {
        value: {
            type: Object,
            default () { return {} },
        },
    },

    data () {
        return {
            selectedEmployee: null,
        }
    },

    computed: {
        ...mapState('account', ['employees', 'storeEmployees', 'employeesLoading']),
        ...mapGetters('auth', ['canFetchStoreSchedules']),
        /**
         * Returns the employee list to populate the dropdown. For week schedule page we use the employees from the entire
         * store if current user has "schedules_all_departments_view" user right
         *
         * @returns { }
         */
        employeesList () {
            return this.storeEmployees || []
        },
    },

    watch: {
        value (val) {
            this.selectedEmployee = JSON.parse(JSON.stringify(val))
        },
    },

    mounted () {
        this.selectedEmployee = JSON.parse(JSON.stringify(this.value))
    },
}
</script>

<style lang="scss" scoped>
    .selected-label {
        flex-direction: row;

        .material-design-icon {
            vertical-align: 2px;
        }
    }
</style>
