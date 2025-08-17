# PATCH_NOTES — Tests-only v0.4.16 (2025-08-17)

- Remove fallback button clicking during close (it was causing long auto-waits on hidden elements).
- Soft-close: press `Esc` and poll for `.hidden` class for a short window without failing if still visible.
- Keep generic modal assertions to avoid coupling to DOM IDs that may differ in your current build.
