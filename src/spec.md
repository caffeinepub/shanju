# Specification

## Summary
**Goal:** Require users to provide a Password and NID Number when saving a Personal Account profile.

**Planned changes:**
- Update the backend PersonalAccount data model to include required fields for a user-provided password and NID number.
- Update backend saveCallerPersonalAccount to reject saving when password or NID number is empty/blank.
- Update the frontend Personal Account Profile form to add a masked Password input and a NID Number input (English labels/messages only).
- Enforce client-side required validation for Password and NID Number, initialize both fields to empty strings by default, and update the existing Tax ID / NID field so NID Number is required (not shown as optional).

**User-visible outcome:** On the Personal Account > Profile tab, users must enter both a Password and a NID Number to save their profile, and they will see inline English validation errors if either field is missing.
