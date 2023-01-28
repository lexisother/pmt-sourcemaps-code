<template>
    <span
        class="avatar no-image img-bordered-sm"
        :style="{'border': getBorderColor(), 'color': noImageTextColor()}"
    >
        <table>
            <tr>
                <td>{{ initials }}</td>
            </tr>
        </table>
    </span>
</template>

<script>
import stringHelper from '@/libraries/stringHelper'
import { mapGetters } from 'vuex'

export default {
    name: 'Avatar',
    props: {
        fullname: {
            type: String,
        },
        theme: {
            type: Object,
        },
        active: {
            type: Boolean,
        },
        hovered: {
            type: Boolean,
        },
    },
    computed: {
        ...mapGetters('menu', {
            lightBackgrounds: 'getLightBackgrounds',
        }),
        initials () {
            const words = this.fullname.split(/[\s-]+/)
            let intls = ''
            for (let i = 0; i < words.length; i++) {
                intls += words[i].substr(0, 1).toUpperCase()
            }
            if (intls.length > 3) {
                intls = intls.substr(0, 3)
            }
            return intls
        },
        /**
         * When background is white, just lighten a bit the primary color instead of using secondary color - since
         *  most of the times secondary color is white (or very light).
         **/
        getSecondaryColor () {
            if (this.lightBackgrounds.indexOf(this.theme.primaryBackgroundColor.toLowerCase()) === -1) {
                return this.theme.secondaryColor
            }

            return stringHelper.lightenDarkenColor(this.theme.primaryColor, 20)
        },
    },
    methods: {
        noImageTextColor () {
            if (this.active && !this.hovered) {
                return this.theme.secondaryColor
            }

            return (this.active || (this.hovered) ? this.getSecondaryColor : this.theme.primaryColor)
        },
        getBorderColor () {
            return ' 2px solid ' + this.noImageTextColor()
        },
    },
}
</script>
<style lang="scss" scoped>

    .avatar {
        /*display: inline-block;*/
        cursor: pointer;
        float: left;
        color: white;
        font-weight:600;
        width: 35px;
        height: 35px;
        line-height: 30px;
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        font-size: 15px;
        border-radius: 50%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-image: none;
    }

    .avatar table {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }

    .avatar table td {
        text-align: center;
        vertical-align: middle;
    }

    .avatar img {
        width: 100%;
        overflow: hidden;
    }
</style>
