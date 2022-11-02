import * as ConfigDAL from "../../dal/config";
import { TypesterResponse } from "../../utils/Typester-response";

export async function getConfig(
  req: .Request
): Promise<TypesterResponse> {
  const { uid } = req.ctx.decodedToken;

  const data = await ConfigDAL.getConfig(uid);
  return new TypesterResponse("Configuration retrieved", data);
}

export async function saveConfig(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { config } = req.body;
  const { uid } = req.ctx.decodedToken;

  await ConfigDAL.saveConfig(uid, config);

  return new TypesterResponse("Config updated");
}
