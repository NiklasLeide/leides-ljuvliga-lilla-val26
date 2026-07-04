# Loop-backlog — förbättringar inför nästa loopgeneration (v3)

Insamlade strukturfynd som INTE åtgärdas i pågående körningar. Varje punkt
ska bli ett eget beslut (DEC) eller en scoped ändring med guardtest innan
den implementeras.

- **Budget per STEG i stället för per OMRÅDE.** Designbrist påvisad i
  diskursbatchen 2026-07-04: demokrati-områdets Steg A (citatloopen) förbrukade
  hela områdesbudgeten ($15.18 av $20) eftersom loopens interna tak ($15) och
  områdestaket ($20) inte var koordinerade — Steg B+C fick inte plats och
  områdestaket fick höjas som namngivet undantag ($26, Niklas 2026-07-04).
  v3: per-steg-tak (t.ex. A $12 / B $5 / C $3) som summerar till områdestaket,
  kontrollerade i wrappern före varje steg.

- **Kontextväxt i långa workersessioner.** Forsvar-workern nådde ~477k cachad
  kontext på 71 turns i EN session → CLI:t försökte auto-uppgradera till
  1M-kontext (kräver usage credits) → 429. Transient-retry med fresh session
  mildrar, men v3 bör överväga: sessionsrotation efter N turns, eller
  instruktion till workern att arbeta parti-för-parti med kompaktare kontext.
