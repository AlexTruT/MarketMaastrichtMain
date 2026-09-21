/** Pure countdown/copy helpers — safe for server and client. */

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function formatNextFriday(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Amsterdam",
  });
}

export function clockLabel(now: Date, cutoff: Date, close: Date): string {
  if (now >= cutoff && now < close) {
    return "Open now until 15:00";
  }

  if (now >= close) {
    const next = new Date(close.getTime() + 7 * 24 * 60 * 60 * 1000);
    return `Next market: ${formatNextFriday(next)}`;
  }

  const ms = cutoff.getTime() - now.getTime();
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days > 0) {
    return `${plural(days, "day", "days")} ${plural(hours, "hour", "hours")} left`;
  }
  if (hours > 0) {
    return `${plural(hours, "hour", "hours")} ${plural(mins, "minute", "minutes")} left`;
  }
  return `${plural(mins, "minute", "minutes")} left`;
}

export function clockNote(now: Date, cutoff: Date, close: Date): string {
  if (now >= cutoff && now < close) {
    return "Our shopper is on the Markt right now. Ordering reopens tonight.";
  }
  if (now >= close) {
    return "The Markt has packed up. Order ahead for the next Friday.";
  }
  return "Order before Friday 10:00 and it is on your table the same afternoon.";
}
