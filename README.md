# Mission Khaki — Marketing Website

A static marketing site for the **Mission Khaki** Android exam-prep app
(Army Agniveer, Assam Police, SSC, CAPF aspirants). Plain HTML/CSS/JS —
**no build step, no npm, no bundler** — deploys directly to GitHub Pages.

- **Live site:** https://MadB0i.github.io/Mission_Khaki/
- **Google Play:** https://play.google.com/store/apps/details?id=com.rupjyoti.missionkhaki

## About the app

**Mission Khaki** is a free Android app for defence and government-job
exam preparation. It offers full-length mock tests with real negative
marking, section-wise score breakdowns (GK / Maths / Reasoning / English),
and instant English / Hindi / Assamese translation in the middle of a test —
for Army Agniveer, Assam Police (SI / Constable), SSC (GD / CHSL / MTS / CGL)
and CAPF (CRPF / BSF / CISF / ITBP / SSB) aspirants.

Mock tests are free (ad-supported). Premium is a **one-time ₹99 purchase**
— Grand Mocks (100-question papers) and study notes, for life. No subscription.

> Mission Khaki is an independent, privately developed app. The site clearly
> states (hero, mid-page disclosure band, footer) that it is **not affiliated
> with any government or defence organisation** — keep these visible; they are
> also required for an honest Google Play listing.

---

   Privacy/Terms URLs (for Play Console):

   ```
   https://YOUR_USERNAME.github.io/mission-khaki-website/privacy.html
   https://YOUR_USERNAME.github.io/mission-khaki-website/terms.html
   ```

   > **Tip:** if you name the repo exactly `YOUR_USERNAME.github.io`,
   > the site becomes your *user site* at `https://YOUR_USERNAME.github.io`
   > (without the `/mission-khaki-website` suffix) — slightly cleaner URLs.

---


## Play Console notes

- **Data safety form:** point the “Privacy policy” field at your
  `privacy.html` URL. The page already covers the four required categories:
  Firebase Auth (account info), Firestore (progress/scores), Google Play
  Billing (purchase data, no card details), and AdMob (advertising data).
- **Target audience:** 13+ (stated in both policy pages).
- **Non-affiliation:** the “not affiliated with any government/defence
  organisation” statement appears on the landing page and in both legal
  docs — don’t remove it; Google checks listings for misleading claims of
  endorsement, and your app is independent.
