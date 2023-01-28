const translations = {
    general: {
        title: 'News overview',
        sticky: 'Sticky news',
        create: 'Create',
        unreadMessages: '{0} unread messages',
        hiddenMessages: 'News messages are temporarily hidden. Create or cancel the news item creation to view them again',
        loadingEditor: 'Loading editor ...',
    },
    info: {
        title: 'Filters',
        departments: 'Departments',
        all: 'All',
        allDepartments: 'All departments',
        categories: 'Categories',
        uncategorized: 'Uncategorized',
        unread: 'Unread',
        markAsRead: 'Mark as read',
        new: 'New!',
        infoTitle: 'Information',
        deleteFilters: 'Remove filters',
        organisationalNews: 'Organisational news',
        activeNews: 'Active news',
        inactiveNews: 'Inactive news',
        activeNewsInfo: 'Show news messages which are available for everyone on the news overview',
        inactiveNewsInfo: 'Show news messages that are not visible (anymore) for everyone on the newsoverview. (\'Show from\' date is not reached yet or \'Show until\' date has passed',
    },
    noNews: {
        title: 'No news',
        text: 'There is no news to read',
        textFilters: 'There is no news to read with the current filters',
        leftText: 'No messages to display, click',
        hrefText: 'here',
        rightText: 'to reload the filter options',
        afterScroll: 'There are no older messages to read',
    },
    newsBody: {
        noNews: 'There is no more news to be shown...',
        readMore: 'Show more...',
        readLess: 'Hide',
        isLoading: 'More news messages are being loaded..',
    },
    newsInfo: {
        createdAt: 'Created by:',
        lastEdited: 'Last edited by:',
        cog: 'Open/close news message settings',
        edit: 'Edit',
        newspaper: 'Newsletter',
        eye: 'Newslog',
        trash: 'Delete',
        sticky: 'Sticky news',
        invisible: 'Invisible news. This message has an appear date in /the past. It is only shown for people who have the right \'news edit\' turned on.',
    },
    actions: {
        news_created: 'News added',
        news_edited: 'News saved',
        news_deleted: 'News deleted successfully',
        newsletter_sent: 'Newsletter successfully sent',
        news_delete: 'Are you sure you want to delete this news message?',
        news_delete_confirm: 'News message successfully deleted',
    },
    createEdit: {
        // Titles
        newNewsMessage: 'Create news message',
        editNewsMessage: 'Edit news message',

        // Options
        enterTitle: 'Enter a title...',
        enterBody: 'Enter a message...',

        // Visbility
        visibilityOptions: 'Visibility options',
        departments: 'Department(s) *',
        departmentHint: 'department(s) selected',
        category: 'Category',
        roles: 'Visible for *',
        rolesHint: 'role(s) selected',
        storegroups: 'Storegroups / Organisation',
        storegroupsHint: 'storegroup(s) selected',
        showFrom: 'Show from',
        showUntil: 'Show until',

        // Public
        publicOptions: 'Public options',
        publicNews: 'Public news (external)',
        publicWarning: 'This article is going public on the internet',
        homepageNews: 'Homepage news (internal)',
        publicInfo: 'Please be advised that images and attatchments will be publicly shown when the option for public news is enabled',

        // Sticky options
        stickyOptions: 'Sticky options',
        stickyNews: 'Sticky news',
        stickyUntil: 'Sticky until',
        stickyInfo: 'The news item is shown in the "Sticky news" section. As a result, the news item always remains at the top of the news overview',

        // Buttons
        cancel: 'Cancel',
        save: 'Save',
        create: 'Create',

        // Info
        selectAll: 'Select all',
        others: 'others',
        characters: 'Characters: ',
        intro: 'Example of introduction text',
        introMax: 'Characters left for intro: ',
        introInfo: 'There are no seperate sections for intro and full message anmyore. Instead the first part of the news message is now automatically split after around {0} characters, and will be used as introduction. Words won\'t be split here.',
        mandatoryInfo: 'Actions with * are mandatory to be selected/filled in',

        // Snackbar messages
        savedSuccess: 'News message saved successfully',
        error: 'Something went wrong, please try again or contact support when this keeps occuring',
        unsavedData: 'You have unsaved data, are you sure you want to remove this?',
        unenteredData: 'You need to enter data in order to save a news message',
        checkRedOutLinedItems: 'Please check for errors in the red outlined items',
    },
    newsTrack: {
        employee: 'Employee name',
        dateSent: 'Date sent',
        dateRead: 'Date read',
        info: 'News track',
        toNewsletter: 'Send as news letter',
        seenBy: 'Seen by',
    },
}

export default translations
