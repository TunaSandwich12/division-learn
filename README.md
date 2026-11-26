# Adding Fractions with Pip

A phone-first maths tutor with Pip, a ÷-headed guide, that teaches one idea: **adding fractions with different denominators**.

- **Lesson:** four parts (Explain → Watch → Together → On your own).
- **Practice questions:** random fraction-addition questions at **Easy**, **Medium** and **Hard** levels. They use the lesson's four-line method, every line is checked, and a hint ladder runs nudge → more specific hint → *Show me*.
- **Timed quiz:** 10 questions at one level against a single clock, with a running score, feedback after every answer, and a results page that reviews each question and keeps your best score.

| Level | Denominators | Example |
|---|---|---|
| Easy | One is a multiple of the other | 1/4 + 3/8 |
| Medium | They share no factor, so multiply them | 2/3 + 1/5 |
| Hard | They share a factor, so the smallest common denominator is less than the product | 7/10 + 2/15 |

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
| `generator.js` | Makes random fraction-addition questions at each level, with their checking rules and hints |
| `lesson.json` | Every word on screen: lesson content, button labels, quiz text and time limits |
| `DESIGN-NOTES.md` | Design decisions and how answers are checked |
