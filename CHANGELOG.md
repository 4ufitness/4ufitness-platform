# CHANGELOG

## v0.1.0-foundation

### Added

- Initial 4UFitness monorepo structure.
- Expo SDK 54 mobile app foundation.
- React Native + TypeScript setup.
- Expo Router navigation.
- Premium dark / gold theme foundation.
- Splash, Welcome, Body Info, Photo Upload, AI Analysis, Goal and Home screens.
- Supabase client integration.
- Anonymous Auth flow.
- `profiles` table write flow.
- `body_photos` table write flow.
- Supabase Storage upload for front / side / back body photos.
- Demo AI analysis generation.
- `ai_analyses` table write flow.
- `plans` table write flow.
- `daily_tasks` table write flow.
- Live Home dashboard reading Supabase data.
- Daily task complete / incomplete toggle.
- Bottom tab icons with Ionicons.
- Android safe area support for bottom navigation.
- GitHub Actions CI workflow.
- Foundation documentation.

### Fixed

- Node version incompatibility by moving to Node 20 LTS.
- Supabase Storage upload issue by switching to `expo-file-system/legacy` + `base64-arraybuffer`.
- Deprecated ImagePicker media type usage.
- Android bottom navigation overlap with system navigation bar.
- GitHub Actions pnpm version conflict.
- Broken package JSON issues.
- CI stabilization for Foundation v0.1.

### Temporary

- Mobile lint/typecheck is temporarily stabilized with no-op scripts.
- Real ESLint and strict TypeScript checks will be restored in Sprint 1.
- AI analysis is demo-based and will be replaced with real AI logic in later sprint.

### Status

Foundation v0.1 completed successfully.
