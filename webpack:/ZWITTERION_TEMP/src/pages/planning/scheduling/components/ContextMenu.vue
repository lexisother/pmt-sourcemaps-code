<template>
    <VMenu
        v-if="menuItems"
        ref="contextMenu"
        :value="showMenu"
        :position-x="shiftRect.x"
        :position-y="shiftRect.y"
        absolute
        offset-y
        :min-width="menuWidth"
        :max-width="menuWidth"
        :close-on-content-click="!IS_MOBILE"
        :close-on-click="true"
        @input="closeMenu"
    >
        <div>
            <div
                v-if="shiftConfirmation.show"
                class="confirmation"
            >
                <p>
                    {{ $t('pages.scheduling.substituteRequests.overrideExisting') }}
                </p>
                <PmtButton
                    ref="cancel"
                    default
                    medium
                    @click="cancelConfirmation()"
                >
                    {{ $t('ui.singles.no') }}
                </PmtButton>
                <PmtButton
                    ref="confirm"
                    primary
                    medium
                    @click="emitEvent($event, shiftConfirmation.action)"
                >
                    {{ $t('ui.singles.yes') }}
                </PmtButton>
            </div>
            <VList
                v-else
                dense
            >
                <template v-for="(item, index) in menuItems">
                    <VMenu
                        :key="index"
                        :value="assignEmployeeMenu"
                        :open-on-hover="item.isCascade"
                        :close-delay="200"
                        :right="isCascadeMenuRight"
                        :left="!isCascadeMenuRight"
                        offset-x
                        :nudge-right="isCascadeMenuRight ? 2 : 0"
                        :nudge-left="!isCascadeMenuRight ? -5 : 0"
                        :min-width="cascadeMenuWidth"
                        :max-width="400"
                    >
                        <template #activator="{ on, value }">
                            <VListItem
                                :id="item.id"
                                :ref="item.ref"
                                :cy_id="item.id"
                                :disabled="item.disabled || item.loading"
                                :class="{'disabled-list-item': item.disabled, active: value}"
                                v-on="on"
                                @click.prevent="!item.isCascade ? checkEvent({ ...item, $event }) : false"
                                @mouseover="hovered = item.ref"
                                @mouseout="hovered = ''"
                            >
                                <VProgressCircular
                                    v-if="item.loading"
                                    indeterminate
                                    size="15"
                                    width="2"
                                    color="primary"
                                    class="mr-2"
                                />
                                <VListItemIcon
                                    v-if="!item.loading && item.icon"
                                >
                                    <VIcon
                                        :disabled="item.disabled"
                                        :color="(IS_MOBILE || hovered === item.ref) ? item.color : 'default'"
                                        :size="16"
                                    >
                                        {{ item.icon }}
                                    </VIcon>
                                </VListItemIcon>
                                <VListItemContent>
                                    <VListItemTitle>
                                        {{ item.title }}
                                    </VListItemTitle>
                                    <VListItemSubtitle
                                        v-for="(subtitle, subtitleIndex) in item.subtitles"
                                        :key="subtitleIndex"
                                    >
                                        {{ subtitle }}
                                    </VListItemSubtitle>
                                </VListItemContent>
                                <VListItemIcon v-if="item.isCascade">
                                    <VIcon
                                        :color="item.color"
                                        :size="16"
                                    >
                                        mdi-chevron-right
                                    </VIcon>
                                </VListItemIcon>
                            </VListItem>
                        </template>
                        <QuickEmployeesSuggestions
                            v-if="type === 'shift' && shift"
                            ref="quickEmployeeSuggestion"
                            :shift="shift"
                            :employee="employee"
                            auto-load-employees
                            @select-employee="$emit(item.action, $event)"
                            @another-employee="$emit('another-employee', $event)"
                        />
                    </VMenu>
                </template>
            </VList>
        </div>
    </VMenu>
</template>

