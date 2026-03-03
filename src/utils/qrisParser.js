/**
 * Simple EMVCo QRIS Parser for PunyaKios
 * Based on EMVCo QR Code Specification
 */

export const parseQRIS = (qrisString) => {
  if (!qrisString || qrisString.length < 10) return null;

  // Basic check for QRIS (Merchant Account Information is usually tag 26-51)
  // And must have Payload Format Indicator (00) and Point of Initiation Method (01)
  if (!qrisString.startsWith('00')) return null;

  const tags = {};
  let offset = 0;

  while (offset < qrisString.length) {
    const tag = qrisString.substring(offset, offset + 2);
    const length = parseInt(qrisString.substring(offset + 2, offset + 4), 10);
    const value = qrisString.substring(offset + 4, offset + 4 + length);

    if (isNaN(length)) break;

    tags[tag] = value;
    offset += 4 + length;
  }

  // Tag 59: Merchant Name
  // Tag 60: Merchant City
  // Tag 54: Transaction Amount (if static, this might be empty)
  
  if (tags['59']) {
    return {
      merchantName: tags['59'],
      merchantCity: tags['60'] || '',
      amount: tags['54'] || null,
      fullPayload: qrisString,
      isQRIS: true
    };
  }

  return null;
};
