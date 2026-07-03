# UTKAST — sektion för RESEARCH_AGENT.md

> Placering: direkt under regeln "**Ingen match-bedömning läggs in i voting.json
> utan Niklas godkännande.**" (slutet av avsnittet om match-bedömningar).
> Detta är ett utkast — RESEARCH_AGENT.md ändras först efter Niklas beslut.

---

### Undantag: agentloopar på binärt verifierbar data

Match-bedömningar får produceras av en evaluator-optimizer-loop
(`scripts/data-loop.sh`, se DEC-007) i stället för att presenteras
post för post i chatten — på följande villkor:

1. **Scope är begränsat till binärt verifierbar ground truth.** Undantaget
   gäller endast data där varje påstående kan verifieras mot en officiell
   källa med entydigt utfall — i praktiken voteringsdata med
   riksdagen.se-URL (röstade för/mot/lade ned, datum, bet.-/prop.-nummer).
   Tolkningsdata omfattas INTE: discourse.json och GAL-TAN-bedömningar
   (galtan.json) följer den ursprungliga godkänneregeln oförändrad —
   ingen sådan data läggs in utan Niklas uttryckliga godkännande i chatten.

2. **Niklas granskar varje match-bedömning post för post i PR:en.**
   Loopens resultat går som PR mot master; PR-granskningen ersätter
   chattpresentationen och utgör godkännandet. Riktlinje: max 15 poster
   per PR — större uppdateringar delas upp så att post-för-post-granskning
   förblir realistisk.

3. **Evaluatorn är andra försvarslinjen, inte en ersättning för Niklas.**
   Den maskinella evaluatorn (separat session, domare ≠ utförare)
   förhandsgranskar mot denna metodik och stoppar uppenbara fel innan
   PR:en skapas — men det mänskliga godkännandet ligger alltid i
   PR-granskningen. Ett PASS från evaluatorn är ett nödvändigt villkor
   för PR, aldrig ett tillräckligt villkor för merge.

4. **PR-granskning = godkännande; loopen mergar aldrig.** Regeln
   "Ingen match-bedömning läggs in i voting.json utan Niklas godkännande"
   uppfylls genom att inget når master utan att Niklas själv granskat
   och mergat PR:en. Loopen (och Claude) skapar PR:en men rör aldrig
   merge-knappen.
