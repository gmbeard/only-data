## Only Data
*Only Data* will strip input down to just its data properties, removing "non-data" types such as functions and symbols. It works on primitive types, objects, arrays of objects, and nested graphs of objects. 

**Features:**

- Circular reference protection is provided by either throwing (the default), or removing them. 
- Ability to use a user-provided "reduction" function, allowing fine-grained control over the output.

### Signature

    onlyData(input[, options])

    Parameters:
        input: Primitive | Object | Array<Any>
        options: Object | Array<String> | Function

    Returns:
        Primitive | Object | Array<Any>


### Usage

    const { onlyData } = require("only-data");

    const input = {
        name: "object",
        value: 42,
        invoke: function() { ... }
    };

    const data = onlyData(input);

    // data: { name: "object", value: 42 }

### Options
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
        <td><code>reducer</code></td>
        <td><code>Function | Array&lt;String&gt;</code></td>
        <td></td>
        <td>A caller provided <em>Reducer</em> to use on object types. If set to an array of property names then only these properties will be included in the output. If a function is provided then it will be used to determine which properties are included. see the <em>Custom Reducer</em> section.</td>
    </tr>
    <tr>
        <td><code>errorOnCircularReference</code></td>
        <td><code>Boolean</code></td>
        <td><code>true</code></td>
        <td>If <code>true</code> an error will be throw when a circular reference is encountered. If <code>false</code> then <code>{ }</code> will be returned for any circular references</td>
    </tr>
    <tr>
        <td><code>indicateCircularWarnings</code></td>
        <td><code>Boolean</code></td>
        <td><code>false</code></td>
        <td>If <code>true</code>, circular references will be replaced by <code>{ __circular: true }</code>. If <code>false</code> then the behaviour falls back to the behaviour of the <code>errorOnCircularReference</code> option</td>
    </tr>
    <tr>
        <td><code>disableCircularReferenceProtection</code></td>
        <td><code>Boolean</code></td>
        <td><code>false</code></td>
        <td>If you're sure that the input contains no circular references then setting this option to <code>true</code> will potentially increase performance. <strong>A stack overflow will occur if the input contains any circular references</strong></td>
    </tr>
    <tr>
        <td><code>circularReferences</code></td>
        <td><code>String</code></td>
        <td></td>
        <td>Can be one of <code>empty</code>, <code>error</code>, <code>indicate</code>, or <code>remove</code>. Controls how circular references are handled. See <em>Circular Reference Behaviour</em> section.</td>
    </tr>
</table>

### Circular Reference Behaviour
By default, *Only Data* will throw an error whenever it encounters a circular reference. This will prevent costly stack overflows. You can control this behaviour using the `circularReferences` option.

`circularReferences: "empty"`: Circular reference objects will be replaced with an empty object (`{ }`)

    const a = { name: "A" };
    const b = { name: "B", val: a };
    a.val = b; // This closes the loop and causes a circular reference

    const data = onlyData(a, { circularReferences: "empty" });

    // data: {
    //   name: "A",
    //   val: {
    //     name: "B",
    //     val: { }
    //   }
    // }

`circularReferences: "error"`: An error will be thrown when a circular reference is detected. This is the default behaviour.

`circularReferences: "indicate"`: Indicates circular references in the output by offending objects with `{ __circular: true }`.

    const a = { name: "A" };
    const b = { name: "B", val: a };
    a.val = b; // This closes the loop and causes a circular reference

    const data = onlyData(a, { circularReferences: "remove" });

    // data: {
    //   name: "A",
    //   val: {
    //     name: "B",
    //     val: { __circular: true }
    //   }
    // }

`circularReferences: "remove"`: Removes circular reference objects from the graph altogether.

    const a = { name: "A" };
    const b = { name: "B", val: a };
    a.val = b; // This closes the loop and causes a circular reference

    const data = onlyData(a, { circularReferences: "remove" });

    // data: {
    //   name: "A",
    //   val: {
    //     name: "B",
    //   }
    // }

### Custom Reducer
A custom reduction function has the signature `(key: String, value: Any) -> Any`. It will be called for each property of an object that needs to be reduced. Returning `undefined` from the custom reducer will cause the property to be ignored in the output.

    function customReducer(key, value) {
        if (key === "propertyToIgnore")
            return;

        return value;
    }

    const data = onlyData(input, customReducer);
