# Mombongo Mobile

App iOS + Android — **React Native + Expo + TypeScript**.

Référence design et parcours : `mombongo-web` (vue mobile PWA).

## Stack

- Expo SDK **54** (compatible Expo Go)
- Expo Router (navigation fichier)
- TypeScript strict
- i18n : fr / en / ln (mêmes traductions que le web)
- Firebase Auth + Cloud Functions (`europe-west1`)

## Configuration Firebase

Copier `.env.example` vers `.env` et renseigner les clés `EXPO_PUBLIC_*` (projet `mombongo-dev`).

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_FIREBASE_*` | Config Firebase (même projet que le web) |
| `EXPO_PUBLIC_DEV_MODE` | `true` = mock data + auth sans Firebase |
| `EXPO_PUBLIC_USE_EMULATORS` | `true` = Auth/Functions en local |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Web client ID Google (Firebase → Auth → Google) |

### Google Sign-In

1. **Firebase Console** → Authentication → Sign-in method → Google → activer
2. Copier le **Web client ID** (`….apps.googleusercontent.com`) dans `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
3. **Google Cloud Console** → APIs & Services → Credentials → client OAuth Web :
   - Ajouter l’URI de redirection affiché au lancement (`npx expo start --clear`) ou `mombongo://`
4. (Optionnel) Clients iOS/Android natifs pour builds standalone → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

Le rôle choisi à l’écran Auth est transmis à `createUserProfile` après la première connexion Google.

Redémarrer Metro après modification du `.env` :

```bash
npx expo start --clear
```

## Démarrage

```bash
cd mombongo-mobile
npm install
npm start
```

Puis scanner le QR code avec **Expo Go** (Android/iOS).

## Structure

```
app/                  # Routes Expo Router
  language.tsx        # ✅ Sélection langue (implémenté)
  auth.tsx            # 🔜 Connexion
  (tabs)/             # Onglets principaux (placeholders)
src/
  context/            # AppContext (langue, rôle)
  i18n/               # Traductions
  screens/            # Composants écran
  theme/              # Tokens design (couleurs web)
```

## Commandes

```bash
npm start          # Expo dev server
npm run typecheck  # Vérification TypeScript
npm run android    # Émulateur Android
npm run ios        # Simulateur iOS
```
