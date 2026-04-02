import type { CalendarData, CalendarEvent } from "./getData";

interface GoogleCalendarProps extends CalendarData {
	width?: number;
	height?: number;
}

function formatTime(iso: string, tz: string): string {
	return new Date(iso).toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: tz,
	});
}

function formatDay(iso: string, tz: string): string {
	return new Date(iso).toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		timeZone: tz,
	});
}

function timeRange(event: CalendarEvent, tz: string): string {
	if (event.allDay) return "All day";
	return `${formatTime(event.start, tz)}–${formatTime(event.end, tz)}`;
}

export default function GoogleCalendar({
	events = [],
	currentTime = "--:--",
	currentDay = "Loading...",
	weekStart = "",
	weekEnd = "",
	timezone = "Europe/London",
	width = 800,
	height = 480,
}: GoogleCalendarProps) {
	const nowEvent = events.find((e) => e.isNow);
	const nextEvent = events.find((e) => e.isNext);
	const heroEvent = nowEvent ?? nextEvent;
	const heroLabel = nowEvent ? "NOW" : nextEvent ? "NEXT" : null;

	const listEvents = events.slice(0, 8);

	return (
		<div
			style={{
				width,
				height,
				display: "flex",
				flexDirection: "column",
				fontFamily: "sans-serif",
				background: "#fff",
				color: "#000",
				padding: "16px 20px",
				boxSizing: "border-box",
			}}
		>
			{/* Header */}
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 12,
				}}
			>
				<span style={{ fontSize: 22, fontWeight: "bold" }}>{currentDay}</span>
				<span
					style={{
						fontSize: 28,
						fontWeight: "bold",
						fontVariantNumeric: "tabular-nums",
					}}
				>
					{currentTime}
				</span>
			</div>

			{/* Hero block */}
			{heroEvent && heroLabel && (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						padding: "10px 14px",
						marginBottom: 12,
						background: nowEvent ? "#000" : "#fff",
						color: nowEvent ? "#fff" : "#000",
						border: nowEvent ? "none" : "2px solid #000",
					}}
				>
					<span
						style={{
							fontSize: 10,
							letterSpacing: 2,
							textTransform: "uppercase",
							marginBottom: 4,
						}}
					>
						{heroLabel}
					</span>
					<span style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
						{heroEvent.summary}
					</span>
					<span style={{ fontSize: 12 }}>{timeRange(heroEvent, timezone)}</span>
				</div>
			)}

			{/* Week range label */}
			<div style={{ fontSize: 12, marginBottom: 6 }}>
				{weekStart} – {weekEnd}
			</div>

			{/* Event rows */}
			<div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
				{listEvents.map((event) => (
					<div
						key={event.id}
						style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							borderBottom: "1px solid #ccc",
							padding: "4px 0",
							fontSize: 13,
						}}
					>
						<span
							style={{
								width: 64,
								flexShrink: 0,
								overflow: "hidden",
								whiteSpace: "nowrap",
							}}
						>
							{formatDay(event.start, timezone)}
						</span>
						<span
							style={{
								width: 80,
								flexShrink: 0,
								overflow: "hidden",
								whiteSpace: "nowrap",
							}}
						>
							{timeRange(event, timezone)}
						</span>
						<span
							style={{
								flex: 1,
								overflow: "hidden",
								whiteSpace: "nowrap",
								textOverflow: "ellipsis",
							}}
						>
							{event.isNow && (
								<span
									style={{
										fontSize: 10,
										fontWeight: "bold",
										marginRight: 4,
										padding: "1px 4px",
										background: "#000",
										color: "#fff",
									}}
								>
									NOW
								</span>
							)}
							{event.isNext && (
								<span
									style={{
										fontSize: 10,
										fontWeight: "bold",
										marginRight: 4,
										padding: "1px 4px",
										border: "1px solid #000",
									}}
								>
									NEXT
								</span>
							)}
							{event.summary}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
