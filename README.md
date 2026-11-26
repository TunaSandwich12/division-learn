# Division Learn

A phone-first maths tutor with Pip, a ÷-headed guide. It has:

- **Practice questions:** random division questions with remainders at **Easy**, **Medium** and **Hard** levels. There's a separate remainder box, every answer is checked, and a hint ladder runs nudge → more specific hint → *Show me*.
- **Timed quiz:** 10 questions against one clock, a running score, feedback after every answer, and a results page that reviews each question and keeps your best score.
- **Adding fractions lesson:** the original four-part lesson (Explain → Watch → Together → On your own). Fractions are also available in practice and quiz mode.

## Run it

`index.html` loads `lesson.json`, so it has to be served over http rather than opened as a file:

```sh
python -m http.server 8000
```

Then open:

| Page | Link |
|---|---|
| Lesson | http://localhost:8000/index.html |
| Practice questions | http://localhost:8000/index.html#practice |
| Timed quiz | http://localhost:8000/index.html#quiz |

## Files

| File | What it holds |
|---|---|
| `index.html` | The engine: screens, keypad, answer checking, hints, quiz timer and results |
| `generator.js` | Makes random division and fraction questions, with their checking rules and hints |
| `lesson.json` | Every word on screen: lesson content, button labels, quiz text and time limits |
| `DESIGN-NOTES.md` | Design decisions and how answers are checked |
