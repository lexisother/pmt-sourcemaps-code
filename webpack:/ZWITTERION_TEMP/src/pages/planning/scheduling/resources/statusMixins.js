export default {
    methods: {
        logColor (status) {
            if (status === 'finalized') return 'var(--green-100)'
            if (status === 'changed') return 'var(--orange-100)'
            if (status === 'concept') return 'var(--grey-80)'
            if (status === 'closed') return 'var(--red-100)'
        },
    },

}
