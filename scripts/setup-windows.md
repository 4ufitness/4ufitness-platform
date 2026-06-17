# Windows Setup

```powershell
node -v
npm -v
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm -v
cd C:\Projects\4UFitness
pnpm install
pnpm mobile
```

If Expo complains about dependency versions:

```powershell
cd C:\Projects\4UFitness\apps\mobile
npx expo install --fix
npx expo start -c
```
