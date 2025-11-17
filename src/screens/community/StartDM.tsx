/**
 * StartDM Screen
 * 
 * Allows users to start a DM by scanning another user's QR code.
 * The QR code should contain the recipient's public key in the format:
 * tribe://contact/{publicKey}
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { Code } from 'react-native-vision-camera';
import { useChat } from 'src/hooks/useChat';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import QRScanner from 'src/components/QRScanner';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import Toast from 'src/components/Toast';
import Clipboard from '@react-native-clipboard/clipboard';

function StartDM() {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { sendDMInvitation, isCreatingRoom } = useChat();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [publicKeyInput, setPublicKeyInput] = useState('');

  const parseQRData = (data: string): string | null => {
    try {
      // Expected formats:
      // 1. tribe://contact/{publicKey}
      // 2. Just the public key (64-char hex string)
      
      if (data.includes('tribe://contact/')) {
        const publicKey = data.split('tribe://contact/')[1];
        return publicKey || null;
      }
      
      // Validate if it's a valid hex string (64 characters for 32 bytes)
      if (/^[0-9a-f]{64}$/i.test(data)) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('[StartDM] Failed to parse QR data:', error);
      return null;
    }
  };

  const handleStartDM = async (publicKey: string) => {
    setProcessing(true);

    try {
      console.log('[StartDM] Starting DM with public key:', publicKey.substring(0, 8) + '...');

      // Send DM invitation
      Toast('Sending DM invitation...');
      const dmRoom = await sendDMInvitation(publicKey);
      
      // Navigate to the DM chat
      Toast('DM invitation sent!');
      (navigation as any).navigate(NavigationRoutes.CHAT, {
        roomId: dmRoom.roomId,
      });
    } catch (error: any) {
      console.error('[StartDM] Failed to start DM:', error);
      Toast(error.message || 'Failed to start DM', true);
      
      // Allow retrying after error
      setTimeout(() => {
        setScanning(true);
        setProcessing(false);
      }, 2000);
    }
  };

  const handleQRScan = useCallback(
    async (codes: Code[]) => {
      if (!scanning || processing || isCreatingRoom) {
        return;
      }

      if (codes && codes.length > 0) {
        const data = codes[0].value;
        
        if (!data) {
          return;
        }

        setScanning(false);

        // Parse QR data to get public key
        const publicKey = parseQRData(data);
        
        if (!publicKey) {
          Toast('Invalid QR code format. Please scan a valid contact QR code.', true);
          setTimeout(() => {
            setScanning(true);
          }, 2000);
          return;
        }

        await handleStartDM(publicKey);
      }
    },
    [scanning, processing, isCreatingRoom],
  );

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      
      if (!clipboardContent) {
        Toast('Clipboard is empty', true);
        return;
      }

      const publicKey = parseQRData(clipboardContent.trim());
      
      if (!publicKey) {
        Toast('Invalid public key format in clipboard', true);
        return;
      }

      setPublicKeyInput(publicKey);
      Toast('Public key pasted from clipboard');
    } catch (error) {
      console.error('[StartDM] Failed to paste from clipboard:', error);
      Toast('Failed to paste from clipboard', true);
    }
  };

  const handleManualSubmit = async () => {
    const publicKey = parseQRData(publicKeyInput.trim());
    
    if (!publicKey) {
      Toast('Invalid public key format. Please enter a valid 64-character hex string.', true);
      return;
    }

    await handleStartDM(publicKey);
  };

  const toggleInputMode = () => {
    setShowManualInput(!showManualInput);
    setPublicKeyInput('');
    setScanning(!showManualInput);
  };

  return (
    <ScreenContainer>
      <AppHeader
        title="Start Direct Message"
        subTitle="Scan contact QR code"
      />

      <View style={styles.container}>
        {processing || isCreatingRoom ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <AppText style={styles.processingText}>
              {isCreatingRoom ? 'Creating DM room...' : 'Processing...'}
            </AppText>
          </View>
        ) : (
          <>
            {/* Toggle between QR scan and manual input */}
            <View style={styles.toggleContainer}>
              <AppTouchable
                onPress={toggleInputMode}
                style={[
                  styles.toggleButton,
                  !showManualInput && styles.toggleButtonActive,
                ]}
              >
                <AppText
                  style={[
                    styles.toggleButtonText,
                    !showManualInput && styles.toggleButtonTextActive,
                  ]}
                >
                  Scan QR
                </AppText>
              </AppTouchable>
              
              <AppTouchable
                onPress={toggleInputMode}
                style={[
                  styles.toggleButton,
                  showManualInput && styles.toggleButtonActive,
                ]}
              >
                <AppText
                  style={[
                    styles.toggleButtonText,
                    showManualInput && styles.toggleButtonTextActive,
                  ]}
                >
                  Paste Key
                </AppText>
              </AppTouchable>
            </View>

            {showManualInput ? (
              <View style={styles.manualInputContainer}>
                <AppText style={styles.inputLabel}>
                  Enter or paste public key
                </AppText>
                
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={publicKeyInput}
                    onChangeText={setPublicKeyInput}
                    placeholder="64-character hex string or tribe://contact/..."
                    placeholderTextColor={theme.colors.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.buttonRow}>
                  <AppTouchable
                    onPress={handlePasteFromClipboard}
                    style={[styles.actionButton, styles.pasteButton]}
                  >
                    <AppText style={styles.pasteButtonText}>
                      Paste from Clipboard
                    </AppText>
                  </AppTouchable>
                  
                  <AppTouchable
                    onPress={handleManualSubmit}
                    style={[
                      styles.actionButton,
                      styles.submitButton,
                      !publicKeyInput.trim() && styles.submitButtonDisabled,
                    ]}
                    disabled={!publicKeyInput.trim()}
                  >
                    <AppText
                      style={[
                        styles.submitButtonText,
                        !publicKeyInput.trim() && styles.submitButtonTextDisabled,
                      ]}
                    >
                      Start DM
                    </AppText>
                  </AppTouchable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.scannerContainer}>
                  <QRScanner
                    onCodeScanned={handleQRScan}
                    isScanning={scanning}
                  />
                </View>

                <AppText style={styles.footerText}>
                  The QR code should contain the format: tribe://contact/[publicKey]
                </AppText>
              </>
            )}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: wp(16),
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 8,
      padding: wp(4),
      marginBottom: hp(20),
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: hp(10),
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.accent,
    },
    toggleButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.placeholder,
    },
    toggleButtonTextActive: {
      color: theme.colors.primaryBackground,
    },
    manualInputContainer: {
      flex: 1,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primaryText,
      marginBottom: hp(12),
    },
    inputRow: {
      marginBottom: hp(16),
    },
    input: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 8,
      padding: wp(12),
      fontSize: 12,
      color: theme.colors.placeholder,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      fontFamily: 'Courier',
      minHeight: hp(80),
      textAlignVertical: 'top',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: wp(12),
    },
    actionButton: {
      flex: 1,
      paddingVertical: hp(14),
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pasteButton: {
      backgroundColor: theme.colors.cardBackground,
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    pasteButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.placeholder,
    },
    submitButton: {
      backgroundColor: theme.colors.accent,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.borderColor,
    },
    submitButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primaryBackground,
    },
    submitButtonTextDisabled: {
      color: theme.colors.placeholder,
    },
    scannerContainer: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: hp(16),
    },
    footerText: {
      fontSize: 12,
      color: theme.colors.placeholder,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    processingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    processingText: {
      fontSize: 16,
      color: theme.colors.primaryText,
      marginTop: hp(16),
    },
  });

export default StartDM;


