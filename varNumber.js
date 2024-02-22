// Source: https://wiki.vg/Protocol#VarInt_and_VarLong

const SEGMENT_BITS = 0x7F;
const CONTINUE_BIT = 0x80;

/**
 * Encodes a number to a varNumber buffer.
 * @param {number} value
 * @returns {Buffer}
 */
function encode(value) {
	const buffer = [];

	do {
		let byte = value & SEGMENT_BITS;
		value >>>= 7;

		if (value !== 0) {
			byte |= CONTINUE_BIT
		}

		buffer.push(byte);
	} while (value !== 0);

	return Buffer.from(buffer);
}

/**
 * Decodes a varNumber from a buffer.
 * @param {Buffer} buffer
 * @param {number} offset
 * @returns {number}
 */
function decode(buffer, offset = 0) {
	let result = 0;
	let shift = 0;

	while (true) {
		const byte = buffer.readUInt8(offset++);

		result |= (byte & SEGMENT_BITS) << shift;
		shift += 7;

		if ((byte & CONTINUE_BIT) === 0) {
			break;
		}
	}

	return result;
}

/**
 * Returns the expected length of a varNumber.
 * @param {number} value
 * @returns {number}
 */
function encodingLength(value) {
	let length = 0;

	do {
		length++;
		value >>>= 7;
	} while (value !== 0);

	return length;
}

module.exports = {
	encode,
	decode,
	encodingLength
}