import data from './data'
import computed from './computed'
import methods from './methods'
import watchers from './watchers'
import apiActions from './apiActions'
import compare from './compare'
import indirectHours from './indirectHours'
export default {
    mixins: [data, computed, methods, watchers, apiActions, compare, indirectHours],
}
