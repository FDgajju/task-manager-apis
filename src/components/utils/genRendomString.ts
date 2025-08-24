export type RandomStringParam = {
  numbers?: boolean;
  specialChar?: boolean;
  alphabets?: boolean;
};

export const generateRandomString = (
  length: number,
  params: RandomStringParam = {}
): string => {
  const charSets = {
    numbers: "0123456789",
    specialChar: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    alphabets: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  };

  // If no params are provided, include all character sets
  const effectiveParams =
    Object.keys(params).length === 0
      ? { numbers: true, specialChar: true, alphabets: true }
      : params;

  // Build the character set based on the provided params
  let activeSet = "";
  if (effectiveParams.numbers) activeSet += charSets.numbers;
  if (effectiveParams.specialChar) activeSet += charSets.specialChar;
  if (effectiveParams.alphabets) activeSet += charSets.alphabets;

  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * activeSet.length);
    randomString += activeSet.charAt(randomIndex);
  }

  return randomString;
};

export const generateOTP = (length: number): string => {
  return generateRandomString(length, {
    numbers: true,
    alphabets: false,
    specialChar: false,
  });
};
