<template>
    <VMenu
        ref="tooltipMenu"
        :open-on-hover="openOnHover"
        max-height="350"
        offset-x
    >
        <template #activator="{ on }">
            <div
                class="extra-menu"
                v-on="on"
            >
                <template v-if="type === 'competences'">
                    <VChip
                        color="var(--grey-40)"
                        text-color="var(--grey-140)"
                        label
                        small
                    >
                        {{ employeeCompetences }}
                    </VChip>
                    <div
                        v-if="employee.competences.length > 1"
                        class="more-items"
                    >
                        + {{ employee.competences.length - 1 }} {{ $t('ui.singles.more') }}
                    </div>
                </template>
                <template v-if="type === 'departments'">
                    <VChip
                        color="var(--grey-40)"
                        text-color="var(--grey-140)"
                        label
                        small
                    >
                        {{ employee.departments?.find(d => d.is_default)?.department_shortname }}
                    </VChip>
                    <div
                        v-if="employee.departments.length > 1"
                        class="more-items"
                    >
                        + {{ employee.departments.length - 1 }} {{ $t('ui.singles.more') }}
                    </div>
                </template>
            </div>
        </template>
        <VList
            v-if="type === 'competences'"
            nav
            dense
        >
            <template v-for="(competence, competenceIndex) in employee.competences">
                <VListItem :key="competenceIndex">
                    <VListItemContent>
                        <VListItemTitle v-text="competence.competence_name" />
                    </VListItemContent>
                </VListItem>
            </template>
        </VList>
        <VList
            v-if="type === 'departments'"
            nav
            dense
        >
            <template v-for="(department, departmentIndex) in employee.departments">
                <VListItem :key="departmentIndex">
                    <VListItemContent>
                        <VListItemTitle>
                            <span>{{ department?.department_name }}</span>
                            <VChip
                                v-if="department.is_default"
                                color="green"
                                text-color="white"
                                label
                                primary
                                x-small
                                class="uppercase mx-1"
                            >
                                {{ $t('ui.singles.default') }}
                            </VChip>
                        </VListItemTitle>
                    </VListItemContent>
                </VListItem>
            </template>
        </VList>
    </VMenu>
</template>

<script>
export default {
    name: 'EmployeeDetailsExtraList',
    props: {
        employee: {
            type: Object,
            required: true,
        },
        type: {
            type: String,
            default: 'competences',
            validator: (value) => {
                // The value must match one of these strings
                return ['competences', 'departments'].includes(value)
            },
        },
    },
    computed: {
        openOnHover () {
            if (this.type === 'competences') {
                return this.employee.competences.length > 1
            } else if (this.type === 'departments') {
                return this.employee.departments.length > 1
            }
            return false
        },
        employeeCompetences () {
            return this.employee.competences[0]?.competence_name
        },
    },
}
</script>

<style lang="scss" scoped>
:deep() {
    .v-list-item {
        min-height: 25px;
    }
}
.more-items {
    font-size: 11px;
    line-height: 11px;
    padding-left: 5px;
}
.extra-menu {
    max-width: max-content;
}
</style>
