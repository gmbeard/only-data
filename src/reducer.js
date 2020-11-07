function createReducer(option) {

    /* Use an "identity" reducer if one wasn't 
     * provided by the caller...
     */
    option = option || ((key, value) => value);

    /* The caller can provide an array of property
     * names to include (if `data` is an object)...
     */
    if (Array.isArray(option)) {
        const include = option;
        option = (key, value) => {
            if (key !== "" && include.indexOf(key) < 0)
                return;

            return value;
        };
    }

    return option;
}

module.exports = createReducer;
