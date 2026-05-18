import { specLoader } from "../../lib/soroban/spec";

describe("SorobanSpecLoader", () => {
    const mockSpec = {
        name: "TestContract",
        functions: [
            {
                name: "hello",
                inputs: [{ name: "arg1", type: "string" }],
                output: "string",
            },
        ],
    };

    it("should load and parse spec from JSON", async () => {
        const spec = await specLoader.loadFromJson("CAT123", mockSpec);
        expect(spec.name).toBe("TestContract");
        expect(spec.fns).toHaveLength(1);
        expect(spec.fns[0].name).toBe("hello");
        expect(spec.fns[0].args[0].type).toBe("string");
    });

    it("should use cache for subsequent loads", async () => {
        const spec1 = await specLoader.loadFromJson("CAT123", mockSpec);
        const spec2 = await specLoader.loadFromJson("CAT123", {}); // Should return cached
        expect(spec1).toBe(spec2);
        expect(spec2.name).toBe("TestContract");
    });

    it("should clear cache correctly", () => {
        specLoader.clearCache();
        expect(specLoader.getSpec("CAT123")).toBeUndefined();
    });
});
