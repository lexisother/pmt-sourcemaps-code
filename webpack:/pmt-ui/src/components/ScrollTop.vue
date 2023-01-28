<template>
    <a
        class="bottom-right"
        @click="scrollTop()"
    >
        <a class="btn">
            <component :is="'chevron-up'" />
        </a>
    </a>
</template>

<script>
export default {
    methods: {
        scrollTop () {
            const element = document.getElementById('main')
            if (element !== null) {
                const interval = setInterval(() => {
                    element.scrollTop = element.scrollTop - 200
                    if (element.scrollTop <= 0) {
                        clearInterval(interval)
                    }
                }, 0)
            }
        },
    },
}
</script>

<style scoped lang="scss">
    @import '@/assets/scss/_colors.scss';

    .btn {
        background-color: $primary-color;
        color: #FFF;
        opacity: 0.75;
        display: block;
        height: 50px;
        width: 50px;
        font-size: 25px;
        line-height: 25px;
        text-align: center;
        border-radius: 50%;
    }

    .btn:hover {
        opacity: 1
    }

    .bottom-right {
        z-index: 1;
        position: fixed;
        bottom: 20px;
        right: 50%;
        cursor: pointer;
    }

    @media (max-width: 768px) {
        .bottom-right {
            right: 45%
        }
    }
</style>
