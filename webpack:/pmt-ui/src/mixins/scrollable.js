const scrollable = {
    computed: {
        $localScrollContainer () {
            if (this.$scrollContainer) {
                return this.$scrollContainer
            }

            return this.$el
        },
    },
    methods: {
        hasScrollContainer () {
            return !!this.$localScrollContainer
        },
        scrollToPosition (posX, posY) {
            this.$localScrollContainer.scrollTo(posX, posY)
        },
    },
}

export default scrollable
