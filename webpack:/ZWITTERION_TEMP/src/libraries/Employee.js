import Vue from 'vue'
import * as moment from '../config/moment'
Vue.use(moment)
class Employee {
    _employedDays = {}
    _age = 0
    constructor(payload = {}) {
        Object.keys(payload).forEach(key => {
            this[key] = payload[key]
        })
        this.name = this.namePartsToFullName(payload)
        this.setAge(payload.selectedDate || Vue.moment())
        this.personnel_number = isNaN(payload.personnel_number) ? payload.personnel_number : Number(payload.personnel_number)
        this.departments = payload.departments.map(d => {
            if (d.id) {
                return {
                    ...d,
                    color: d.color || d.department_color,
                    department_id: d.id,
                }
            }
            return d
        })
        this.setEmployedDays()
    }

    get age() {
        return this._age
    }

    set age(val) {
        this._age = val
    }

    isEmployed = (date) => {
        return this._employedDays[date.isoWeekday()]
    }

    isEmployedOn = (date) => {
        if (!date) return false
        const employedFrom = this.details.date_of_employment ? Vue.moment(this.details.date_of_employment) : false
        const employedUntil = this.details.date_of_unemployment ? Vue.moment(this.details.date_of_unemployment) : false
        if (employedFrom && date.isBefore(employedFrom, 'day')) {
            // not yet employed on date => employment is in the future
            return false
        }
        if (employedUntil && date.isAfter(employedUntil, 'day')) {
            // no longer employed on date => employment ended on date
            return false
        }
        // if not employment data is found return is employed = true by default
        return true
    }

    setEmployedDays = () => {
        const week = this.selectedDate.toCalendarArray('week')
        week.forEach(day => {
            if (process.env.NODE_ENV === 'development') {
                if (!this.isEmployedOn(day)) {
                    console.warn(`${this.name} is not employed on: `, day.format('dddd, DD MMMM YYYY'))
                }
            }
            this._employedDays[day.isoWeekday()] = this.isEmployedOn(day)
        })
    }

    setAge = (date) => {
        if (!this.details.date_of_birth) return
        const birthDate = this.details.date_of_birth
        this.age = date.diff(Vue.moment(birthDate), 'years')
        if (date.isoWeek() === Vue.moment().isoWeek()) {
            this.age = Vue.moment().diff(Vue.moment(birthDate), 'years')
        }
        this.age_filter_key = this.mapAgeToFilters(this.age)
    }

    mapAgeToFilters(age) {
        if (age <= 14) {
            return '13_14_year'
        }
        if (age === 15) {
            return '15_year'
        }
        if (age >= 18) {
            return '18_year_up'
        }
        // Else the employee is 16/17.
        return '16_17_year'
    }

    /**
     * Trims and puts together first, middle and last name of employee into a full name.
     *
     * @param employee
     */
    namePartsToFullName(employee) {
        const allNames = [employee.details.employee_first_name, employee.details.employee_middle_name, employee.details.employee_last_name]
        return allNames.filter(Boolean).join(' ') || employee.account_name
    };
}

export default Employee
