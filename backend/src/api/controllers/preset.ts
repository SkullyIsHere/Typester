import * as PresetDAL from "../../dal/preset";
import { TypesterResponse } from "../../utils/typester-response";

export async function getPresets(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { uid } = req.ctx.decodedToken;

  const data = await PresetDAL.getPresets(uid);
  return new TypesterResponse("Preset retrieved", data);
}

export async function addPreset(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { name, config } = req.body;
  const { uid } = req.ctx.decodedToken;

  const data = await PresetDAL.addPreset(uid, name, config);

  return new TypesterResponse("Preset created", data);
}

export async function editPreset(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { _id, name, config } = req.body;
  const { uid } = req.ctx.decodedToken;

  await PresetDAL.editPreset(uid, _id, name, config);

  return new TypesterResponse("Preset updated");
}

export async function removePreset(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { presetId } = req.params;
  const { uid } = req.ctx.decodedToken;

  await PresetDAL.removePreset(uid, presetId);

  return new TypesterResponse("Preset deleted");
}
