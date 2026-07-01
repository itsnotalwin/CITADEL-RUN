## 2024-07-01 - Missing ARIA Labels on Core Layout Icon Buttons
**Learning:** The main application layout (`src/App.tsx`) relies on multiple icon-only utility buttons (Theme Toggle, Sound Toggle, and Game Pause). While styled cleanly, they lacked accessible names (`aria-label`) and tooltip hints (`title`), which degrades usability for screen reader users and obscures intent for mouse users.
**Action:** Always verify icon-only interactive elements in top-level app navigations/headers have proper `aria-label` and `title` attributes.
