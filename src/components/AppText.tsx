import React from 'react';
import { Text } from 'react-native-paper';
import CommonStyles from '../common/styles/CommonStyles';
type AppTextProps = {
  children: any;
  variant?: string;
  style?: any;
};
const AppText = ({ children, variant, style, ...props }: AppTextProps) => {
  let textStyle;
  switch (variant) {
    case 'heading1':
      textStyle = CommonStyles.heading1;
      break;
    case 'heading2':
      textStyle = CommonStyles.heading2;
      break;
    case 'pageTitle':
      textStyle = CommonStyles.pageTitle;
      break;
    case 'subTitle':
      textStyle = CommonStyles.subTitle;
      break;
    case 'body1':
      textStyle = CommonStyles.body1;
      break;
    case 'body2':
      textStyle = CommonStyles.body2;
      break;
    case 'body4':
      textStyle = CommonStyles.body4;
      break;
    case 'body5':
      textStyle = CommonStyles.body5;
      break;
    case 'body6':
      textStyle = CommonStyles.body6;
      break;
    case 'body7':
      textStyle = CommonStyles.body7;
      break;
    case 'primaryCTATitle':
      textStyle = CommonStyles.primaryCTATitle;
      break;
    case 'secondaryCTATitle':
      textStyle = CommonStyles.secondaryCTATitle;
      break;
    case 'transactionCTATitle':
      textStyle = CommonStyles.transactionCTATitle;
      break;
    case 'textFieldLabel':
      textStyle = CommonStyles.textFieldLabel;
      break;
    case 'toastMessage':
      textStyle = CommonStyles.toastMessage;
      break;
    default:
      textStyle = CommonStyles.body1;
      break;
  }
  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};
export default AppText;
