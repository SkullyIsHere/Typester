import _ from "lodash";
import { randomBytes } from "crypto";
import { hash } from "bcrypt";
import * as ApeKeysDAL from "../../dal/ape-keys";
import TypesterError from "../../utils/error";
import { TypesterResponse } from "../../utils/Typester-response";
import { base64UrlEncode } from "../../utils/misc";
import { ObjectId } from "mongodb";

function cleanApeKey(apeKey: MonkeyTypes.ApeKey): Partial<TypesterTypes.ApeKey> {
  return _.omit(apeKey, "hash", "_id", "uid", "useCount");
}

export async function getApeKeys(
  req: TypesterTypes.Request
): Promise<TypesterResponse> {
  const { uid } = req.ctx.decodedToken;

  const apeKeys = await ApeKeysDAL.getApeKeys(uid);
  const cleanedKeys = _(apeKeys).keyBy("_id").mapValues(cleanApeKey).value();

  return new TypesterResponse("ApeKeys retrieved", cleanedKeys);
}

export async function generateApeKey(
  req: TypesterTypes.Request
): Promise<TypesterResponse> {
  const { name, enabled } = req.body;
  const { uid } = req.ctx.decodedToken;
  const { maxKeysPerUser, apeKeyBytes, apeKeySaltRounds } =
    req.ctx.configuration.apeKeys;

  const currentNumberOfApeKeys = await ApeKeysDAL.countApeKeysForUser(uid);

  if (currentNumberOfApeKeys >= maxKeysPerUser) {
    throw new TypeyError(409, "Maximum number of ApeKeys have been generated");
  }

  const apiKey = randomBytes(apeKeyBytes).toString("base64url");
  const saltyHash = await hash(apiKey, apeKeySaltRounds);

  const apeKey: TypesterTypes.ApeKey = {
    _id: new ObjectId(),
    name,
    enabled,
    uid,
    hash: saltyHash,
    createdOn: Date.now(),
    modifiedOn: Date.now(),
    lastUsedOn: -1,
    useCount: 0,
  };

  const apeKeyId = await ApeKeysDAL.addApeKey(apeKey);

  return new TypesterResponse("ApeKey generated", {
    apeKey: base64UrlEncode(`${apeKeyId}.${apiKey}`),
    apeKeyId,
    apeKeyDetails: cleanApeKey(apeKey),
  });
}

export async function editApeKey(
  req: TypesterTypes.Request
): Promise<TypesterResponse> {
  const { apeKeyId } = req.params;
  const { name, enabled } = req.body;
  const { uid } = req.ctx.decodedToken;

  await ApeKeysDAL.editApeKey(uid, apeKeyId, name, enabled);

  return new TypesterResponse("ApeKey updated");
}

export async function deleteApeKey(
  req: TypesterTypes.Request
): Promise<TypesterResponse> {
  const { apeKeyId } = req.params;
  const { uid } = req.ctx.decodedToken;

  await ApeKeysDAL.deleteApeKey(uid, apeKeyId);

  return new TypesterResponse("ApeKey deleted");
}
