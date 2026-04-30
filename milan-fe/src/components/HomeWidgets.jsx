import { useEffect, useState } from "react";
import NotificationsWidget from "./NotificationsWidget.jsx";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function ClockWidget() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h24 = now.getHours();
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  const mm = pad(now.getMinutes());
  const time = `${pad(h12)}:${mm}`;

  const greeting =
    h24 < 5 ? "Late night"
    : h24 < 12 ? "Good morning"
    : h24 < 17 ? "Good afternoon"
    : h24 < 21 ? "Good evening"
    : "Good night";

  return (
    <div id="clock-widget" className="widget-clock" aria-label={`Time ${time} ${ampm}`}>
      <div className="clock-glow" aria-hidden />
      <div className="clock-row">
        <span id="clock-time" className="clock-time">{time}</span>
        <span id="clock-ampm" className="clock-ampm">{ampm}</span>
      </div>
      <div id="clock-greeting" className="clock-sub">
        {greeting} · {DAYS[now.getDay()]}
      </div>
    </div>
  );
}

function DateWidget() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay++, current: false });
  }

  return (
    <div id="date-widget" className="widget-date">
      <div className="date-headline">
        <div id="date-head" className="date-head">
          <span id="date-dow" className="date-dow">{DAYS[now.getDay()]}</span>
          <span id="date-month" className="date-month">{MONTHS[month]}</span>
        </div>
        <div id="date-day-num" className="date-num">{today}</div>
      </div>
      <div
        id="date-calendar"
        className="date-cal"
        aria-label={`${MONTHS[month]} ${year} calendar`}
      >
        <div className="cal-grid">
          {DOW.map((d) => (
            <div key={d} className="cal-dow">{d}</div>
          ))}
          {cells.map((c, i) => (
            <div
              key={i}
              id={c.current ? `calendar-day-${c.day}` : undefined}
              className={
                "cal-cell" +
                (c.current ? "" : " muted") +
                (c.current && c.day === today ? " today" : "")
              }
            >
              {c.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeWidgets() {
  return (
    <>
      <div id="home-clock-slot" className="home-clock-slot">
        <ClockWidget />
      </div>
      <div id="home-widget-stack" className="widget-stack">
        <DateWidget />
        <NotificationsWidget />
      </div>
    </>
  );
}
