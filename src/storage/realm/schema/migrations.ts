import AppType from 'src/models/enums/AppType';
import { RealmSchema } from 'src/storage/enum';

export const runRealmMigrations = ({
  oldRealm,
  newRealm,
}: {
  oldRealm: Realm;
  newRealm: Realm;
}) => {
  if (oldRealm.schemaVersion < 27) {
    const oldObjects = oldRealm.objects(RealmSchema.TribeApp);
    const newObjects = newRealm.objects(RealmSchema.TribeApp);
    for (let i = 0; i < newObjects.length; i++) {
      if (!oldObjects[i].appType) {
        newObjects[i].appType = AppType.ON_CHAIN;
      }
    }
  }
};
