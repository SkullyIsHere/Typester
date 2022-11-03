import * as PsaDAL from "../../dal/psa";
import { Typester } from "../../utils/typester-response";

export async function getPsas(
  _req: Typester.Request
): Promise<TypesterResponse> {
  const data = await PsaDAL.get();
  return new TypesterResponse("PSAs retrieved", data);
}
