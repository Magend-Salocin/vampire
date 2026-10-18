---
paths:
  - "assets/**"
---

# Assets

- Noms de fichiers en minuscules, mots séparés par des tirets, sans espace ni accent (`atlas-sprites.png`).
- `assets/reference/` est en lecture seule : captures du jeu original, jamais modifiées ni utilisées telles quelles dans le jeu.
- Les planches d'atlas (`assets/atlas/`) font 1536×1024, sauf `atlas-prototype-512.png` (512×512, issu du prototype 02).
- Avant d'ajouter une image, vérifier qu'elle n'existe pas déjà : `md5sum` sur les fichiers existants.
- Ne pas committer de version « Copie » ou « (1) » : un seul exemplaire par fichier.
