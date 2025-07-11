import { RealmSchema } from '../enum';
import realm from './realm';
import Realm from 'realm';
/**
 * intializes realm
 * @param  {ArrayBuffer|ArrayBufferView|Int8Array} key
 * @returns Promise
 */
const initializeRealm = async (
  key: ArrayBuffer | ArrayBufferView | Int8Array,
): Promise<boolean> => {
  console.log('[Realm]: Database initialising...');
  return realm.initializeDatabase(key);
};

/**
 * delete realm
 * @returns Promise
 */
const deleteRealm = (key: ArrayBuffer | ArrayBufferView | Int8Array) =>
  realm.deleteDatabase(key);

/**
 * generic :: creates an object corresponding to provided schema
 * @param  {RealmSchema} schema
 * @param  {any} object
 */
const createObject = (
  schema: RealmSchema,
  object: any,
  updateMode = Realm.UpdateMode.All,
) => {
  try {
    const hasCreated = realm.create(schema, object, updateMode);
    return hasCreated;
  } catch (err) {
    console.log(err);
  }
};

/**
 * generic :: creates objects corresponding to provided schema
 * @param  {RealmSchema} schema
 * @param  {any[]} objects
 */
const createObjectBulk = (
  schema: RealmSchema,
  objects: any[],
  updateMode = Realm.UpdateMode.All,
) => {
  try {
    if(schema === RealmSchema.Collectible || schema === RealmSchema.UniqueDigitalAsset || schema === RealmSchema.Coin ) {
      objects.forEach(object => {
        object.issuedSupply = object.issuedSupply.toString();
        object.balance.spendable = object.balance.spendable.toString();
        object.balance.future = object.balance.future.toString();
        object.balance.settled = object.balance.settled.toString();
        object.balance.offchainOutbound = object.balance.offchainOutbound?.toString();
        object.balance.offchainInbound = object.balance.offchainInbound?.toString();
        if(object.metaData) {
          object.metaData.issuedSupply = object.metaData.issuedSupply.toString();
        }
      });
    }
    const hasCreated = realm.createBulk(schema, objects, updateMode);
    return hasCreated;
  } catch (err) {
    console.log('err',err);
  }
};

/**
 * generic :: fetches an object corresponding to provided schema and the supplied instance num
 * @param  {RealmSchema} schema
 */
const getObjectByIndex = <T>(
  schema: RealmSchema,
  index: number = 0,
  all: boolean = false,
): T | T[] | undefined => {
  const objects = realm.get(schema) as Realm.Results<T>;
  if (all) {
    return Array.from(objects);
  }
  return objects[index];
};

/**
 * generic :: fetches an object corresponding to provided schema and the supplied id
 * @param  {RealmSchema} schema
 * @param  {string} id
 */
const getObjectById = (schema: RealmSchema, id: string) => {
  const objects = realm.get(schema);
  return objects.filtered(`id == '${id}'`)[0];
};

/**
 * generic :: fetches an object corresponding to provided schema and the supplied id
 * @param  {RealmSchema} schema
 * @param  {string} id
 */
const getObjectByPrimaryId = (
  schema: RealmSchema,
  name: string,
  primaryId: string,
) => {
  const objects = realm.get(schema);
  return objects.filtered(`${name} == '${primaryId}'`)[0];
};

/**
 * generic :: updates the object, corresponding to provided schema and id, w/ supplied props
 * @param  {RealmSchema} schema
 * @param  {string} id
 * @param  {any} updateProps
 */
const updateObjectById = (
  schema: RealmSchema,
  id: string,
  updateProps: any,
) => {
  try {
    const object = getObjectById(schema, id);
    for (const [key, value] of Object.entries(updateProps)) {
      realm.write(() => {
        object[key] = value;
      });
    }
    return true;
  } catch (err) {
    console.error({ err });
    return false;
  }
};

/**
 * generic :: updates the object, corresponding to provided schema and id, w/ supplied props
 * @param  {RealmSchema} schema
 * @param  {string} id
 * @param  {any} updateProps
 */
const updateObjectByPrimaryId = (
  schema: RealmSchema,
  name: string,
  primaryId: string,
  updateProps: any,
) => {
  try {
    const object = getObjectByPrimaryId(schema, name, primaryId);
    for (const [key, value] of Object.entries(updateProps)) {
      realm.write(() => {
        object[key] = value;
      });
    }
    return true;
  } catch (err) {
    console.error({ err });
    return false;
  }
};

/**
 * generic :: fetched the object corresponding to the fieldName and Value
 * @param  {RealmSchema} schema
 * @param  {any} value
 * @param  {string} fieldName
 */
const getObjectByField = (
  schema: RealmSchema,
  value: string,
  fieldName: string,
) => {
  const objects = realm.get(schema);
  return objects.filtered(`${fieldName} == '${value}'`);
};

/**
 * generic :: fetches an object corresponding to provided schema and the supplied id
 * @param  {RealmSchema} schema
 */
const getCollection = <T extends Realm.Object>(schema: RealmSchema): T[] => {
  const objects = realm.get(schema);
  return objects.toJSON() as T[];
};

/**
 * generic :: deletes an object corresponding to provided schema and the supplied id
 * @param  {RealmSchema} schema
 */
const deleteObjectById = (schema: RealmSchema, id: string) => {
  try {
    const object = getObjectById(schema, id);
    realm.delete(object);
    return true;
  } catch (err) {
    console.error({ err });
    return false;
  }
};

/**
 * generic :: deletes an object corresponding to provided schema and the supplied primary key
 * @param  {RealmSchema} schema
 */
const deleteObjectByPrimaryKey = (
  schema: RealmSchema,
  key: string,
  value: any,
) => {
  try {
    const object = getObjectByPrimaryId(schema, key, value);
    realm.delete(object);
    return true;
  } catch (err) {
    console.error({ err });
    return false;
  }
};

const updateObject = (
  schema: RealmSchema,
  existingObject: any,
  newData: any,
) => {
  realm.write(() => {
    Object.keys(newData).forEach(key => {
      existingObject[key] = newData[key];
    });
  });
};

const getObjectByTxid = (schema: RealmSchema, txid: string) => {
  return realm.get(schema).filtered('utxo.outpoint.txid == $0', txid)[0];
};

export default {
  initializeRealm,
  deleteRealm,
  deleteObjectById,
  deleteObjectByPrimaryKey,
  createObjectBulk,
  createObject,
  getObjectByIndex,
  getObjectById,
  getObjectByPrimaryId,
  updateObjectById,
  updateObjectByPrimaryId,
  getCollection,
  getObjectByField,
  updateObject,
  getObjectByTxid,
};
