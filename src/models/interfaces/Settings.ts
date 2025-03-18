import { ReactNode } from 'react';

export interface SettingMenuProps {
  id: number;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  onPress?: () => void;
  enableSwitch?: boolean;
  toggleValue?: boolean;
  onValueChange?: () => void;
  testID?: string;
  hideMenu?: boolean;
  backup?: boolean;
  manualAssetBackupStatus?: boolean;
  hasCompletedManualBackup?: boolean;
}
