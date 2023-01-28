import computed from './computed'
import methods from './methods'
import apiActions from './apiActions'
import legacyMethods from './legacyMethods'
export default {
    mixins: [computed, methods, apiActions, legacyMethods],
}
