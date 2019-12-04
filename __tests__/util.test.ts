import { TinybarValueError } from "../src/errors";
import BigNumber from "bignumber.js";
import { Hbar } from "../src/Hbar";
import {AccountId, normalizeAccountId} from "../src/account/AccountId";
import {ContractId, normalizeContractId} from "../src/contract/ContractId";
import {FileId, normalizeFileId} from "../src/file/FileId";
import {tinybarRangeCheck} from "../src/Tinybar";
import {dateToTimestamp, timestampToDate, timestampToProto} from "../src/Timestamp";

describe("tinybarRangeCheck()", () => {
    it("forbids negative numbers by default", () => {
        expect(() => tinybarRangeCheck(-1)).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(new BigNumber(-1))).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(Hbar.of("-1"))).toThrow(TinybarValueError);
    });

    it("forbids number values out of range", () => {
        expect(() => tinybarRangeCheck(2 ** 53)).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck((2 ** 53) - 1)).not.toThrow();

        expect(() => tinybarRangeCheck(-(2 ** 53), "allowNegative")).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(-(2 ** 53) + 1, "allowNegative")).not.toThrow();
    });

    it("forbids BigNumber values out of range", () => {
        expect(() => tinybarRangeCheck(new BigNumber(2).pow(63))).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(new BigNumber(2).pow(63).minus(1))).not.toThrow();

        expect(() => tinybarRangeCheck(new BigNumber(-2).pow(63).minus(1), "allowNegative")).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(new BigNumber(-2).pow(63), "allowNegative")).not.toThrow();
    });

    it("forbids Hbar values out of range", () => {
        expect(() => tinybarRangeCheck(Hbar.from(93, "gigabar"))).toThrow(TinybarValueError);
        // the maximum amount of gigabar in the network at any given time
        expect(() => tinybarRangeCheck(Hbar.from(50, "gigabar"))).not.toThrow();
        expect(() => tinybarRangeCheck(Hbar.MAX_VALUE)).not.toThrow();

        expect(() => tinybarRangeCheck(Hbar.from(-93, "gigabar"), "allowNegative")).toThrow(TinybarValueError);
        expect(() => tinybarRangeCheck(Hbar.from(-50, "gigabar"), "allowNegative")).not.toThrow();
        expect(() => tinybarRangeCheck(Hbar.MIN_VALUE, "allowNegative")).not.toThrow();
    });
});

describe("normalizeAccountId()", () => {
    it("normalizes objects", () => {
        expect(normalizeAccountId({ account: 3 }).toString()).toStrictEqual("0.0.3");
        expect(normalizeAccountId({ shard: 1, account: 3 }).toString()).toStrictEqual("1.0.3");
        expect(normalizeAccountId({ realm: 2, account: 3 }).toString()).toStrictEqual("0.2.3");
        expect(normalizeAccountId({ shard: 1, realm: 2, account: 3 }).toString()).toStrictEqual("1.2.3");
    });

    it("normalizes strings", () => {
        expect(normalizeAccountId("3").toString()).toStrictEqual("0.0.3");
        expect(normalizeAccountId("0.0.3").toString()).toStrictEqual("0.0.3");
        expect(normalizeAccountId("1.2.3").toString()).toStrictEqual("1.2.3");

        expect(() => normalizeAccountId("0.0.0.3"))
            .toThrow("invalid account ID: 0.0.0.3");
        expect(() => normalizeAccountId("0.3"))
            .toThrow("invalid account ID: 0.3");
        expect(() => normalizeAccountId("."))
            .toThrow("invalid account ID: .");
    });

    it("normalizes numbers", () => {
        expect(normalizeAccountId(3).toString()).toStrictEqual("0.0.3");
        expect(normalizeAccountId(Number.MAX_SAFE_INTEGER).toString()).toStrictEqual(`0.0.${Number.MAX_SAFE_INTEGER}`);

        expect(() => normalizeAccountId(-1))
            .toThrow("invalid account ID: -1");
        expect(() => normalizeAccountId(0.3))
            .toThrow("invalid account ID: 0.3");
        expect(() => normalizeAccountId(Number.MAX_SAFE_INTEGER + 1))
            .toThrow(`account ID outside safe integer range for number: ${Number.MAX_SAFE_INTEGER + 1}`);
    });
});

