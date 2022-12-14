import _ from "lodash";
import { getCurrentDayTimestamp, MILLISECONDS_IN_DAY } from "../../utils/misc";
import { TypesterResponse } from "../../utils/typester-response";
import * as LeaderboardsDAL from "../../dal/leaderboards";
import TypesterError from "../../utils/error";
import * as DailyLeaderboards from "../../utils/daily-leaderboards";

export async function getLeaderboard(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { language, mode, mode2, skip, limit = 50 } = req.query;
  const { uid } = req.ctx.decodedToken;

  const queryLimit = Math.min(parseInt(limit as string, 10), 50);

  const leaderboard = await LeaderboardsDAL.get(
    mode as string,
    mode2 as string,
    language as string,
    parseInt(skip as string, 10),
    queryLimit
  );

  if (leaderboard === false) {
    return new TypesterResponse(
      "Leaderboard is currently updating. Please try again in a few seconds.",
      null,
      503
    );
  }

  if (!leaderboard) {
    throw new TypesterError(
      404,
      `No ${mode} ${mode2} leaderboard found`,
      `getLeaderboard${mode}${mode2}`,
      uid
    );
  }

  const normalizedLeaderboard = _.map(leaderboard, (entry) => {
    return uid && entry.uid === uid
      ? entry
      : _.omit(entry, ["_id", "difficulty", "language"]);
  });

  return new Typester("Leaderboard retrieved", normalizedLeaderboard);
}

export async function getRankFromLeaderboard(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { language, mode, mode2 } = req.query;
  const { uid } = req.ctx.decodedToken;

  const data = await LeaderboardsDAL.getRank(
    mode as string,
    mode2 as string,
    language as string,
    uid
  );
  if (data === false) {
    return new TypesterResponse(
      "Leaderboard is currently updating. Please try again in a few seconds.",
      null,
      503
    );
  }

  return new TypesterResponse("Rank retrieved", data);
}

function getDailyLeaderboardWithError(
  req: Typester.Request
): DailyLeaderboards.DailyLeaderboard {
  const { language, mode, mode2, daysBefore } = req.query;

  const normalizedDayBefore = parseInt(daysBefore as string, 10);
  const currentDayTimestamp = getCurrentDayTimestamp();
  const dayBeforeTimestamp =
    currentDayTimestamp - normalizedDayBefore * MILLISECONDS_IN_DAY;

  const customTimestamp = _.isNil(daysBefore) ? -1 : dayBeforeTimestamp;

  const dailyLeaderboard = DailyLeaderboards.getDailyLeaderboard(
    language as string,
    mode as string,
    mode2 as string,
    req.ctx.configuration.dailyLeaderboards,
    customTimestamp
  );
  if (!dailyLeaderboard) {
    throw new TypesterError(404, "There is no daily leaderboard for this mode");
  }

  return dailyLeaderboard;
}

export async function getDailyLeaderboard(
  req: Typester.Request
): Promise<TypesterResponse> {
  const { skip = 0, limit = 50 } = req.query;

  const dailyLeaderboard = getDailyLeaderboardWithError(req);

  const minRank = parseInt(skip as string, 10);
  const maxRank = minRank + parseInt(limit as string, 10) - 1;

  const topResults = await dailyLeaderboard.getResults(
    minRank,
    maxRank,
    req.ctx.configuration.dailyLeaderboards
  );

  return new MonkeyResponse("Daily leaderboard retrieved", topResults);
}

export async function getDailyLeaderboardRank(
  req: MonkeyTypes.Request
): Promise<TypesterResponse> {
  const { uid } = req.ctx.decodedToken;

  const dailyLeaderboard = getDailyLeaderboardWithError(req);

  const rank = await dailyLeaderboard.getRank(
    uid,
    req.ctx.configuration.dailyLeaderboards
  );

  return new TypesterResponse("Daily leaderboard rank retrieved", rank);
}
