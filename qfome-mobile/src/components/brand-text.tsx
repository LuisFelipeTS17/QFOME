import { Text, type StyleProp, type TextStyle } from "react-native";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/typography";

type BrandTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

const BRAND_SPLIT_REGEX = /(qfome)/gi;
const isBrandWord = (value: string) => value.trim().toLowerCase() === "qfome";

/**
 * Porta do `BrandText` do site: destaca a palavra "QFome" na cor da marca
 * em qualquer frase, preservando o restante do estilo do texto.
 */
export function BrandText({ text, style, numberOfLines }: BrandTextProps) {
  const parts = text.split(BRAND_SPLIT_REGEX);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, index) =>
        isBrandWord(part) ? (
          <Text
            key={`${part}-${index}`}
            style={{ color: colors.brand, fontFamily: fonts.extrabold }}
          >
            {part}
          </Text>
        ) : (
          <Text key={`${part}-${index}`}>{part}</Text>
        ),
      )}
    </Text>
  );
}
