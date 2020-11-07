const { onlyData } = require("../src/index");

describe("onlyData", function() {
    it("should convert simple types", function() {

        const str = "Hello, World!";
        let result = onlyData(str);

        expect(result).toBe(str);

        const num = 42;
        result = onlyData(num);

        expect(result).toBe(num);
    });

    it("should convert arrays", function() {

        const array = [42, "Hello, World!"];

        const result = onlyData(array);

        expect(result).toEqual(array);
    });

    it("should exclude non-data types (functions, etc.)", function() {
        
        const obj = {
            name: "obj",
            value: 42,
            invoke() {

            }
        };

        const result = onlyData(obj);
        expect(Object.keys(result)).toEqual(["name", "value"]);
        expect(result).toEqual({ name: "obj", value: 42 });
    });

    it("should throw on circular reference by default", function() {
        
        const a = { name: "A" };
        const b = { name: "B", val: a };

        a.val = b;

        expect(() => onlyData(a)).toThrow();
    });
});
