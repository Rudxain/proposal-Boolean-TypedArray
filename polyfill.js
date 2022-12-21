/*
code based on the ECMAScript spec, not real-life polyfills.

I'll make this work properly as a polyfill, but later
*/

(() => {
	'use strict'
	const TypeErr = TypeError, RangeErr = RangeError
	const MAX = Number.MAX_SAFE_INTEGER
	const { trunc } = Math
	const
		getter = DataView.prototype.getUint8,
		setter = DataView.prototype.setUint8,
		mapper = [].map
	const TypedArray = Reflect.getPrototypeOf(Int8Array)

	/**
	https://tc39.es/ecma262/multipage/abstract-operations.html#sec-toindex
	*/
	const toIndex = x => {
		x = trunc(x) || 0
		if (x >= 0 && x <= MAX) return x
		throw new RangeErr('invalid index')
	}

	/**
	Short edition of `defineProperty`
	@param {object} O
	@param {PropertyKey} p
	@param {*} v value to set
	@param {number} desc bitwise bool descriptor with format W|E|C
	*/
	const defProp = (O, p, v, desc) => Object.defineProperty(O, p, {
		value: v,
		writable: !!(desc & 4), enumerable: !!(desc & 2), configurable: !!(desc & 1)
	})

	defProp(DataView.prototype, 'getBool',
		function getBool(bitOffset) {
			bitOffset = toIndex(bitOffset)
			return !!(getter.call(this, bitOffset / 8) & (0x80 >> (bitOffset & 7)))
		},
		5
	)
	defProp(DataView.prototype, 'setBool',
		function setBool(bitOffset, value) {
			bitOffset = toIndex(bitOffset)
			const byteOffset = trunc(bitOffset / 8)
			const byte = getter.call(this, byteOffset)
			bitOffset &= 7
			if (!!(byte & (0x80 >> bitOffset)) != !!value)
				setter.call(this, byteOffset, byte ^ (0x80 >> bitOffset))
		},
		5
	)

	class BoolArray extends TypedArray {
		// https://tc39.es/ecma262/multipage/indexed-collections.html#sec-typedarray-constructors
		constructor(...args) {
			const constructorName = 'BoolArray'
			const proto = TypedArray.prototype
			const numberOfArgs = args.length
			if (!numberOfArgs) return AllocateTypedArray(constructorName, NewTarget, proto, 0)
			const firstArgument = args[0]
			if (typeof firstArgument == 'object') {
				const O = AllocateTypedArray(constructorName, NewTarget, proto)
				if (Object.hasOwn(firstArgument, 'TypedArrayName')) InitializeTypedArrayFromTypedArray(O, firstArgument)
			}
		}

		get(bitOffset) { return (new DataView(this.buffer)).getBool(bitOffset) }
		set(bitOffset, value) { return (new DataView(this.buffer)).setBool(bitOffset, value) }

		static from(obj, func, thisObj) {
			if (typeof this != 'function' || (new this(0)) == null) throw new TypeErr('`this` is not a constructor')
			if (this.prototype !== BoolArray.prototype) throw new TypeErr('`this` is not BoolArray')

			func ||= function (_) { return _ }
			if (typeof func != 'function') throw new TypeErr('specified argument is not a function')

			obj = Object(obj)
			if (!obj.length) return new this(0)
			let copy = []
			for (let i = 0; i < obj.length; i++) copy[copy.length] = obj[i]

			copy = mapper.call(copy, func, thisObj)
			const typed_arr = new this(copy.length)
			for (let i = 0; i < typed_arr.length; i++) typed_arr.set(i, copy[i])
			return typed_arr
		}
	}
	defProp(BoolArray, 'BYTES_PER_ELEMENT', 1 / 8, 0)
	defProp(globalThis, 'BoolArray', BoolArray, 5)
})()
