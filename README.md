# Mombongo Mobile

App iOS + Android — **React Native + Expo + TypeScript**.

Référence design et parcours : `mombongo-web` (vue mobile PWA).

## Stack

- Expo SDK **54** (compatible Expo Go)
- Expo Router (navigation fichier)
- TypeScript strict
- i18n : fr / en / ln (mêmes traductions que le web)
- Firebase Auth + Cloud Functions (à brancher)

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
