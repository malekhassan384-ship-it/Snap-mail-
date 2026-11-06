/**
 * Verification code extractor
 * Scans plain text body for 4 to 8 digit verification codes and OTPs.
 */
export function findVerificationCodes(text: string | undefined | null): string[] {
  if (!text || typeof text !== 'string') return [];

  // Look for OTP patterns like "code is 123456", "OTP: 4921", "verification code: 948214"
  // or standalone 4-8 digit sequences bounded by non-digits
  const codes = new Set<string>();

  // High priority: preceded or followed by OTP/code keywords
  const contextRegex = /(?:code|otp|verification|pin|رمز|كود|التحقق|تأكيد|password|passcode)[^\d\n]{1,25}(?<codeVal>\b\d{4,8}\b)/gi;
  let match: RegExpExecArray | null;
  while ((match = contextRegex.exec(text)) !== null) {
    if (match.groups?.codeVal) {
      codes.add(match.groups.codeVal);
    }
  }

  // Also check hyphenated codes like 123-456
  const hyphenRegex = /(?:code|otp|verification|رمز)[^\d\n]{1,20}(\b\d{3}-\d{3}\b)/gi;
  while ((match = hyphenRegex.exec(text)) !== null) {
    if (match[1]) {
      codes.add(match[1].replace('-', ''));
    }
  }

  // If no contextual code found, look for isolated 4-8 digit numbers that are not obvious years (e.g. 1990-2035)
  if (codes.size === 0) {
    const generalRegex = /\b\d{4,8}\b/g;
    const currentYear = new Date().getFullYear();
    while ((match = generalRegex.exec(text)) !== null) {
      const val = match[0];
      const num = parseInt(val, 10);
      // Avoid standalone years unless there are multiple
      if (val.length === 4 && num >= 1990 && num <= currentYear + 10) {
        continue;
      }
      codes.add(val);
      if (codes.size >= 3) break; // Limit to 3 candidate codes
    }
  }

  return Array.from(codes);
}
