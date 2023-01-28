import moment from 'moment'
import language from '@/config/language'
import stringHelper from '@/libraries/stringHelper'

const timeRegistrationsHelper = {
    // Creates default for setting up new realisation
    newRealisation (timeRegistrations, accountId, departments) {
        const timeRegistration = timeRegistrations.find(o => o.account_id === accountId)
        const realisations = timeRegistration.realisation.filter(o => o.time_from !== o.time_to)
        const schedules = timeRegistration.schedules.filter(o => o.time_from !== o.time_to)
        const date = moment(timeRegistration.startTime).format('YYYY-MM-DD')
        const colors = {
            pending: 'warning',
            ready: 'success',
            approved: 'approved',
        }
        let timeFrom = date + ' 09:00'
        let timeTo = date + ' 12:00'
        let totalTime = '03:00'
        let departmentId = departments[0]?.department_id || null
        let breakDuration = '00:00'
        let exchangeStore = null
        let indirectHours = []
        if (realisations.length && realisations.length >= schedules.length) {
            // at least one realisation found, create new one consecutive
            const lastRealisation = realisations[realisations.length - 1]
            if (lastRealisation.time_from !== lastRealisation.time_to) {
                timeFrom = lastRealisation.time_to
                timeTo = moment(lastRealisation.time_to).add(3, 'hour').format('YYYY-MM-DD HH:mm')
            }
            if (lastRealisation.time_from !== lastRealisation.time_to) {
                timeFrom = lastRealisation.time_to
                timeTo = moment(lastRealisation.time_to).add(3, 'hour').format('YYYY-MM-DD HH:mm')
            }
            if (departments.find(dep => dep.department_id === lastRealisation.department_id)) {
                // assign department id of last realisation if accessible for user
                departmentId = lastRealisation.department_id
            }
        } else if (schedules.length > realisations.length) {
            // more scheduled shifts found than realisations, create new one based on scheduled shift

            // chosen department depends on lent out status and accessible departments for user
            let proposedDepartmentId = schedules[realisations.length].department_id
            if (!schedules[realisations.length].exchange_store) {
                if (!departments.find(dep => dep.department_id === proposedDepartmentId)) {
                    proposedDepartmentId = departments[0].department_id || null
                }
            }

            timeFrom = schedules[realisations.length].time_from
            timeTo = schedules[realisations.length].time_to
            totalTime = schedules[realisations.length].total_time
            departmentId = proposedDepartmentId
            breakDuration = schedules[realisations.length].break
            exchangeStore = schedules[realisations.length].exchange_store
            indirectHours = timeRegistrationsHelper.indirectHours(timeRegistration.unused_indirect_hours, schedules[realisations.length])
        }
        return {
            department_id: departmentId,
            time_from: timeFrom,
            time_to: timeTo,
            break: breakDuration,
            total_time: totalTime,
            status_color: colors[timeRegistration.displayStatus],
            exchange_store: exchangeStore || undefined,
            indirect_hours: indirectHours,
        }
    },
    // Recalculates total time after changing from or to time
    updateTotalTime (realisation) {
        const from = moment(realisation.time_from)
        const to = moment(realisation.time_to)
        const duration = moment.duration(to.diff(from)).asMilliseconds()
        const breakDuration = moment.duration(realisation.break, 'HH:mm').asMilliseconds()
        // if break is equeal or longer than shift duration, shift duration is set as total time
        const totalTimeInMilliseconds = duration > breakDuration ? duration - breakDuration : duration
        realisation.total_time = moment.duration(totalTimeInMilliseconds).format('HH:mm')

        return realisation
    },

    /**
     * Sum total_time or break for realisation or schedules from different rows and return as HH:mm
     */
    sumTimes (arr, key) {
        if (key) {
            return moment.duration(stringHelper.sumArrayValues(arr.map(o => moment.duration(o[key])))).format('HH:mm')
        } else {
            return moment.duration(stringHelper.sumArrayValues(arr.map(o => moment.duration(o)))).format('HH:mm')
        }
    },

    /**
     * Calculate deviation of proposed realisation compared to schedule
     */
    deviation (scheduleTotalTime, realisationTotalTime) {
        const scheduleTotalDuration = moment.duration(scheduleTotalTime).asMinutes()
        const realisationTotalDuration = moment.duration(realisationTotalTime).asMinutes()
        let prefix = ''
        if ((realisationTotalDuration - scheduleTotalDuration) < 0) {
            prefix = '-'
        } else if ((realisationTotalDuration - scheduleTotalDuration) > 0) {
            prefix = '+'
        }
        return `${prefix}${moment.duration(Math.abs(realisationTotalDuration - scheduleTotalDuration), 'minutes').format('HH:mm')}`
    },

    /**
     * Fix issues with negative break durations
     */
    fixNegativeBreakDurations (realisation) {
        realisation.forEach(rel => {
            if (rel.break.substring(0, 1) === '-') {
                rel.break = '00:00'
            }
        })
        return realisation
    },

    /**
     * Tooltip items for shift block and table row
     */
    tooltipItems (shift, department, notifications = []) {
        const output = []
        if (shift?.exchange_store) {
            output.push({
                icon: 'account-arrow-right',
                color: 'var(--grey-200)',
                title: language.t('pages.scheduling.tooltips.lentOutToStore', { name: shift.exchange_store.store_name }),
                subtitle: '',
            })
        }
        if (notifications.length && notifications.includes('departmentOutsideResponsibility')) {
            output.push({
                icon: 'cancel',
                color: 'var(--orange-100)',
                title: language.t('pages.timeRegistrationsPage.tooltips.departmentOutsideResponsibility'),
                subtitle: department?.department_name,
            })
        }
        if (notifications.length && notifications.includes('employeeOutsideResponsibility')) {
            output.push({
                icon: 'cancel',
                color: 'var(--orange-100)',
                title: language.t('pages.timeRegistrationsPage.tooltips.employeeOutsideResponsibility'),
                subtitle: '',
            })
        }
        if (notifications.length && notifications.includes('partiallyApprovedRealisations')) {
            output.push({
                icon: 'check-circle-outline',
                color: 'var(--blue-100)',
                title: language.t('pages.timeRegistrationsPage.tooltips.partiallyApprovedRealisations'),
                subtitle: '',
            })
        }
        if (notifications.length && notifications.includes('indirectHours')) {
            output.push({
                icon: 'file-tree',
                color: 'var(--grey-200)',
                title: language.t('pages.timeRegistrationsPage.tooltips.indirectHours'),
                subtitle: timeRegistrationsHelper.indirectHoursTooltipSubtitle(shift),
            })
        }
        if (notifications.length && notifications.includes('employeeChanged')) {
            output.push({
                icon: 'cog-clockwise',
                color: 'var(--green-100)',
                title: language.t('pages.timeRegistrationsPage.tooltips.employeeChanged'),
                subtitle: '',
            })
        }
        return output
    },

    indirectHoursTooltipSubtitle (shift) {
        if (!shift.indirect_hours.length) return null

        // display total indirect hours
        let minutes = 0
        shift.indirect_hours.forEach(task => {
            minutes += moment.duration(task.duration).asMinutes()
        })
        return `${language.t('ui.singles.total')} ${moment.duration({ minutes }).format('HH:mm')}`
    },

    indirectHours (unusedIndirectHours, schedule) {
        if (unusedIndirectHours) {
            // check if indirect task hours do not exceed schedule duration
            let indirectTasksDuration = 0
            unusedIndirectHours.indirect_hours?.forEach(task => {
                indirectTasksDuration += moment.duration(task.duration).asMinutes()
            })
            const scheduleDuration = moment.duration(schedule.total_time).asMinutes()

            if (indirectTasksDuration <= scheduleDuration) {
                // indirect hours fit in schedule, return entire array
                return unusedIndirectHours.indirect_hours
            } else if (unusedIndirectHours.indirect_hours.length > 1) {
                // indirect hours do not fit in schedule
                // if multiple indirect tasks are assigned, try to make it fit with less indirect tasks
                let cumulativeDuration = 0
                const limitedIndirectHoursList = []
                for (let n = 0; n < unusedIndirectHours.indirect_hours.length; n++) {
                    cumulativeDuration = moment.duration(unusedIndirectHours.indirect_hours[n].duration).asMinutes()
                    if (cumulativeDuration < scheduleDuration) {
                        limitedIndirectHoursList.push(unusedIndirectHours.indirect_hours[n])
                    } else {
                        return limitedIndirectHoursList
                    }
                }
            }
        }
        return []
    },
}

export default timeRegistrationsHelper
