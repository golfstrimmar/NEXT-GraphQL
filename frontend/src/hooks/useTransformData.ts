export default function transformData(rawTimestamp: string) {
  const timestamp = Number(rawTimestamp);
  const date = new Date(timestamp);

  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(date);

  return formattedDate;
}
