import fs from "fs";
import path from "path";

const WSWrapper = require("./wswrapper");

type MusicManifestEntry = {
	id: string;
	name: string;
	artist?: string;
	album?: string;
	category?: string;
	year?: number;
	genres?: string[];
};

type RoomLike = {
	roomUniqueId: string;
	started: boolean;
	users: Array<{ uniqueId: string }>;
	get: () => any;
	setCurrentSong?: (song: { id: string; name: string }, startedAt: number) => void;
};

type StreamSession = {
	room: RoomLike;
	song: MusicManifestEntry;
	choices: MusicManifestEntry[];
	audioPath: string;
	audioBuffer: Buffer;
	previewBuffer: Buffer;
	randomStartByte: number;
	countdownReadyUsers?: Set<string>;
	readyUsers: Set<string>;
	started: boolean;
	streamId: string;
};

class MusicStreamer {
	private readonly manifestPath: string;
  private readonly songFolder: string;
	private readonly previewSeconds: number;
	private readonly fallbackBitrateKbps: number;
	private readonly minRandomStartBytes: number;
	private readonly chunkSize: number;
	private readonly startDelayMs: number;
	private readonly chunkDelayMs: number;
	private listenersReady: boolean;
	private manifest: MusicManifestEntry[];
	private sessions: Map<string, StreamSession>;

	constructor() {
		this.manifestPath = path.join(__dirname, "..", "music", "manifest.json");
    this.songFolder = path.join(__dirname, "..", "music");
		this.previewSeconds = 15;
		this.fallbackBitrateKbps = 320;
		this.minRandomStartBytes = 96 * 1024;
		this.chunkSize = 8 * 1024;
		this.startDelayMs = 500;
		this.chunkDelayMs = 25;
		this.listenersReady = false;
		this.manifest = [];
		this.sessions = new Map();

		this.updateManifest();
	}

	public initListeners() {
		if (this.listenersReady) {
			return;
		}

		WSWrapper.on("music-ready", this.handleMusicReady.bind(this));
		WSWrapper.on("countdown-ready", this.handleCountdownReady.bind(this));
		this.listenersReady = true;
		console.log("MUSIC-LOG", "MusicStreamer listeners initialized.");
	}

	private handleCountdownReady(message: any) {
		try {
			const data = message?.data;
			if (!data?.roomUniqueId || !data?.uniqueId) return;

			const session = this.sessions.get(data.roomUniqueId);
			if (!session || session.started) return;

			session.countdownReadyUsers = session.countdownReadyUsers || new Set<string>();
			session.countdownReadyUsers.add(String(data.uniqueId));

			console.log("MUSIC-LOG", `Countdown ready from ${data.uniqueId} in room ${data.roomUniqueId} (${session.countdownReadyUsers.size}/${session.room.users.length})`);

			if (session.countdownReadyUsers.size >= session.room.users.length) {
				// all ready -> start streaming
				void this.beginStreaming(session);
			}
		} catch (e: any) {
			console.error("MUSIC-LOG", `Error in handleCountdownReady: ${e.message}`);
		}
	}

	private updateManifest() {
		try {
			const manifestData = fs.readFileSync(this.manifestPath, "utf-8");
			this.manifest = JSON.parse(manifestData) as MusicManifestEntry[];
      console.log("MUSIC-LOG", `Music manifest updated. Now has ${this.manifest.length} songs.`);
		} catch (error: any) {
			console.error("MUSIC-LOG", `Failed to read music manifest: ${error.message}`);
			this.manifest = [];
		}
	}

	private pickRandomSong(excludedIds: string[] = []): MusicManifestEntry {
		if (this.manifest.length === 0) {
			throw new Error("Music manifest is empty.");
		}

		const availableSongs = this.manifest.filter((song) => !excludedIds.includes(song.id));
		const pool = availableSongs.length > 0 ? availableSongs : this.manifest;
		const randomIndex = Math.floor(Math.random() * pool.length);
		return pool[randomIndex];
	}

