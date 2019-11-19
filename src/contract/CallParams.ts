import { keccak256 } from "js-sha3";

enum ArgumentType {
    uint32 = "uint32",
    uint64 = "uint64",
    uint256 = "uint256",
    string = "string",
    bool = "bool",
    bytes = "bytes",
}

export class CallParams {
    private readonly func: Uint8Array;
    private argumentList: Argument[] = [];
    private readonly argumentTypes: ArgumentType[];
    private currentArgument = 0;
    // Use Uint8Array to hold the offset in bytes, and use
    // offsetView to get the value as a Uint32; effectively
    // creating a Uint32 value type.
    private offset = new Uint8Array(32);
    private offsetView: DataView;

    public constructor(func: FunctionSelector) {
        const finish = func.finish();

        this.func = finish.hash;
        this.argumentTypes = finish.argumentTypes;
        this.offsetView = new DataView(this.offset.buffer, 28);
        this.offsetView.setUint32(0, this.argumentTypes.length * 32);
    }

    // String type unsupported (directly). See `ArgumentType.String` in
    // the switch statement below
    public addParam(param: boolean | number | Uint8Array): this {
        let value = new Uint8Array(32);
        let dynamic = false;
        const offset = new Uint8Array(32);
        const offsetView = new DataView(offset.buffer, 28);

        switch (this.argumentTypes[ this.currentArgument ]) {
            case ArgumentType.uint32:
                value.set(param as Uint8Array, 28);
                break;
            case ArgumentType.uint64:
                value.set(param as Uint8Array, 24);
                break;
            case ArgumentType.uint256:
                value = (param as Uint8Array);
                break;
            case ArgumentType.bool:
                value[ 31 ] = (param as boolean) ? 1 : 0;
                break;
            // Bytes should have not the length already encoded
            // JS String type is encoded as UTF-16 whilst Solidity `string` type is UTF-8 encoded.
            // So if will assume is already correctly updated to being a Uint8Array of UTF-8 string
            case ArgumentType.bytes:
            case ArgumentType.string:
                // eslint-disable-next-line no-case-declarations
                const length = (param as Uint8Array).length;
                // resize value if needed
                if (length / 32 >= 0) {
                    value = new Uint8Array(((length / 32) + 1) * 32);
                }
                value.set(param as Uint8Array, 0);
                dynamic = true;
                offsetView.setUint32(0, this.offsetView.getUint32(0));
                // The next offset is equal to the last offset + the length of this field.
                // Bytes are encoded as one 32 byte value for the length, and then the value after
                // right-padded to a 32 byte boundary. Taking the length of the bytes and dividing
                // it by 32 + 1 would give you exactly the right amount of bytes needed. Adding 32
                // on top of that for the length encoded in the beginning of the byte array;
                this.offsetView.setUint32(0, offsetView.getUint32(0) + value.length);
                break;
            default: throw new Error(`Unsupported argument type: ${this.argumentTypes[ this.currentArgument ]}`);
        }

        this.argumentList.push({ dynamic, offset, offsetView, value });
        this.currentArgument += 1;

        return this;
    }

    public finish(): Uint8Array {
        if (this.argumentList.length !== this.argumentTypes.length) {
            throw new Error("Invalid number of parameters provided");
        }

        const length = (this.argumentList.length * 32) + this.argumentList
            .map((arg) => arg.dynamic ? arg.value.length : 0)
            .reduce((sum, value) => sum + value) + 4;

        console.error(`length: ${length}`);
        const func = new Uint8Array(length);
        func.set(this.func, 0);

        // Encode the initial arguments
        // For non dynamic types encode the value in-place,
        // for dynamic types encode the offset
        // The 4 bytes is added to offsets because offset don't account
        // for the function hash
        for (let i = 0; i < this.argumentList.length; i += 1) {
            const arg = this.argumentList[ i ];
            if (arg.dynamic) {
                func.set(arg.offset as Uint8Array, 4 + (i * 32));
            } else {
                func.set(arg.value, 4 + (i * 32));
            }
        }

        // Encode dynamic arguments at the offset.
        for (let i = 0; i < this.argumentList.length; i += 1) {
            const arg = this.argumentList[ i ];
            if (arg.dynamic) {
                func.set(arg.value, 4 + (arg.offsetView as DataView).getUint32(0));
            }
        }

        return func;
    }
}

type Argument = {
    dynamic: boolean;
    offset: null | Uint8Array;
    offsetView: null | DataView;
    value: Uint8Array;
};

export class FunctionSelector {
    private func: string;
    private needsComma = false;
    private argumentTypes: ArgumentType[] = [];

    public constructor(func: string) {
        this.func = `${func}(`;
    }

    public addParamType(ty: string): this {
        if (this.needsComma) {
            this.func += ",";
        }

        const argument = stringToArgumentType(ty);

        this.func += argument;
        this.argumentTypes.push(argument);
        this.needsComma = true;

        return this;
    }

    public finish(): { hash: Uint8Array; argumentTypes: ArgumentType[] } {
        this.func += ")";

        return {
            hash: new Uint8Array(keccak256.arrayBuffer(this.func).slice(0, 4)),
            argumentTypes: this.argumentTypes
        };
    }

    public toString(): string {
        return this.func;
    }
}

function stringToArgumentType(ty: string): ArgumentType {
    const argument = ArgumentType[ ty as keyof typeof ArgumentType ];
    if (argument == null) {
        throw new Error(`Argument Type is unsuppored: ${ty}`);
    }

    return argument;
}

