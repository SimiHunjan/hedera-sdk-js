import { mockClient, mockTransaction } from "../MockClient";
import { FileContentsQuery } from "../../src/exports";

describe("FileContentsQuery", () => {
    it("serializes and deserializes correctly; FileContentsQuery", () => {
        const query = new FileContentsQuery(mockClient)
            .setFileId({ shard: 0, realm: 0, file: 5 })
            .setPayment(mockTransaction.toProto());

        const tx = query.toProto().toObject();
        expect(tx).toStrictEqual({
            contractcalllocal: undefined,
            contractgetbytecode: undefined,
            contractgetinfo: undefined,
            contractgetrecords: undefined,
            cryptogetaccountbalance: undefined,
            cryptogetaccountrecords: undefined,
            cryptogetclaim: undefined,
            cryptogetinfo: undefined,
            cryptogetproxystakers: undefined,
            filegetcontents: {
                fileid: {
                    filenum: 5,
                    realmnum: 0,
                    shardnum: 0
                },
                header: {
                    payment: {
                        body: undefined,
                        bodybytes: "Cg4KCAjcyQcQ258JEgIYAxICGAMYwIQ9IgIIeHIUChIKBwoCGAIQxwEKBwoCGAMQyAE=",
                        sigmap: {
                            sigpairList: [{
                                contract: "",
                                ecdsa384: "",
                                ed25519: "1W86WCxMfK1Pv83GbBxXIDzpTLgwsLzOO/Nccs9QEV6ej/kp3QbJGtgO64gTXrdje6lyTdbuaLFYxxHXtje2CgoOCggI3MkHENufCRICGAMSAhgDGMCEPSICCHhyFAoSCgcKAhgCEMcBCgcKAhgDEMgB",
                                pubkeyprefix: "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                                rsa3072: ""
                            }]
                        },
                        sigs: undefined
                    },
                    responsetype: 0
                }
            },
            filegetinfo: undefined,
            getbykey: undefined,
            getbysolidityid: undefined,
            transactiongetfastrecord: undefined,
            transactiongetreceipt: undefined,
            transactiongetrecord: undefined
        });
    });
});
