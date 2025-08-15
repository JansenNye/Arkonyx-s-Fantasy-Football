export type TeamCount = 10 | 12;

export const strategyAdvice: Record<TeamCount, Record<number, string>> = {
  10: {
    1: "Placeholder advice for 10-team leagues, slot 1. Replace with your own guidance.",
    2: "Placeholder advice for 10-team leagues, slot 2. Replace with your own guidance.",
    3: "Placeholder advice for 10-team leagues, slot 3. Replace with your own guidance.",
    4: "Placeholder advice for 10-team leagues, slot 4. Replace with your own guidance.",
    5: "Placeholder advice for 10-team leagues, slot 5. Replace with your own guidance.",
    6: "Placeholder advice for 10-team leagues, slot 6. Replace with your own guidance.",
    7: "Placeholder advice for 10-team leagues, slot 7. Replace with your own guidance.",
    8: "Placeholder advice for 10-team leagues, slot 8. Replace with your own guidance.",
    9: "Placeholder advice for 10-team leagues, slot 9. Replace with your own guidance.",
    10: "Placeholder advice for 10-team leagues, slot 10. Replace with your own guidance."
  },
  12: {
    1: "Ja'Marr Chase. On to round 2.\nIf you really want to take Bijan Robinson, you can, but Ja'Marr Chase is the guy.",
    2: "Placeholder advice for 12-team leagues, slot 2. Replace with your own guidance.",
    3: "Placeholder advice for 12-team leagues, slot 3. Replace with your own guidance.",
    4: "Placeholder advice for 12-team leagues, slot 4. Replace with your own guidance.",
    5: "Placeholder advice for 12-team leagues, slot 5. Replace with your own guidance.",
    6: "Placeholder advice for 12-team leagues, slot 6. Replace with your own guidance.",
    7: "Placeholder advice for 12-team leagues, slot 7. Replace with your own guidance.",
    8: "Placeholder advice for 12-team leagues, slot 8. Replace with your own guidance.",
    9: "Placeholder advice for 12-team leagues, slot 9. Replace with your own guidance.",
    10: "Placeholder advice for 12-team leagues, slot 10. Replace with your own guidance.",
    11: "Placeholder advice for 12-team leagues, slot 11. Replace with your own guidance.",
    12: "Placeholder advice for 12-team leagues, slot 12. Replace with your own guidance."
  }
};

export const getAdviceByOverallPick = (teamCount: TeamCount, overallPick: number): string => {
  return `Placeholder advice for ${teamCount}-team leagues, overall pick ${overallPick}. Replace with your own guidance.`;
}; 