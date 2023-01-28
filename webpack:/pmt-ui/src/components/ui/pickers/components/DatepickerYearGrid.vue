<template>
    <div class="year-picker">
        <div
            id="years"
            class="years"
        >
            <div
                v-for="(year, index) in $moment().getYearsRange()"
                :id="year"
                :key="index"
                :ref="year"
                class="year"
                :cy_id="`year-${year}`"
                @click="selectYear(year)"
            >
                <span :class="{'is-current': year === navigationYear}">
                    <slot name="year-selection">{{ year }}</slot>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
import scrollHelper from '@/libraries/scrollHelper'
export default {
    name: 'DatepickerYearGrid',

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
    },

    mounted () {
        setTimeout(() => {
            const yearsContainer = this.$el
            const currentYearElement = document.getElementById(this.navigationYear)
            const currentYearRect = currentYearElement.getBoundingClientRect()
            if (!scrollHelper.isInViewport(currentYearElement)) {
                yearsContainer.scrollTop = currentYearRect.top - yearsContainer.getBoundingClientRect().height - (currentYearRect.height / 2)
            }
        }, 0)
    },

}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .year-picker {
        max-height: 220px;
        overflow: auto;
        .years {
            width: 100%;
            text-align: center;
            .year {
                padding: 5px;
            }
            .year:hover {
                background-color: $row-hover-color;
                cursor: pointer;
            }
        }
        .is-current {
            font-size: 150%;
            color: $primary-color;
            font-weight: 600;
        }
    }
</style>
