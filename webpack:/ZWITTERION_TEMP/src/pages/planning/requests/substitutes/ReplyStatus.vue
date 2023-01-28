<template>
    <div>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col
                        cols="4"
                        class="column approved-column pt-6 pb-6"
                    >
                        <h4 class="approved">
                            {{ $t('entities.requests.substitutes.replyStatus.interested') }} ({{ getItemAmount(approvedItems.length) }})
                        </h4>
                        <v-row>
                            <v-col
                                v-for="(approvedSubstitute, index) in approvedItems"
                                :key="index"
                                cols="6"
                                class="column no-padding p-1"
                            >
                                {{ approvedSubstitute.substitute_name }}
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col
                        cols="4"
                        class="column pending-column pt-6 pb-6"
                    >
                        <h4 class="pending">
                            {{ $t('entities.requests.substitutes.replyStatus.pending') }} ({{ getItemAmount(pendingItems.length) }})
                        </h4>
                        <v-row>
                            <v-col
                                v-for="(pendingSubstitute, index) in pendingItems"
                                :key="index"
                                cols="6"
                                class="column no-padding p-1"
                            >
                                {{ pendingSubstitute.substitute_name }}
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col
                        cols="4"
                        class="column denied-column pt-6 pb-6"
                    >
                        <h4 class="denied">
                            {{ $t('entities.requests.substitutes.replyStatus.notInterested') }} ({{ getItemAmount(deniedItems.length) }})
                        </h4>
                        <v-row>
                            <v-col
                                v-for="(deniedSubstitute, index) in deniedItems"
                                :key="index"
                                cols="6"
                                class="column no-padding p-1"
                            >
                                {{ deniedSubstitute.substitute_name }}
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    props: {
        items: {
            type: Array,
            default: () => ([]),
        },
    },
    data () {
        return {
            approvedItems: [],
            pendingItems: [],
            deniedItems: [],
        }
    },
    mounted () {
        this.splitItems(this.items)
    },
    methods: {
        /**
         * Split the items from the 'items' object into their own categories.
         *
         * @param {Object} items
         */
        splitItems (items) {
            items.forEach(element => {
                if (element.reply === 1) {
                    this.approvedItems.push(element)
                }
                if (element.reply === 0) {
                    this.pendingItems.push(element)
                }
                if (element.reply === -1) {
                    this.deniedItems.push(element)
                }
            })
        },

        /**
            * Get a string with the amount of items per category are set.
            *
            * @param {Number} n
            * @returns {string}
            */
        getItemAmount (n) {
            return n + '/' + this.items.length
        },
    },
}
</script>

<style scoped lang="scss">
    @import '@/assets/scss/_colors.scss';

    .row {
        text-align: center;
        overflow: hidden;
    }
    .column {
        border-right: 2px solid lightgray;

        &.no-padding {
            padding: 0;
            border-right: 0;
        }

        .approved {
            color: $success-color;
        }
        .pending {
            color: $pending-color;
        }
        .denied {
            color: $fail-color;
        }
    }

    .col-4, .col-12 {
        padding: 24px 0px;
    }
</style>
