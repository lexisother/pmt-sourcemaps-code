const state = {
    sitemap: [],
    sitemapFetched: false,
    activeSubmenu: [],
    headerMenu: [
        {
            label: 'Home',
            url: '/',
            icon: 'home',
        },
    ],
    userMenu: [],
    storeSwitchMenu: [],
    categoryIcons: [
        {
            id: 1,
            icon: 'send', // Schedules
        },
        {
            id: 2,
            icon: 'account-supervisor', // Employees
        },
        {
            id: 3,
            icon: 'calendar-account', // Employability
        },
        {
            id: 4,
            icon: 'domain', // Organisation
        },
        {
            id: 5,
            icon: 'file-chart', // Reports
        },
        {
            id: 6,
            icon: 'sync', // Sync settings
        },
        {
            id: 7,
            icon: 'book-minus-multiple', // Department settings
        },
        {
            id: 8,
            icon: 'island', // Holiday settings
        },
        {
            id: 9,
            icon: 'chart-areaspline', // Workload
        },
        {
            id: 10,
            icon: 'file-table', // Budget
        },
        {
            id: 11,
            icon: 'store', // Store
        },
        {
            id: 12,
            icon: 'bullhorn', // Communication settings
        },
        {
            id: 13,
            icon: 'store', // Store settings
        },
        {
            id: 14,
            icon: 'domain', // Organisational settings
        },
        {
            id: 15,
            icon: 'settings-transfer', // Environment settings
        },
    ],
    lightBackgrounds: ['#ffffff', '#c1dcee', '#e4e4e4', '#eeeeee'],
    redirect: '',
    whatsNewArticles: [],
}
export default state
