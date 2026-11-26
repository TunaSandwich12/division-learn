# Teach One Idea: design notes

**Topic:** Adding fractions with different denominators
**Files:** `index.html` (the engine) and `lesson.json` (every word, example, accepted answer and hint)

---

## What I took from Duolingo, and why

| Duolingo idea | How it shows up here | Why it helps learning |
|---|---|---|
| **Try first, explain after** | The lesson starts with "have a guess: 1/2 + 1/3". Any answer moves on, and the explanation is aimed at the most common wrong guess (2/5). | Learners care about the explanation more once they've made a guess. Studying how other apps work is allowed by the brief. |
| **"Why?" only if you ask** | After a correct line, the feedback sheet has a *Why does this work?* link. It's folded away by default. | Learners who already understand aren't slowed down. Curious learners get the reason. |
| **Bottom feedback sheet** | A sheet slides up after every Check: green ✓ for right, amber ≈ for "right idea", red ✗ for not yet, blue for info. | One consistent place to look. Every sheet has an icon and a title as well as a colour, so meaning never depends on colour alone. |
| **Progress bar, one idea per screen** | A thin bar at the top, short screens, one big button at the bottom. | You always know how far you are, and there's no wall of text. |
| **Chunky, thumb-friendly buttons** | Full-width buttons and keys at least 46px tall, all within thumb reach. | Phone first. |
| **A character with expressions** | Pip, an original tutor with a ÷ sign as an antenna. It looks happy, thinking or worried depending on what's happening. | Gives the feedback warmth. |

**What I deliberately left out from Duolingo:** XP, streaks, hearts, leagues and celebration animations (the brief bans them). I also left out the childish tone. Pip's lines are short and a bit dry, because the learners are 13 to 16.

---

## Key decisions

**1. Typing fractions: a custom keypad, not the phone keyboard.**
Each fraction is two tap-able boxes (top and bottom) with a bar between them. The keypad has the digits plus *top box*, *bottom box*, *next box* and *delete*. The phone's own keyboard never opens, so it can't cover the working. On short phones the keypad folds into two rows so the working stays visible. On a laptop the physical keyboard works: digits, `/` or ↓ for the bottom box, Tab or → for the next box, Enter to check.

**2. Checking: what counts as right.**
Every rule is in `lesson.json`, checked in order, first match wins:
- **Exact** (3/12): correct.
- **Equal but not what the step asked for** (6/24 when we want twelfths): not yet, with a reason.
- **Already simplified early** (2/3 typed at the "add" step): accepted as correct, and the simplify step is skipped.
- **Equal but only half-simplified** (4/6 for 8/12): accepted as "right idea". The line records 8/12, and the next line finishes simplifying.
- **Any common multiple** for the common denominator (24 instead of 12): "right idea", but we carry on with the smallest one to keep the numbers small.
- **Known mistakes get their own message:** adding the bottoms (8/24), changing the bottom but not the top (1/12), adding the denominators to get a "common" one (16).
- A denominator of 0 gets its own message.

**3. Help ladder: hints, not answers (Brilliant's approach).**
Hint 1 is a nudge, hint 2 is more specific, and the third tap, *Show me*, fills in the line and marks it **shown** (not **done**). After two wrong tries, the Hint button glows and Pip offers it. The learner can never hit a dead end.

**4. The tutor and pointing.**
Pip sits beside a speech bubble on phones and in its own column on laptops. On laptops that column also shows the four-step method, with the current step highlighted, which uses the extra space. In the worked example, Pip points by highlighting the exact part it's talking about, such as the two denominators or the new numerator. That follows the research note that animation helps when it points at something specific.

**5. Voice is optional and off by default.**
The speaker button turns on the browser's built-in text-to-speech. The same words are always on screen. Fractions are read naturally, so 3/10 is read as "3 tenths", not "3 slash 10".

**6. Pacing.**
In Explain and Watch you can step back and forward freely. Practice can't be skipped. The menu (✕) lets you jump back to any part you've already reached, but not ahead.

**7. Examples chosen on purpose.**
- Explain: 1/2 + 1/3, small enough to draw as bars.
- Watch: 3/10 + 1/6 = 7/15. The smallest common denominator (30) isn't the product (60), and the answer needs simplifying.
- Together: 1/4 + 5/12 = 2/3. One denominator is already the common one, and the answer simplifies.
- On your own: 7/10 + 2/15 = 5/6. A new pair of denominators, the smallest common denominator isn't the product, and it simplifies by 5.

All the maths was checked in code.

---

## Content is separate from code

Switching to one-step equations means rewriting only `lesson.json`. The engine just knows *screens* (talk, method, worked, practice) and *rule checks* (exact, equivalent, numerator, denominator, multipleOf, lowest, any).

## Accessibility

- Text contrast meets WCAG AA.
- Every feedback state has an icon and a word, not just a colour.
- Shaded bars have labels and stripes.
- The speech bubble is announced to screen readers.
- Fractions have spoken labels ("3 over 10").
- Reduced-motion settings are respected.

## Practice questions (generator)

`generator.js` makes new questions in the same format as the hand-written practice screens, so the engine checks them with the same rules, hint ladder and feedback sheet. Open it from **Practice questions** in the ✕ menu, from the end screen, or go straight there with `index.html#practice`.

- **Division with remainders:** one line, `N ÷ d = [answer] r [remainder]`, with a separate remainder box (enter 0 if nothing is left over).
  - *Easy*: dividing by 2 to 5, answers up to 10, about half have a remainder.
  - *Medium*: two-digit numbers divided by 3 to 9.
  - *Hard*: three-digit numbers divided by 6 to 15, with hints that split the number into chunks.
  - Feedback on each box: answer too big, one too small (the remainder would be too big), remainder of the divisor or more, remainder missing, 0 needed when it divides exactly. Hints: times-table nudge → the nearest multiple → Show me (with a check back: d × q + r = N).
- **Adding fractions:** random pairs from this lesson (sum below 1, smallest common denominator 60 or less). The simplify step is only included when the answer needs it, about 60% of the time.
- You never get the same question twice in a row. Labels and Pip's lines are in the `extra` section of `lesson.json`, and the wording of each question's feedback is in `generator.js`.
- Tested in Node: 30,000 division and 20,000 fraction questions. Each answer is accepted, and the known mistakes are rejected.

## Timed quiz

Open it from **Timed quiz** in the ✕ menu, from the *Timed quiz* switch on the practice picker, or with `index.html#quiz`. Each quiz is 10 different questions from one of the four options.

- **One clock for the whole quiz:** 3:00 (Easy), 4:00 (Medium), 6:00 (Hard or fractions). It stops while feedback or the menu is on screen, so reading costs no time. At 30 seconds the timer turns red and Pip warns you. When it hits 0, any questions left are marked *not answered* and the results page opens.
- **One try, no hints:** after each answer the feedback sheet names the mistake (the same messages as practice, worded as statements, not prompts), gives the right answer, and has the usual *Why does this work?* fold. Skip is allowed.
- **Results page:** score out of 10, time used, best score for that level (or *New best!*), a verdict from Pip, and every question with your answer, the correct answer and what went wrong. *New quiz* repeats the level with fresh questions.
- Best scores are kept in `localStorage` on this device only. If storage is blocked, the quiz still works without them. Following the brief, there are no streaks or XP.
- The text is in the `quiz` section of `lesson.json`, and the time limits are `quizSeconds` on each practice option.
