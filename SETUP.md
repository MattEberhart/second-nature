# Second Nature estimator setup

The estimator UI works locally with the launch catalog, but saving, scheduling,
delivery calculations, emails, and Lydia's dashboard require the services below.
The source inventory workbook is reference-only and is never edited or queried by
the production application.

## 1. Supabase

The dedicated `second-nature` project (`yrincjetscfhcjtuwlkl`) is already live in
`us-east-1`. Both repository migrations have been applied, the launch catalog has
been loaded, and its public and server-only credentials are installed in every
Vercel environment. The existing Supabase projects were not modified.

Set `ADMIN_EMAILS` in Vercel to a comma-separated list of Google accounts that may
open the dashboard. Those addresses can be regular Gmail or Workspace accounts.
Set `CALENDAR_OWNER_EMAIL` to Lydia's Workspace account only; this is the sole
account allowed to connect the booking calendar. `LYDIA_EMAIL` independently
controls estimate and appointment notifications. The generated
`APP_ENCRYPTION_KEY` is already installed in Vercel.

The free Supabase plan can pause after inactivity. It is suitable for development;
review the production plan before relying on it for uninterrupted lead capture.

## 2. Google Workspace, Calendar, and Meet

1. Create Lydia's business Google Workspace account.
2. In Google Cloud Console, create a project and enable **Google Calendar API**.
3. Configure the OAuth consent screen and create a Web OAuth client.
4. In the OAuth client, add this authorized redirect URI:
   `https://yrincjetscfhcjtuwlkl.supabase.co/auth/v1/callback`.
5. Put the Google client ID and secret into both Supabase's Google Auth provider
   settings and the Vercel `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` variables.
6. In Supabase Auth URL Configuration, set the site URL to
   `https://www.secondnaturecreative.com` and add
   `https://www.secondnaturecreative.com/auth/callback` to the redirect allow list.
7. In Lydia's business Calendar, create a secondary calendar named **Second Nature
   Consultations**. Copy its Calendar ID into `GOOGLE_BOOKING_CALENDAR_ID`.
8. From Lydia's personal Google Calendar, share the calendar with her business
   account using **See only free/busy (hide details)**.
9. In the business account, subscribe to that shared calendar. Copy its calendar
   ID/email into **Busy calendar IDs** in `/admin`, alongside `primary` and the
   consultations calendar ID.
10. Sign into `/admin` with Lydia's approved Workspace account, then select
    **Connect calendar**. Ordinary admin sign-in requests identity only. The
    calendar-owner-only connection separately asks for calendar availability,
    event creation, and calendar-list access. Its refresh token is encrypted
    before it is stored.

Appointments are created on the consultations calendar with a unique Google Meet
link. The requester's email is added as an attendee, so Google sends the calendar
invitation and keeps changes synchronized.

## 3. Google delivery-distance estimates

1. Enable **Routes API** in the Google Cloud project.
2. Create a dedicated API key, restrict it to Routes API, set a quota, and add a
   billing budget alert.
3. Put the key in `GOOGLE_MAPS_API_KEY`.
4. Set `DELIVERY_ORIGIN_ADDRESS` privately in Vercel to the selected Enderly-area
   public landmark. The origin is used only in a server-side Routes request and is
   never returned to the browser.

Launch defaults are a $75 delivery base plus $2 per round-trip mile. Full service
starts at $250. Lydia can edit those values in `/admin`.

## 4. Resend

The `secondnaturecreative.com` sending domain, DNS records, restricted Resend key,
and `Second Nature <hello@secondnaturecreative.com>` sender are already configured.
Keep `LYDIA_EMAIL` current; estimate notifications are delivered there and use
   the customer's address as Reply-To.

Resend sends the branded estimate/resume messages. Google Calendar separately
sends the actual calendar invitation.

## 5. Vercel

The repository is linked to the Vercel `second-nature` project and deployed at
`https://www.secondnaturecreative.com`. Supabase, Resend, the encryption key, the
site URL, and the private delivery origin are already present in Development,
Preview, and Production. The remaining variables are Lydia's email and the Google
credentials described above. Never put the service-role key, Google secret, Maps
key, encryption key, or private delivery origin in a `NEXT_PUBLIC_` variable.
