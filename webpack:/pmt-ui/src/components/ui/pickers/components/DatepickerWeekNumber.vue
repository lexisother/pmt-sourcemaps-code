<template>
    <th class="week-nr">
        <slot
            name="week-number"
            :week-number="date.isoWeek()"
        >
            <span>{{ date.isoWeek() }}</span>
        </slot>
    </th>
</template>

<script>
export default {
    name: 'WeekNumber',
    props: {
        date: Object,
    },
}
</script>