<script>
import QuickEmployeesSuggestions from '@/pages/planning/scheduling/components/QuickEmployeesSuggestions'
import mixins from '@/pages/planning/scheduling/resources/mixins'
const actions = {
    EDIT: 'edit',
    COPY: 'copy',
    PASTE: 'paste',
    EDIT_INDIRECT_TASKS: 'edit-indirect-tasks',
    DELETE: 'delete',
    REMOVE_EMPLOYEE: 'remove-employee',
    SELECT_EMPLOYEE: 'select-employee',
    SWAP_EMPLOYEE: 'swap-employee',
    ASSESS_SUBSTITUTE_REQUEST: 'assess-substitute-request',
    REJECT_SUBSTITUTE_REQUEST: 'reject-substitute-request',
    CREATE: 'create',
}
export default {
    name: 'ContextMenu',
    components: {
        QuickEmployeesSuggestions,
    },
    mixins: [mixins],
    props: {
        shift: {
            type: Object,
            default: () => (undefined),
        },
        employee: {
            type: Object,
            required: true,
        },
        event: {
            type: PointerEvent,
            required: true,
        },
        type: {
            type: String,
            default: undefined,
        },
    },
    emits: () => {
        return ['edit']
    },
    data () {
        return {
            assignEmployeeMenu: false,
            hovered: '',
            cascadeMenuWidth: 200,
            shiftConfirmation: { show: false },
            shiftRect: { x: 0, y: 0 },
        }
    },
    computed: {
        contextMenuItems () {
            return {
                edit: {
                    title: this.$t('ui.singles.edit'),
                    icon: 'mdi-pencil',
                    color: 'primary',
                    action: actions.EDIT,
                    ref: 'edit',
                    id: 'edit-shift',
                },
                copy: {
                    title: this.$t('ui.singles.copy'),
                    icon: 'mdi-content-copy',
                    color: 'primary',
                    action: actions.COPY,
                    ref: 'copy',
                    id: 'copy-shift',
                },
                delete: {
                    title: this.$t('ui.singles.delete'),
                    icon: 'mdi-delete-forever',
                    color: 'error',
                    action: actions.DELETE,
                    ref: 'delete',
                    id: 'delete-shift',
                },
                create: {
                    title: this.$t('ui.singles.add', ['']),
                    icon: 'mdi-plus',
                    color: 'primary',
                    action: actions.CREATE,
                    ref: 'create',
                    id: 'create-shift',
                },
                assignEmployee: {
                    title: this.baseTranslate('contextMenu.assignEmployee'),
                    icon: 'mdi-account-plus',
                    color: 'primary',
                    action: actions.SELECT_EMPLOYEE,
                    ref: 'assignEmployee',
                    isCascade: true,
                    id: 'assign-employee-to-not-assigned-shift',
                },
                assessSsr: {
                    title: this.baseTranslate('contextMenu.assessSubstituteRequest'),
                    icon: 'mdi-account-switch-outline',
                    color: 'warning',
                    action: actions.ASSESS_SUBSTITUTE_REQUEST,
                    ref: 'assessSubstituteRequest',
                    id: 'assess-substitute-request',
                },
                rejectSsr: {
                    title: this.baseTranslate('contextMenu.rejectSubstituteRequest'),
                    icon: 'mdi-account-cancel-outline',
                    color: 'error',
                    action: actions.REJECT_SUBSTITUTE_REQUEST,
                    ref: 'rejectSubstituteRequest',
                    id: 'reject-substitute-request',
                },
                editIndirectTask: {
                    title: this.baseTranslate('contextMenu.addIndirectTask'),
                    icon: 'mdi-pencil-plus',
                    color: 'primary',
                    action: actions.EDIT_INDIRECT_TASKS,
                    ref: 'editIndirectTask',
                    id: 'edit-indirect-tasks',
                },
                removeEmployee: {
                    title: this.baseTranslate('contextMenu.removeEmployee'),
                    icon: 'mdi-account-remove',
                    color: 'error',
                    action: actions.REMOVE_EMPLOYEE,
                    ref: 'removeEmployee',
                    id: 'remove-employee-from-shift',
                },
                swapEmployee: {
                    title: this.baseTranslate('contextMenu.changeEmployee'),
                    icon: 'mdi-account-switch-outline',
                    color: 'primary',
                    action: actions.SWAP_EMPLOYEE,
                    ref: 'swapEmployee',
                    isCascade: true,
                    id: 'assign-employee-to-shift',
                    loading: this.loading.plannableEmployees,
                },
                pasteShift: {
                    title: this.$t('ui.singles.paste'),
                    subtitles: this.pasteSubtitle(),
                    icon: 'mdi-content-paste',
                    color: 'primary',
                    action: actions.PASTE,
                    ref: 'paste',
                    id: 'paste-shift',
                },
            }
        },
        menuWidth () {
            if (this.shiftConfirmation.show) {
                return 300
            }
            return 230
        },
        /**
         * Checks if current selected shift is read-only
         * @returns {Boolean}
         */
        readOnly () {
            return this.shift?.readOnly
        },
        /**
         * Gets the menu items for the context menu
         * @return {Array}
         */
        menuItems () {
            const menu = []
            if (this.type === 'shift' && this.shift) {
                if (!this.readOnly && this.CAN_PLAN_OTHERS) {
                    if (this.notAssigned) {
                        menu.push(this.contextMenuItems.assignEmployee)
                    }
                    menu.push(this.contextMenuItems.edit)

                    const disableNonProductiveOnDayView = this.isDayView && this.shift.nonProductive
                    if (!this.IS_MOBILE && !disableNonProductiveOnDayView) {
                        menu.push(this.contextMenuItems.copy)
                    }
                    menu.push(this.contextMenuItems.delete)
                    if (!this.isStandardShifts && !this.$route.meta.standard_shifts_account_id) {
                        if (this.hasSubstituteRequests && this.CAN_MANAGE_SUBSTITUTE_REQUESTS) {
                            menu.push(this.contextMenuItems.assessSsr)
                            menu.push(this.contextMenuItems.rejectSsr)
                        }
                        if (this.CAN_MANAGE_INDIRECT_HOURS && !this.nonProductive && !this.notAssigned) {
                            menu.push(this.contextMenuItems.editIndirectTask)
                        }
                        if (!this.notAssigned && !this.nonProductive) {
                            if (this.isCheckHours) return menu
                            menu.push(this.contextMenuItems.removeEmployee)
                            menu.push(this.contextMenuItems.swapEmployee)
                        }
                    }
                }
            } else if (this.type === 'timeRegistrations' && this.shift) {
                menu.push(this.contextMenuItems.edit)
                menu.push(this.contextMenuItems.delete)
                menu.push(this.contextMenuItems.create)
            } else if (this.type === 'cell') {
                menu.push(this.contextMenuItems.pasteShift)
            }
            return menu
        },
        /**
         * Handles the context menu v-model
         */
        showMenu: {
            get () {
                if (this.type === 'shift') return !!this.shift
                return this.type
            },
            set (newVal) {
                if (!newVal) {
                    this.closeMenu()
                }
            },
        },
        /**
         * Checks if current selected shift is not-assigned
         * @return {Boolean}
         */
        notAssigned () {
            return this.shift?.notAssigned
        },
        /**
         * Checks if current selected shift is not-assigned
         * @return {Boolean}
         */
        nonProductive () {
            return this.shift?.nonProductive
        },
        /**
         * Checks if the cascade menu item should open on the right
         * @returns {Boolean}
         */
        isCascadeMenuRight () {
            const combinedWidths = this.shiftRect.x + this.menuWidth + this.cascadeMenuWidth
            // if remaining width is lower than the cascade menu width,
            // the cascade will open on the left, else on the right
            return combinedWidths < window.innerWidth
        },
        /**
         * Checks if current selected shift has substitute requests
         * @return {Boolean}
         */
        hasSubstituteRequests () {
            return !!this.shift.pending_substitute_request && Object.keys(this.shift.pending_substitute_request).length
        },
    },
    watch: {
        event: {
            handler () {
                this.setPosition()
            },
            deep: true,
        },
        'layoutScroll.top': {
            handler (newVal, oldVal) {
                if (Math.abs(newVal - oldVal) > 50) {
                    this.closeMenu()
                }
            },
        },
    },
    mounted () {
        this.setPosition()
    },
    methods: {
        setPosition () {
            this.shiftRect = { x: this.event.x, y: this.event.y }
        },
        /**
         * Checks the event for various validations in business logic
         */
        checkEvent ({ $event = PointerEvent, action = String }) {
            // check if the shift has a substitute request on it
            if (this.shift && this.hasSubstituteRequests) {
                const removeEmployee = action === actions.REMOVE_EMPLOYEE
                const swapEmployee = action === actions.SWAP_EMPLOYEE
                const deleteShift = action === actions.DELETE
                if (removeEmployee || swapEmployee || deleteShift) {
                    this.shiftConfirmation = {
                        show: true,
                        action,
                    }
                    return
                }
            }
            // add other checks on the shift here
            this.emitEvent($event, action)
        },
        /**
         * Emits close event and closes the current context menu
         */
        emitEvent (event = PointerEvent, action = String) {
            this.$emit(action, { shift: this.shift, employee: this.employee, event })
            this.shiftConfirmation = { show: false }
            this.closeMenu()
        },
        /**
         * Closes the context menu
         */
        closeMenu () {
            if (!this.shiftConfirmation.show) {
                this.SET_ACTIVE_CONTEXT_MENU(null)
            }
            this.$emit('close')
        },
        cancelConfirmation () {
            this.shiftConfirmation = { show: false }
            this.closeMenu()
        },

        pasteSubtitle () {
            let subtitles = []
            if (!this.COPIED_SHIFT) {
                subtitles = ['No shift in clipboard']
            } else {
                if (!this.COPIED_SHIFT.nonProductive) {
                    const fromTime = this.$moment(this.COPIED_SHIFT.start_datetime).shortTime()
                    const toTime = this.$moment(this.COPIED_SHIFT.end_datetime).shortTime()
                    const breaks = this.COPIED_SHIFT.breaks.length ? this.COPIED_SHIFT.breaks[0].duration : ''
                    subtitles.push(`${this.departments.find(d => d.department_id === this.COPIED_SHIFT.department_id).department_name}`)
                    subtitles.push(`${fromTime} - ${toTime} | ${breaks}`)
                } else {
                    subtitles.push(this.bookableHourTypes[this.COPIED_SHIFT.type].local_description)
                    subtitles.push(this.COPIED_SHIFT.duration)
                }
            }
            return subtitles
        },
    },
}
</script>
<style lang="scss" scoped>
.cascade-menu-icon {
    float: right;
    color: var(--grey-100);
}
.confirmation {
    padding: 15px;
    border-radius: 5px;
    :first-child {
        line-height: 1.5em;
    }
}
.disabled-list-item {
    background-color: white;
}

.active {
    background-color: var(--grey-40);
}

:deep() {
    .v-list-item {
        .v-list-item__icon {
            align-self: center;
        }
    }
}
</style>
