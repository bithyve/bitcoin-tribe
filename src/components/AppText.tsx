import React, { useMemo, ComponentProps } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import CommonStyles from 'src/common/styles/CommonStyles';

export enum TextVariants {
  heading1 = 'heading1',
  heading2 = 'heading2',
  pageTitle = 'pageTitle',
  subTitle = 'subTitle',
  body1 = 'body1',
  body2 = 'body2',
  secondaryCTATitle = 'secondaryCTATitle',
}

type VariantProp = keyof typeof TextVariants;

interface Props extends ComponentProps<typeof Text> {
  children: React.ReactNode;
  variant?: VariantProp;
  style?: StyleProp<TextStyle>;
  testID: string;
}

const AppText: React.FC<Props> = ({
  children,
  variant = TextVariants.body1,
  style,
  testID,
}) => {
  const textStyle = useMemo(() => {
    switch (variant) {
      case TextVariants.heading1:
        return CommonStyles.heading1;
      case TextVariants.heading2:
        return CommonStyles.heading2;
      case TextVariants.pageTitle:
        return CommonStyles.pageTitle;
      case TextVariants.subTitle:
        return CommonStyles.subTitle;
      case TextVariants.body1:
        return CommonStyles.body1;
      case TextVariants.body2:
        return CommonStyles.body2;
      case TextVariants.secondaryCTATitle:
        return CommonStyles.secondaryCTATitle;
      default:
        return CommonStyles.body1;
    }
  }, [variant]);

  return (
    <Text style={[textStyle, style]} testID={testID}>
      {children}
    </Text>
  );
};

export default AppText;
