import React, { useContext, useEffect } from 'react';
import { RealmProvider as Provider } from '@realm/react';
import { RealmDatabase } from './realm';
import schema from './schema';
import { stringToArrayBuffer } from 'src/utils/encryption';
import { AppContext } from 'src/contexts/AppContext';

export const realmConfig = key => ({
  path: RealmDatabase.file,
  schema,
  schemaVersion: RealmDatabase.schemaVersion,
  encryptionKey: key,
});

const AppWithNetwork = ({ children }) => {
  useEffect(() => {}, []);
  return children;
};

export function RealmProvider({ children }) {
  const { key } = useContext(AppContext);
  const encKey = stringToArrayBuffer(key);
  if (!encKey) {
    return null;
  }
  return (
    <Provider
      path={RealmDatabase.file}
      schema={schema}
      schemaVersion={RealmDatabase.schemaVersion}
      // encryptionKey={encKey}
    >
      <AppWithNetwork>{children}</AppWithNetwork>
    </Provider>
  );
}
