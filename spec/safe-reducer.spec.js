const { onlyData } = require("../src/index");

let input;
beforeEach(() => {

    const parent = {
        name: "parent",
    };

    const leaf = {
        name: "leaf",
        parent,
    };

    const children = [
        { name: "child1", leaf },
        { name: "child2", leaf },
        { name: "child3", leaf },
    ];

    parent.children = children;

    input = parent;
});

describe("safeReduce", function() {
    it("should prevent circular references", function() {

        const result = onlyData(input, { errorOnCircularReference: false });

        expect(result.children).toEqual([
            { name: "child1", leaf: { name: "leaf", parent: { } } },
            { name: "child2", leaf: { name: "leaf", parent: { } } },
            { name: "child3", leaf: { name: "leaf", parent: { } } },
        ]);
    });

    it("should honour `indicateCircularWarnings` option", function() {

        const result = onlyData(input, { indicateCircularWarnings: true });

        expect(result).toEqual({
            name: "parent",
            children: [
                { name: "child1", leaf: { name: "leaf", parent: { __circular: true } } },
                { name: "child2", leaf: { name: "leaf", parent: { __circular: true } } },
                { name: "child3", leaf: { name: "leaf", parent: { __circular: true } } },
            ]
        });
    });

    it("should use inner reducer function", function() {

        const result = onlyData(input, {
            errorOnCircularReference: false,
            reducer: (key, value) => {
                if (key === "name")
                    return;

                return value;
            }
        });

        expect(result).toEqual({
            children: [
                { leaf: { parent: { } } },
                { leaf: { parent: { } } },
                { leaf: { parent: { } } },
            ]
        });
    });

    it("should use inner reducer array", function() {

        const result =
            onlyData(input, {
                errorOnCircularReference: false,
                reducer: ["name", "children", "leaf", "parent"]
            });

        expect(result).toEqual({
            name: "parent",
            children: [
                { name: "child1", leaf: { name: "leaf", parent: { } } },
                { name: "child2", leaf: { name: "leaf", parent: { } } },
                { name: "child3", leaf: { name: "leaf", parent: { } } },
            ]
        });
    });
});
