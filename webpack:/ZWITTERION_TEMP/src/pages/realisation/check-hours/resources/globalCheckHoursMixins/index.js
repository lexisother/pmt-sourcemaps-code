import computed from './computed'
import methods from './methods'
import watchers from './watchers'
import apiActions from './apiActions'
export default {
    mixins: [computed, methods, watchers, apiActions],
}
