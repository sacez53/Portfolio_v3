# Guide de Contribution

Merci de vous intéresser au portfolio de **Sacha GUITTER** ! 

Ce projet est avant tout un portfolio personnel et artistique, mais les retours, suggestions et corrections (orthographe, accessibilité, performances, bugs d'affichage) sont toujours les bienvenus.

---

## 🛠️ Comment contribuer ?

### 1. Signaler un bug ou proposer une amélioration
- Avant d'ouvrir un ticket, vérifiez dans les [Issues](../../issues) qu'un sujet similaire n'existe pas déjà.
- Si le problème est inédit, créez une Issue en utilisant le modèle approprié :
  - **Bug Report** pour un dysfonctionnement.
  - **Feature Request** pour une suggestion d'amélioration.

### 2. Proposer une modification de code (Pull Request)

1. **Forkez** le dépôt sur votre compte GitHub.
2. **Clonez** votre fork localement :
   ```bash
   git clone https://github.com/<votre-pseudo>/portfolio_v3.git
   cd portfolio_v3
   ```
3. Créez une branche dédiée à votre modification :
   ```bash
   git checkout -b fix/nom-du-bug
   # ou
   git checkout -b feature/nom-de-l-amelioration
   ```
4. Installez les dépendances et lancez le serveur de développement :
   ```bash
   npm install
   npm run dev
   ```
5. Effectuez vos modifications en respectant les conventions existantes :
   - HTML sémantique et accessible (balises ARIA, alternatives textuelles d'images).
   - Design Tokens et CSS standardisé dans `style/design-tokens.css` et `style/style.css`.
   - JavaScript modulaire et lisible dans `script/`.
6. Validez que le build fonctionne correctement :
   ```bash
   npm run build
   ```
7. Committez vos modifications avec un message clair :
   ```bash
   git commit -m "fix(nav): correction du repli du menu burger sur mobile"
   ```
8. Poussez sur votre fork et ouvrez une **Pull Request** vers la branche principale `main`.

---

## 📸 Note importante sur les médias

Les photographies, tirages et créations graphiques hébergés dans `image/` et `projets/` sont des créations personnelles protégées par le droit d'auteur.
Veuillez **ne pas altérer, écraser ou redistribuer** ces fichiers multimédias sans autorisation expresse de Sacha GUITTER.

---

## 💬 Contact

Pour toute question directe, vous pouvez contacter Sacha GUITTER via le formulaire sur le portfolio ou par email à `sachaguitterphoto@gmail.com`.
