const getters = {
    /**
     * Returns timeframes for a week and year
     * @param {Object|Moment} date
     */
    GET_WEEK_TIMEFRAMES: (state) => (date) => {
        return state.timeframes[`"${date.isoWeek()}-${date.isoWeekYear()}"`] || []
    },

    HAS_TIMEFRAMES: (state) => (week, year, department_id, work_process_id) => {
        const department_frames = state.timeframes[`"${week}-${year}"`].find(frame => {
            return frame.department_id === department_id
        })
        if (!department_frames) {
            return false
        }
        return department_frames.work_processes.find(proc => {
            return parseInt(proc.work_process_id) === parseInt(work_process_id)
        })
    },

    GET_PATTERN_WORKLOAD_PROCESS_LINK: (state) => ({ week, year, pattern_id, department_id, print = false }) => {
        const aggregation = state.weekWorkloadAggregation[`"${year}-${week}"`]
        if (aggregation) {
            const processes = aggregation.work_processes
            const foundProcesses = []
            for (const process in processes) {
                if (processes[process].wlp2_pattern_id === pattern_id) {
                    foundProcesses.push(processes[process].id)
                }
            }
            if (!foundProcesses.length) return
            const workload = state.weekWorkload[`"${year}-${week}"`]
            if (!workload) return
            const department_workload = workload.find(dep => dep.department_id === department_id)
            if (!department_workload) return
            const mainResult = {
                process_ids: [],
                days: {
                    0: 0,
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                    6: 0,
                },
                total: 0,
            }
            foundProcesses.forEach(foundProcess => {
                const workload_process = department_workload.work_processes.find(proc => proc.work_process_id === foundProcess)
                if (workload_process) {
                    workload_process.days.forEach((day, index) => {
                        mainResult.days[index] += day.work_minutes
                    })
                    mainResult.total += workload_process.total.work_minutes
                    mainResult.process_ids.push({
                        id: workload_process.work_process_id,
                        hours: workload_process.total.work_minutes,
                    })
                }
            })
            return mainResult
        }
    },

}
export default getters
