import React from 'react';
import { StyleSheet } from 'react-native';
import ShowQRCode from 'src/components/ShowQRCode';

type ReceiveQrDetailsProps = {
  receivingAddress?: string;
  qrTitle?: string;
  qrTitleColor?: string;
};

const ReceiveQrDetails = ({
  receivingAddress,
  qrTitle,
  qrTitleColor,
}: ReceiveQrDetailsProps) => {
  return (
    <ShowQRCode
      value={receivingAddress}
      title={qrTitle}
      qrTitleColor={qrTitleColor}
    />
  );
};

const styles = StyleSheet.create({});

export default ReceiveQrDetails;
