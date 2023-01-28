import stringHelper from '../libraries/stringHelper'
import language from '../config/language'

export default {
    defaultOptions(self) {
        return {
            /**
             * id:
             * This is needed to have distinct datepickers in VUEX.
             * It is recommended that this will be overwritten in the options.
             * If it is not, then VUEX cannot be accessed and used in the datepicker parent,
             * although the datepicker will still emit on-select event with the propper date.
             * This is usefull for small logic datepickers.
             */
            id: stringHelper.generateId(),
            /**
             * selectedDate:
             * The selected date of the datepicker
            */
            selectedDate: self.$moment(),
            /**
             * minDate, maxDate:
             * Props to determine the first and last
             * possible date to be selected
             */
            minDate: null,
            maxDate: null,
            /**
             * localSelectedDate:
             * Prop used for internal picker navigation.
             * this will be updated accordingly,
             * inside the datepicker logic
            */
            localSelectedDate: self.$moment(),
            /**
             * selectedDateFrom, selectedDateTo:
             * two props used for range selection.
             * they both default to the provided minDate or today
             */
            selectedDateFrom: self.options.minDate || self.$moment(),
            selectedDateTo: self.options.minDate || self.$moment(),
            /**
             * selection:
             * This prop is used to determine which view
             * of the date picker should be selected
             * Possible: week, month, year
             */
            selection: 'week',
            /**
             * mode:
             * This prop is used to determine
             * the selection mode of the date picker
             * Possible: day, week, week-simple, month and not done yet: year
             */
            mode: 'week',
            /**
             * dateFormat:
             * Prop used for activator text to display
             */
            dateFormat: {
                day: 'ddd D MMM YYYY',
                week: 'w YYYY',
                month: 'MMMM YYYY',
            },
            /**
             * activator:
             * Props used for activator buttons styling
             */
            activator: {
                primary: true,
                inverted: true,
                showIcon: true,
            },
            /**
             * isRangePicker:
             * Prop to activate range selection logic
             * Currently only day range selection is available
             */
            isRangePicker: false,
            /**
             * maxRangeDays:
             * Number of maximum days available
             * to be selected as a range
             */
            maxRangeDays: null,
            /**
             * Prop used for range selection.
             * Determines if the first range
             * date was selected
             */
            firstSelected: false,
            /**
             * hoveredRangeDay:
             * Prop to determine if a day is hovered
             * inside a range picker after the first
             * date was selected.
             */
            hoveredRangeDay: null,
            /**
             * showPredefinedRanges:
             * Shows or hides the predefined range selector
             * in a range selection datepicker.
             * On desktop this is shown in the sidebar.
             * On mobile it is shown as sepparate selection
             * in the navigation and will displayed as a grid option
             */
            showPredefinedRanges: false,
            /**
             * showDistinctiveRangeText:
             * Shows from and to as distinct lines
             * in a range selection sidebar
             */
            showDistinctiveRangeText: true,
            /**
             * initialRangeSelection:
             * Determines the initial range selection
             * from and to. See DatepickerPredefinedRangeSelector.vue
             * for more options
             */
            initialRangeSelection: 'ThisYear',
            /**
             * closeOnRangeSelect:
             * Determines if the datepicker should be closed
             * after the second in the range date is selected
             */
            closeOnRangeSelect: false,
            /**
             * closeOnReset:
             * Determines if the datepicker should be closed
             * when the reset button is clicked
             */
            closeOnReset: true,
            /**
             * isSelected:
             * Determines if the date is displayed as selected in the grid
             */
            isSelected: true,
            /**
             * showNavigation:
             * Shows or hides the datepicker navigation buttons in the activator
             */
            showNavigation: false,
            /**
             * inlineNavigation: (depends on showNavigation)
             * Shows the main mavigation buttons (previous and next) as side-by-side if true.
             * Ex: < > Date
             * If set to false the "next-date" navigation button will show after the activator
             * Ex: < Date >
             */
            inlineNavigationButtons: true,
            /**
             * showResetFilter:
             * Determines if a reset button is shown that
             * will reset the current range or date selection
             */
            showResetFilter: false,
            /**
             * showYearNavigation:
             * Determines if the year navigation is shown
             * inside the datepicker navigation
             */
            showYearNavigation: true,
            /**
             * showMonthNavigation:
             * Determines if the month navigation is shown
             * inside the datepicker navigation
             */
            showMonthNavigation: true,
            /**
             * showSidebar:
             * Determines if the sidebar is shown
             */
            showSidebar: true,
            /**
             * overrideReset:
             * Determines if the inner logic of the datepicker
             * will not be used when set to true.
             */
            overrideReset: false,
            /**
             * handleRoute:
             * Determines if navigation or any grid selection
             * will also update current route params.
             * Updated params are: day, week, month, year.
             * This will also keep any pre-existing route params or query
             */
            handleRoute: false,
            /**
             * portrait:
             * Determines datepicker should be displayed as portrait
             */
            portrait: false,
            /**
             * landscape:
             * Determines datepicker should be displayed as landscape
             * This prop is ignored on mobile, where the datepicker
             * will always display in portrait mode.
             */
            landscape: false,
            /**
             * disabled:
             * Determines if the datepicker is disabled or not
             */
            disabled: false,
            /**
             * Displays on hover when the datepicker is disabled
             * Can be a v-tooltip tooltip object or a string
             */
            placeholder: null,
            /**
             * Emits on select event when component is mounted
             */
            emitSelectOnMounted: true,
            /**
             * navigationDay:
             * Date use to determine the navigation inside the date picker
             * mode: day => day
             * mode: week => startOf('isoWeek')
             * mode: month => startOf('month)
             * This will be updated in the mounted hook of the datepicker
             * with the correct date, depending on the mode
             */
            navigationDay: self.$moment(),
            /**
             * simpleWeekPicker:
             * Show a simple week selector view, with just the week numbers
             * and a year navigation bar
             */
            simpleWeekPicker: false,
            /**
             * Determines if the menu is open or not
             */
            show: false,
            /**
             * The direction of the navigation process
             * This will be over-written during
             * the datepicker navigation process
             */
            direction: 'right',

            /**
             * Display of the datepicker in relation with its label.
             */
            display: 'block',

            /**
             * The label of the "reset" button - which de-selects the selected date.
             */
            resetLabel: language.t('components.datepicker.resetFilter'),

            /**
             * Emits selected date events, even if it's the same date
             * as the previously selected date
             */
            forceSelect: false,

            /**
             * Datepicker menu transition
             * See https://vuetifyjs.com/en/styles/transitions/
             */
            transitionOrigin: 'top center',
            transition: 'scale-transition',

            /**
             * Dates can be disabled using this Object,
             * as long as the value is > 0
             */
            enableEvery: {
                days: false,
                weeks: false,
                months: false,
                years: false,
                value: 0,
                basedOnDate: undefined,
            },
        }
    },
}
