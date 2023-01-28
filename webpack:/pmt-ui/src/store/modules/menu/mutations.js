const mutations = {

    setSitemapResponse (state, response) {
        state.sitemap = response
    },

    setMenuAsHeaderMenu (state, menuItems) {
        if (!menuItems.length) return
        state.headerMenu = menuItems
    },

    setMenuAsHeaderUserMenu (state, menuItems) {
        state.userMenu = menuItems
    },
    setStoreSwitchMenu (state, menuItems) {
        state.storeSwitchMenu = menuItems
    },

    setActiveSubMenu (state, subMenu) {
        if (state.activeSubmenu.length === 0 && subMenu.length === 0) {
            return
        }
        state.activeSubmenu = subMenu
    },

    setRedirect (state, redirect) {
        state.redirect = redirect
    },

    setSitemapFetched (state, fetched) {
        state.sitemapFetched = fetched || true
    },

    SET_WHATSNEW_ARTICLES (state, articles) {
        state.whatsNewArticles = articles
    },
}
export default mutations
