import { useMutation, useQuery } from 'react-query';
import { AuthService } from 'src/services/auth/AuthService';
import { Keys, Storage } from 'src/storage';
import PinMethod from 'src/models/enums/PinMethod';

export const useAuth = () => {
  const authService = AuthService.getInstance();

  const loginMutation = useMutation(async () => {
    return await authService.login();
  });

  const loginWithPinMutation = useMutation(async (pin: string) => {
    return await authService.loginWithPin(pin);
  });

  const biometricLoginMutation = useMutation(async (signature: string) => {
    return await authService.biometricLogin(signature);
  });

  const createPinMutation = useMutation(async (pin: string) => {
    return await authService.createPin(pin);
  });
  
  const verifyPinMutation = useMutation(async (pin: string) => {
      return await authService.verifyPin(pin);
  });

  const changePinMutation = useMutation(async ({ key, pin }: { key: string; pin?: string }) => {
      return await authService.changePin(key, pin);
  });

  // Query for Pin Method
  const usePinMethod = () => useQuery(['pinMethod'], async () => {
    const pinMethod = await Storage.get(Keys.PIN_METHOD);
    return pinMethod as PinMethod;
  });

  return {
    login: loginMutation,
    loginWithPin: loginWithPinMutation,
    biometricLogin: biometricLoginMutation,
    createPin: createPinMutation,
    verifyPin: verifyPinMutation,
    changePin: changePinMutation,
    usePinMethod,
  };
};