	private pickChoices(targetSong: MusicManifestEntry): MusicManifestEntry[] {
		const choices: MusicManifestEntry[] = [];
		const maxChoices = Math.min(4, this.manifest.length);

		while (choices.length < maxChoices) {
			const candidate = this.pickRandomSong(choices.map((choice) => choice.id));
			if (!choices.some((choice) => choice.id === candidate.id)) {
				choices.push(candidate);
			}
		}

		// Safety net: always force targetSong into the final choices.
		if (!choices.some((choice) => choice.id === targetSong.id)) {
			if (choices.length > 0) {
				choices.pop();
			}
			choices.push(targetSong);
		}

		for (let index = choices.length - 1; index > 0; index -= 1) {
			const swapIndex = Math.floor(Math.random() * (index + 1));
			[choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
		}

		return choices;
	}

	private findSongAudioFile(songId: string): string {
    const songFolder = path.join(this.songFolder, songId);
		if (!fs.existsSync(songFolder)) {
			throw new Error(`Music folder not found for song ${songId}`);
		}

		const audioFile = fs.readdirSync(songFolder).find((fileName) => fileName.toLowerCase().endsWith(".mp3"));
		if (!audioFile) {
			throw new Error(`No mp3 file found for song ${songId}`);
		}

		return path.join(songFolder, audioFile);
	}

	private detectMp3BitrateKbps(audioBuffer: Buffer): number {
		for (let index = 0; index < audioBuffer.length - 4; index += 1) {
			if (audioBuffer[index] !== 0xff || (audioBuffer[index + 1] & 0xe0) !== 0xe0) {
				continue;
			}

			const versionBits = (audioBuffer[index + 1] >> 3) & 0x03;
			const layerBits = (audioBuffer[index + 1] >> 1) & 0x03;
			const bitrateIndex = (audioBuffer[index + 2] >> 4) & 0x0f;

			if (bitrateIndex === 0 || bitrateIndex === 15 || layerBits !== 1) {
				continue;
			}

			const mpeg1Layer3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
			const mpeg2Layer3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
			const bitrateTable = versionBits === 3 ? mpeg1Layer3 : mpeg2Layer3;
			const bitrate = bitrateTable[bitrateIndex] || 0;

			if (bitrate > 0) {
				return bitrate;
			}
		}

		return this.fallbackBitrateKbps;
	}

	private pickRandomPreviewSegment(audioBuffer: Buffer): { previewBuffer: Buffer; randomStartByte: number } {
		const bitrateKbps = this.detectMp3BitrateKbps(audioBuffer);
		const previewBytes = Math.min(
			Math.max(1, Math.floor((bitrateKbps * 1000 * this.previewSeconds) / 8)),
			audioBuffer.length - 1
		);
		if (previewBytes <= 0) {
			return {
				previewBuffer: Buffer.alloc(0),
				randomStartByte: 0,
			};
		}

		const maxStartByte = audioBuffer.length - previewBytes;
		const minStartByte = Math.min(this.minRandomStartBytes, maxStartByte);
		const randomStartByte = minStartByte + Math.floor(Math.random() * (maxStartByte - minStartByte + 1));
		const randomEndByte = randomStartByte + previewBytes;

		console.log("MUSIC-LOG", `Detected mp3 bitrate ${bitrateKbps}kbps and previewBytes ${previewBytes}.`);

		return {
			previewBuffer: audioBuffer.subarray(randomStartByte, randomEndByte),
			randomStartByte,
		};
	}

	public start(room: RoomLike) {
		if (!this.listenersReady) {
			this.initListeners();
		}

		this.updateManifest();

		if (!room || !room.roomUniqueId) {
			throw new Error("Cannot start music streaming without a room id.");
		}

		if (this.sessions.has(room.roomUniqueId)) {
			return this.sessions.get(room.roomUniqueId);
		}

		const targetSong = this.pickRandomSong();
    console.log("MUSIC-LOG", `Selected song ${targetSong.name} (${targetSong.id}) for room ${room.roomUniqueId}.`);
		const choices = this.pickChoices(targetSong);
    console.log("MUSIC-LOG", `Choices for room ${room.roomUniqueId}: ${choices.map((c) => c.name).join(", ")}`);
		const audioPath = this.findSongAudioFile(targetSong.id);
    console.log("MUSIC-LOG", `Audio path for song ${targetSong.name} (${targetSong.id}): ${audioPath}`);
		const audioBuffer = fs.readFileSync(audioPath);
		const { previewBuffer, randomStartByte } = this.pickRandomPreviewSegment(audioBuffer);
		if (previewBuffer.length === 0) {
			throw new Error(`Music file is too small to create a valid preview for song ${targetSong.id}.`);
		}

		const session: StreamSession = {
			room,
			song: targetSong,
			choices,
			audioPath,
			audioBuffer,
			previewBuffer,
			randomStartByte,
			readyUsers: new Set<string>(),
			started: false,
			streamId: `${room.roomUniqueId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
		};

		console.log(
			"MUSIC-LOG",
			`Selected random preview offset ${session.randomStartByte} with ${session.previewBuffer.length} bytes (previewSeconds=${this.previewSeconds}) for room ${room.roomUniqueId}.`
		);

		this.sessions.set(room.roomUniqueId, session);

		WSWrapper.send({
			route: "room",
			type: "music-prepared",
			data: {
				roomUniqueId: room.roomUniqueId,
				streamId: session.streamId,
				choiceNames: choices.map((choice) => choice.name),
			},
		});

		return session;
	}

	private handleMusicReady(message: any) {
		console.log("MUSIC-LOG", `Received music-ready from client: ${JSON.stringify(message?.data)}`);
		try {
			const data = message?.data;
			if (!data?.roomUniqueId || !data?.uniqueId) {
				return;
			}

			const session = this.sessions.get(data.roomUniqueId);
			if (!session || session.started) {
				return;
			}

			const roomUser = session.room.users.find((user) => user.uniqueId === data.uniqueId);
			if (!roomUser) {
				return;
			}

			session.readyUsers.add(String(data.uniqueId));

			if (session.readyUsers.size >= session.room.users.length) {
				// all players reported music-ready; run countdown then stream
				void (async () => {
					try {
						await this.runCountdown(session);
						// after countdown (or timeout), begin streaming
						await this.beginStreaming(session);
					} catch (e: any) {
						console.error("MUSIC-LOG", `Error during countdown/streaming: ${e.message}`);
					}
				})();
			}
		} catch (error: any) {
			console.error("MUSIC-LOG", `Error handling music-ready: ${error.message}`);
		}
	}

	private async runCountdown(session: StreamSession) {
		// send 3..1 ticks, then wait for countdown-ready from players (with timeout)
		const counts = [3, 2, 1];
		for (const c of counts) {
			WSWrapper.send({ route: "room", type: "countdown-tick", data: { roomUniqueId: session.room.roomUniqueId, value: c } });
			// if we just sent 1, give players a small time to ack
			if (c === 1) break;
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		// after sending 1, wait up to timeout for countdown-ready from all players
		session.countdownReadyUsers = session.countdownReadyUsers || new Set<string>();
		const timeoutMs = 3000;
		const start = Date.now();
		while ((Date.now() - start) < timeoutMs) {
			if (session.countdownReadyUsers.size >= session.room.users.length) break;
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		WSWrapper.send({ route: "room", type: "countdown-go", data: { roomUniqueId: session.room.roomUniqueId } });
	}

	private async beginStreaming(session: StreamSession) {
		if (session.started) {
			return;
		}

		session.started = true;
		const startAt = Date.now() + this.startDelayMs;
		if (typeof session.room.setCurrentSong === "function") {
			session.room.setCurrentSong({ id: session.song.id, name: session.song.name }, startAt);
		}

		WSWrapper.send({
			route: "room",
			type: "music-start",
			data: {
				roomUniqueId: session.room.roomUniqueId,
				streamId: session.streamId,
				startAt,
				previewSeconds: this.previewSeconds,
				previewBytes: session.previewBuffer.length,
				randomStartByte: session.randomStartByte,
				chunkSize: this.chunkSize,
				choiceNames: session.choices.map((choice) => choice.name),
				choiceIds: session.choices.map((choice) => choice.id),
			},
		});

		const totalChunks = Math.ceil(session.previewBuffer.length / this.chunkSize);

		for (let index = 0; index < totalChunks; index += 1) {
			const chunkStart = index * this.chunkSize;
			const chunkEnd = Math.min(chunkStart + this.chunkSize, session.previewBuffer.length);
			const chunk = session.previewBuffer.subarray(chunkStart, chunkEnd);

			WSWrapper.send({
				route: "room",
				type: "music-chunk",
				data: {
					roomUniqueId: session.room.roomUniqueId,
					streamId: session.streamId,
					chunkIndex: index,
					totalChunks,
					chunk: chunk.toString("base64"),
				},
			});

			if (this.chunkDelayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, this.chunkDelayMs));
			}
		}

		WSWrapper.send({
			route: "room",
			type: "music-end",
			data: {
				roomUniqueId: session.room.roomUniqueId,
				streamId: session.streamId,
			},
		});

		this.sessions.delete(session.room.roomUniqueId);
	}
}

module.exports = new MusicStreamer();
