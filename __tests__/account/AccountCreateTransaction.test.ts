import { AccountCreateTransaction, Hbar } from "../../src/exports";
import { mockClient, privateKey } from "../MockClient";
import { TransactionBody } from "../../src/generated/TransactionBody_pb";


describe('AccountCreateTransaction', () => {
    it('serializes correctly', () => {
        const transaction = new AccountCreateTransaction(mockClient)
            // deterministic values
            .setTransactionId({
                account: { shard: 0, realm: 0, account: 3 },
                validStartSeconds: 124124,
                validStartNanos: 151515
            })
            .setKey(privateKey.publicKey)
            .setTransactionFee(Hbar.of(1))
            .build();

        const bodybytes = "Cg4KCAjcyQcQ258JEgIYAxICGAMYgMLXLyICCHhaPwoiEiDgyOwnWKWHn/rCJqE8DFFreZ5y41FBoN2Cj5TTeYiktzD//////////384//////////9/SgUI0MjhAw==";

        const tx = transaction.toProto().toObject();
        let expectedTx = {
            body: undefined as undefined | Object,
            bodybytes,
            sigmap: undefined,
            sigs: undefined
        };

        expect(tx).toStrictEqual(expectedTx);

        const txnBody = TransactionBody.deserializeBinary(Buffer.from(bodybytes, "base64")).toObject();

        // `toObject()` sets not-present properties explicitly to undefined
        const expectedTxBody = {
            "contractcall": undefined,
            "contractcreateinstance": undefined,
            "contractdeleteinstance": undefined,
            "contractupdateinstance": undefined,
            "cryptoaddclaim": undefined,
            "transactionid": {
                "transactionvalidstart": {
                    "seconds": 124124,
                    "nanos": 151515
                },
                "accountid": {
                    "shardnum": 0,
                    "realmnum": 0,
                    "accountnum": 3
                }
            },
            "nodeaccountid": {
                "shardnum": 0,
                "realmnum": 0,
                "accountnum": 3
            },
            "transactionfee": "100000000",
            "transactionvalidduration": {
                "seconds": 120
            },
            "generaterecord": false,
            "memo": "",
            "cryptocreateaccount": {
                "key": {
                    "contractid": undefined,
                    "ed25519": "4MjsJ1ilh5/6wiahPAxRa3mecuNRQaDdgo+U03mIpLc=",
                    "keylist": undefined,
                    "rsa3072": "",
                    "ecdsa384": "",
                    "thresholdkey": undefined,
                },
                "initialbalance": "0",
                "sendrecordthreshold": "9223372036854775807",
                "receiverecordthreshold": "9223372036854775807",
                "receiversigrequired": false,
                "autorenewperiod": {
                    "seconds": 7890000
                },
                "newrealmadminkey": undefined,
                "proxyaccountid": undefined,
                "realmid": undefined,
                "shardid": undefined,
            },
            "cryptodelete": undefined,
            "cryptodeleteclaim": undefined,
            "cryptotransfer": undefined,
            "cryptoupdateaccount": undefined,
            "fileappend": undefined,
            "filecreate": undefined,
            "filedelete": undefined,
            "fileupdate": undefined,
            "freeze": undefined,
            "systemdelete": undefined,
            "systemundelete": undefined
        };
        expect(txnBody).toStrictEqual(expectedTxBody);

        expectedTx.body = expectedTxBody;

        expect(JSON.stringify(expectedTx, undefined, 4)).toEqual(transaction.toString());
    });
});
