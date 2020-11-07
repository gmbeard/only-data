const reducer = require("./safe-reducer");
const constants = require("./constants");

function onlyData(data, options, recursiveCall) {

    let reduce = options;
    if (!recursiveCall) {
        reduce = reducer(options);
    }

    /* Ignore any non-data properties...
     */
    if (typeof data === "undefined"
        || typeof data === "function"
        || typeof data === "symbol")
        return;

    /* These types can't be reduced any further...
     */
    if (typeof data === "string"
        || typeof data === "number"
        || typeof data === "boolean")
        return data;

    /* Recursively convert any array items...
     */
    if (Array.isArray(data))
        return data.map((item) => onlyData(item, reduce, true));

    /* At this stage, we're assuming `data` is an object
     */

    /* Use a user provided `onlyData()` member function if
     * provided by `data`...
     */
    if (typeof data.onlyData === "function")
        return data.onlyData();

    /* Ignore this object completely if the reducer
     * returns a falsy value from the "begin" stage...
     */
    const shouldProcess = reduce.bind(data)("", data, constants.BEGIN_STAGE);

    let view;
    if (shouldProcess) {
        view = Object.keys(data).reduce(
            (acc, key) => {
                let inner = reduce.bind(data)(key, data[key]);

                inner = onlyData(inner, reduce, true);
                if (typeof inner !== "undefined")
                    acc[key] = inner;

                return acc;
            },
            { }
        );
    }

    /* Inform the reducer that we've finished this
     * particular object...
     */
    reduce.bind(data)("", data, constants.END_STAGE);

    return view;
}

module.exports = {
    constants,
    onlyData,
};
