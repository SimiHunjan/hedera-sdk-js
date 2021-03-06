import { AccountID } from "../generated/BasicTypes_pb";
import { normalizeEntityId } from "../util";

/** Normalized account ID returned by various methods in the SDK. */
export type AccountId = { shard: number; realm: number; account: number };

/**
 * Input type for an ID of an account on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<account>'` or `'<account>'`.
 *
 * A bare `number` will be taken as the account number with shard and realm of 0.
 */
export type AccountIdLike =
    { shard?: number; realm?: number; account: number }
    | string
    | number;

export function accountIdToSdk(accountId: AccountID): AccountId {
    return {
        shard: accountId.getShardnum(),
        realm: accountId.getRealmnum(),
        account: accountId.getAccountnum()
    };
}

export function accountIdToProto(accountId: AccountIdLike): AccountID {
    const { shard, realm, account } = normalizeAccountId(accountId);
    const acctId = new AccountID();
    acctId.setShardnum(shard);
    acctId.setRealmnum(realm);
    acctId.setAccountnum(account);
    return acctId;
}

export function normalizeAccountId(accountId: AccountIdLike): AccountId {
    return normalizeEntityId("account", accountId);
}
