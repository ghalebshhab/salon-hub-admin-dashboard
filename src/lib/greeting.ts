/** SalonHub works on Jordan time, wherever the admin is. */
const JORDAN_TIME_ZONE = "Asia/Amman";
/** "Good morning" until noon, then "Good evening", as people say it in Jordan. */
const NOON = 12;

const hourFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: JORDAN_TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

/** The hour (0–23) in Jordan now. */
export function jordanHour(now: Date = new Date()): number {
  return Number(hourFormat.format(now));
}

/** "Good morning" or "Good evening", by the time in Jordan. */
export function jordanGreeting(now: Date = new Date()): string {
  const hour = jordanHour(now);
  return hour >= 5 && hour < NOON ? "Good morning" : "Good evening";
}

/** For example "Good morning Ghaleb, good to see you." */
export function welcomeLine(firstName: string | null | undefined, now: Date = new Date()): string {
  const name = firstName?.trim();
  return name
    ? `${jordanGreeting(now)} ${name}, good to see you.`
    : `${jordanGreeting(now)}, good to see you.`;
}
