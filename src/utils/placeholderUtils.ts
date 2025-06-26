export const getPlaceholderSuperScripted = (index: number) => {
  const mainIndex = index + 1;
  if (mainIndex === 1) {return `${mainIndex}ˢᵗ`;}
  if (mainIndex === 2) {return `${mainIndex}ⁿᵈ`;}
  if (mainIndex === 3) {return `${mainIndex}ʳᵈ`;}
  return `${mainIndex}ᵗʰ`;
};

export const getPlaceholder = (index: number) => {
  const mainIndex = index + 1;
  if (mainIndex === 1) {return `${mainIndex}st`;}
  if (mainIndex === 2) {return `${mainIndex}nd`;}
  if (mainIndex === 3) {return `${mainIndex}rd`;}
  return `${mainIndex}th`;
};
