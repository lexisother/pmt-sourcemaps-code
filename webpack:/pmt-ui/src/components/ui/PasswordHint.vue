<template>
    <component
        :is="tag"
        border="left"
        colored-border
        :type="conditionalPasswordValidation(password) ? 'success' : 'warning'"
        :icon="false"
        elevation="2"
    >
        <small>{{ $t('forms.editAccount.passwordComplexityHint.title', [strengthRequirementCount]) }}</small>
        <ul>
            <li>
                <done
                    v-if="validatePassword(accountValidations.password.lowerCase) && password != ''"
                    class="text-success"
                    :size="15"
                />
                <close
                    v-else
                    class="text-error"
                    :size="15"
                />
                <small>{{ $t('forms.editAccount.passwordComplexityHint.lowerCase') }}</small>
            </li>
            <li>
                <done
                    v-if="validatePassword(accountValidations.password.upperCase) && password != ''"
                    class="text-success"
                    :size="15"
                />
                <close
                    v-else
                    class="text-error"
                    :size="15"
                />
                <small>{{ $t('forms.editAccount.passwordComplexityHint.upperCase') }}</small>
            </li>
            <li>
                <done
                    v-if="validatePassword(accountValidations.password.numbers) && password != ''"
                    class="text-success"
                    :size="15"
                />
                <close
                    v-else
                    class="text-error"
                    :size="15"
                />
                <small>{{ $t('forms.editAccount.passwordComplexityHint.number') }}</small>
            </li>
            <li>
                <done
                    v-if="validatePassword(accountValidations.password.specialChars) && password != ''"
                    class="text-success"
                    :size="15"
                />
                <close
                    v-else
                    class="text-error"
                    :size="15"
                />
                <small>{{ $t('forms.editAccount.passwordComplexityHint.specialChar') }}</small>
            </li>
        </ul>
    </component>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
    name: 'PasswordHint',
    props: {
        password: String,
        tag: {
            type: String,
            default: 'div',
        },
    },
    computed: {
        ...mapGetters('account', ['conditionalPasswordValidation', 'strengthRequirementCount']),
        ...mapState('account', {
            accountValidations: state => state.validations,
        }),
    },
    methods: {
        validatePassword (validation) {
            return new RegExp(validation).test(this.password)
        },
    },
}
</script>
