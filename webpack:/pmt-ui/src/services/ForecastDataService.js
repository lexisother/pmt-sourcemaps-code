import pmtApi from '../libraries/pmtApi'
import pmt from '../libraries/pmt'
import * as moment from '../config/moment'
import Vue from 'vue'
const qs = require('qs')
Vue.use(moment)

class ForecastDataService {
    getForecastData(payload) {
        const { year, week } = payload
        return pmt.get(`/forecastData/${year}/${week}`).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    saveForcastData(payload) {
        const { year, week, data } = payload
        const dataToApi = { forecast_data: data.week_forecast_data }
        return pmt.post(`/saveForecastData/${year}/${week}`, dataToApi).then((response) => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    getDepartmentType(payload) {
        const { mondayOfCurrentweek, storeId } = payload

        return pmtApi.get('storestructures', {
            params: {
                store_id: storeId,
                date: mondayOfCurrentweek, // Y-m-d
            },

        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    getSteerInformationData(payload) {
        const { params } = payload

        return pmtApi.get(`week/${payload.year}-${payload.week}/steerInformation`, {
            v3: true,
            store: true,
            params,
            paramsSerializer: function (params) {
                return qs.stringify(params, { arrayFormat: 'repeat' })
            },
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }

    getSteerInformationIntersections(date, departments) {
        let query = ''
        if (departments) {
            query = `?department_id=${departments}`
        }
        return pmtApi.get(`week/${Vue.moment(date).yearWeekApiFilter()}/dashboardTotals${query}`, {
            v3: true,
            store: true,
        }).then(response => {
            return response.data.result
        }).catch(error => {
            throw error
        })
    }
}

export default new ForecastDataService()
