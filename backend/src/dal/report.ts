import TypesterError from "../utils/error";
import * as db from "../init/db";

const COLLECTION_NAME = "reports";

export async function createReport(
  report: Typester.Report,
  maxReports: number,
  contentReportLimit: number
): Promise<void> {
  const reportsCount = await db
    .collection<MonkeyTypes.Report>(COLLECTION_NAME)
    .estimatedDocumentCount();

  if (reportsCount >= maxReports) {
    throw new TypesterError(
      503,
      "Reports are not being accepted at this time due to a large backlog of reports. Please try again later."
    );
  }

  const sameReports = await db
    .collection<Typester.Report>(COLLECTION_NAME)
    .find({ contentId: report.contentId })
    .toArray();

  if (sameReports.length >= contentReportLimit) {
    throw new TypesterError(
      409,
      "A report limit for this content has been reached."
    );
  }

  await db.collection<Typester.Report>(COLLECTION_NAME).insertOne(report);
}
