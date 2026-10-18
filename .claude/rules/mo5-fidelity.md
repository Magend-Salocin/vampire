# Fidélité Thomson MO5

- Résolution logique **320×200**. Ne jamais dessiner à une autre résolution : on met à l'échelle le canvas.
- Mise à l'échelle par **facteur entier uniquement**, avec `image-rendering: pixelated`.
- Les couleurs viennent de la palette MO5 définie dans le prototype 03 (`PAL`), pas de couleurs arbitraires.
- Les effets CRT (scanlines, tremblements, fondu) sont des surcouches désactivables, jamais dans la logique de jeu.
- Mode « Remaster » (V2/V3) : il remplace uniquement le rendu, la logique reste identique au mode Original.
- Le jeu original sert de référence : consulter `assets/reference/` avant de changer un comportement ou un décor.
