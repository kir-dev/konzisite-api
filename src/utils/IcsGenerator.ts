export function GenerateIcs(consultation) {
  const startString =
    consultation.startDate.getFullYear().toString() +
    ('0' + (consultation.startDate.getMonth() + 1).toString()).slice(-2) +
    ('0' + consultation.startDate.getDate().toString()).slice(-2) +
    `T` +
    ('0' + consultation.startDate.getHours().toString()).slice(-2) +
    ('0' + consultation.startDate.getMinutes().toString()).slice(-2) +
    ('0' + consultation.startDate.getSeconds().toString()).slice(-2)
  const endString =
    consultation.endDate.getFullYear().toString() +
    ('0' + consultation.endDate.getMonth().toString()).slice(-2) +
    ('0' + consultation.endDate.getDate().toString()).slice(-2) +
    `T` +
    ('0' + consultation.endDate.getHours().toString()).slice(-2) +
    ('0' + consultation.endDate.getMinutes().toString()).slice(-2) +
    ('0' + consultation.endDate.getSeconds().toString()).slice(-2)

  const eventText = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VTIMEZONE
TZID:Europe/Budapest
X-LIC-LOCATION:Europe/Budapest
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTART;TZID=Europe/Budapest:${startString}
DTEND;TZID=Europe/Budapest:${endString}
X-MICROSOFT-CDO-OWNERAPPTID:-1911733949
DESCRIPTION: ${consultation.descMarkdown.toString()}
LOCATION:${consultation.location.toString()}
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:${consultation.name.toString()}
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`
  return eventText
}
