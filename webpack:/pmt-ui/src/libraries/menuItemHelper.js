const menuItemHelper = {
    /**
     * Returns true of the route matches the item.
     *
     * @param {object} route The Vue $route object.
     * @param {object} item
     * @returns {Boolean}
     */
    matchesRoute (route, item) {
        let matchRoutes = []
        const currentRoute = route.name
        const currentPath = route.path

        if (currentPath === item.url || currentRoute === item.route) {
            return true
        }

        if (typeof item.match === 'string') {
            matchRoutes = [item.match]
        } else if (item.match) {
            matchRoutes = item.match
        }

        return !!~matchRoutes.indexOf(currentRoute)
    },
}

export default menuItemHelper
