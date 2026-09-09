const MEMBERSHIP_TIME_ZONE = "Asia/Manila";

export function getMembershipDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MEMBERSHIP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function getStoredDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Memberships remain valid for the full configured expiration date in Manila. */
export function isMembershipExpired(
  expiration: Date | string | null | undefined,
  now = new Date(),
) {
  if (!expiration) return false;

  const expirationDate =
    expiration instanceof Date ? expiration : new Date(expiration);
  if (Number.isNaN(expirationDate.getTime())) return true;

  return getMembershipDateKey(now) > getStoredDateKey(expirationDate);
}
