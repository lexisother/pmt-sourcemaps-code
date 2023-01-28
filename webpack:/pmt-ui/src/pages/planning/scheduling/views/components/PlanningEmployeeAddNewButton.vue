<template>
    <button
        v-if="big"
        :id="`add-new-shift-${day.apiFormat()}`"
        ref="addNewShift"
        tabindex="0"
        class="add-new-shift"
        :data-account-id="employee.account_id"
        :data-date="day.apiFormat()"
        @click.prevent.stop="addShift()"
        @keyup.enter="addShift()"
        @keyup.space="addShift()"
        @contextmenu="onContextMenu($event)"
    >
        <template v-if="!hasActiveAddNew">
            + <span v-if="!IS_MOBILE">{{ baseTranslate('shiftPopover.titles.newSchedule') }}</span>
        </template>
        <template v-else>
            <div style="line-height: 13px;">
                <div>{{ $t('ui.singles.startTyping') }}</div>
                <div>{{ $t('ui.singles.exampleShort') }}: 13 {{ $t('ui.singles.or') }} 1215</div>
            </div>
        </template>
        <ContextMenu
            v-if="showContextMenu"
            ref="schedulerContextMenu"
            :employee="employee"
            :event="showContextMenu"
            type="cell"
            @paste="pasteShift(day)"
            @close="showContextMenu = false"
        />
    </button>
    <div
        v-else-if="small"
        class="add-new"
        tabindex="0"
        @keyup.enter="addShift()"
        @keyup.space="addShift()"
        @click="addShift()"
        @contextmenu="$emit('contextmenu', {dayTimeIndex, event: $event, employee})"
    >
        <div class="add-new-line" />
        <div class="add-new-button" />
        <ContextMenu
            v-if="showContextMenu"
            ref="schedulerContextMenu"
            :employee="employee"
            :event="showContextMenu"
            type="cell"
            @paste="pasteShift(day)"
            @close="showContextMenu = false"
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import ContextMenu from '@/pages/planning/scheduling/components/ContextMenu.vue'
export default {
    name: 'PlanningEmployeeAddNewButton',
    components: { ContextMenu },
    mixins: [mixins],
    props: {
        day: {
            type: Object,
            required: true,
        },
        dayTimeIndex: {
            type: Number,
            required: true,
        },
        employee: {
            type: Object,
            required: true,
        },
        hasActiveAddNew: Boolean,
        big: Boolean,
        small: Boolean,
    },
    data () {
        return {
            showContextMenu: false,
        }
    },
    methods: {
        addShift () {
            this.$emit('add-shift', this.day)
        },
        onContextMenu (e) {
            e.preventDefault()
            this.showContextMenu = e
        },
    },
}
</script>
