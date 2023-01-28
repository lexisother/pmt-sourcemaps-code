<template>
    <div class="birthdays-modal">
        <pmt-modal
            ref="birthdayModal"
            :title="$t( 'modals.birthdayOverview.pageTitle' )"
            :hide-on-overlay-click="true"
        >
            <ul class="employees-list">
                <li
                    v-for="(employee, index) in employees"
                    id="employees"
                    :key="index"
                >
                    {{ employee.employee_name }}
                </li>
            </ul>
        </pmt-modal>
    </div>
</template>

<script>
import confetti from 'canvas-confetti'

export default {
    data () {
        return {
            employees: [],
            checkBirthdays: false,
        }
    },
    methods: {
        open (payload) {
            this.$refs.birthdayModal.show()
            this.employees = payload.employees
            if (payload.confetti) {
                setTimeout(function () {
                    confetti({
                        particleCount: 400,
                        spread: 150,
                        origin: {
                            y: 0.5,
                        },
                    })
                }, 750)
            }
        },
        close () {
            this.$refs.birthdayModal.hide()
        },
    },
}
</script>
