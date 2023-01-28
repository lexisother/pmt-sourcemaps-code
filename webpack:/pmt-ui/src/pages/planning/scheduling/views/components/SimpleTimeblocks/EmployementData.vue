<template>
    <VList
        nav
        dense
    >
        <VListItem>
            <VListItemIcon>
                <VIcon
                    dense
                    small
                >
                    {{ 'mdi-account-alert-outline' }}
                </VIcon>
            </VListItemIcon>
            <VListItemContent>
                <VListItemTitle>
                    {{ title }}
                </VListItemTitle>
                <VListItemSubtitle v-if="isUnemployed(employee, day)">
                    <span>{{ baseTranslate('employment.from', { date: $moment(employee.details.date_of_employment).format('ddd DD MMM YYYY')}) }}</span>
                </VListItemSubtitle>
                <VListItemSubtitle v-if="isUnemployed(employee, day) && employee.details.date_of_unemployment">
                    <span>{{ baseTranslate('employment.to', { date: $moment(employee.details.date_of_unemployment).format('ddd DD MMM YYYY')}) }}</span>
                </VListItemSubtitle>
                <VListItemSubtitle v-if="hasExpiredContract(employee, day)">
                    <span>{{ baseTranslate('employment.contractEnd', { date: $moment(employee.contract.end_date).format('ddd DD MMM YYYY')}) }}</span>
                </VListItemSubtitle>
            </VListItemContent>
        </VListItem>
    </VList>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'EmployementData',
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
        day: {
            type: Object,
            default: () => {},
        },
    },
    computed: {
        title () {
            if (this.isUnemployed(this.employee, this.day)) {
                return this.baseTranslate('employment.title')
            }
            return this.baseTranslate('employment.contractEndTitle')
        },
    },
}
</script>

<style lang="scss" scoped>
:deep() .v-list-item__icon {
    margin-left: 7px;
}
</style>
