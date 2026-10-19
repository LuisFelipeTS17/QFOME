type BrandTextProps = {
  text: string;
};

const BRAND_SPLIT_REGEX = /(qfome)/gi;
const isBrandWord = (value: string) => value.trim().toLowerCase() === "qfome";

export function BrandText({ text }: BrandTextProps) {
  const parts = text.split(BRAND_SPLIT_REGEX);

  return (
    <>
      {parts.map((part, index) =>
        isBrandWord(part) ? (
          <span key={`${part}-${index}`} className="qfome-word">
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

