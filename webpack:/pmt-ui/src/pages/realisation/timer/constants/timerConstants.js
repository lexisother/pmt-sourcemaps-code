const timerEnums = Object.freeze({
    IN_LATE: 'late',
    WORKING: 'working',
    PAUSED: 'paused',
    SCHEDULED: 'scheduled',
    READY: 'ready',
})

const clockStatus = Object.freeze({
    STOP: 'stop',
    PAUSE: 'pauze',
    START: 'start',
})

const minGridWidth = 35

export { timerEnums, clockStatus, minGridWidth }
