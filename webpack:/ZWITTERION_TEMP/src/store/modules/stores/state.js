const state = {
    currentStore: null,
    stores: [],
    defaultTheme: {
        primaryBackgroundColor: '#47a6d8',
        secondaryBackgroundColor: '#E67E22',
        primaryColor: '#FFFFFF',
        secondaryColor: '#FFFFFF',
        activeItemColor: '#FFFFFF',
    },
    storeRoles: [],
    customStoreRoles: [],
    weekBusinessTimes: {},
    loading: {
        storeTimes: false,
        weekStatus: false,
    },
    weekStatuses: [],
}
export default state
