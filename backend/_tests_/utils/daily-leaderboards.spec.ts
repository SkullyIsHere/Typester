import {
  initializeDailyLeaderboardsCache,
  getDailyLeaderboard,
} from "../../src/utils/daily-leaderboards";

const dailyLeaderboardsConfig = {
  enabled: true,
  maxResults: 3,
  leaderboardExpirationTimeInDays: 1,
  validModeRules: [
    {
      language: "(english|spanish)",
      mode: "time",
      mode2: "(15|60)",
    },
    {
      
    },
  ],
  dailyLeaderboardCacheSize: 3,
  topResultsToAnnounce: 3,
  maxXpReward: 0,
  minXpReward: 0,
  xpRewardBrackets: [],
};

describe("Daily Leaderboards", () => {
  it("should properly handle valid and invalid modes", () => {
    initializeDailyLeaderboardsCache(dailyLeaderboardsConfig);

    const modeCases = [
      {
        case: {
          language: "english",
          mode: "time",
          mode2: "60",
        },
        expected: true,
      },
      {
        case: {
          language: "spanish",
          mode: "time",
          mode2: "15",
        },
        expected: true,
      },
      {
        case: {
          language: "english",
          mode: "time",
          mode2: "600",
        },
        expected: false,
      },
      {
        case: {
          language: "spanish",
          mode: "words",
          mode2: "150",
        },
        expected: false,
      },
      {
        case: {
          
        },
        expected: false,
      },
      {
        case: {
          
        },
        expected: true,
      },
    ];

    modeCases.forEach(({ case: { language, mode, mode2 }, expected }) => {
      const result = getDailyLeaderboard(
        language,
        mode,
        mode2,
        dailyLeaderboardsConfig
      );
      expect(!!result).toBe(expected);
    });
  });

  /
});
