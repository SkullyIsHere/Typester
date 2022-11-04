import * as db from "../init/db";

export async function get(): Promise<Typester.PSA[]> {
  return await db.collection<Typester.PSA>("psa").find().toArray();
}
