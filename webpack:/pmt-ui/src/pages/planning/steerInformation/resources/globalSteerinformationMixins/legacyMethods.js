/*
    This file contains the legacy PMT1 code that is needed in order to support the API call GET /steerInformation
    This code is and looks very old, it CANNOT be changed without a proper testing strategy. Please. For your and mine sanity.
*/

export default {
    methods: {
        numberFormatter (value) {
            // @todo: need to remove this functions in later stage
            return value
        },
        /**
         * Sets editable flag for all elements for each day
         *
         * @param object data
         */
        setEditableFlag (data) {
            for (let i = 0, l = data.departments.length; i < l; i++) {
                const department = data.departments[i]
                const isExternal = department.type === 'external'
                this.setEditableForDays(department, isExternal)
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    this.setEditableForDays(subdepartment, isExternal)
                    for (let m = 0, n = subdepartment.drivers.length; m < n; m++) {
                        const driver = subdepartment.drivers[m]
                        this.setEditableForDays(driver, isExternal)
                    }
                }
            }
            this.setEditableDaysForStore(data)
        },
        /**
         * Sets editable flad for an element for each day
         *
         * @param object element
         * @param boolean isExternal
         */
        setEditableForDays (element, isExternal) {
            for (let i = 0, l = 7; i < l; i++) {
                let hasPos = this.pos[i]
                if (isExternal) {
                    hasPos = false
                }
                element.days[i].editable = (this.weekIsClosed !== true) && (hasPos !== true)
            }
        },
        /**
         * Returns POS letiable based on the closed days         *
         */
        pos () {
            return this.updatePOSbyStandardTimes()
        },
        daysWithPosData () {
            return this.pos
        },
        /**
         * Sets editable flag for each day of store total
         * The flag is sets based on editable subdepartments which count to it
         *
         * @param object data
         */
        setEditableDaysForStore (data) {
            const editableDays = this.getEditableDaysForStore(data)
            let editable = false
            for (let i = 0, l = 7; i < l; i++) {
                editable = false
                if (editableDays.hasOwnProperty(i) && editableDays[i]) {
                    editable = true
                }
                data.store.days[i].editable = editable
            }
        },
        /**
         * Returns an object with the editable status of each day
         *
         * @param object data
         */
        getEditableDaysForStore (data) {
            const editableDays = {}
            for (let i = 0, l = data.departments.length; i < l; i++) {
                const department = data.departments[i]
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    // ignore subdepartments which do not contribute to store
                    if (subdepartment.store_turnover && (subdepartment.store_turnover !== 1)) {
                        continue
                    }
                    for (let m = 0, n = 7; m < n; m++) {
                        if (subdepartment.days[m].editable) {
                            editableDays[m] = true
                        }
                    }
                }
            }
            return editableDays
        },
        /**
         * Checks if an element is editable in a given day
         *
         * @param object object
         * @param int day
         * @returns {Boolean}
         */
        isDayEditable (object, day) {
            if (!object.days[day].editable) {
                return false
            }
            return true
        },
        /**
         * Updates POS letiable based on the closed days from standard times
         */
        updatePOSbyStandardTimes: (forecastData) => {
            this.forecastData.standard_times.forEach((key, value) => {
                if (!!value.closed && value.closed === 1) {
                    const idx = key - 1
                    this.pos[idx] = true
                }
            })
            return this.pos
        },
        /**
         * Updates POS letiable based on a specific closed day
         */
        updatePOSbyClosedDay (e) {
            const day = e.target[0].value
            const dayClosed = document.querySelector(e.target).dataset.isclosed
            const auxPos = this.pos
            auxPos[day] = dayClosed
            this.pos = auxPos
            this.forecastData.store.days[day].value = 0
            this.changeBudget(0, 'value', false, day)
        },
        /**
         * Returns the driver which matches key, from subdepartment
         * @param object subdepartment
         * @param key
         * @returns object
         */
        getDriver (subdepartment, key) {
            for (let i = 0, j = subdepartment.drivers.length; i < j; i++) {
                const driver = subdepartment.drivers[i]
                if (driver.key === key) {
                    return driver
                }
            }
            return null
        },
        /**
         * Deletes the driver which matches key, from subdepartment
         * @param object subdepartment
         * @param key
         */
        deleteDriverWithKey (subdepartment, key) {
            let index = null
            for (let i = 0, j = subdepartment.drivers.length; i < j; i++) {
                const driver = subdepartment.drivers[i]
                if (driver.key === key) {
                    index = i
                }
            }
            if (index >= 0) {
                subdepartment.drivers.splice(index, 1)
            }
        },
        parseComplexStringToFloat (value) {
            return parseFloat(value
                .replace(/[^\d\-.,]/g, '')
                .replace(/,/g, '.')
                .replace(/\.(?=.*\.)/g, ''))
        },
        recalculateTotals (fieldName, turnover, day, dep) {
            this.SET_CHANGE_TRIGGERED(true)
            this.SET_FIELD_NAME(fieldName)
            const inputValue = this.parseComplexStringToFloat(turnover)
            const depId = this.numberFormatter(dep)
            let weekly = true
            let layer = 0
            if ((this.isNumeric(day))) {
                weekly = false
            }
            if ((this.isNumeric(depId))) {
                layer = 1
                const department = this.getDepartmentBasedOnId(depId)
                if (weekly) {
                    department.weekly.value = inputValue
                } else {
                    department.days[day].value = inputValue
                }
            } else {
                this.forecastData.store.weekly.value = inputValue
            }
            this.changeBudget(layer, 'value', weekly, day, depId)
        },
        /**
         * Updates turnover data when day value is changed
         * The calculation is done form week to day, from store down to driver
         * and from driver to store
         * @param int layer
         * @param string type
         * @param int day
         * @param string driverChanged
         * @param boolean driverChanged (optional)
         */
        changeBudget (layer, type, weekly, day, id, driverChanged, markChanges) {
            const changedDriver = false
            const direction = 1
            const layers = {}
            const changesMark = undefined !== markChanges ? markChanges : true
            this.changedSubdepartments = {}
            layers[0] = this.calculateStoreBudget
            layers[1] = this.calculateDepartmentBudgets
            layers[2] = this.calculateSubdepartmentBudgets
            layers[3] = this.calculateDriverBudgets
            if (weekly) {
                // make updates from week to day if week value changed
                this.updateFromWeekly(this.forecastData, layer)
                for (let di = 0; di < 7; di++) {
                    // we recalculate subdepartment absolute values, based on day layer and id
                    this.recalculateSubdepartmentAbsoluteValues(di, layer, type, id)
                }
            } else {
                this.recalculateSubdepartmentAbsoluteValues(day, layer, type, id)
            }
            // calculate turnover based on driver if driver changed
            layers[3].call(this, type, direction === 1 ? 'down' : 'up', changedDriver, day, id)
            if (changedDriver) {
                for (let di = 0; di < 7; di++) {
                    // after subdepartment turnover was updated we need to recheck
                    // dependent subdepartments
                    this.updatedRelatedSubdepartments(di, id)
                    // we recalculate subdepartment absolute values, based on day layer and id
                    this.recalculateDependentSubdepartmentTurnover(di)
                }
                layers[3].call(this, type, direction === 1 ? 'down' : 'up', false, day)
            }
            // after subdepartment absolute values were updated we start the upwords calculations
            for (let i = 2; i >= 0; i--) {
                layers[i].call(this, type, 'up', day)
            }
            // after data has been updated we need to recalculate ratios
            this.updateRatio(this.forecastData)
            this.updateSubdepartmentsRatioStore(this.forecastData)
            if (changesMark) {
                this.checkChangedInputs()
            }
            // input has changed disable week budget data
            // Recalculate derived drivers.
            this.updateDefaultDrivers(this.forecastData)
            this.SYNC_FORE_CAST_DATA(this.selectedDate)
        },
        /**
         * Initiates the calculation for the store layer
         * @param string basedOnType
         * @param string direction
         * @param int day
         * @param int direction
         */
        calculateStoreBudget (basedOnType, direction, day) {
            const storeObject = this.forecastData.store
            storeObject.departments = this.forecastData.departments
            this.startBudgetCalculation(
                [storeObject],
                {},
                'departments',
                basedOnType,
                direction,
                day)
        },
        /**
         * Initiates the calculation for the departments layer
         * @param string basedOnType
         * @param int direction
         * @param int day
         */
        calculateDepartmentBudgets (basedOnType, direction, day) {
            this.startBudgetCalculation(
                this.forecastData.departments,
                this.forecastData.store,
                'subdepartments',
                basedOnType,
                direction,
                day)
        },
        /**
         * Initiates the calculation for the subdepartments layer
         * @param string basedOnType
         * @param int direction
         * @param int day
         */
        calculateSubdepartmentBudgets (basedOnType, direction, day) {
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                this.startBudgetCalculation(
                    this.forecastData.departments[i].subdepartments,
                    this.forecastData.departments[i],
                    '',
                    basedOnType,
                    direction,
                    day)
            }
        },
        /**
         * Initiates the calculation for the drivers layer
         * If driver changed we also need to recalculate turnovers
         * @param string basedOnType
         * @param int direction
         * @param string driverChanged
         * @param int day
         * @param int id
         */
        calculateDriverBudgets (basedOnType, direction, driverChanged, day, id) {
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                for (let si = 0, sl = this.forecastData.departments[i].subdepartments.length; si < sl; si++) {
                    const subdepartment = this.forecastData.departments[i].subdepartments[si]
                    for (let di = 0; di < 7; di++) {
                        if ((this.isNumeric(day)) && (day !== di)) {
                            continue
                        }
                        if (!this.isDayEditable(subdepartment, di)) {
                            continue
                        }
                        if (driverChanged) {
                            // recalculate turnover and update the other driver
                            // based on the new turnover
                            if (driverChanged.indexOf('customer') >= 0) {
                                this.updateTurnoverBasedOnDerivedDriver(this.forecastData.departments[i].subdepartments[si], di, 'customers', 'average_customer_spending', id)
                                this.updateDriverBasedOnTurnover(this.forecastData.departments[i].subdepartments[si], di, 'items_out', 'average_item_value')
                            } else if ((driverChanged.indexOf('item') >= 0) && (driverChanged.indexOf('items_in') === -1)) {
                                this.updateTurnoverBasedOnDerivedDriver(this.forecastData.departments[i].subdepartments[si], di, 'items_out', 'average_item_value', id)
                                this.updateDriverBasedOnTurnover(this.forecastData.departments[i].subdepartments[si], di, 'customers', 'average_customer_spending')
                            }
                        } else {
                            this.updateDriverBasedOnTurnover(this.forecastData.departments[i].subdepartments[si], di, 'items_out', 'average_item_value')
                            this.updateDriverBasedOnTurnover(this.forecastData.departments[i].subdepartments[si], di, 'customers', 'average_customer_spending')
                        }
                    }
                    // recalculate totals and calculate day percentage taking into account
                    // pos days
                    for (let m = 0, n = subdepartment.drivers.length; m < n; m++) {
                        const driver = subdepartment.drivers[m]
                        this.calculateTotalValue(driver)
                        this.addPercentWithoutPos(driver)
                    }
                }
            }
        },
        /**
         * Does the calculations for the above mentioned layers.
         * @param array currentArray
         * @param object parentObject
         * @param string childKey
         * @param string basedOnType
         * @param int direction
         * @param int day
         */
        startBudgetCalculation (currentArray, parentObject, childKey, basedOnType, direction, day) {
            if (direction === 'up' && parentObject.days && currentArray.length) {
                for (let di = 0; di < 7; di++) {
                    if ((this.isNumeric(day)) && (day !== di)) {
                        continue
                    }
                    if (childKey === '') {
                        this.calculateDepartmentTotalForDay(parentObject, di) // 1
                    } else if (childKey === 'subdepartments') {
                        this.calculateStoreTotalForDay(this.forecastData, di) // 2
                    }
                }
            }
            for (let i = 0, l = currentArray.length; i < l; i++) {
                if (basedOnType === 'value') {
                    this.calculateTotalValue(currentArray[i])
                    this.calculateBasedOnValue(currentArray[i])
                    this.calculateTotalPercentage(currentArray[i])
                    this.addPercentWithoutPos(currentArray[i])
                } else if (basedOnType === 'percentage') {
                    this.calculateTotalPercentage(currentArray[i])
                    this.calculateBasedOnPercentage(currentArray[i])
                }
            }
        },
        /**
         * Calculates totals for a department, based on related subdepartments and selected day
         * @param object department
         * @param int day
         * @returns object
         */
        calculateDepartmentTotalForDay (department, day) {
            const dayValues = {
                value: 0,
                percent: 0,
            }
            for (let i = 0, l = department.subdepartments.length; i < l; i++) {
                const subdepartment = department.subdepartments[i]
                // ignore subdepartments which do not contribute to department
                if (subdepartment.department_turnover && (subdepartment.department_turnover !== 1)) {
                    return
                }
                dayValues.value += this.numberFormatter(subdepartment.days[day].value)
            }
            department.days[day].value = this.getRoundedValue(dayValues.value)
            return dayValues
        },
        /**
         * Calculates store total based on related subdepartments
         * @param object store
         * @param int day
         * @returns object
         */
        calculateStoreTotalForDay (store, day) {
            const dayValues = {
                value: 0,
                percent: 0,
            }
            for (let j = 0, k = store.departments.length; j < k; j++) {
                const department = store.departments[j]
                for (let i = 0, l = department.subdepartments.length; i < l; i++) {
                    const subdepartment = department.subdepartments[i]
                    // each subdepartment should be counted once
                    if (!this.storeIds[subdepartment.id]) {
                        continue
                    }
                    dayValues.value += this.numberFormatter(subdepartment.days[day].value)
                }
            }
            store.store.days[day].value = this.getRoundedValue(dayValues.value)
            return dayValues
        },
        /**
         * Returns an array with unique turnover subdepartments which are contributing to store
         * total
         * @param array data
         * @returns array
         */
        getUniqueSubdepartmentsToStore (data) {
            const turnoverIds = {}
            for (let j = 0, k = data.departments.length; j < k; j++) {
                const department = data.departments[j]
                for (let i = 0, l = department.subdepartments.length; i < l; i++) {
                    const subdepartment = department.subdepartments[i]
                    // ignore subdepartments which do not contribute to store
                    if (subdepartment.store_turnover && (subdepartment.store_turnover !== 1)) {
                        continue
                    }
                    // if subdepartment type is turnover we can add it's id to array
                    if (subdepartment.subdepartment_type === 'turnover') {
                        turnoverIds[subdepartment.id] = true
                    }
                    // if subdepartment type is dependent we will add related subdepartments
                    // which were not previously added
                    if (subdepartment.subdepartment_type === 'dependent') {
                        subdepartment.relatedSubdepartments.forEach((key, relation) => {
                            turnoverIds[relation.subdepartment_id] = true
                        })
                    }
                }
            }
            return turnoverIds
        },
        /**
         * Calculate absolute values for subdepartments based on layer
         * @param int day
         * @param int layer
         * @param string type
         * @param int id
         */
        recalculateSubdepartmentAbsoluteValues: function (day, layer, type, id) {
            if (layer == 2) {
                // on subdepartment change we also need to update related subdepartments
                this.updatedRelatedSubdepartments(day, id)
                // recalculates turnover for dependent subdepartments
                this.recalculateDependentSubdepartmentTurnover(day)
                return false
            }
            // only do this updates when a department or store value was changed
            if (!((layer == 1) || (layer == 0))) {
                return false
            }
            // parent based on which the ratios will be calculated
            const parent = this.getParentValueBasedOnLayer(day, layer, id)
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                const department = this.forecastData.departments[i]
                // change was on department level, only do it for the changed department
                if ((layer == 1) && (department.id != id)) {
                    continue
                }
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    // change was on department level, ignore subdepartments which do not contribute to department
                    if (layer == 1 && subdepartment.department_turnover && (subdepartment.department_turnover != 1)) {
                        continue
                    }
                    // change was on store level, ignore subdepartments which do not contribute to store
                    if (layer == 0 && (!this.storeIds[subdepartment.id])) {
                        continue
                    }
                    // ignore subdepartments which are not editable
                    if (!this.isDayEditable(subdepartment, day)) {
                        continue
                    }
                    let ratio = 0
                    if (layer == 0) {
                        // get ratio to store
                        ratio = department.days[day].ratioToStore[subdepartment.id]
                    }
                    if (layer == 1) {
                        // get ratio to department
                        ratio = department.days[day].ratio[subdepartment.id]
                    }
                    // calculate ratio based on selected parent value
                    subdepartment.days[day].value = this.getRoundedValue(ratio / 100 * this.numberFormatter(parent.value))
                    if (subdepartment.subdepartment_type == 'dependent') {
                        this.updatedRelatedSubdepartments(day, subdepartment.id)
                    }
                }
                // change was on department level,
                // normalize subdepartments to department total
                if (layer == 1) {
                    this.normalizeSubdepartmentsToDepartment(department, day)
                }
            }
            // change was on store level
            // normalize subdepartments to store total
            if (layer == 0) {
                this.normalizeSubdepartmentsToStore(day)
            }
            // after absolute values were calculated and normalized, we need to recalculate
            // the totals for dependent subdepartments
            this.recalculateDependentSubdepartmentTurnover(day)
        },
        /**
         * Sets the total turnover of dependent subdepartment based on the related turnover subdepartments
         * @param int day
         */
        recalculateDependentSubdepartmentTurnover: function (day) {
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                const department = this.forecastData.departments[i]
                if (!this.isDayEditable(department, day)) {
                    continue
                }
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    if (subdepartment.subdepartment_type == 'dependent') {
                        const relatedValue = this.getRoundedValue(this.calculateDependentSubdepartmentTurnover(subdepartment, day))
                        subdepartment.days[day].value = relatedValue
                    }
                }
            }
        },
        /**
         * Calculates total turnover for a dependent subdepartment
         * @param object dependentSubdepartment
         * @param int day
         * @returns float
         */
        calculateDependentSubdepartmentTurnover: function (dependentSubdepartment, day) {
            let total = 0
            const relatedSubdepartments = this.getRelatedSubdepartments(dependentSubdepartment.relatedSubdepartments)
            for (let i = 0, l = relatedSubdepartments.length; i < l; i++) {
                const relatedSubdepartment = relatedSubdepartments[i]
                total += this.numberFormatter(relatedSubdepartment.days[day].value)
            }
            return total
        },
        /**
         * Updates related subdepartments to dependent subdepartment based on ratio
         * @param int day
         * @param int id
         */
        /**
         * Updates related subdepartments to dependent subdepartment based on ratio
         * @param int day
         * @param int id
         */
        updatedRelatedSubdepartments: function (day, id) {
            const dependentSubdepartment = this.getSubdepartmentBasedOnId(id)
            if (!this.isDayEditable(dependentSubdepartment, day)) {
                return false
            }
            if (dependentSubdepartment.subdepartment_type && dependentSubdepartment.subdepartment_type == 'turnover') {
                return false
            }
            const relatedSubdepartments = this.getRelatedSubdepartments(dependentSubdepartment.relatedSubdepartments)
            for (let i = 0, l = relatedSubdepartments.length; i < l; i++) {
                const relatedSubdepartment = relatedSubdepartments[i]
                const ratio = relatedSubdepartment.days[day].ratioToDependent[dependentSubdepartment.id]
                const parentValue = dependentSubdepartment.days[day].value
                if (!this.isDayEditable(relatedSubdepartment, day)) {
                    continue
                }
                // calculate value of related Subdepartments
                relatedSubdepartment.days[day].value = this.getRoundedValue(ratio / 100 * this.numberFormatter(parentValue))
            }
            // after the value was splitted between turnover subdepartments
            // we need to normalize the value, to make sure it adds up perfectly
            this.normalizaSubdepartmentToDependentTotal(day, dependentSubdepartment, relatedSubdepartments)
        },
        /**
         * Returns the value, based on layer, id and day
         * @param int day
         * @param int layer
         * @param int id
         * @returns object
         */
        getParentValueBasedOnLayer (day, layer, id) {
            let parent = 0
            if (layer === 0) {
                parent = this.forecastData.store.days[day]
                return parent
            }
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                const department = this.forecastData.departments[i]
                if (layer === 1 && department.id === parseInt(id)) {
                    parent = department.days[day]
                    return parent
                }
            }
            return parent
        },
        isNumeric (n) {
            return !isNaN(parseFloat(n)) && isFinite(n)
        },
        /**
         * Returns the subdepartment based on id
         * @param int id
         * @returns object
         */
        getSubdepartmentBasedOnId: function (id) {
            let parent = 0
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                const department = this.forecastData.departments[i]
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    if (subdepartment.id == id) {
                        parent = subdepartment
                        return parent
                    }
                }
            }
            return parent
        },
        /**
         * Returns the department based on id
         * @param int id
         * @returns object
         */
        getDepartmentBasedOnId: function (id) {
            let object = 0
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                const department = this.forecastData.departments[i]
                if (department.id == id) {
                    object = department
                    return object
                }
            }
            return object
        },
        /**
         * Normalizes subdepartments to department total
         * @param object department
         * @param int day
         */
        normalizeSubdepartmentsToDepartment: function (department, day) {
            let totalDayValue = 0
            const child = department.subdepartments
            const maxChild = this.getMaxChildForDay(child, day)
            for (let j = 0; j < child.length; j++) {
                const object = child[j]
                if (object.department_turnover && (object.department_turnover != 1)) {
                    continue
                }
                totalDayValue += (this.numberFormatter(object.days[day].value)) || 0
            }
            const diff = this.numberFormatter(department.days[day].value) - this.numberFormatter(totalDayValue)
            if (maxChild && diff) {
                maxChild.days[day].value = this.getRoundedValue(this.numberFormatter(maxChild.days[day].value) + diff)
                if (maxChild.subdepartment_type == 'dependent') {
                    this.normalizaSubdepartmentToDependentTotal(day, maxChild)
                }
            }
        },
        /**
         * Normalizes turnover subdepartments to dependent subdepartment total
         * @param int day
         * @param object dependentSubdepartment
         * @param array relatedSubdepartments
         */
        normalizaSubdepartmentToDependentTotal: function (day, dependentSubdepartment, relatedSubdepartments) {
            if (!relatedSubdepartments) {
                relatedSubdepartments = this.getRelatedSubdepartments(this.getRelatedSubdepartments(dependentSubdepartment.relatedSubdepartments))
            }
            let totalDayValue = 0
            const child = relatedSubdepartments
            const maxChild = this.getMaxChildForRelatedSubdepartment(relatedSubdepartments, day)
            for (let j = 0; j < child.length; j++) {
                const object = child[j]
                totalDayValue += (this.numberFormatter(object.days[day].value)) || 0
            }
            const diff = this.numberFormatter(dependentSubdepartment.days[day].value) - this.numberFormatter(totalDayValue)
            if (maxChild && diff) {
                maxChild.days[day].value = this.getRoundedValue(this.numberFormatter(maxChild.days[day].value) + diff)
            }
        },
        /**
         * Returns an array with subdepartments based on given ids
         * @param array relatedIds
         * @returns array
         */
        getRelatedSubdepartments: function (relatedIds) {
            const relatedSubdepartments = []
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                const department = this.forecastData.departments[i]
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    if (!relatedIds[subdepartment.id]) {
                        continue
                    }
                    relatedSubdepartments.push(subdepartment)
                }
            }
            return relatedSubdepartments
        },
        /**
         * Normalizes subdepartments to store total
         * @param int day
         */
        normalizeSubdepartmentsToStore: function (day) {
            let totalDayValue = 0
            const maxChild = this.getMaxSubdepartmentForDay(day)
            const parent = this.forecastData.store
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                const department = this.forecastData.departments[i]
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    if (!this.storeIds[subdepartment.id]) {
                        continue
                    }
                    totalDayValue += (this.numberFormatter(subdepartment.days[day].value)) || 0
                }
            }
            const diff = this.numberFormatter(parent.days[day].value) - this.numberFormatter(totalDayValue)
            if (maxChild && diff) {
                maxChild.days[day].value = this.getRoundedValue(this.numberFormatter(maxChild.days[day].value) + diff)
            }
        },
        /**
         * Put the sum of all child object at the according day in the parent object
         * @param object parentObject
         * @param object dayValues
         * @param int day
         */
        calculateUpBasedOnLayer: function (parentObject, dayValues, day) {
            if ((!parentObject.days) || (!dayValues.length)) {
                return
            }
            for (let i = 0; i < 7; i++) {
                if (($.isNumeric(day)) && (day != i)) {
                    continue
                }
                parentObject.days[i].value = this.getRoundedValue(dayValues[i].value)
            }
        },
        /**
         * Set the percentage of the object based on the value of the parent object
         * @param object object
         */
        calculateBasedOnValue: function (object) {
            for (let i = 0; i < 7; i++) {
                object.days[i].percent = this.getRoundedValue((this.numberFormatter(object.days[i].value) / this.numberFormatter(object.weekly.value) * 100) || 0)
            }
        },
        /**
         * Set the value based on the percentage against the weekly value @todo: change this when percentages get enabled
         * @param object object
         */
        calculateBasedOnPercentage: function (object) {
            for (let i = 0; i < 7; i++) {
                object.days[i].value = this.getRoundedValue((this.numberFormatter(object.days[i].percent) / 100 * this.numberFormatter(object.weekly.value)) || 0)
            }
        },
        /**
         * Calculate the total object value
         * @param object object
         */
        calculateTotalValue: function (object) {
            let totalWeekValue = 0
            for (let i = 0; i < 7; i++) {
                totalWeekValue += (this.numberFormatter(object.days[i].value)) || 0
            }
            object.weekly.value = this.getRoundedValue(totalWeekValue)
        },
        /**
         * Calculate the total object percentage
         * @param object object
         */
        calculateTotalPercentage: function (object) {
            let totalWeekPercentage = 0
            for (let i = 0; i < 7; i++) {
                totalWeekPercentage += (this.numberFormatter(object.days[i].percent)) || 0
            }
            if (totalWeekPercentage) {
                object.weekly.percent = 100
                this.normalizeDailyToWeek(object, 'percent')
            } else {
                object.weekly.percent = 0
            }
        },
        /**
         * Calculates budget data after value changed
         * @param object child
         * @param object parent
         * @param int dayIndex
         */
        calculateBudget: function (child, parent, dayIndex) {
            let totalBudget = 0
            const oldBudget = child.weekly.value
            for (let i = 0, l = child.days.length; i < l; i++) {
                const day = child.days[i]
                totalBudget += this.numberFormatter(day.value)
            }
            child.weekly.value = totalBudget
            this.updatePercent(child.days, totalBudget)
            if (parent != null) {
                parent.days[dayIndex].value += totalBudget - oldBudget
            }
        },
        /**
         * Updates percent data after turnover value is changed
         * @param array days
         * @param float weekTotal
         */
        updatePercent: function (days, weekTotal) {
            for (let i = 0, l = days.length; i < l; i++) {
                days[i].percent = (weekTotal != 0) ? this.getRoundedValue(this.numberFormatter(days[i].value) / this.numberFormatter(weekTotal) * 100) : 0
            }
        },
        /**
         * Calculates the week total after a day value is changed
         * @param object data
         */
        updateWeeklyTotal: function (data) {
            let totalBudget = 0
            for (let i = 0, l = data.days.length; i < l; i++) {
                const day = data.days[i]
                totalBudget += this.numberFormatter((day.value))
            }
            data.weekly.value = totalBudget
        },
        /**
         * Updates driver when day values are changed
         * @param object driver
         * @param int dayIndex
         * @param object subdepartment
         * @param object department
         */
        updateDriverValue: function (driver, dayIndex, subdepartment, department) {
            this.updateWeeklyTotal(driver)
            if ($.inArray(driver.key, this.driverKeys) >= 0) {
                this.updateTurnoverBasedOnDerivedDriver(subdepartment, department, dayIndex, driver.key, driver.derivedKey, null)
            }
        },
        /**
         * Updates turnover when a derived driver value is changed
         * @param object subdepartment
         * @param object department
         * @param int dayIndex
         * @param string key
         * @param string derivedKey
         * @param int id
         */
        updateTurnoverBasedOnDerivedDriver: function (subdepartment, dayIndex, key, derivedKey, id) {
            const customer = this.getDriver(subdepartment, key)
            const average = this.getDriver(subdepartment, derivedKey)
            if (!average) {
                return false
            }
            // if exact value is not defined use the rounded value
            if (typeof average.days[dayIndex].exactValue === 'undefined') {
                average.days[dayIndex].exactValue = average.days[dayIndex].value
            }
            if ((customer.icon == 'lock' && customer.days[dayIndex].value == 0) ||
                (average.icon == 'lock' && average.days[dayIndex].exactValue == 0)
            ) {
                return false
            }
            // if driver was updated at this point use it's adjusted value
            if (id && id == subdepartment.id) {
                average.days[dayIndex].exactValue = average.days[dayIndex].value
            }
            const value = this.numberFormatter(customer.days[dayIndex].value) * this.numberFormatter(average.days[dayIndex].exactValue)
            if (parseInt(value, 10) != parseInt(this.numberFormatter(subdepartment.days[dayIndex].value), 10)) {
                subdepartment.days[dayIndex].value = this.getRoundedValue(value)
                return true
            }
            return false
        },
        /**
         * Updates subdepartment driver when turnover is changed
         * @param object subdepartment
         * @param int dayIndex
         * @param string key
         * @param string derivedKey
         */
        updateDriverBasedOnTurnover: function (subdepartment, dayIndex, key, derivedKey) {
            const customer = this.getDriver(subdepartment, key)
            const average = this.getDriver(subdepartment, derivedKey)
            if (!average) {
                return false
            }
            if ((customer.icon == 'lock' && customer.days[dayIndex].value == 0) ||
                (average.icon == 'lock' && average.days[dayIndex].value == 0)
            ) {
                return false
            }
            let value = 0
            for (let i = 0, j = subdepartment.drivers.length; i < j; i++) {
                const driver = subdepartment.drivers[i]
                if ((driver.key == key) && (driver.icon != 'lock')) {
                    value = (average.days[dayIndex].value != 0) ? this.numberFormatter(subdepartment.days[dayIndex].value) / this.numberFormatter(average.days[dayIndex].exactValue) : 0
                    driver.days[dayIndex].value = this.getRoundedValue(value)
                }
                if ((driver.key == derivedKey) && (driver.icon != 'lock')) {
                    value = (customer.days[dayIndex].value != 0) ? this.numberFormatter(subdepartment.days[dayIndex].value) / this.numberFormatter(customer.days[dayIndex].value) : 0
                    driver.days[dayIndex].value = this.getRoundedValue(value)
                }
            }
        },
        /**
         * Creates and updates derived driver values
         * @param object data
         */
        updateDefaultDrivers: function (data) {
            for (let i = 0, l = data.departments.length; i < l; i++) {
                const department = data.departments[i]
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    const averageCustomersDriver = this.getDriver(subdepartment, 'average_customer_spending')
                    const customersDriver = this.getDriver(subdepartment, 'customers')
                    const averageItemsDriver = this.getDriver(subdepartment, 'average_item_value')
                    const itemsDriver = this.getDriver(subdepartment, 'items_out')
                    if (customersDriver && averageCustomersDriver) {
                        this.updateDerivedDriver(subdepartment, department.id, customersDriver, 'average_customer_spending', 'customers')
                    } else if (averageCustomersDriver) {
                        this.deleteDriverWithKey(subdepartment, 'average_customer_spending')
                    }
                    if (itemsDriver && averageItemsDriver) {
                        this.updateDerivedDriver(subdepartment, department.id, itemsDriver, 'average_item_value', 'items_out')
                    } else if (averageItemsDriver) {
                        this.deleteDriverWithKey(subdepartment, 'average_item_value')
                    }
                }
            }
        },
        /**
         * Update turnover ratio based on pos days and parent data
         * @param object data
         */
        updateRatio: function (data) {
            for (let i = 0, l = data.departments.length; i < l; i++) {
                const department = data.departments[i]
                this.addPercentWithoutPos(department)
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    this.calculateRatio(subdepartment, data.departments[i])
                    this.addPercentWithoutPos(subdepartment)
                    for (let m = 0, n = subdepartment.drivers.length; m < n; m++) {
                        const driver = subdepartment.drivers[m]
                        this.addPercentWithoutPos(driver)
                    }
                }
                this.calculateRatio(data.departments[i], data.store)
            }
            this.addPercentWithoutPos(data.store)
        },
        /**
         * Update turnover ratio based on store total
         * @param object data
         */
        updateSubdepartmentsRatioStore: function (data) {
            for (let i = 0, l = data.departments.length; i < l; i++) {
                const department = data.departments[i]
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    this.calculateSubdepartmentRatio(subdepartment, data.departments[i])
                    if (subdepartment.subdepartment_type == 'dependent') {
                        this.calculateSubdepartmentRatioToDependent(subdepartment)
                    }
                }
            }
        },
        /**
         * Calculates ratio of turnover subdepartment to the related dependent subdepartment
         * @param object dependentSubdepartment
         */
        calculateSubdepartmentRatioToDependent: function (dependentSubdepartment) {
            const relatedSubdepartments = this.getRelatedSubdepartments(dependentSubdepartment.relatedSubdepartments)
            if (!dependentSubdepartment.days) {
                return false
            }
            for (let j = 0; j < relatedSubdepartments.length; j++) {
                const subdepartment = relatedSubdepartments[j]
                for (let i = 0; i < 7; i++) {
                    const nrDep = this.getNrEmptyRelatedSubdepartmentsForDay(relatedSubdepartments, i)
                    if (!subdepartment.days[i].ratioToDependent) {
                        subdepartment.days[i].ratioToDependent = {}
                    }
                    if (!this.numberFormatter(dependentSubdepartment.days[i].value)) {
                        subdepartment.days[i].ratioToDependent[dependentSubdepartment.id] = 100 / relatedSubdepartments.length
                        continue
                    }
                    if (!nrDep) {
                        subdepartment.days[i].ratioToDependent[dependentSubdepartment.id] = (dependentSubdepartment.days[i].value != 0) ? ((this.numberFormatter(subdepartment.days[i].value) / this.numberFormatter(dependentSubdepartment.days[i].value) * 100) || 0) : 0
                    } else {
                        subdepartment.days[i].ratioToDependent[dependentSubdepartment.id] = 100 / nrDep
                    }
                }
            }
        },
        /**
         * Sets the ratio based on the parent values
         * @param object object
         * @param object parentObject
         */
        calculateRatio: function (object, parentObject) {
            if (object.days && parentObject.days) {
                for (let i = 0; i < 7; i++) {
                    const nrDep = this.getNrEmptyChildrenIfAllEmptyForDay(parentObject, i)
                    if (!parentObject.days[i].ratio) {
                        parentObject.days[i].ratio = {}
                    }
                    if (!this.numberFormatter(parentObject.days[i].value)) {
                        const dep = this.getNrChildrenForDay(parentObject)
                        parentObject.days[i].ratio[object.id] = 100 / dep
                        continue
                    }
                    if (!nrDep) {
                        parentObject.days[i].ratio[object.id] = (parentObject.days[i].value != 0) ? ((this.numberFormatter(object.days[i].value) / this.numberFormatter(parentObject.days[i].value) * 100) || 0) : 0
                    } else {
                        parentObject.days[i].ratio[object.id] = 100 / nrDep
                    }
                }
            }
        },
        /**
         * Calculates subdepartment ratio to store
         * @param object object
         * @param object parentObject
         */
        calculateSubdepartmentRatio: function (object, parentObject) {
            if (object.days && parentObject.days) {
                for (let i = 0; i < 7; i++) {
                    const nrDep = this.getNrEmptySubdepartmentsIfAllEmptyForDay(i)
                    if (!parentObject.days[i].ratioToStore) {
                        parentObject.days[i].ratioToStore = {}
                    }
                    if (!this.numberFormatter(this.forecastData.store.days[i].value)) {
                        const dep = this.getNrOfSubdepartmentsForDay()
                        parentObject.days[i].ratioToStore[object.id] = 100 / dep
                        continue
                    }
                    if (!nrDep) {
                        parentObject.days[i].ratioToStore[object.id] = (parentObject.days[i].ratio[object.id] * this.forecastData.store.days[i].ratio[parentObject.id]) / 100
                    } else {
                        parentObject.days[i].ratioToStore[object.id] = 100 / nrDep
                    }
                }
            }
        },
        /**
         * Sets daily percentages without pos days
         * @param object object
         */
        addPercentWithoutPos: function (object) {
            const weekly = this.getWeeklyWithoutPos(object)
            const days = this.getNumberOfDaysIfAllEmpty(object)
            const allDays = this.getNumberOfDays(object)
            for (let i = 0; i < 7; i++) {
                if (!this.isDayEditable(object, i)) {
                    continue
                }
                if (!this.numberFormatter(object.weekly.value)) {
                    object.days[i].posPercent = 100 / allDays
                    continue
                }
                if (!days) {
                    object.days[i].posPercent = (weekly != 0) ? ((this.numberFormatter(object.days[i].value) / weekly * 100) || 0) : 0
                } else {
                    object.days[i].posPercent = 100 / days
                }
            }
        },
        /**
         * Checks if all days have emty turnovers and returns the number of
         * days without pos processed
         * @param object object
         */
        getNumberOfDaysIfAllEmpty: function (object) {
            let nrDays = 0
            let allEmpty = true
            for (let i = 0; i < 7; i++) {
                if (!this.isDayEditable(object, i)) {
                    continue
                }
                nrDays++
                if (this.numberFormatter(object.days[i].value) != 0) {
                    allEmpty = false
                }
            }
            if (allEmpty) {
                return nrDays
            }
            return false
        },
        /**
         * Returns the number of days without pos processed
         * @param object object
         */
        getNumberOfDays: function (object) {
            let nrDays = 0
            for (let i = 0; i < 7; i++) {
                if (!this.isDayEditable(object, i)) {
                    continue
                }
                nrDays++
            }
            return nrDays
        },
        /**
         * Checks if all children are empty for a specific day
         * @param object parentObject
         * @param int day
         */
        getNrEmptyChildrenIfAllEmptyForDay: function (parentObject, day) {
            let data = []
            let allEmpty = true
            let nrDep = 0
            if (parentObject.departments) {
                data = parentObject.departments
            } else if (parentObject.subdepartments) {
                data = parentObject.subdepartments
            } else if (!parentObject.id) {
                data = this.forecastData.departments
            } else {
                return false
            }
            for (let j = 0; j < data.length; j++) {
                const object = data[j]
                if (object.department_turnover && (object.department_turnover != 1)) {
                    continue
                }
                if (this.numberFormatter(object.days[day].value) != 0) {
                    allEmpty = false
                }
                nrDep++
            }
            if (allEmpty) {
                return nrDep
            }
            return false
        },
        /**
         * Returns the number of children
         * @param object parentObject
         * @param int day
         */
        getNrChildrenForDay: function (parentObject) {
            let data = []
            let nrDep = 0
            if (parentObject.departments) {
                data = parentObject.departments
            } else if (parentObject.subdepartments) {
                data = parentObject.subdepartments
            } else if (!parentObject.id) {
                data = this.forecastData.departments
            } else {
                return false
            }
            for (let j = 0; j < data.length; j++) {
                const object = data[j]
                if (object.department_turnover && (object.department_turnover != 1)) {
                    continue
                }
                nrDep++
            }
            return nrDep
        },
        /**
         * Checks if all subdepartments are empty for a specific day
         * @param int day
         */
        getNrEmptySubdepartmentsIfAllEmptyForDay: function (day) {
            const data = this.forecastData.departments
            let allEmpty = true
            let nrDep = 0
            for (let i = 0, l = data.length; i < l; i++) {
                const department = data[i]
                if (!this.isDayEditable(department, day)) {
                    continue
                }
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    if (subdepartment.store_turnover && (subdepartment.store_turnover != 1)) {
                        continue
                    }
                    if (this.numberFormatter(subdepartment.days[day].value) != 0) {
                        allEmpty = false
                    }
                    nrDep++
                }
            }
            if (allEmpty) {
                return nrDep
            }
            return false
        },
        /**
         * Returns the number of subdepartments for day
         */
        getNrOfSubdepartmentsForDay: function () {
            const data = this.forecastData.departments
            let nrDep = 0
            for (let i = 0, l = data.length; i < l; i++) {
                const department = data[i]
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    if (subdepartment.store_turnover && (subdepartment.store_turnover != 1)) {
                        continue
                    }
                    nrDep++
                }
            }
            return nrDep
        },
        /**
         * Checks if all related subdepartments are empty for a specific day
         * @param object parentObject
         * @param int day
         */
        getNrEmptyRelatedSubdepartmentsForDay: function (relatedSubdepartments, day) {
            let allEmpty = true
            let nrDep = 0
            for (let j = 0; j < relatedSubdepartments.length; j++) {
                const subdepartment = relatedSubdepartments[j]
                if (this.numberFormatter(subdepartment.days[day].value) != 0) {
                    allEmpty = false
                }
                nrDep++
            }
            if (allEmpty) {
                return nrDep
            }
            return false
        },
        /**
         * Updates turnover based on weekly values
         * @param object data
         * @param int layer
         */
        updateFromWeekly: function (data, layer) {
            for (let i = 0, l = data.departments.length; i < l; i++) {
                const department = data.departments[i]
                if (layer == 1) {
                    this.updateDailyFromWeekly(department)
                    this.normalizeDailyToWeek(department)
                }
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    if (layer == 2) {
                        this.updateDailyFromWeekly(subdepartment)
                        this.normalizeDailyToWeek(subdepartment)
                    }
                    for (let m = 0, n = subdepartment.drivers.length; m < n; m++) {
                        const driver = subdepartment.drivers[m]
                        if (layer == 3) {
                            this.updateDailyFromWeekly(driver)
                            this.normalizeDailyToWeek(driver)
                        }
                    }
                }
            }
            if (layer == 0) {
                this.updateDailyFromWeekly(data.store)
                this.normalizeDailyToWeek(data.store)
            }
        },
        /**
         * Sets the ratio based on the parent values
         * @param object object
         */
        updateDailyFromWeekly: function (object) {
            let weekly = this.getWeeklyWithoutPos(object)
            const maxPos = this.getTurnoverProcessedDays(object)
            weekly = this.numberFormatter(object.weekly.value) - this.numberFormatter(maxPos)
            for (let i = 0; i < 7; i++) {
                if (!this.isDayEditable(object, i)) {
                    continue
                }
                const day = (weekly * this.numberFormatter(object.days[i].posPercent) / 100) || 0
                object.days[i].value = this.getRoundedValue(day)
            }
        },
        /**
         * Normalizes daily values to week total, due to roundings
         * @param object object
         * @param string type
         */
        normalizeDailyToWeek: function (object, type) {
            const maxPos = this.getMaxUnProcessedDays(object.days)
            if (!type) {
                type = 'value'
            }
            let totalWeekValue = 0
            for (let i = 0; i < 7; i++) {
                totalWeekValue += (this.numberFormatter(object.days[i][type])) || 0
            }
            const total = this.numberFormatter(object.weekly[type])
            const diff = this.numberFormatter(total) - this.numberFormatter(totalWeekValue)
            if (maxPos && diff) { maxPos[type] = this.getRoundedValue(this.numberFormatter(maxPos[type]) + diff) }
        },
        /**
         * Gets the weekly total without pos
         * @param object object
         * @param string type
         */
        getWeeklyWithoutPos: function (object, type) {
            let total = 0
            if (!type) {
                type = 'value'
            }
            for (let i = 0; i < 7; i++) {
                if (!this.isDayEditable(object, i)) {
                    total += this.numberFormatter(object.days[i][type])
                }
            }
            const weekly = this.numberFormatter(object.weekly[type]) - total
            return weekly
        },
        /**
         * Gets the turnver from processed days
         * @param object object
         */
        getTurnoverProcessedDays: function (object) {
            let value = 0
            for (let i = 0; i < 7; i++) {
                if (this.isDayEditable(object, i)) {
                    continue
                }
                value += this.numberFormatter(object.days[i].value)
            }
            return value
        },
        /**
         * Gets the max turnver from processed days
         * @param object object
         */
        getMaxUnProcessedDays: function (days) {
            let max = null
            for (let i = 0; i < 7; i++) {
                if (!days[i].editable) {
                    continue
                }
                if (!max) {
                    max = days[i]
                    continue
                }
                if (this.numberFormatter(max.value) < this.numberFormatter(days[i].value)) {
                    max = days[i]
                }
            }
            return max
        },
        /**
         * Gets child with max turnover value for day
         * @param object object
         * @param int day
         */
        getMaxChildForDay: function (child, day) {
            let max = null
            for (let j = 0; j < child.length; j++) {
                const object = child[j]
                // if object is not editable skip it
                if (!this.isDayEditable(object, day)) {
                    continue
                }
                if (object.department_turnover && (object.department_turnover != 1)) {
                    continue
                }
                if (!max) {
                    max = object
                    continue
                }
                if (this.numberFormatter(max.days[day].value) < this.numberFormatter(object.days[day].value)) {
                    max = object
                }
            }
            return max
        },
        /**
         * Gets subdepartment with max value from related subdepartments
         * @param object object
         * @param int day
         */
        getMaxChildForRelatedSubdepartment: function (child, day) {
            let max = null
            for (let j = 0; j < child.length; j++) {
                const object = child[j]
                if (!this.isDayEditable(object, day)) {
                    continue
                }
                if (!max) {
                    max = object
                    continue
                }
                if (this.numberFormatter(max.days[day].value) < this.numberFormatter(object.days[day].value)) {
                    max = object
                }
            }
            return max
        },
        /**
         * Gets the subdepartment with max turnover value for day
         * @param object object
         * @param int day
         */
        getMaxSubdepartmentForDay: function (day) {
            let max = null
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                const department = this.forecastData.departments[i]
                if (!this.isDayEditable(department, day)) {
                    continue
                }
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    if (!this.storeIds[subdepartment.id]) {
                        continue
                    }
                    if (!max) {
                        max = subdepartment
                        continue
                    }
                    if (this.numberFormatter(max.days[day].value) < this.numberFormatter(subdepartment.days[day].value)) {
                        max = subdepartment
                    }
                }
            }
            return max
        },
        /**
         * Calculates derived subdepartment driver values
         * @param object subdepartment
         * @param int departmentId
         * @param object driver
         * @param string key
         * @param string derivedKey
         */
        updateDerivedDriver: function (subdepartment, departmentId, driver, key, derivedKey) {
            const dataDriver = this.getDriver(subdepartment, key)
            let weekly = 0
            dataDriver.derivedKey = derivedKey
            const driverIconKey = 'icon_' + derivedKey + '_' + departmentId + '_' + subdepartment.id
            driver.derivedKey = key
            dataDriver.weekly.value = 0
            for (let i = 0, j = driver.days.length; i < j; i++) {
                let value = dataDriver.days[i].value
                // if the driver value is 0 and subdepartment value is not 0 do not recalculate average
                // because will be just set to 0 and user input will be lost
                // in this case we will just leave the user input value
                if (!(driver.days[i].value == 0 && subdepartment.days[i].value != 0)) {
                    value = (driver.days[i].value != 0) ? this.numberFormatter(subdepartment.days[i].value) / this.numberFormatter(driver.days[i].value) : 0
                }
                dataDriver.days[i].value = this.getRoundedValue(value)
                dataDriver.days[i].exactValue = value
                weekly += this.numberFormatter(value)
            }
            const derivedDriver = this.getDriver(subdepartment, derivedKey)
            // in case driver value is 0, just use the calculated sum above, doing the average from turnover will just result into 0
            weekly = (derivedDriver.weekly.value != 0) ? subdepartment.weekly.value / derivedDriver.weekly.value : weekly
            dataDriver.weekly.value = this.getRoundedValue(weekly)
            dataDriver.weekly.exactValue = weekly
        },
        /**
         * Checks how the inputs were updated
         */
        checkChangedInputs: function () {
            for (let i = 0, l = this.forecastData.departments.length; i < l; i++) {
                const department = this.forecastData.departments[i]
                const backupDepartment = this.backupTurnover.departments[i]
                this.checkUpdatedWeeklyInputs(department, backupDepartment)
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    const backupSubdepartment = backupDepartment.subdepartments[j]
                    this.checkUpdatedWeeklyInputs(subdepartment, backupSubdepartment)
                    for (let m = 0, n = subdepartment.drivers.length; m < n; m++) {
                        const driver = subdepartment.drivers[m]
                        const backupDriver = backupSubdepartment.drivers[m]
                        this.checkUpdatedWeeklyInputs(driver, backupDriver)
                    }
                }
            }
            this.checkUpdatedWeeklyInputs(this.forecastData.store, this.backupTurnover.store)
        },
        /**
         * Checks the values with which the inputs over a week were updated
         * @param object data
         * @param object backup
         */
        checkUpdatedWeeklyInputs: function (data, backup) {
            for (let i = 0; i < 7; i++) {
                const dif = this.numberFormatter(data.days[i].value) - this.numberFormatter(backup.days[i].value)
                this.setInputDifference(dif, data.days[i])
            }
            const dif = this.numberFormatter(data.weekly.value) - this.numberFormatter(backup.weekly.value)
            this.setInputDifference(dif, data.weekly)
        },
        displayEuroSign: function (name) {
            if (this.driverWithEuro[name]) {
                return true
            }
            return false
        },
        /**
         * Sets input difference
         * @param float dif
         * @param object input
         */
        setInputDifference: function (dif, input) {
            if (Math.abs(dif) > 0) {
                input.changed = {
                    value: this.getRoundedValue(dif),
                    inputClass: (dif > 0) ? 'updateUp' : 'updateDown',
                }
            }
        },
        updateInputandParent: function (elem, parent, roundedTurnover, turnover) {
            if (elem.is('input')) {
                elem.val(roundedTurnover)
            } else {
                elem.html(roundedTurnover)
            }
            if (parent) {
                parent.attr('title', turnover)
            }
        },
        /**
        * Get department_id from element id
        * @param elementId
        * @param elementPrefix
        * @return
        */
        getDepartmentIdFromElementId: function (elementId, elementPrefix) {
            let departmentId = elementId.replace(elementPrefix, '')
            departmentId = parseInt(departmentId, 10)
            if (isNaN(departmentId)) {
                departmentId = 0
            }
            return departmentId
        },
        /**
        * Filters forecast data object, to send only the required information
        * @param object forecastData
        * @returns object
        */
        filterForecastDataForSave: function (forecastData) {
            const result = {
                departments: {},
            }
            for (let i = 0, l = forecastData.departments.length; i < l; i++) {
                const department = forecastData.departments[i]
                result.departments[department.id] = {}
                if (typeof result.departments[department.id].subdepartments === 'undefined') {
                    result.departments[department.id].subdepartments = {}
                }
                for (let j = 0, k = department.subdepartments.length; j < k; j++) {
                    const subdepartment = department.subdepartments[j]
                    if (typeof result.departments[department.id].subdepartments[subdepartment.subdepartment_type] === 'undefined') {
                        result.departments[department.id].subdepartments[subdepartment.subdepartment_type] = {}
                    }
                    result.departments[department.id].subdepartments[subdepartment.subdepartment_type][subdepartment.id] = this.getAbsoluteTurnovers(subdepartment)
                    const drivers = {}
                    for (let m = 0, n = subdepartment.drivers.length; m < n; m++) {
                        const driver = subdepartment.drivers[m]
                        drivers[driver.key] = this.getAbsoluteTurnovers(driver)
                    }
                    if (subdepartment.drivers.length) { result.departments[department.id].subdepartments[subdepartment.subdepartment_type][subdepartment.id].drivers = drivers }
                }
            }
            return result
        },
        /**
         * Returns absolute turnover values from object
         * @param object data
         * @returns object
         */
        getAbsoluteTurnovers: function (data) {
            const newData = {
                daily: [],
                weekly: '',
            }
            for (let k = 0; k < data.days.length; k++) {
                newData.daily[k] = data.days[k].value
            }
            newData.weekly = data.weekly.value
            return newData
        },
        /**
         * Calculates the rounded value of a given number
         * @param float value
         * @returns float
         */
        getRoundedValue (value) {
            const rounded = Math.round(value * 100) / 100
            return rounded
        },
        numberFormat  (number, decimals, decPoint, thousandSep) {
            number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
            const n = !isFinite(+number) ? 0 : +number
            const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
            const sep = (typeof thousandSep === 'undefined') ? ',' : thousandSep
            const dec = (typeof decPoint === 'undefined') ? '.' : decPoint
            let s = ''
            const toFixedFix = function (n, prec) {
                const k = Math.pow(10, prec)
                return '' + Math.round(n * k) / k
            }
            s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
            }
            if ((s[1] || '').length < prec) {
                s[1] = s[1] || ''
                s[1] += new Array(prec - s[1].length + 1).join('0')
            }
            return s.join(dec)
        },
    },
}
