import _ from 'lodash'

import timeHelper from './timeHelper'
import dateHelper from './dateHelper'
import stringHelper from './stringHelper'
import objectHelper from '../libraries/objectHelper'
import moment from 'moment'

const timeBlockHelper = {
    /**
     * Returns a new time block based on the given properties.
     *
     * NOTE:
     * Function can handle the API availability entry data structure (normal and result call) or
     * system used time block property naming as properties.
     *
     * @param {array} props
     * @returns {object}
     */
    getTimeBlock(props, week) {
        if (props.pattern === 'week' && !!props.start_date && !!props.day && !!week) {
            const date = dateHelper.getDateOfWeek(week.nr, week.year)

            props.date = date.addDays(props.day - 1)
        } else if (props.pattern === 'single' && !!props.start_date) {
            props.date = props.start_date
        }

        if (!props.date) {
            props.date = new Date().setTimeFromString('0:00')
        } else if (!dateHelper.isValidDate(props.date)) {
            props.date = dateHelper.getDateFromString(props.date).setTimeFromString('0:00')
        }

        if (!props.type) {
            props.type = 'other'
        }

        if (!props.timeFrom && !props.time_from) {
            props.timeFrom = '0:00'
        }

        if (!props.timeTo && !props.time_to) {
            props.timeTo = '23:59'
        }

        const timeBlock = {
            date: props.date,
            timeFrom: props.time_from || props.timeFrom,
            timeTo: props.time_to || props.timeTo,
            type: props.type || props.type,
            repeat: !!props.pattern && props.pattern === 'week',
        }

        if (!!props.id || !!props.availability_id) {
            timeBlock.id = props.id || props.availability_id
        }

        if (!!props.account_id || !!props.accountId) {
            timeBlock.accountId = props.account_id || props.accountId
        }

        timeBlock.editable = !!props.editable && !!timeBlock.id
        timeBlock.editable = this.isBlockEditable(timeBlock)

        if (props.priority) {
            timeBlock.priority = props.priority
        }
        timeBlock.travel = {
            before: props.travel_before || props.travelBefore || '00:00',
            after: props.travel_after || props.travelAfter || '00:00',
        }

        if (props.lesson_hours || props.lessonHours) {
            timeBlock.lessonHours = props.lesson_hours || props.lessonHours
        }
        timeBlock.created = props.created
        timeBlock.last_modified = props.last_modified
        timeBlock.icon = this.getTimeBlockTypeIcon(timeBlock)

        if (props.availability_weekset_id) {
            timeBlock.availability_weekset_id = props.availability_weekset_id
        }
        return timeBlock
    },

    /**
     * Returns true if a block can be edited (these rules are overwritten by certain user rights):
     *  - editable flag is not false
     *  - block is not in the past
     *
     * @param timeBlock
     * @returns {boolean}
     */
    isBlockEditable(timeBlock) {
        if (!timeBlock.editable) {
            return false
        }
        const blockDateTime = moment(timeBlock.date).set({ hour: timeBlock.timeFrom.split(':')[0], minutes: timeBlock.timeFrom.split(':')[1] })
        return !blockDateTime.isBefore(moment(), 'minute') || !!timeBlock.repeat
    },

    /**
     * Returns a unique id for a time block based on its id and its recurrent character.
     *
     * @param {object} timeBlock
     *
     * @returns {number}
     */
    getUniqueIdForBlock(timeBlock) {
        if (!timeBlock.id) {
            return 0
        }

        return timeBlock.repeat ? `${timeBlock.id}-${moment(timeBlock.date).format('YYY-MM-DD')}` : timeBlock.id
    },

    /**
     * @param {string} start
     * @param {string} end
     * @param {int} rowHeight
     * @param {int} step
     * @returns {int}
     */
    getTimeBlockHeight(start, end, rowHeight, step) {
        const startTimeInMin = timeHelper.convertTimeToMinutes(start)
        const endTimeInMin = timeHelper.convertTimeToMinutes(end)

        return Math.floor((endTimeInMin - startTimeInMin) * (rowHeight / step))
    },
    /**
     * Returns the start and end time including travel time.
     *
     * @param {object} timeBlock
     * @returns {object}
     */
    getTimeBlockStartStopTimes(timeBlock) {
        const times = {
            start: timeBlock.timeFrom,
            end: timeBlock.timeTo,
        }

        if (timeBlock.travel) {
            if (timeBlock.travel.before) {
                times.start = timeHelper.subtractTimeStrings(times.start, timeBlock.travel.before)
            }

            if (timeBlock.travel.after) {
                times.end = timeHelper.addTimeStrings(times.end, timeBlock.travel.after)
            }
        }

        return times
    },
    /**
     * Returns the start and end time in minutes, including travel time.
     *
     * @param {object} timeBlock object
     * @returns {object}
     */
    getTimeBlockStartStopTimesInMinutes(timeBlock) {
        const correctTimes = this.getTimeBlockStartStopTimes(timeBlock)

        return {
            start: timeHelper.convertTimeToMinutes(correctTimes.start),
            end: timeHelper.convertTimeToMinutes(correctTimes.end),
        }
    },
    /**
     * Returns the Y offset of the time block.
     *
     * @param {string} start
     * @param {string} rangeStartTime The start time of the grid where the time block will be plotted on.
     * @param {int} rowHeight
     * @param {int} step
     * @returns {float}
     */
    getTimeBlockCssTopPosition(start, rangeStartTime, rowHeight, step) {
        const scheduleStartTimeInMin = timeHelper.convertTimeToMinutes(rangeStartTime)
        const startTimeInMin = timeHelper.convertTimeToMinutes(start)

        return ((startTimeInMin - scheduleStartTimeInMin) * (rowHeight / step) + rowHeight) + 3 + 'px'
    },
    /**
     * @param {object} timeBlock
     * @param {int} rowHeight
     * @param {int} step
     * @returns {object}
     */
    getTravelBeforeStyle(timeBlock, rowHeight, step) {
        const correctTimes = timeBlockHelper.getTimeBlockStartStopTimes(timeBlock)
        const cssHeight = timeBlockHelper.getTimeBlockHeight(correctTimes.start, timeBlock.timeFrom, rowHeight, step)

        return {
            height: cssHeight + 'px',
            top: '-' + (cssHeight) + 'px',
        }
    },
    /**
     * @param {object} timeBlock
     * @param {int} rowHeight
     * @param {int} step
     * @returns {object}
     */
    getTravelAfterStyle(timeBlock, rowHeight, step) {
        const correctTimes = timeBlockHelper.getTimeBlockStartStopTimes(timeBlock)
        const cssHeight = timeBlockHelper.getTimeBlockHeight(timeBlock.timeTo, correctTimes.end, rowHeight, step)

        return {
            height: cssHeight + 'px',
            bottom: '-' + (cssHeight) + 'px',
        }
    },
    /**
     * Returns all the time blocks which overlap with the given time block.
     *
     * @param {object} timeBlock
     * @param {object} timeBlocks
     * @param {boolean|null} ignoreWeeksets
     * @returns {array}
     */
    getOverlappingTimeBlocks(timeBlock, timeBlocks, ignoreWeeksets) {
        const overlapingTimeBlocks = []

        for (let i = 0; i < timeBlocks.length; i++) {
            const tb = timeBlocks[i]

            if (!!ignoreWeeksets && !!tb.repeat) {
                continue
            }

            if (timeBlock.date.sameDateAs(tb.date) && this.timeBlocksOverlaps(timeBlock, tb)) {
                overlapingTimeBlocks.push(tb)
            }
        }

        return overlapingTimeBlocks
    },
    /**
     * Returns the result of substracting time block B from time block A.
     *
     * @param {object} timeBlockA
     * @param {object} timeBlockB
     * @returns {object|array}
     */
    subtractTimeBlocks(timeBlockA, timeBlockB) {
        if (!this.timeBlocksOverlaps(timeBlockA, timeBlockB)) {
            return timeBlockA
        }

        const timeBlockTimesA = this.getTimeBlockStartStopTimesInMinutes(timeBlockA)
        const timeBlockTimesB = this.getTimeBlockStartStopTimesInMinutes(timeBlockB)

        if (timeBlockTimesB.start <= timeBlockTimesA.start && timeBlockTimesB.end >= timeBlockTimesA.end) {
            return null
        } else if (timeBlockTimesA.start < timeBlockTimesB.start && timeBlockTimesA.end > timeBlockTimesB.end) {
            const timeBlockBStartStopTimes = this.getTimeBlockStartStopTimes(timeBlockB)
            const chunkA1 = this.cloneTimeBlock(timeBlockA, timeBlockA.date)
            const chunkA2 = this.cloneTimeBlock(timeBlockA, timeBlockA.date)

            chunkA1.timeFrom = timeBlockA.timeFrom
            chunkA1.timeTo = timeBlockBStartStopTimes.start

            if (timeBlockA.repeat) {
                chunkA2.timeFrom = timeBlockBStartStopTimes.end
                chunkA2.timeTo = timeBlockA.timeTo

                return [chunkA1, chunkA2]
            } else {
                return chunkA1
            }
        }

        const newTimeBlockA = this.cloneTimeBlock(timeBlockA, timeBlockA.date)

        // calculate offset based on time block A
        const startOffset = timeBlockTimesB.end - timeBlockTimesA.start
        const endOffset = timeBlockTimesA.end - timeBlockTimesB.start

        // determine if the start or end time needs to be changed
        if (startOffset > endOffset) {
            newTimeBlockA.timeTo = timeHelper.minutesToTimeString(timeBlockTimesB.start)
        } else {
            newTimeBlockA.timeFrom = timeHelper.minutesToTimeString(timeBlockTimesB.end)
        }

        return newTimeBlockA
    },
    /**
     * Returns true if the given time block doesn't overlap with any of the given time blocks.
     *
     * @param {object} timeBlock
     * @param {array} timeBlocks
     * @returns {boolean}
     */
    isFreeSpotForTimeBlock(timeBlock, timeBlocks) {
        const timeRange = this.getTimeBlockStartStopTimes(timeBlock)

        return this.isFreeSpot(timeBlock.date, timeRange.start, timeRange.end, timeBlocks)
    },
    /**
     * @param {object} timeBlock
     * @param {string} rangeStart
     * @param {string} rangeEnd
     * @returns {boolean}
     */
    isTimeBlockInRange(timeBlock, rangeStart, rangeEnd) {
        const correctTimes = timeBlockHelper.getTimeBlockStartStopTimes(timeBlock)
        const range = {
            start: new Date().setTimeFromString(rangeStart),
            end: new Date().setTimeFromString(rangeEnd),
        }
        const timeBlockTimes = {
            start: new Date().setTimeFromString(correctTimes.start),
            end: new Date().setTimeFromString(correctTimes.end),
        }

        return timeBlockTimes.start >= range.start &&
            timeBlockTimes.start < range.end &&
            timeBlockTimes.end > range.start &&
            timeBlockTimes.end <= range.end
    },
    /**
     * Returns true if the given date and time frame is free in the given array of time blocks.
     *
     * @param {Date} date
     * @param {String} from
     * @param {String} to
     * @param {Array} timeBlocks
     * @param {Boolean|null} ignoreWeeksets
     * @returns {boolean}
     * @todo refactor so it will use the getOverlapTimeBlocks and returns boolean on found result length
     */
    isFreeSpot(date, from, to, timeBlocks, ignoreWeeksets) {
        const tempTimeBlock = {
            date,
            timeFrom: from,
            timeTo: to,
        }

        for (let i = 0; i < timeBlocks.length; i++) {
            const timeBlock = timeBlocks[i]

            if (!!ignoreWeeksets && !!timeBlock.repeat) {
                continue
            }

            if (date.sameDateAs(timeBlock.date) && this.timeBlocksOverlaps(tempTimeBlock, timeBlock)) {
                return false
            }
        }

        return true
    },
    /**
     * Returns the given list of time blocks as a linked list.
     *
     * @param {array} timeBlocks
     * @returns {array}
     */
    getTimeBlocksAsLinkedList(timeBlocks) {
        const items = this.getOrderedTimeBlocks(timeBlocks)

        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const nextItem = items[i + 1]

            item.next = nextItem || null
        }

        return items
    },
    /**
     * Returns the given array of time blocks order on date and time.
     *
     * @param {array} timeBlocks
     * @returns {array}
     */
    getOrderedTimeBlocks(timeBlocks) {
        return _.orderBy(timeBlocks, [(item) => item.date, (item) => timeHelper.convertTimeToMinutes(item.timeFrom)])
    },
    /**
     * Normalizes the given set of time blocks by ordering the set on date/time and repairing
     * weekset time block caps.
     *
     * @param {array} timeBlocks
     * @returns {array}
     */
    normalize(timeBlocks) {
        const items = this.getOrderedTimeBlocks(timeBlocks)
        const newList = []

        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            if (item.repeat) {
                let nextItem = items[i + 1]
                let otherItem = items[i + 2]

                // make sure that the next and the one after the item is on the same day
                if (!!nextItem && !item.date.sameDateAs(nextItem.date)) {
                    nextItem = null
                }

                if (!!otherItem && !item.date.sameDateAs(otherItem.date)) {
                    otherItem = null
                }

                // remove space to make broken weekset time block whole again
                // [ A ]    [ A ]  ==> [     A     ]
                if (!!nextItem && !!nextItem.repeat && item.id === nextItem.id) {
                    const itemStartStopTime = timeBlockHelper.getTimeBlockStartStopTimes(item)
                    nextItem.timeFrom = itemStartStopTime.start
                    continue
                } else if
                    // remove space between time block and weekset time blocks
                    // [ A ]   [ B ] [ A ]  ==> [ A    ][ B ][  A ]
                    (!!otherItem && !!otherItem.repeat && item.id === otherItem.id) {
                    const nextItemStartStopTime = timeBlockHelper.getTimeBlockStartStopTimes(nextItem)

                    item.timeTo = nextItemStartStopTime.start
                    otherItem.timeFrom = nextItemStartStopTime.end
                }
            }

            newList.push(item)
        }

        return newList
    },
    /**
     * Returns the given time blocks array with altered times when needed to fit the given
     * time block.
     *
     * @param {object} timeBlock
     * @param {array} timeBlocks
     * @returns {array}
     */
    makeRoom(timeBlock, timeBlocks) {
        let timeBlocksList = []
        if (!this.isFreeSpotForTimeBlock(timeBlock, timeBlocks)) {
            const overlapTimeBlocks = this.getOverlappingTimeBlocks(timeBlock, timeBlocks)

            // filter out the overlapping time blocks
            timeBlocksList = timeBlocks.filter(tb => {
                if (tb.repeat) {
                    for (const i in overlapTimeBlocks) {
                        const overlapTimeBlock = overlapTimeBlocks[i]

                        if (overlapTimeBlock === tb) {
                            return false
                        }
                    }
                }

                return true
            })

            for (let i = 0; i < overlapTimeBlocks.length; i++) {
                const overlapTimeBlock = overlapTimeBlocks[i]

                if (!overlapTimeBlock.repeat) {
                    continue
                }

                const alteredTimeBlock = this.subtractTimeBlocks(overlapTimeBlock, timeBlock)
                const timeBlockTimes = this.getTimeBlockStartStopTimes(timeBlock)
                const overlapTimeBlockTimes = this.getTimeBlockStartStopTimes(overlapTimeBlock)

                // add chunk after the time block when the altered time block is from a weekset.
                if (!!overlapTimeBlock.repeat && timeHelper.isGreaterThen(overlapTimeBlockTimes.end, timeBlockTimes.end)) {
                    if (Array.isArray(alteredTimeBlock)) {
                        for (const n in alteredTimeBlock) {
                            const chunk = alteredTimeBlock[n]

                            timeBlocksList.push(chunk)
                        }
                    } else if (alteredTimeBlock) {
                        timeBlocksList.push(alteredTimeBlock)
                    }
                } else if (alteredTimeBlock) {
                    timeBlocksList.push(Array.isArray(alteredTimeBlock) ? alteredTimeBlock[0] : alteredTimeBlock)
                }
            }
        } else {
            timeBlocksList = timeBlocks.map(item => this.cloneTimeBlock(item, item.date))
        }

        timeBlocksList.push(timeBlock)
        this.normalize(timeBlocksList)

        return timeBlockHelper.getOrderedTimeBlocks(timeBlocksList.filter(item => item !== timeBlock))
    },
    /**
     * @param {object} timeBlock
     * @returns {object}
     */
    cloneTimeBlock(timeBlock, date) {
        const clone = JSON.parse(JSON.stringify(timeBlock))
        clone.date = date
        return clone
    },
    /**
     * Returns a new time block object with altered start/end times when
     * they are out of range.
     *
     * @param {object} origTimeBlock
     * @param {string} rangeStart
     * @param {string} rangeEnd
     * @returns {object}
     */
    convertToMaxRangeTimeBlock(origTimeBlock, rangeStart, rangeEnd) {
        const timeBlock = timeBlockHelper.cloneTimeBlock(origTimeBlock, origTimeBlock.date)

        // time block start - travel before <-> time range start
        if (timeHelper.isTimeInRange(timeBlock.timeFrom, rangeStart, rangeEnd)) {
            if (!!timeBlock.travel && !!timeBlock.travel.before) {
                const realStartTime = timeHelper.subtractTimeStrings(timeBlock.timeFrom, timeBlock.travel.before)

                if (!timeHelper.isTimeInRange(realStartTime, rangeStart, rangeEnd)) {
                    if (rangeStart === timeBlock.timeFrom) {
                        timeBlock.travel.before = null
                    } else {
                        timeBlock.travel.before = timeHelper.subtractTimeStrings(timeBlock.timeFrom, rangeStart)
                    }
                }
            }
        } else {
            timeBlock.timeFrom = rangeStart
        }

        // time block end + travel after <-> time range end
        if (timeHelper.isTimeInRange(timeBlock.timeTo, rangeStart, rangeEnd)) {
            if (!!timeBlock.travel && !!timeBlock.travel.after) {
                const realEndTime = timeHelper.addTimeStrings(timeBlock.timeTo, timeBlock.travel.after)

                if (!timeHelper.isTimeInRange(realEndTime, rangeStart, rangeEnd)) {
                    if (rangeEnd === timeBlock.timeTo) {
                        timeBlock.travel.after = null
                    } else {
                        timeBlock.travel.after = timeHelper.subtractTimeStrings(rangeEnd, timeBlock.timeTo)
                    }
                }
            }
        } else {
            timeBlock.timeTo = rangeEnd
        }

        return timeBlock
    },
    /**
     * @param {object} timeBlock
     * @returns {string}
     */
    getTimeBlockTypeIcon(timeBlock) {
        switch (timeBlock.type.toLowerCase()) {
            case 'school':
                return 'school'

            case 'agreed':
                return 'lock'

            case 'sport':
                return 'soccer'

            case 'preferred':
                return 'check'

            case 'placeholder-add':
                return 'plus'

            default:
                return 'cancel'
        }
    },
    /**
     * Returns a list of allowed time block types.
     *
     * @returns {array}
     */
    getTimeBlockTypes() {
        return [
            'preferred',
            'agreed',
            'school',
            'sport',
            'other',
        ]
    },
    /**
     * Returns true if the two given time blocks are identical.
     *
     * @param {object} timeBlockA
     * @param {object} timeBlockB
     */
    areTheSame(timeBlockA, timeBlockB) {
        let aretheSame = false

        if ((!!timeBlockA.id && !timeBlockB.id) ||
            (!timeBlockA.id && !!timeBlockB.id) ||
            (!!timeBlockA.id && !!timeBlockB.id && timeBlockA.id !== timeBlockB.id)) {
            return false
        }

        if (!!timeBlockA.travel && (!timeBlockB.travel ||
            !timeBlockA.travel) && !!timeBlockB.travel) {
            return false
        }

        if (timeBlockA.date.sameDateAs(timeBlockB.date) &&
            timeBlockA.timeFrom === timeBlockB.timeFrom &&
            timeBlockA.timeTo === timeBlockB.timeTo &&
            timeBlockA.type === timeBlockB.type) {
            aretheSame = true
        }

        if (timeBlockA.travel) {
            aretheSame = (timeBlockA.travel.before === timeBlockB.travel.before && timeBlockA.travel.after === timeBlockB.travel.after)
        }

        return aretheSame
    },
    /**
     * Returns a fitting time block based on the given time block and stack.
     * It will return null when no possibility is found.
     *
     * @param {object} timeBlock
     * @param {array} timeBlocks
     * @param {int|null} step Total of minutes to reduce/add when checking (60 default)
     * @returns {object|null}
     */
    fitTimeBlockInStack(timeBlock, timeBlocks, step) {
        if (!this.timeBlocksOverlapsInStack(timeBlock, timeBlocks)) {
            return timeBlock
        }

        if (!step) {
            step = 60
        }

        const newTimeBlock = this.cloneTimeBlock(timeBlock, timeBlock.date)
        let duration = this.getTimeBlockStartStopTimesInMinutes(timeBlock)
        const stepInTimeString = timeHelper.minutesToTimeString(step)

        // remove hours from end and check if it fits
        do {
            const timeBlockStartStopTimes = this.getTimeBlockStartStopTimesInMinutes(newTimeBlock)
            newTimeBlock.timeTo = timeHelper.subtractTimeStrings(newTimeBlock.timeTo, stepInTimeString)
            duration = timeBlockStartStopTimes.end - timeBlockStartStopTimes.start

            if (!this.timeBlocksOverlapsInStack(newTimeBlock, timeBlocks)) {
                return newTimeBlock
            }
        } while (duration > step)

        // traverse the hour block back up in time range and check for a fit
        const startTime = newTimeBlock.timeFrom

        do {
            newTimeBlock.timeFrom = timeHelper.subtractTimeStrings(newTimeBlock.timeFrom, stepInTimeString)
            newTimeBlock.timeTo = timeHelper.addTimeStrings(newTimeBlock.timeFrom, stepInTimeString)

            if (!this.timeBlocksOverlapsInStack(newTimeBlock, timeBlocks)) {
                return newTimeBlock
            }
        } while (startTime !== newTimeBlock.timeFrom)

        // couldn't find any location, return nothing
        return null
    },
    /**
     * Returns true when the given time block overlaps with the stack's time blocks.
     *
     * @param {object} timeBlock
     * @param {array} timeBlocks
     * @returns {boolean}
     */
    timeBlocksOverlapsInStack(timeBlock, timeBlocks) {
        for (const n in timeBlocks) {
            const stackTimeBlock = timeBlocks[n]

            if (this.timeBlocksOverlaps(timeBlock, stackTimeBlock)) {
                return true
            }
        }

        return false
    },
    /**
     * Returns a fitting time block based on the given starting time block and time range.
     *
     * @param {object} timeBlock
     * @param {string} rangeStart
     * @param {string} rangeEnd
     * @returns {object}
     */
    getTimeBlockInRange(timeBlock, rangeStart, rangeEnd) {
        const newTimeBlock = this.cloneTimeBlock(timeBlock, timeBlock.date)
        const startOutOfRange = !timeHelper.isTimeInRange(timeBlock.timeFrom, rangeStart, rangeEnd)
        const endOutOfRange = !timeHelper.isTimeInRange(timeBlock.timeTo, rangeStart, rangeEnd)

        if (startOutOfRange && (endOutOfRange || timeHelper.areTheSame(timeBlock.timeFrom, rangeEnd))) {
            const diffHead = timeHelper.getDuration(timeBlock.timeFrom, rangeStart)
            const diffTail = timeHelper.getDuration(rangeEnd, timeBlock.timeTo)

            const timeFromInMin = timeHelper.convertTimeToMinutes(timeBlock.timeFrom)
            const timeToInMin = timeHelper.convertTimeToMinutes(timeBlock.timeTo)
            const rangeStartInMin = timeHelper.convertTimeToMinutes(rangeStart)
            const rangeEndInMin = timeHelper.convertTimeToMinutes(rangeEnd)

            // is block before range?
            if (timeFromInMin <= rangeStartInMin && timeToInMin <= rangeStartInMin) {
                newTimeBlock.timeTo = timeHelper.addTimeStrings(rangeStart, '1:00')
            } else if
                // is block after range?
                (timeFromInMin >= rangeEndInMin && timeToInMin >= rangeEndInMin) {
                newTimeBlock.timeFrom = timeHelper.subtractTimeStrings(rangeEnd, '1:00')
            } else if
                // change overlapping end of the time block
                (diffHead <= diffTail) {
                newTimeBlock.timeFrom = rangeStart
            } else {
                newTimeBlock.timeTo = rangeEnd
            }
        }

        return newTimeBlock
    },
    /**
     * Inject the missing availability data into single events.
     *
     * @param {object} timeBlock
     * @param {array}  weekEvents
     * @returns {void}
     */
    injectMissingFields(timeBlock, weekEvents) {
        let found = false

        for (const n in weekEvents) {
            const weekEvent = weekEvents[n]

            if (timeBlock.date.sameDateAs(weekEvent.date) &&
                timeHelper.areTheSame(timeBlock.timeFrom, weekEvent.timeFrom) &&
                timeHelper.areTheSame(timeBlock.timeTo, weekEvent.timeTo) &&
                timeBlock.type === weekEvent.type
            ) {
                found = true
                timeBlock.repeat = weekEvent.repeat
                timeBlock.editable = weekEvent.editable

                if (weekEvent.id) {
                    timeBlock.id = weekEvent.id
                }

                if (weekEvent.priority) {
                    timeBlock.priority = weekEvent.priority
                }

                break
            }
        }

        // didn't find any single events so this should be a recurring one
        if (!found) {
            timeBlock.repeat = true
            timeBlock.editable = false
        }
    },
    /**
     * Returns true when the given time blocks overlap.
     *
     * @param {object} timeBlockA
     * @param {object} timeBlockB
     * @returns {boolean}
     */
    timeBlocksOverlaps(timeBlockA, timeBlockB) {
        const timeA = timeBlockHelper.getTimeBlockStartStopTimesInMinutes(timeBlockA)
        const timeB = timeBlockHelper.getTimeBlockStartStopTimesInMinutes(timeBlockB)

        //   [  A  ]
        // [    B    ]
        if (timeA.start >= timeB.start && timeA.start <= timeB.end && timeA.end <= timeB.end) {
            return true
        } else if
            // [    A    ]
            //   [  B  ]
            (timeA.start <= timeB.start && timeA.end >= timeB.end) {
            return true
        } else if
            //    [  A  ]
            // [  B  ]
            (timeA.start >= timeB.start && timeA.start < timeB.end && timeA.end > timeB.end) {
            return true
        } else if
            // [  A  ]
            //     [  B  ]
            (timeA.start < timeB.start && timeA.end < timeB.end && timeA.end > timeB.start) {
            return true
        }

        return false
    },
    /**
     * Outputs the given time block to the console.
     *
     * @param {array} timeBlocks
     */
    consoleOutTimeBlocks(timeBlocks) {
        console.log('-----start-----')

        for (const i in timeBlocks) {
            const tb = timeBlocks[i]

            console.log('#' + (tb.id || '-') + ' ' + tb.date.toDateString() + ' @ ' + tb.timeFrom + ' - ' + tb.timeTo + ' [' + tb.type + '][weekset: ' + (tb.repeat ? 'Y' : 'N') + '][edit: ' + (tb.editable ? 'Y' : 'N') + ']')
        }

        console.log('-----end------')
    },
    /**
     * Outputs the given time block to the console as serializes strings.
     *
     * @param {array} timeBlocks
     */
    serializeTimeBlocksToConsole(timeBlocks) {
        console.log('-----start-----')

        for (const i in timeBlocks) {
            const tb = timeBlocks[i]

            console.log(JSON.stringify(tb))
        }

        console.log('-----end------')
    },

    ocupiedHoursMinutes(timeblockItems, $moment, isInsideEditableWeekset) {
        if (timeblockItems.length) {
            const tempTimes = []
            for (let i = 0; i < timeblockItems.length; i++) {
                const isPlaceholder = timeblockItems[i].placeholder
                const isEditing = timeblockItems[i].editing
                const isRecurring = timeblockItems[i].repeat
                if (!isPlaceholder && !isEditing && (!isRecurring || isInsideEditableWeekset)) {
                    let travel
                    if (timeblockItems[i].type === 'school') {
                        travel = {
                            before: $moment().timeObject(timeblockItems[i].travel.before),
                            after: $moment().timeObject(timeblockItems[i].travel.after),
                        }
                    }
                    const from = timeblockItems[i].type === 'school'
                        ? $moment(timeblockItems[i].timeFrom, 'HH:mm')
                            .add(-travel.before.hours, 'hours').add(-travel.before.minutes, 'minutes').format('HH:mm')
                        : timeblockItems[i].timeFrom
                    const to = timeblockItems[i].type === 'school'
                        ? $moment(timeblockItems[i].timeTo, 'HH:mm')
                            .add(travel.after.hours, 'hours').add(travel.after.minutes, 'minutes').format('HH:mm')
                        : timeblockItems[i].timeTo
                    const range = $moment().timeRange(from, to, 15, 'minutes')
                    range.forEach(time => {
                        tempTimes.push(time)
                    })
                }
            }
            return tempTimes
        }
    },

    ocupiedMinutesForHour(hour, timeblockItems, $moment, isInsideEditableWeekset) {
        const times = []
        if (timeblockItems.length) {
            const tempTimes = []
            for (let i = 0; i < timeblockItems.length; i++) {
                const isPlaceholder = timeblockItems[i].placeholder
                const isEditing = timeblockItems[i].editing
                const isRecurring = timeblockItems[i].repeat
                if (!isPlaceholder && !isEditing && (!isRecurring || isInsideEditableWeekset)) {
                    let travel
                    let from = timeblockItems[i].timeFrom
                    let to = timeblockItems[i].timeTo
                    if (timeblockItems[i].type === 'school') {
                        travel = {
                            before: $moment().timeObject(timeblockItems[i].travel.before),
                            after: $moment().timeObject(timeblockItems[i].travel.after),
                        }
                        from = $moment(timeblockItems[i].timeFrom, 'HH:mm').add(-travel.before.hours, 'hours').add(-travel.before.minutes, 'minutes').format('HH:mm')
                        to = $moment(timeblockItems[i].timeTo, 'HH:mm').add(travel.after.hours, 'hours').add(travel.after.minutes, 'minutes').format('HH:mm')
                    }
                    const range = $moment().timeRange(from, to, 15, 'minutes')
                    range.forEach(time => {
                        const splitTime = time.split(':')
                        tempTimes.push({
                            hour: parseInt(splitTime[0]),
                            minute: parseInt(splitTime[1]),
                        })
                    })
                }
            }
            const checkHours = stringHelper.groupBy(tempTimes, 'hour')
            Object.keys(checkHours).forEach(key => {
                if (parseInt(key) === parseInt(hour)) {
                    checkHours[key].forEach(time => {
                        times.push(parseInt(time.minute))
                    })
                }
            })
        }
        return times
    },

    ocupiedHours(timeblockItems, $moment, isInsideEditableWeekset) {
        const times = []
        if (timeblockItems.length) {
            const tempTimes = []
            for (let i = 0; i < timeblockItems.length; i++) {
                const isPlaceholder = timeblockItems[i].placeholder
                const isEditing = timeblockItems[i].editing
                const isRecurring = timeblockItems[i].repeat
                const considerTimeBlock = !isPlaceholder && !isEditing && (!isRecurring || isInsideEditableWeekset)
                let timeBlockTimeFrom = timeblockItems[i].timeFrom
                let timeBlockTimeTo = timeblockItems[i].timeTo
                if (timeblockItems[i].type === 'school' && considerTimeBlock) {
                    // add travel after times to the timeblock times in order to check for allowed times. This is to not allow overlapping over travel times.
                    const schoolTravelBeforeTimes = $moment().timeObject(timeblockItems[i].travel.before)
                    if (schoolTravelBeforeTimes.hours > 0 || schoolTravelBeforeTimes.minutes > 0) {
                        timeBlockTimeFrom = $moment(timeBlockTimeFrom, 'HH:mm').add(-schoolTravelBeforeTimes.hours, 'hours').add(-schoolTravelBeforeTimes.minutes, 'minutes').format('HH:mm')
                    }
                    const schoolTravelAfterTimes = $moment().timeObject(timeblockItems[i].travel.after)
                    if (schoolTravelAfterTimes.hours > 0 || schoolTravelAfterTimes.minutes > 0) {
                        timeBlockTimeTo = $moment(timeBlockTimeTo, 'HH:mm').add(schoolTravelAfterTimes.hours, 'hours').add(schoolTravelAfterTimes.minutes, 'minutes').format('HH:mm')
                    }
                }
                if (considerTimeBlock) {
                    const range = $moment().timeRange(timeBlockTimeFrom, timeBlockTimeTo, 15, 'minutes')
                    range.forEach(time => {
                        const splitTime = time.split(':')
                        tempTimes.push({
                            hour: parseInt(splitTime[0]),
                            minute: parseInt(splitTime[1]),
                        })
                    })
                }
            }
            const checkHours = stringHelper.groupBy(tempTimes, 'hour')
            Object.keys(checkHours).forEach(key => {
                if (checkHours[key].length > 3) {
                    times.push(parseInt(key))
                }
            })
        }
        return times
    },

    ocupiedTimes(timeblockItems, $moment, isInsideEditableWeekset) {
        const times = []
        if (timeblockItems.length) {
            for (let i = 0; i < timeblockItems.length; i++) {
                const isPlaceholder = timeblockItems[i].placeholder
                const isEditing = timeblockItems[i].editing
                const isRecurring = timeblockItems[i].repeat
                if (!isPlaceholder && !isEditing && (!isRecurring || isInsideEditableWeekset)) {
                    const range = $moment().timeRange(timeblockItems[i].timeFrom, timeblockItems[i].timeTo, 15, 'minutes')
                    range[0] = $moment().setTime(range[0]).add(1, 'minute').format('HH:mm')
                    range[range.length - 1] = $moment().setTime(range[range.length - 1]).subtract(1, 'minute').format('HH:mm')
                    range.forEach(time => {
                        times.push(time)
                    })
                }
            }
        }
        return times
    },

    timeBlockBefore(timeBlock, timeblockItems, $moment, isInsideEditableWeekset, businessTimes) {
        const existing = []
        if (timeblockItems.length) {
            for (let i = 0; i < timeblockItems.length; i++) {
                const isPlaceholder = timeblockItems[i].placeholder
                const isEditing = timeblockItems[i].editing
                const isRecurring = timeblockItems[i].repeat
                let timeblockTime = timeblockItems[i].timeTo
                const considerTimeBlock = !isPlaceholder && !isEditing && (!isRecurring || isInsideEditableWeekset)
                if (timeblockItems[i].type === 'school' && considerTimeBlock) {
                    // add travel after times to the timeblock times in order to check for allowed times. This is to not allow overlapping over travel times.
                    const schoolTravelAfterTimes = $moment().timeObject(timeblockItems[i].travel.after)
                    if (schoolTravelAfterTimes.hours > 0 || schoolTravelAfterTimes.minutes > 0) {
                        timeblockTime = $moment(timeblockTime, 'HH:mm')
                            .add(schoolTravelAfterTimes.hours, 'hours')
                            .add(schoolTravelAfterTimes.minutes, 'minutes')
                            .format('HH:mm')
                    }
                }
                if (considerTimeBlock && timeblockTime <= timeBlock.timeFrom) {
                    existing.push(timeblockTime)
                }
            }
        }
        if (existing.length) {
            existing.sort(objectHelper.compareTimeFrom).reverse()
            return existing[0]
        }
        return !isInsideEditableWeekset ? businessTimes.from : undefined
    },

    timeBlockAfter(timeBlock, timeblockItems, $moment, isInsideEditableWeekset, businessTimes) {
        const existing = []
        if (timeblockItems.length) {
            for (let i = 0; i < timeblockItems.length; i++) {
                const isPlaceholder = timeblockItems[i].placeholder
                const isEditing = timeblockItems[i].editing
                const isRecurring = timeblockItems[i].repeat
                let timeblockTime = timeblockItems[i].timeFrom
                if (timeblockItems[i].type === 'school') {
                    // add travel before times to the timeblock times in order to check for allowed times. This is to not allow overlapping over travel times.
                    const schoolTravelToTimes = $moment().timeObject(timeblockItems[i].travel.before)
                    if (schoolTravelToTimes.hours > 0 || schoolTravelToTimes.minutes > 0) {
                        timeblockTime = $moment(timeblockTime, 'HH:mm')
                            .subtract(schoolTravelToTimes.hours, 'hours')
                            .subtract(schoolTravelToTimes.minutes, 'minutes')
                            .format('HH:mm')
                    }
                }
                if (!isPlaceholder && !isEditing && (!isRecurring || isInsideEditableWeekset) && timeblockTime >= timeBlock.timeTo) {
                    existing.push(timeblockTime)
                }
            }
        }
        if (existing.length) {
            existing.sort(objectHelper.compareTimeFrom)
            return existing[0]
        }
        return !isInsideEditableWeekset ? businessTimes.to : undefined
    },

    /**
     * Processes an availability block changing the property names and formats
     * from vue to api format.
     *
     * @param {object} availability
     * @returns {object}
     */
    formatAvailabilityForApi(availability) {
        const block = {
            time_from: availability.timeFrom,
            time_to: availability.timeTo,
            type: availability.type,
            day: moment(availability.date).isoWeekday(),
            repeat: availability.repeat ? 1 : 0,
        }
        if (availability.type === 'school') {
            block.travel_before = availability.travel.before
            block.travel_after = availability.travel.after
        }
        if (!availability.new) {
            block.availability_id = availability.id
        }

        return block
    },

    /**
     * Returns true if availability block is for duration of entire day.
     *
     * @param timeBlock
     * @returns {boolean}
     */
    isBlockFullDay(timeBlock) {
        return timeBlock.timeFrom === '00:00' && timeBlock.timeTo === '23:59'
    },
}

export default timeBlockHelper
