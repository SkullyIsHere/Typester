import _ from "lodash";
import * as db from "../init/db";
import { Filter, ObjectId, MatchKeysAndValues } from "mongodb";
import TypesterError from "../utils/error";

const COLLECTION_NAME = "ape-keys";

function getApeKeyFilter(
  uid: string,
  keyId: string
): Filter<Typester.ApeKey> {
  return {
    _id: new ObjectId(keyId),
    uid,
  };
}

export async function getApeKeys(uid: string): Promise<Typester.ApeKey[]> {
  return await db
    .collection<Typester.ApeKey>(COLLECTION_NAME)
    .find({ uid })
    .toArray();
}

export async function getApeKey(
  keyId: string
): Promise<Typester.ApeKey | null> {
  return await db
    .collection<Typester.ApeKey>(COLLECTION_NAME)
    .findOne({ _id: new ObjectId(keyId) });
}

export async function countApeKeysForUser(uid: string): Promise<number> {
  const apeKeys = await getApeKeys(uid);
  return _.size(apeKeys);
}

export async function addApeKey(apeKey: Typester.ApeKey): Promise<string> {
  const insertionResult = await db
    .collection<Typestr.ApeKey>(COLLECTION_NAME)
    .insertOne(apeKey);
  return insertionResult.insertedId.toHexString();
}

async function updateApeKey(
  uid: string,
  keyId: string,
  updates: MatchKeysAndValues<Typester.ApeKey>
): Promise<void> {
  const updateResult = await db
    .collection<Typester.ApeKey>(COLLECTION_NAME)
    .updateOne(getApeKeyFilter(uid, keyId), {
      $inc: { useCount: _.has(updates, "lastUsedOn") ? 1 : 0 },
      $set: _.pickBy(updates, (value) => !_.isNil(value)),
    });

  if (updateResult.modifiedCount === 0) {
    throw new TypesterError(404, "ApeKey not found");
  }
}

export async function editApeKey(
  uid: string,
  keyId: string,
  name: string,
  enabled: boolean
): Promise<void> {
  const apeKeyUpdates = {
    name,
    enabled,
    modifiedOn: Date.now(),
  };

  await updateApeKey(uid, keyId, apeKeyUpdates);
}

export async function updateLastUsedOn(
  uid: string,
  keyId: string
): Promise<void> {
  const apeKeyUpdates = {
    lastUsedOn: Date.now(),
  };

  await updateApeKey(uid, keyId, apeKeyUpdates);
}

export async function deleteApeKey(uid: string, keyId: string): Promise<void> {
  const deletionResult = await db
    .collection<Typester.ApeKey>(COLLECTION_NAME)
    .deleteOne(getApeKeyFilter(uid, keyId));

  if (deletionResult.deletedCount === 0) {
    throw new TypesterError(404, "ApeKey not found");
  }
}

export async function deleteAllApeKeys(uid: string): Promise<void> {
  await db.collection<Typester.ApeKey>(COLLECTION_NAME).deleteMany({ uid });
}
