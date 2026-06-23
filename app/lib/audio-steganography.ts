const DELIMITER = "|||END|||";

// WAV header is 44 bytes. Data starts at byte 44.
// For simplicity, we assume standard 16-bit PCM WAV.

export function getAudioCapacity(buffer: ArrayBuffer): number {
  const dataView = new DataView(buffer);
  // Just a simple heuristic if it's not a valid WAV
  if (buffer.byteLength < 44) return 0;
  
  // Total samples (16-bit = 2 bytes per sample)
  const dataSize = dataView.getUint32(40, true);
  const totalSamples = dataSize / 2;
  
  // 8 samples (bits) = 1 char
  const totalChars = Math.floor(totalSamples / 8);
  return Math.max(0, totalChars - DELIMITER.length);
}

export function encodeAudioLSB(buffer: ArrayBuffer, message: string): Blob {
  const view = new DataView(buffer);
  const dataSize = view.getUint32(40, true);
  const dataStart = 44;
  
  // Copy buffer to modify it
  const newBuffer = buffer.slice(0);
  const newView = new DataView(newBuffer);
  
  const fullMessage = message + DELIMITER;
  let binaryMessage = "";
  for (let i = 0; i < fullMessage.length; i++) {
    binaryMessage += fullMessage.charCodeAt(i).toString(2).padStart(8, '0');
  }
  
  const totalBits = binaryMessage.length;
  const totalSamples = dataSize / 2;
  
  if (totalBits > totalSamples) {
    throw new Error(`Pesan terlalu panjang. Maksimum: ${getAudioCapacity(buffer)} karakter`);
  }
  
  let bitIndex = 0;
  for (let i = 0; i < totalSamples; i++) {
    if (bitIndex < totalBits) {
      const offset = dataStart + (i * 2);
      let sample = newView.getInt16(offset, true);
      const bit = parseInt(binaryMessage[bitIndex]);
      
      // modify LSB
      if (bit === 1) {
        sample = sample | 1;
      } else {
        sample = sample & ~1;
      }
      
      newView.setInt16(offset, sample, true);
      bitIndex++;
    } else {
      break;
    }
  }
  
  return new Blob([newBuffer], { type: 'audio/wav' });
}

export function decodeAudioLSB(buffer: ArrayBuffer): string {
  const view = new DataView(buffer);
  if (buffer.byteLength < 44) throw new Error("Bukan file WAV yang valid");
  
  const dataSize = view.getUint32(40, true);
  const dataStart = 44;
  const totalSamples = dataSize / 2;
  
  let binaryString = "";
  let extractedMessage = "";
  
  for (let i = 0; i < totalSamples; i++) {
    const offset = dataStart + (i * 2);
    const sample = view.getInt16(offset, true);
    const lsb = sample & 1;
    
    binaryString += lsb;
    
    if (binaryString.length === 8) {
      const charCode = parseInt(binaryString, 2);
      extractedMessage += String.fromCharCode(charCode);
      binaryString = "";
      
      if (extractedMessage.endsWith(DELIMITER)) {
        return extractedMessage.slice(0, -DELIMITER.length);
      }
      
      if (extractedMessage.length > 500000) {
        throw new Error("Tidak ditemukan pesan rahasia yang valid.");
      }
    }
  }
  
  throw new Error("Tidak ditemukan pesan rahasia yang valid. Pastikan file tidak rusak.");
}

export function validateAudioForStego(file: File): { valid: boolean; reason?: string } {
  if (!file.name.toLowerCase().endsWith(".wav")) {
    return { valid: false, reason: "Hanya file WAV yang didukung untuk steganografi. File kompresi (MP3/AAC) akan merusak pesan LSB." };
  }
  return { valid: true };
}
