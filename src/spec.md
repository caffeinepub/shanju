# Specification

## Summary
**Goal:** Make the Admin Panel installable as a focused PWA so Android “Add to Home Screen” launches directly into the admin experience and reliably supports deep links.

**Planned changes:**
- Update `frontend/public/manifest.webmanifest` to set `start_url` to `/admin` and add a manifest shortcut for the Admin Panel route using existing icons where appropriate.
- Adjust the service worker behavior to support SPA navigation in standalone mode so routes like `/admin`, `/dashboard`, and `/pay/<id>` load reliably when opened from the home screen without breaking existing static asset/icon caching.
- Update the Admin Panel > Install Guide tab copy (English only) to clearly explain installing via “Add to Home Screen/Install app” as the supported APK-like alternative for Android.

**User-visible outcome:** Users can install the app from the Admin Panel on Android Chrome, launch directly into `/admin`, and open deep links (including `/dashboard` and `/pay/<id>`) in standalone mode without blank pages or navigation errors.
