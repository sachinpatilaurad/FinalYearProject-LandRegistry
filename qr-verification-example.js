// Example: Adding QR codes to certificates for easy external verification

import QRCode from 'qrcode';

// When generating a certificate, also generate a QR code
async function generateCertificateWithQR(certificateHash) {
    // Create verification URL
    const verificationUrl = `https://your-api.com/api/verify/${certificateHash}`;
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    
    return {
        certificateHash,
        verificationUrl,
        qrCodeDataUrl // This can be added to the PDF certificate
    };
}

// Usage in your certificate generation:
// 1. Generate certificate hash from blockchain
// 2. Create QR code pointing to verification URL
// 3. Add QR code to PDF certificate
// 4. Anyone scanning the QR code can verify the certificate
