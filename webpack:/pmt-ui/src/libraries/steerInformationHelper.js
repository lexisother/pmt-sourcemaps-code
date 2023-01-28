const getFormattedNumber = function (value) {
    if (typeof value === 'undefined' || isNaN(value)) return
    return Number(value).toFixed(2)
}
// const groupBy = (collection, group) => {
//     return collection.reduce((prev, next) => {
//         return ((prev[group(next)] ||= []).push(next), prev)
//     }, {})
// }
const groupBy = (collection, group) => {
    return collection.reduce((prev, next) => {
        var _group;
        return (prev[_group = group(next)] || (prev[_group] = [])).push(next), prev;
    }, {});
};

export { getFormattedNumber, groupBy }
