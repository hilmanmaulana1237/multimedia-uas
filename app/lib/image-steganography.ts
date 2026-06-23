const DELIMITER = "|||END|||";

export function getImageCapacity(width: number, height: number): number {
  // LSB of Red channel only: 1 bit per pixel.
  // 8 bits = 1 char.
  // We need to leave room for the delimiter (9 chars = 72 bits).
  const totalBits = width * height;
  const totalChars = Math.floor(totalBits / 8);
  return Math.max(0, totalChars - DELIMITER.length);
}

export function encodeImageLSB(canvas: HTMLCanvasElement, message: string): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get canvas context");
  
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const fullMessage = message + DELIMITER;
  let bitIndex = 0;
  
  // Convert full message to binary string
  let binaryMessage = "";
  for (let i = 0; i < fullMessage.length; i++) {
    const bin = fullMessage.charCodeAt(i).toString(2).padStart(8, '0');
    binaryMessage += bin;
  }
  
  const totalBits = binaryMessage.length;
  
  if (totalBits > (width * height)) {
    throw new Error(`Pesan terlalu panjang. Maksimum: ${getImageCapacity(width, height)} karakter`);
  }
  
  // Embed bits in the Red channel LSB (index 0, 4, 8...)
  for (let i = 0; i < data.length; i += 4) {
    if (bitIndex < totalBits) {
      const bit = parseInt(binaryMessage[bitIndex]);
      // clear LSB and set to bit
      data[i] = (data[i] & 0xFE) | bit;
      bitIndex++;
    } else {
      break;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png"); // Must be PNG to be lossless
}

export function decodeImageLSB(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get canvas context");
  
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  let binaryString = "";
  let extractedMessage = "";
  
  // Read bits from Red channel LSB
  for (let i = 0; i < data.length; i += 4) {
    const lsb = data[i] & 1;
    binaryString += lsb;
    
    // Every 8 bits, convert to character
    if (binaryString.length === 8) {
      // Prevent parsing invalid huge loops if no delimiter found for a long time
      // But we must read through it to find the delimiter.
      const charCode = parseInt(binaryString, 2);
      
      // Basic sanity check to avoid memory issues on random noise
      // We only append if it's somewhat a valid char, but realistically we should just append it all
      // To be safe, we just append it
      extractedMessage += String.fromCharCode(charCode);
      binaryString = ""; // Reset for next char
      
      // Check if we hit the delimiter
      if (extractedMessage.endsWith(DELIMITER)) {
        return extractedMessage.slice(0, -DELIMITER.length);
      }
      
      // Failsafe: if we read 1MB of text without delimiter, assume it's garbage
      if (extractedMessage.length > 1000000) {
        throw new Error("Tidak ditemukan pesan rahasia yang valid. Pastikan gambar tidak rusak.");
      }
    }
  }
  
  throw new Error("Tidak ditemukan pesan rahasia yang valid. Pastikan gambar tidak rusak.");
}

export function validateImageForStego(file: File): { valid: boolean; reason?: string } {
  if (!file.type.startsWith("image/")) {
    return { valid: false, reason: "Bukan file gambar" };
  }
  if (file.type === "image/jpeg" || file.type === "image/jpg") {
    return { valid: false, reason: "Format JPEG menggunakan kompresi lossy yang akan merusak pesan steganografi. Gunakan PNG atau WebP lossless." };
  }
  return { valid: true };
}
