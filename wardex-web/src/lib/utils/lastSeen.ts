import { formatDistanceToNow } from "date-fns";

export const lastSeen = (dateStr: string) => {
  const text = formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  if (text.includes("less than a minute")) return "Just now";
  return text;
};
