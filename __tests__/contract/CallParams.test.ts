import { CallParams, FunctionSelector } from "../../src/exports";

describe("CallParams", () => {
    it("encodes correctly", () => {
        const func = new FunctionSelector("f")
            .addParamType("uint32")
            .addParamType("bytes")
            .addParamType("uint64")
            .addParamType("bytes");

        const uint32 = new Uint8Array(4);
        const uint32View = new DataView(uint32.buffer);
        uint32View.setUint32(0, 16909060);

        const bytes = new Uint8Array(10);
        bytes[ 1 ] = 1;
        bytes[ 4 ] = 4;
        bytes[ 9 ] = 8;

        const uint64 = new Uint8Array(8);
        const uint64View = new DataView(uint64.buffer);
        uint64View.setUint32(0, 4294967295);

        const bytes2 = new Uint8Array(31);
        bytes2[ 0 ] = 255;
        bytes2[ 31 ] = 255;

        const params = new CallParams(func);
        expect(() => params.finish()).toThrow(new Error("Invalid number of parameters provided"));
        params.addParam(uint32)
            .addParam(bytes)
            .addParam(uint64)
            .addParam(bytes2);

        const finished = params.finish();
        const funcHash = Buffer.from(finished.slice(0, 4).buffer).toString("hex");
        const firstParam = Buffer.from(finished.slice(4, 32 + 4).buffer).toString("hex");
        const secondParam = Buffer.from(finished.slice(32 + 4, (32 * 2) + 4).buffer).toString("hex");
        const thirdParam = Buffer.from(finished.slice((32 * 2) + 4, (32 * 3) + 4).buffer).toString("hex");
        const forthParam = Buffer.from(finished.slice((32 * 3) + 4, (32 * 4) + 4).buffer).toString("hex");
        const secondParamData = Buffer.from(finished.slice((32 * 4) + 4, (32 * 5) + 4).buffer).toString("hex");
        const fourthParamData = Buffer.from(finished.slice((32 * 5) + 4).buffer).toString("hex");
        expect(funcHash).toStrictEqual("60087f8c");
        expect(firstParam).toStrictEqual("0000000000000000000000000000000000000000000000000000000001020304");
        expect(secondParam).toStrictEqual("0000000000000000000000000000000000000000000000000000000000000080");
        expect(thirdParam).toStrictEqual("000000000000000000000000000000000000000000000000ffffffff00000000");
        expect(forthParam).toStrictEqual("00000000000000000000000000000000000000000000000000000000000000aa");
        expect(secondParamData).toStrictEqual("0001000004000000000800000000000000000000000000000000000000000000");
        expect(fourthParamData).toStrictEqual("ff00000000000000000800000000000000000000000000000000000000000000");
        expect(finished).toHaveLength(100);
    });
});
