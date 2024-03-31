(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[417],{

/***/ 2109:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


    (window.__NEXT_P = window.__NEXT_P || []).push([
      "/create",
      function () {
        return __webpack_require__(7503);
      }
    ]);
    if(false) {}
  

/***/ }),

/***/ 802:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   z: function() { return /* binding */ Button; }
/* harmony export */ });
/* unused harmony export buttonVariants */
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7294);
/* harmony import */ var _radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(634);
/* harmony import */ var class_variance_authority__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5139);
/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(3204);





const buttonVariants = (0,class_variance_authority__WEBPACK_IMPORTED_MODULE_2__/* .cva */ .j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1__.forwardRef((param, ref)=>{
    let { className, variant, size, asChild = false, ...props } = param;
    const Comp = asChild ? _radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__/* .Slot */ .g7 : "button";
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Comp, {
        className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_4__.cn)(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    });
});
Button.displayName = "Button";



/***/ }),

/***/ 3204:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cn: function() { return /* binding */ cn; }
/* harmony export */ });
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(512);
/* harmony import */ var tailwind_merge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8388);


function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_0__/* .twMerge */ .m6)((0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .W)(inputs));
}


/***/ }),

/***/ 7503:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(module, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Component; }
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var _components_ui_button__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(802);
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9466);
/* harmony import */ var o1js_pack__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8455);
/* harmony import */ var _global_context__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(679);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_2__, o1js_pack__WEBPACK_IMPORTED_MODULE_3__, _global_context__WEBPACK_IMPORTED_MODULE_4__]);
([o1js__WEBPACK_IMPORTED_MODULE_2__, o1js_pack__WEBPACK_IMPORTED_MODULE_3__, _global_context__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);





function Component() {
    const { globalState, setGlobalState } = (0,_global_context__WEBPACK_IMPORTED_MODULE_4__/* .useGlobalContext */ .bN)();
    class Gamestate extends (0,o1js_pack__WEBPACK_IMPORTED_MODULE_3__/* .PackedUInt32Factory */ .RP)() {
    }
    const stack1 = o1js__WEBPACK_IMPORTED_MODULE_2__/* .UInt32 */ .xH.from(1234);
    const stack2 = o1js__WEBPACK_IMPORTED_MODULE_2__/* .UInt32 */ .xH.from(5677);
    // So this is a gamestate object...
    const gamestateField = Gamestate.fromUInt32s([
        stack1,
        stack2
    ]);
    // const test: Field = gamestateField.packed;
    const unpacked = Gamestate.unpack(gamestateField.packed);
    console.log(unpacked[0].toJSON(), unpacked[1].toJSON(), unpacked[2].toJSON());
    const handleClick = ()=>{
        // console.log(`Button clicked with value: ${value}`);
        setGlobalState({
            ...globalState,
            testStr: "efgh"
        });
    };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "flex flex-col h-screen",
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("header", {
                className: "flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h1", {
                    className: "text-4xl font-bold tracking-tighter",
                    children: "Create new game"
                })
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                className: "flex-1 flex items-center justify-center",
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_button__WEBPACK_IMPORTED_MODULE_1__/* .Button */ .z, {
                    variant: "default",
                    children: "Create"
                })
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", {
                className: "flex-1 flex items-center justify-center",
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ui_button__WEBPACK_IMPORTED_MODULE_1__/* .Button */ .z, {
                    variant: "default",
                    children: globalState.testStr
                })
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", {
                onClick: handleClick,
                children: "Change value"
            })
        ]
    });
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 8455:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RP: function() { return /* reexport safe */ _lib_packed_types_PackedUInt32_js__WEBPACK_IMPORTED_MODULE_1__.R; }
/* harmony export */ });
/* harmony import */ var _lib_packed_types_PackedBool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9137);
/* harmony import */ var _lib_packed_types_PackedUInt32_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8012);
/* harmony import */ var _lib_PackingPlant_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5682);
/* harmony import */ var _lib_packed_types_PackedString_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7706);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_packed_types_PackedBool_js__WEBPACK_IMPORTED_MODULE_0__, _lib_packed_types_PackedUInt32_js__WEBPACK_IMPORTED_MODULE_1__, _lib_PackingPlant_js__WEBPACK_IMPORTED_MODULE_2__, _lib_packed_types_PackedString_js__WEBPACK_IMPORTED_MODULE_3__]);
([_lib_packed_types_PackedBool_js__WEBPACK_IMPORTED_MODULE_0__, _lib_packed_types_PackedUInt32_js__WEBPACK_IMPORTED_MODULE_1__, _lib_PackingPlant_js__WEBPACK_IMPORTED_MODULE_2__, _lib_packed_types_PackedString_js__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);





//# sourceMappingURL=index.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 5682:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   l: function() { return /* binding */ PackingPlant; }
/* harmony export */ });
/* unused harmony export MultiPackingPlant */
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__]);
o1js__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

