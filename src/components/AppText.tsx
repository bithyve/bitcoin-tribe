import React, { useMemo, ComponentProps } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import CommonStyles from 'src/common/styles/CommonStyles';

export enum TextVariants {
  heading1 = 'heading1',
  heading2 = 'heading2',
  heading3 = 'heading3',
  pageTitle1 = 'pageTitle1',
  pageTitle2 = 'pageTitle2',
  subTitle = 'subTitle',
  body1 = 'body1',
  body2 = 'body2',
  body3 = 'body3',
  body5 = 'body5',
  body6 = 'body6',
  body7 = 'body7',
  secondaryCta = 'secondaryCta',
  smallCTA = 'smallCTA',
  subtitle2 = 'subtitle2',
  walletBalance = 'walletBalance',
  caption = 'caption',
}

type VariantProp = keyof typeof TextVariants;

interface Props extends ComponentProps<typeof Text> {
  children: React.ReactNode;
  variant?: VariantProp;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  ellipsizeMode?: string;
}

const AppText: React.FC<Props> = ({
  children,
  variant = TextVariants.body1,
  style,
  numberOfLines,
  ellipsizeMode,
}) => {
  const textStyle = useMemo(() => {
    switch (variant) {
      case TextVariants.heading1:
        return CommonStyles.heading1;
      case TextVariants.heading2:
        return CommonStyles.heading2;
      case TextVariants.heading3:
        return CommonStyles.heading3;
      case TextVariants.pageTitle1:
        return CommonStyles.pageTitle1;
      case TextVariants.pageTitle2:
        return CommonStyles.pageTitle2;
      case TextVariants.subTitle:
        return CommonStyles.subTitle;
      case TextVariants.body1:
        return CommonStyles.body1;
      case TextVariants.body2:
        return CommonStyles.body2;
      case TextVariants.caption:
        return CommonStyles.caption;
      // Should be removed - body 3, 4, 5, 6 and 7
      case TextVariants.body3:
        return CommonStyles.body3;
      case TextVariants.secondaryCta:
        return CommonStyles.secondaryCta;
      case TextVariants.subtitle2:
        return CommonStyles.subtitle2;
      case TextVariants.body5:
        return CommonStyles.body5;
      case TextVariants.body6:
        return CommonStyles.body6;
      case TextVariants.body7:
        return CommonStyles.body7;
      // end
      case TextVariants.walletBalance:
        return CommonStyles.walletBalance;
      case TextVariants.smallCTA:
        return CommonStyles.smallCTA;
      default:
        return CommonStyles.body1;
    }
  }, [variant]);

  const generatedTestID = useMemo(() => {
    // Ensure children is a string or can be converted to a string
    const childrenText =
      typeof children === 'string' ? children : JSON.stringify(children);

    // Replace spaces and other characters to make it a valid testID
    const sanitizedChildrenText = childrenText
      ?.replace(/\s+/g, '-')
      ?.replace(/[^a-zA-Z0-9-_]/g, '');

    return `app-text-${sanitizedChildrenText}`;
  }, [children]);

  return (
    <Text
      style={[textStyle, style]}
      testID={generatedTestID}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      maxFontSizeMultiplier={1}>
      {children}
    </Text>
  );
};

export default AppText;
