# Time

The monotonic clock measures intervals and never goes backwards; the wall clock gives the date and time and can jump when the system clock is set. Dates and times are in UTC, on the Gregorian calendar extended backwards, and time zones give them as a zone's clocks show them. Durations count whole nanoseconds, and their arithmetic is checked like any integer arithmetic.

```sayon
time = import("standard/time.sayon")

start = time.start()
time.sleep(time.milliseconds(50))
print(time.describe(time.elapsed(start)))     # such as 50.12ms
print(time.format(time.now()))                # such as 2026-10-18T09:30:00Z
moment = time.parse("2026-10-18T09:30:00+02:00")
print(time.format(moment), time.weekday(moment))   # 2026-10-18T07:30:00Z 7
```

`time.zone(name)` is a `Zone` of the IANA time zone database, such as `"Europe/Paris"`, and fails with `TimeZoneError` for a name the system does not know; `time.local_zone()` is the system's own. `zone.at(moment)` gives a `ZonedTime`: the `local` date and time the zone's clocks show, their `offset` from UTC, and the zone, whose `format()` writes ISO 8601 with the offset and whose `moment()` is the moment in UTC again. `zone.moment(local)` goes the other way, from a local date and time to its moment: a local time the clocks skip when they go forward falls after the gap, and one they show twice is the earlier. The rules come from the system: on Windows from the ICU library it ships, on Android from the database the phone keeps up to date, with the phone's own zone as the local one, and elsewhere from `/usr/share/zoneinfo`, or the directory `TZDIR` names; `time.zones_version()` tells their version.

```sayon
paris = time.zone("Europe/Paris")
print(paris.at(time.parse("2026-07-15T12:00:00Z")).format())   # 2026-07-15T14:00:00+02:00
print(time.format(paris.moment(time.parse("2026-12-24T18:00:00Z"))))   # 2026-12-24T17:00:00Z
```

`time.deadline(duration)` is a `Deadline` that long from now, whose `remaining()` is the time left (none once it has passed), `passed()` tells whether it has, and `wait()` waits for it. `time.ticker(interval)` is a `Ticker`, whose `wait()` waits for its next beat and gives how many beats have come: the beats keep to the interval however long the work between them takes, and when the work took longer than an interval, the beats missed count too.