const MAX_BITS_PER_FIELD = 254n;
function PackingPlant(elementType, l, bitSize) {
    if (bitSize * BigInt(l) > MAX_BITS_PER_FIELD) {
        throw new Error(`The Packing Plant is only accepting orders that can fit into one Field, try using MultiPackingPlant`);
    }
    class Packed_ extends (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Struct */ .AU)({
        packed: o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN,
    }) {
        constructor(packed) {
            super({ packed });
        }
        // Must implement these in type-specific implementation
        static extractField(input) {
            throw new Error('Must implement extractField');
        }
        static sizeInBits() {
            throw new Error('Must implement sizeInBits');
        }
        static unpack(f) {
            throw new Error('Must implement unpack');
        }
        // End
        /**
         *
         * @param unpacked Array of the implemented packed type
         * @throws if the length of the array is longer than the length of the implementing factory config
         */
        static checkPack(unpacked) {
            if (unpacked.length > l) {
                throw new Error(`Input of size ${unpacked.length} is larger than expected size of ${l}`);
            }
        }
        /**
         *
         * @param unpacked Array of the implemented packed type, must be shorter than the max allowed, which varies by type, will throw if the input is too long
         * @returns Field, packed with the information from the unpacked input
         */
        static pack(unpacked) {
            this.checkPack(unpacked);
            let f = this.extractField(unpacked[0]);
            const n = Math.min(unpacked.length, l);
            for (let i = 1; i < n; i++) {
                const c = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN)((2n ** this.sizeInBits()) ** BigInt(i));
                f = f.add(this.extractField(unpacked[i]).mul(c));
            }
            return f;
        }
        /**
         *
         * @param f Field, packed with the information, as returned by #pack
         * @returns Array of bigints, which can be decoded by the implementing class into the final type
         */
        static unpackToBigints(f) {
            let unpacked = new Array(l);
            unpacked.fill(0n);
            let packedN;
            if (f) {
                packedN = f.toBigInt();
            }
            else {
                throw new Error('No Packed Value Provided');
            }
            for (let i = 0; i < l; i++) {
                unpacked[i] = packedN & ((1n << this.sizeInBits()) - 1n);
                packedN >>= this.sizeInBits();
            }
            return unpacked;
        }
        // NOTE: adding to fields here breaks the proof generation.  Probably not overriding it correctly
        /**
         * @returns array of single Field element which constitute the packed object
         */
        toFields() {
            return [this.packed];
        }
        assertEquals(other) {
            this.packed.assertEquals(other.packed);
        }
    }
    Packed_.type = (0,o1js__WEBPACK_IMPORTED_MODULE_0__/* .provable */ .MZ)({ packed: o1js__WEBPACK_IMPORTED_MODULE_0__/* .Field */ .gN }, {});
    Packed_.l = l;
    Packed_.bitSize = bitSize;
    return Packed_;
}
function MultiPackingPlant(elementType, l, bitSize) {
    if (bitSize * BigInt(l) > 8n * MAX_BITS_PER_FIELD) {
        throw new Error(`The Packing Plant is only accepting orders that can fit into eight Fields`);
    }
    const n = Math.ceil(Number(bitSize * BigInt(l)) / Number(255n));
    class Packed_ extends Struct({
        packed: Provable.Array(Field, n),
    }) {
        constructor(packed) {
            super({ packed });
        }
        // Must implement these in type-specific implementation
        static extractField(input) {
            throw new Error('Must implement extractField');
        }
        static sizeInBits() {
            throw new Error('Must implement sizeInBits');
        }
        static elementsPerField() {
            throw new Error('Must implement elementsPerField');
        }
        static unpack(fields) {
            throw new Error('Must implement unpack');
        }
        // End
        /**
         *
         * @param unpacked Array of the implemented packed type
         * @throws if the length of the array is longer than the length of the implementing factory config
         */
        static checkPack(unpacked) {
            if (unpacked.length > this.l) {
                throw new Error(`Input of size ${unpacked.length} is larger than expected size of ${l}`);
            }
        }
        /**
         *
         * @param unpacked Array of the implemented packed type, must be shorter than the max allowed, which varies by type, will throw if the input is too long
         * @returns Array of Fields, packed such that each Field has as much information as possible
         *
         * e.g. 15 Characters pack into 1 Field.  15 or fewer Characters will return an array of 1 Field
         *      30 of fewer Characters will return an aray of 2 Fields
         */
        static pack(unpacked) {
            this.checkPack(unpacked);
            const q = this.elementsPerField();
            let fields = [];
            let mutableUnpacked = [...unpacked];
            for (let i = 0; i < this.n; i++) {
                let f = this.extractField(mutableUnpacked[i * q]);
                if (!f) {
                    throw new Error('Unexpected Array Length');
                }
                for (let j = 1; j < q; j++) {
                    const idx = i * q + j;
                    let value = this.extractField(mutableUnpacked[idx]);
                    if (!value) {
                        throw new Error('Unexpected Array Length');
                    }
                    value = value || Field(0);
                    const c = Field((2n ** this.sizeInBits()) ** BigInt(j));
                    f = f.add(value.mul(c));
                }
                fields.push(f);
            }
            return fields;
        }
        /**
         *
         * @param fields Array of Fields, packed such that each Field has as much information as possible, as returned in #pack
         * @returns Array of bigints, which can be decoded by the implementing class into the final type
         */
        static unpackToBigints(fields) {
            let uints_ = new Array(this.l); // array length is number of elements per field * number of fields
            uints_.fill(0n);
            let packedNs = new Array(this.n);
            packedNs.fill(0n);
            const packedArg = new Array(this.n);
            packedArg.fill(Field(0), 0, this.n);
            for (let i = 0; i < this.n; i++) {
                if (fields[i]) {
                    packedArg[i] = fields[i];
                }
            }
            if (packedArg.length !== this.n) {
                throw new Error(`Packed value must be exactly ${this.n} in length`);
            }
            for (let i = 0; i < this.n; i++) {
                packedNs[i] = packedArg[i].toConstant().toBigInt();
            }
            for (let i = 0; i < packedNs.length; i++) {
                let packedN = packedNs[i];
                for (let j = 0; j < this.elementsPerField(); j++) {
                    const k = i * this.elementsPerField() + j;
                    uints_[k] = packedN & ((1n << this.sizeInBits()) - 1n);
                    packedN >>= this.sizeInBits();
                }
            }
            return uints_;
        }
        // NOTE: adding to fields here breaks the proof generation.  Probably not overriding it correctly
        /**
         * @returns array of Field elements which constitute the multi-packed object
         */
        toFields() {
            return this.packed;
        }
        assertEquals(other) {
            for (let x = 0; x < n; x++) {
                this.packed[x].assertEquals(other.packed[x]);
            }
        }
    }
    Packed_.type = provable({ packed: Provable.Array(Field, n) }, {});
    Packed_.l = l;
    Packed_.n = n;
    Packed_.bitSize = bitSize;
    return Packed_;
}
//# sourceMappingURL=PackingPlant.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 9137:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* unused harmony export PackedBoolFactory */
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
/* harmony import */ var _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5682);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__]);
([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);


const L = 254; // 254 1-bit booleans fit in one Field
const SIZE_IN_BITS = 1n;
function PackedBoolFactory(l = L) {
    class PackedBool_ extends PackingPlant(Bool, l, SIZE_IN_BITS) {
        static extractField(input) {
            return input.toField();
        }
        static sizeInBits() {
            return SIZE_IN_BITS;
        }
        /**
         *
         * @param f Field, packed with the information, as returned by #pack
         * @returns Array of Bool
         */
        static unpack(f) {
            const unpacked = Provable.witness(Provable.Array(Bool, l), () => {
                const unpacked = this.unpackToBigints(f);
                return unpacked.map((x) => Bool.fromJSON(Boolean(x)));
            });
            f.assertEquals(PackedBool_.pack(unpacked));
            return unpacked;
        }
        /**
         *
         * @param bools Array of Bools to be packed
         * @returns Instance of the implementing class
         */
        static fromBools(bools) {
            const packed = PackedBool_.pack(bools);
            return new PackedBool_(packed);
        }
        /**
         *
         * @param booleans Array of booleans to be packed
         * @returns Instance of the implementing class
         */
        static fromBooleans(booleans) {
            const bools = booleans.map((x) => Bool(x));
            return PackedBool_.fromBools(bools);
        }
        toBooleans() {
            return PackedBool_.unpack(this.packed).map((x) => x.toBoolean());
        }
    }
    return PackedBool_;
}
//# sourceMappingURL=PackedBool.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 7706:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* unused harmony exports PackedStringFactory, MultiPackedStringFactory */
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
/* harmony import */ var _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5682);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__]);
([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);


const SIZE_IN_BITS = 8n;
const L = 31; // Default to one-field worth of characters
const CHARS_PER_FIELD = 31;
function PackedStringFactory(l = L) {
    class PackedString_ extends PackingPlant(Character, l, SIZE_IN_BITS) {
        static extractField(input) {
            return input.value;
        }
        static sizeInBits() {
            return SIZE_IN_BITS;
        }
        /**
         *
         * @param f Field, packed with the information, as returned by #pack
         * @returns Array of Character
         */
        static unpack(f) {
            const unpacked = Provable.witness(Provable.Array(Character, l), () => {
                const unpacked = this.unpackToBigints(f);
                return unpacked.map((x) => Character.fromString(String.fromCharCode(Number(x))));
            });
            f.assertEquals(PackedString_.pack(unpacked));
            return unpacked;
        }
        /**
         *
         * @param characters Array of Character to be packed
         * @returns Instance of the implementing class
         */
        static fromCharacters(input) {
            let characters = new Array(this.l);
            characters.fill(new Character(Field(0)), 0, this.l);
            for (let i = 0; i < input.length; i++) {
                characters[i] = input[i];
            }
            const packed = this.pack(characters);
            return new PackedString_(packed);
        }
        /**
         *
         * @param str string to be packed
         * @returns Instance of the implementing class
         */
        static fromString(str) {
            let characters = new Array(this.l);
            characters.fill(new Character(Field(0)), 0, this.l);
            for (let i = 0; i < str.length; i++) {
                characters[i] = Character.fromString(str[i]);
            }
            return this.fromCharacters(characters);
        }
        toString() {
            const nullChar = String.fromCharCode(0);
            return PackedString_.unpack(this.packed)
                .filter((c) => c.toString() !== nullChar)
                .join('');
        }
    }
    return PackedString_;
}
/**
 *
 * @param n number of fields to employ to store the string
 * @returns MultiPackedString_ class with length of n * CHARS_PER_FIELD
 */
function MultiPackedStringFactory(n = 8) {
    class MultiPackedString_ extends MultiPackingPlant(Character, n * CHARS_PER_FIELD, SIZE_IN_BITS) {
        static extractField(input) {
            return input.value;
        }
        static sizeInBits() {
            return SIZE_IN_BITS;
        }
        static elementsPerField() {
            return CHARS_PER_FIELD;
        }
        /**
         *
         * @param fields Array of Fields, containing packed Characters
         * @returns Array of Character
         */
        static unpack(fields) {
            const unpacked = Provable.witness(Provable.Array(Character, this.l), () => {
                let unpacked = this.unpackToBigints(fields);
                return unpacked.map((x) => Character.fromString(String.fromCharCode(Number(x))));
            });
            Poseidon.hash(fields).assertEquals(Poseidon.hash(MultiPackedString_.pack(unpacked)));
            return unpacked;
        }
        /**
         *
         * @param characters Array of Character to be packed
         * @returns Instance of the implementing class
         */
        static fromCharacters(input) {
            let characters = new Array(this.l);
            characters.fill(new Character(Field(0)), 0, this.l);
            for (let i = 0; i < input.length; i++) {
                characters[i] = input[i];
            }
            const packed = this.pack(characters);
            return new MultiPackedString_(packed);
        }
        /**
         *
         * @param str string to be packed
         * @returns Instance of the implementing class
         */
        static fromString(str) {
            let characters = new Array(this.l);
            characters.fill(new Character(Field(0)), 0, this.l);
            for (let i = 0; i < str.length; i++) {
                characters[i] = Character.fromString(str[i]);
            }
            return this.fromCharacters(characters);
        }
        toString() {
            const nullChar = String.fromCharCode(0);
            return MultiPackedString_.unpack(this.packed)
                .filter((c) => c.toString() !== nullChar)
                .join('');
        }
    }
    return MultiPackedString_;
}
//# sourceMappingURL=PackedString.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 8012:
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(__webpack_module__, async function (__webpack_handle_async_dependencies__, __webpack_async_result__) { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   R: function() { return /* binding */ PackedUInt32Factory; }
/* harmony export */ });
/* harmony import */ var o1js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9466);
/* harmony import */ var _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5682);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__]);
([o1js__WEBPACK_IMPORTED_MODULE_0__, _PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);


const L = 7; // 7 32-bit uints fit in one Field
const SIZE_IN_BITS = 32n;
function PackedUInt32Factory(l = L) {
    class PackedUInt32_ extends (0,_PackingPlant_js__WEBPACK_IMPORTED_MODULE_1__/* .PackingPlant */ .l)(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH, l, SIZE_IN_BITS) {
        static extractField(input) {
            return input.value;
        }
        static sizeInBits() {
            return SIZE_IN_BITS;
        }
        /**
         *
         * @param f Field, packed with the information, as returned by #pack
         * @returns Array of UInt32
         */
        static unpack(f) {
            const unpacked = o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.witness(o1js__WEBPACK_IMPORTED_MODULE_0__/* .Provable */ .PC.Array(o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH, l), () => {
                const unpacked = this.unpackToBigints(f);
                return unpacked.map((x) => o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(x));
            });
            f.assertEquals(PackedUInt32_.pack(unpacked));
            return unpacked;
        }
        /**
         *
         * @param uint32s Array of UInt32s to be packed
         * @returns Instance of the implementing class
         */
        static fromUInt32s(uint32s) {
            const packed = PackedUInt32_.pack(uint32s);
            return new PackedUInt32_(packed);
        }
        /**
         *
         * @param bigints Array of bigints to be packed
         * @returns Instance of the implementing class
         */
        static fromBigInts(bigints) {
            const uint32s = bigints.map((x) => o1js__WEBPACK_IMPORTED_MODULE_0__/* .UInt32 */ .xH.from(x));
            return PackedUInt32_.fromUInt32s(uint32s);
        }
        toBigInts() {
            return PackedUInt32_.unpack(this.packed).map((x) => x.toBigint());
        }
    }
    return PackedUInt32_;
}
//# sourceMappingURL=PackedUInt32.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, [534,774,888,179], function() { return __webpack_exec__(2109); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ _N_E = __webpack_exports__;
/******/ }
]);