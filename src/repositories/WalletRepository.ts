import RealmDatabase from 'src/storage/realm/realm';
import { RealmSchema } from 'src/storage/enum';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import Realm from 'realm';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';

export class WalletRepository {
  private static instance: WalletRepository;
  private db: typeof RealmDatabase;

  private constructor() {
    this.db = RealmDatabase;
  }

  static getInstance(): WalletRepository {
    if (!WalletRepository.instance) {
      WalletRepository.instance = new WalletRepository();
    }
    return WalletRepository.instance;
  }

  /**
   * Get all wallets
   */
  getWallets(): Realm.Results<Wallet> {
    const results = this.db.get(RealmSchema.Wallet);
    return results as unknown as Realm.Results<Wallet>;
  }

  /**
   * Get wallet by ID
   */
  getWalletById(id: string): Wallet | undefined {
    const wallets = this.getWallets();
    return wallets.filtered(`id == "${id}"`)[0];
  }

  /**
   * Create a new wallet
   */
  createWallet(wallet: Wallet): boolean {
    return this.db.create(RealmSchema.Wallet, wallet, Realm.UpdateMode.Modified);
  }

  /**
   * Update existing wallet
   */
  updateWallet(id: string, updates: Partial<Wallet>): void {
    const wallet = this.getWalletById(id);
    if (wallet) {
      this.db.write(() => {
        Object.assign(wallet, updates);
      });
    }
  }

  /**
   * Delete a wallet
   */
  deleteWallet(wallet: Wallet): void {
    this.db.delete(wallet);
  }
}
