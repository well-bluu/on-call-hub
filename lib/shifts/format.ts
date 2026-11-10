const pad = (n: number) => String(n).padStart(2, "0");

export function toLocalKey(date: Date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toLocalTime(date: Date) {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fmtClock(date: Date) {
	return date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
}

export function fmtLongDate(date: Date) {
	return date
		.toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric"})
		.toUpperCase();
}

export function timeAgo(iso: string) {
	const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	const days = Math.round(hours / 24);
	return `${days} day${days === 1 ? "" : "s"} ago`;
}
