export function getMonthRanges(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-based index (0 = January, 11 = December)

  return {
    startOfLastMonth: new Date(Date.UTC(year, month - 1, 1)),
    startOfThisMonth: new Date(Date.UTC(year, month, 1)),
    startOfNextMonth: new Date(Date.UTC(year, month + 1, 1)),
  };
}

export function getStartOfTodayUTC(now = new Date()) {// get the start of today in UTC (00:00:00) because  in db we store dates in UTC, so we need to compare with UTC dates
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}  