const translations = {
    titles: {
        new: 'New availability',
        edit: 'Edit availability',
        newWeekset: 'New weekset',
    },

    createdBy: 'created by ',
    modifiedBy: 'modified by ',
    you: 'You',

    typeField: {
        label: 'Type',
    },
    dateField: {
        label: 'Date',
    },
    travelBeforeField: {
        label: 'Travel before',
    },
    travelAfterField: {
        label: 'Travel after',
    },
    lessonHoursField: {
        label: 'Lesson hours',
    },

    submitBtn: {
        label: 'Save',
    },
    cancelBtn: {
        label: 'Cancel',
    },
    deleteBtn: {
        label: 'Delete',
    },

    school: {
        notBeforeSeven: 'School cannot start before {0}',
        notAfterNineteen: 'School cannot end after {0}',
        notBeforeSevenShort: ' (only between {0} - {1})',
        onlyBetween: 'School is allowed only between {0} - {1}',
        noLongerThanTwelveHours: 'School cannot be set for more than {0} hours.',
        notAllowedOnWeekends: ' (not allowed on weekends)',
    },

    validationMsg: {
        travelBeforeNotOnSameDay: 'The "travel before" time must start on the same date.',
        travelAfterNotOnSameDay: 'The "travel after" time must end on the same date.',
        timesOverlap: 'Modified the end time to {0} because overlapping timeblocks were detected.',
        notShorterThanFiveteenMinutes: 'Availability cannot be shorter than 15 minutes',
        overlapDetected: 'Time overlaps with another',
        outsideBusinessTimes: 'Time is outside business times.',
    },

    newAvailability: {
        oneTime: 'One time',
        recurring: 'Recurring',
        freshStart: 'Fresh Start',
        freshStartTooltip: 'Start from an empty weekset',
        fromCurrent: 'From current',
        fromCurrentTooltip: 'Select this to include current recurring availabilities',
        aboutWeeksetsPrimary: 'Weeksets help you organize your work and personal availabilities as you see fit. This means that a recurring availability will be added for each week from now on, until you create a new weekset.',
        aboutWeeksetsSecondary: 'The new weekset will have to be approved by a manager before you can use it.',
    },
    delete: 'Delete',
    notEditableTitle: 'Not editable',
    notEditable: 'This event is part of a set with weekly availability. If you want to change this you can create a new set.',
    singleWeekEdit: 'Changes are only saved for this week. Do you also want to apply this change for future weeks? Then create a new weekset',
    singleWeekMsg: {
        changeFailed: 'Something went wrong. We were unable to change this availability. Please try again.',
        changeSaved: 'Changes are saved',
    },
}

export default translations
