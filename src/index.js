const { safeReduce } = require("./safe-reducer");
const constants = require("./constants");
const createReducer = require("./reducer");

function onlyData(data, options) {

    /* TODO(GB):
     * This should all be the job of `createReducer`...
     */
    let reducer;
    if (!options || typeof options === "function" || Array.isArray(options)) {
        reducer = safeReduce({
            reducer: createReducer(options),
            errorOnCircularReference: true,
        });
    }
    else {
        options = options || { };
        if (options.disableCircularReferenceProtection)
            reducer = createReducer(options.reducer);
        else
            reducer = safeReduce(options);
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
        return data.map((item) => onlyData(item, reducer));

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
    const shouldProcess = reducer.bind(data)("", data, constants.BEGIN_STAGE);

    let view;
    if (shouldProcess) {
        view = Object.keys(data).reduce(
            (acc, key) => {
                let inner = reducer.bind(data)(key, data[key]);

                inner = onlyData(inner, reducer);
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
    reducer.bind(data)("", data, constants.END_STAGE);

    return view;
}

module.exports = {
    constants,
    onlyData,
};