// technically redundant to `normalizeAccountId()` but if the implementation details or types change
// asymmetrically or in a breaking manner we would want to know
describe("normalizeContractId()", () => {
    it("normalizes objects", () => {
        expect(normalizeContractId({ contract: 3 }).toString()).toStrictEqual("0.0.3");
        expect(normalizeContractId({ shard: 1, contract: 3 }).toString()).toStrictEqual("1.0.3");
        expect(normalizeContractId({ realm: 2, contract: 3 }).toString()).toStrictEqual("0.2.3");
        expect(normalizeContractId({ shard: 1, realm: 2, contract: 3 }).toString()).toStrictEqual("1.2.3");
        expect(normalizeContractId({ contract: 3 }).toString()).toStrictEqual("0.0.3");
    });

    it("normalizes strings", () => {
        expect(normalizeContractId("3").toString()).toStrictEqual("0.0.3");
        expect(normalizeContractId("0.0.3").toString()).toStrictEqual("0.0.3");
        expect(normalizeContractId("1.2.3").toString()).toStrictEqual("1.2.3");

        expect(() => normalizeContractId("0.0.0.3"))
            .toThrow("invalid contract ID: 0.0.0.3");
        expect(() => normalizeContractId("0.3"))
            .toThrow("invalid contract ID: 0.3");
        expect(() => normalizeContractId("."))
            .toThrow("invalid contract ID: .");
    });

    it("normalizes numbers", () => {
        expect(normalizeContractId(3).toString()).toStrictEqual("0.0.3");
        expect(normalizeContractId(Number.MAX_SAFE_INTEGER).toString()).toStrictEqual(`0.0.${Number.MAX_SAFE_INTEGER}`);

        expect(() => normalizeContractId(-1))
            .toThrow("invalid contract ID: -1");
        expect(() => normalizeContractId(0.3))
            .toThrow("invalid contract ID: 0.3");
        expect(() => normalizeContractId(Number.MAX_SAFE_INTEGER + 1))
            .toThrow(`contract ID outside safe integer range for number: ${Number.MAX_SAFE_INTEGER + 1}`);
    });
});

// technically redundant to `normalizeAccountId()` but if the implementation details or types change
// asymmetrically or in a breaking manner we would want to know
describe("normalizeFileId()", () => {
    it("normalizes objects", () => {
        expect(normalizeFileId({ file: 3 }).toString()).toStrictEqual("0.0.3");
        expect(normalizeFileId({ shard: 1, file: 3 }).toString()).toStrictEqual("1.0.3");
        expect(normalizeFileId({ realm: 2, file: 3 }).toString()).toStrictEqual("0.2.3");
        expect(normalizeFileId({ shard: 1, realm: 2, file: 3 }).toString()).toStrictEqual("1.2.3");
        expect(normalizeFileId({ file: 3 }).toString()).toStrictEqual("0.0.3");
    });

    it("normalizes strings", () => {
        expect(normalizeFileId("3").toString()).toStrictEqual("0.0.3");
        expect(normalizeFileId("0.0.3").toString()).toStrictEqual("0.0.3");
        expect(normalizeFileId("1.2.3").toString()).toStrictEqual("1.2.3");

        expect(() => normalizeFileId("0.0.0.3"))
            .toThrow("invalid file ID: 0.0.0.3");
        expect(() => normalizeFileId("0.3"))
            .toThrow("invalid file ID: 0.3");
        expect(() => normalizeFileId("."))
            .toThrow("invalid file ID: .");
    });

    it("normalizes numbers", () => {
        expect(normalizeFileId(3).toString()).toStrictEqual("0.0.3");
        expect(normalizeFileId(Number.MAX_SAFE_INTEGER).toString()).toStrictEqual(`0.0.${Number.MAX_SAFE_INTEGER}`);

        expect(() => normalizeFileId(-1))
            .toThrow("invalid file ID: -1");
        expect(() => normalizeFileId(0.3))
            .toThrow("invalid file ID: 0.3");
        expect(() => normalizeFileId(Number.MAX_SAFE_INTEGER + 1))
            .toThrow(`file ID outside safe integer range for number: ${Number.MAX_SAFE_INTEGER + 1}`);
    });
});

describe("Date and Timestamp", () => {
    it("roundtrip", () => {
        const date = new Date(1414141411);
        const timestamp = dateToTimestamp(date);
        const protoTimestmap = timestampToProto(timestamp);
        const roundTripDate = timestampToDate(protoTimestmap);
        expect(date.toDateString()).toStrictEqual(roundTripDate.toDateString());
    });
});
