const pad = (n: number) => String(n).padStart(2, "0");

export function toLocalKey(date: Date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toLocalTime(date: Date) {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
