const getters = {
    getSitemapResponse: (state) => {
        return state.sitemap
    },
    headerMenuItems: (state) => {
        return state.headerMenu
    },
    headerUserMenuItems: (state) => {
        return state.userMenu
    },
    getStoreSwitchMenu (state) {
        return state.storeSwitchMenu
    },
    activeSubmenu: (state) => {
        return state.activeSubmenu
    },
    getCategoryIcon: (state) => (cI) => {
        for (let i = 0; i < cI.length; i++) {
            if (typeof cI[i].category_id !== 'undefined') {
                return state.categoryIcons.find(icon => icon.id === cI[i].category_id).icon
            }
        }
    },
    getLightBackgrounds: (state) => {
        return state.lightBackgrounds
    },
}
export default getters
