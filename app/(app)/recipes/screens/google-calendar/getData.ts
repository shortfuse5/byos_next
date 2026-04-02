export interface CalendarEvent {
	id: string;
	summary: string;
	start: string;
	end: string;
	allDay: boolean;
	isNow: boolean;
	isNext: boolean;
}

export interface CalendarData {
	events: CalendarEvent[];
	currentTime: string;
	currentDay: string;
	weekStart: string;
	weekEnd: string;
	timezone: string;
}

interface GoogleCalendarEventDateTime {
	dateTime?: string;
	date?: string;
	timeZone?: string;
}

interface GoogleCalendarItem {
	id?: string;
	summary?: string;
	start?: GoogleCalendarEventDateTime;
	end?: GoogleCalendarEventDateTime;
}

interface GoogleCalendarResponse {
	items?: GoogleCalendarItem[];
}

function buildEmptyData(tz: string): CalendarData {
	const now = new Date();

	const currentTime = new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: tz,
	}).format(now);

	const currentDay = new Intl.DateTimeFormat("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: tz,
	}).format(now);

	const weekEndDate = new Date(now);
	weekEndDate.setDate(weekEndDate.getDate() + 7);

	const weekStart = new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		timeZone: tz,
	}).format(now);

	const weekEnd = new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		timeZone: tz,
	}).format(weekEndDate);

	return { events: [], currentTime, currentDay, weekStart, weekEnd, timezone: tz };
}

export default async function getData(
	params?: Record<string, unknown>,
): Promise<CalendarData> {
	const calendarId =
		(params?.calendarId as string | undefined) ||
		process.env.GOOGLE_CALENDAR_ID;
	const apiKey =
		(params?.apiKey as string | undefined) ||
		process.env.GOOGLE_CALENDAR_API_KEY;
	const timezone = (params?.timezone as string | undefined) || "Europe/London";

	if (!calendarId || !apiKey) {
		return buildEmptyData(timezone);
	}

	const now = new Date();
	const timeMin = new Date(now);
	timeMin.setHours(0, 0, 0, 0);
	const timeMax = new Date(now);
	timeMax.setDate(timeMax.getDate() + 7);

	const url = new URL(
		`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
	);
	url.searchParams.set("key", apiKey);
	url.searchParams.set("timeMin", timeMin.toISOString());
	url.searchParams.set("timeMax", timeMax.toISOString());
	url.searchParams.set("singleEvents", "true");
	url.searchParams.set("orderBy", "startTime");
	url.searchParams.set("maxResults", "20");

	let items: GoogleCalendarItem[] = [];
	try {
		const res = await fetch(url.toString(), { next: { revalidate: 300 } });
		if (!res.ok) {
			console.error(`Google Calendar API error: ${res.status}`);
			return buildEmptyData(timezone);
		}
		const json = (await res.json()) as GoogleCalendarResponse;
		items = json.items ?? [];
	} catch (err) {
		console.error("Failed to fetch Google Calendar data:", err);
		return buildEmptyData(timezone);
	}

	let nextFound = false;
	const events: CalendarEvent[] = items.map((item) => {
		const allDay = !item.start?.dateTime;
		const startIso = item.start?.dateTime ?? item.start?.date ?? "";
		const endIso = item.end?.dateTime ?? item.end?.date ?? "";
		const startDate = new Date(startIso);
		const endDate = new Date(endIso);

		const isNow = !allDay && now >= startDate && now < endDate;

		let isNext = false;
		if (!allDay && !nextFound && startDate > now) {
			isNext = true;
			nextFound = true;
		}

		return {
			id: item.id ?? startIso,
			summary: item.summary ?? "(No title)",
			start: startIso,
			end: endIso,
			allDay,
			isNow,
			isNext,
		};
	});

	const currentTime = new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: timezone,
	}).format(now);

	const currentDay = new Intl.DateTimeFormat("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: timezone,
	}).format(now);

	const weekEndDate = new Date(now);
	weekEndDate.setDate(weekEndDate.getDate() + 7);

	const weekStart = new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		timeZone: timezone,
	}).format(now);

	const weekEnd = new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		timeZone: timezone,
	}).format(weekEndDate);

	return { events, currentTime, currentDay, weekStart, weekEnd, timezone };
}
