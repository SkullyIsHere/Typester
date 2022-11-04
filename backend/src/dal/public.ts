import * as db from "../init/db";
import { roundTo2 } from "../utils/misc";
import TypesterError from "../utils/error";

export async function updateStats(
  restartCount: number,
  time: number
): Promise<boolean> {
  await db.collection<typester.PublicStats>("public").updateOne(
    { type: "stats" },
    {
      $inc: {
        testsCompleted: 1,
        testsStarted: restartCount + 1,
        timeTyping: roundTo2(time),
      },
    },
    { upsert: true }
  );
  return true;
}


 */
export async function getSpeedHistogram(
  language,
  mode,
  mode2
): Promise<Record<string, number>> {
  const key = `${language}_${mode}_${mode2}`;
  const stats = await db
    .collection<MonkeyTypes.PublicSpeedStats>("public")
    .findOne({ type: "speedStats" }, { projection: { [key]: 1 } });
  return stats?.[key] ?? {};
}

/** Get typing stats such as total number of tests completed on site */
export async function getTypingStats(): Promise<Typester.PublicStats> {
  const stats = await db
    .collection<Typester.PublicStats>("public")
    .findOne({ type: "stats" }, { projection: { _id: 0 } });
  if (!stats) {
    throw new TypesterError(
      404,
      "Public typing stats not found",
      "get typing stats"
    );
  }
  return stats;
}
