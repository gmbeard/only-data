*Only Data* will strip input down to just its data properties, removing "non-data" types such as functions and symbols. It works on primitive types, objects, arrays of objects, and nested graphs of objects. This can be useful as a pre-serialize step when returning JSON from a webservice, for example.

## Signature

    onlyData(input[, options])

    Parameters:
        input: Primitive | Object | Array<Any>
        options: Object | Array<String> | Function

    Returns:
        Primitive | Object | Array<Any>


## Usage

    const { onlyData } = require("only-data");

    const input = {
        name: "object",
        value: 42,
        invoke: function() { ... }
    };

    const data = onlyData(input);

    // data: { name: "object", value: 42 }

## Options
If `options` is a `Array<String>` then only properties matching these values will be included in the output.

If `options` is a `Function` then the function will be used as the reducer. See the *Custom Reducer* section.

If `options` is an object, it can contain the following settings...

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>`reducer`</td>
        <td>`Function | [ String ]`</td>
        <td></td>
        <td>A caller provided *Reducer* to use on object types. If set to an array of property names then only these properties will be included in the output. If a function is provided then it will be used to determine which properties are included. see the *Custom Reducer* section.</td>
    </tr>
    <tr>
        <td>`errorOnCircularReference`</td>
        <td>`Boolean`</td>
        <td>`true`</td>
        <td>If `true` an error will be throw when a circular reference is encountered. If `false` then `{ }` will be returned for any circular references</td>
    </tr>
    <tr>
        <td>`indicateCircularWarnings`</td>
        <td>`Boolean`</td>
        <td>`false`</td>
        <td>If `true`, circular references will be replaced by `{ __circular: true }`. If `false` then the behaviour falls back to the behaviour of the `errorOnCircularReference` option</td>
    </tr>
    <tr>
        <td>`disableCircularReferenceProtection`</td>
        <td>`Boolean`</td>
        <td>`false`</td>
        <td>If you're sure that the input contains no circular references then setting this option to `true` will potentially increase performance. **A stack overflow will occur if the input contains any circular references**</td>
    </tr>
</table>

## Circular Reference Behaviour
By default, *Only Data* will throw an error whenever it encounters a circular reference. This will prevent stack overflows. However, you can disable this behaviour with the `errorOnCircularReference: false` option. This will prevent *Only Data* from descending any deeper into the object graph when a circular reference is encountered, instead replacing the offending object with `{ }`.

    const a = { name: "A" };
    const b = { name: "B", val: a };
    a.val = b; // This closes the loop and causes a circular reference

    const data = onlyData(a, { errorOnCircularReference: false });

    // data: {
    //   name: "A",
    //   val: {
    //     name: "B",
    //     val: { }
    //   }
    // }

## Custom Reducer
A custom reduction function has the signature `(key: String, value: Any) -> Any`. It will be called for each property of an object that needs to be reduced. Returning `undefined` from the custom reducer will cause the property to be ignored in the output.

    function customReducer(key, value) {
        if (key === "propertyToIgnore")
            return;

        return value;
    }

    const data = onlyData(input, customReducer);
