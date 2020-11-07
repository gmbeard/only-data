const constants = require("./constants");
const createReducer = require("./reducer");

class CircularReferenceError extends Error { 
    constructor() {
        super("Circular reference detected");
    }
}

function safeReduce(options) {
    let stack = [];

    options = options || { };
    if (typeof options === "function" || Array.isArray(options))
        options = { reducer: createReducer(options) };

    if (Array.isArray(options.reducer))
        options.reducer = createReducer(options.reducer);

    return function(key, value, stage) {
        if (stage === constants.BEGIN_STAGE)
            stack.push(this);
        else if (stage === constants.END_STAGE)
            stack = stack.slice(0, stack.indexOf(this));

        if (key !== "" && stack.indexOf(value) >= 0) {
            if (options.indicateCircularWarnings)
                return { __circular: true };
            else if(options.errorOnCircularReference)
                throw new CircularReferenceError();
            else
                return { };
        }

        if (options.reducer)
            return options.reducer.bind(this)(key, value, stage);

        return value;
    };
}

module.exports = {
    safeReduce,
};
