const net = require('node:net');
const dns = require('node:dns/promises');
const varNumber = require('./varNumber.js');

/**
 * Create a Minecraft packet.
 * @param {number} packetID The packet ID
 * @param {Buffer} data The packet data
 * @returns {Buffer}
 */
function createPacket(packetID, data) {
	const length = varNumber.encodingLength(packetID) + data.length;

	return Buffer.concat([
		varNumber.encode(length),
		varNumber.encode(packetID),
		data
	]);
}

/**
 * Create a handshake packet.
 * @param {string} host The server host
 * @param {number} port The server port
 * @returns {Buffer}
 */
function createHandshakePacket(host, port = 25565) {
	const portBuffer = Buffer.alloc(2);
	portBuffer.writeUInt16BE(port);

	return createPacket(
		0x00, // Handshake packet ID
		Buffer.concat([
			varNumber.encode(-1), // Protocol version (-1 for dynamic version)
			varNumber.encode(host.length),
			Buffer.from(host),
			portBuffer,
			Buffer.from([0x01]) // Next state (1 for status)
		])
	);
}

/**
 * Fetches the server informations.
 * @param {string} host The server host
 * @returns {Promise<ServerStatus>}
 */
async function fetchInformations(host) {
	const { address } = await dns.lookup(host);
	if (address == null) throw new Error('Failed to resolve address');

	const socket = net.createConnection(25565, address, () => {
		socket.write(createHandshakePacket(host));
		socket.write(createPacket(0x00, Buffer.alloc(0))); // Status request packet
	});

	/**
	 * @type {{ length: number, id: number, data: Buffer }}
	 */
	const packet = {
		length: -1,
		id: -1,
		data: null
	};

	socket.on('data', dataChunk => {
		if (packet.id === -1) {
			const packetLength = varNumber.decode(dataChunk);
			const packetID = varNumber.decode(dataChunk, varNumber.encodingLength(packetLength));

			packet.length = packetLength;
			packet.id = packetID;
			packet.data = dataChunk.subarray(varNumber.encodingLength(packetLength) + varNumber.encodingLength(packetID));
			return;
		}

		packet.data = Buffer.concat([packet.data, dataChunk]);

		if (packet.data.length >= packet.length - varNumber.encodingLength(packet.length)) socket.end();
	});

	return new Promise((resolve, reject) => {
		socket.on('end', () => {
			if (packet.id !== 0x00) reject(new Error('Invalid packet ID'));

			const jsonLength = varNumber.decode(packet.data);
			const jsonString = packet.data.subarray(varNumber.encodingLength(jsonLength), varNumber.encodingLength(jsonLength) + jsonLength);

			try {
				resolve(JSON.parse(jsonString.toString()));
			} catch (error) {
				reject(error);
			}
		});

		socket.on('error', reject);
	});
}

module.exports = {
	fetchInformations
};