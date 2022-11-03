import * as PublicDAL from "../../dal/public";
import { TypesterResponse } from "../../utils/typester-response";

export async function getPublicSpeedHistogram(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { language, mode, mode2 } = req.query;
  const data = await PublicDAL.getSpeedHistogram(language, mode, mode2);
  return new Typester("Public speed histogram retrieved", data);
}

export async function getPublicTypingStats(
  _req: Typester.Request
): Promise<TypesterResponse> {
  const data = await PublicDAL.getTypingStats();
  return new TypesterResponse("Public typing stats retrieved", data);
}
