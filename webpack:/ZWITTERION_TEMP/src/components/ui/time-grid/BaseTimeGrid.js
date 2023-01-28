import scrollable from '@/mixins/scrollable'
import { mapGetters, mapState, mapMutations } from 'vuex'
import moment from 'moment'

const baseTimeGrid = {
    mixins: [
        scrollable,
    ],
    props: {
        placeholderStartTime: {
            type: String,
            default: '11:00',
        },
        placeholderEndTime: {
            type: String,
            default: '12:00',
        },
    },
    data () {
        return {
            items: [],
            hoveredDate: null,
            hoveredTimeBlock: null,
        }
    },
    computed: {
        ...mapGetters('locale', { locale: 'getLocale' }),
        ...mapGetters('auth', ['user', 'canEditOthersAvailabilities', 'canAddAvailability']),
        ...mapState('availability', {
            activeTimeBlock: 'activeTimeBlock',
            placeholderTimeblock: 'placeholderTimeblock',
            availabilityTimeBlocks: 'availabilityTimeBlocks',
        }),
    },
    methods: {
        ...mapMutations('availability', {
            insertNewTimeBlock: 'insertNewTimeBlock',
            insertNewWeeksetTimeBlock: 'insertNewWeeksetTimeBlock',
            setNewTimeBlockPosition: 'setNewTimeBlockPosition',
            openPopover: 'openPopover',
            openPopoverChoose: 'openPopoverChoose',
        }),
        openNewAvailability (date, event, time, isWeekset) {
            if (this.canAddAvailability) {
                this.setNewTimeBlockPosition(event.srcElement.getBoundingClientRect())
                if (this.canEditOthersAvailabilities && !this.$cfg.specialAvailabilityRoutes.includes(this.$route.name)) {
                    this.placeholderTimeblock.type = 'agreed'
                }
                if (this.placeholderTimeblock.type === 'agreed' && !this.canEditOthersAvailabilities && !this.$cfg.specialAvailabilityRoutes.includes(this.$route.name)) {
                    this.placeholderTimeblock.type = 'preferred'
                }
                this.insertNewTimeBlock({ timeBlock: this.placeholderTimeblock, time, date, isWeekset })
                isWeekset ? this.openPopover() : this.openPopoverChoose({ week: moment(date).isoWeek(), year: moment(date).isoWeekYear() })
            }
        },
        handleTimeBlockClick (event) {
            this.setNewTimeBlockPosition(event.event.srcElement.getBoundingClientRect())
            this.insertNewTimeBlock({ timeBlock: event.timeBlock })
            this.openPopover()
        },
    },
}

export default baseTimeGrid
