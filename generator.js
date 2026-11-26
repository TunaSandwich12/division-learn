/* =========================================================
   Question generator: adding fractions with different denominators.
   Builds a practice screen in exactly the same shape as the
   hand-written "On your own" screen in lesson.json, so the engine
   checks it with the same rules (exact, equivalent, multipleOf, ...).
   Works in the browser (window.generateQuestion) and in Node (module.exports).
   ========================================================= */
(function (root) {
  const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const F = (n, d) => `{${n}/${d}}`;              // fraction token for speech-bubble text
  const MAX_LCD = 60;                             // keeps every number within 3 keypad digits

  /* Levels differ in how hard the common denominator is to find:
       easy   – one bottom is already a multiple of the other   (1/4 + 3/8: use 8)
       medium – the bottoms share no factor, so multiply them    (2/3 + 1/5: use 15)
       hard   – they share a factor, so the smallest common
                denominator is less than the product            (7/10 + 2/15: use 30, not 150) */
  const LEVELS = {
    easy:   { denoms: [2, 3, 4, 5, 6, 8, 9, 10, 12], fits: (a, b) => Math.max(a, b) % Math.min(a, b) === 0, simplify: 0.5 },
    medium: { denoms: [2, 3, 4, 5, 7, 8, 9],         fits: (a, b) => gcd(a, b) === 1,                      simplify: 0 },   // coprime bottoms: the sum is always already simplest
    hard:   { denoms: [4, 6, 8, 9, 10, 12, 15],      fits: (a, b) => gcd(a, b) > 1 && Math.max(a, b) % Math.min(a, b) !== 0, simplify: 0.7 }
  };

  /* Pick two proper, simplified fractions with different denominators whose sum is below 1. */
  function pickProblem(avoid, level) {
    const cfg = LEVELS[level] || LEVELS.hard;
    const wantSimplify = Math.random() < cfg.simplify;   // mix answers that do and don't need simplifying
    let backup = null;
    for (let tries = 0; tries < 800; tries++) {
      const d1 = cfg.denoms[rand(0, cfg.denoms.length - 1)], d2 = cfg.denoms[rand(0, cfg.denoms.length - 1)];
      if (d1 === d2 || !cfg.fits(d1, d2) || lcm(d1, d2) > MAX_LCD) continue;
      const n1 = rand(1, d1 - 1), n2 = rand(1, d2 - 1);
      if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1) continue;
      if (n1 * d2 + n2 * d1 >= d1 * d2) continue;           // sum must be less than 1
      const key = `${n1}/${d1}+${n2}/${d2}`;
      if (avoid && key === avoid) continue;
      const L = lcm(d1, d2), S = n1 * (L / d1) + n2 * (L / d2);
      const found = { n1, d1, n2, d2, key };
      if ((gcd(S, L) > 1) !== wantSimplify) { backup = backup || found; continue; }
      return found;
    }
    return backup || { n1: 7, d1: 10, n2: 2, d2: 15, key: "7/10+2/15" };  // the lesson's own example
  }

  function multiplesHint(a, b, L) {
    const big = Math.max(a, b), small = Math.min(a, b), list = [];
    for (let m = big; list.length < 3 || list[list.length - 1] <= L; m += big) list.push(m);
    return `Count up in ${big}s: ${list.join(", ")}… Which is the first one ${small} also divides into?`;
  }

  function convertRules(which, n, d, L) {
    const k = L / d, cn = n * k, label = which === 1 ? "First fraction" : "Second fraction";
    const rules = [{ exact: `${cn}/${L}`, status: "correct" }];
    if (k > 1) {
      rules.push({ denominator: L, numerator: n, status: "wrong",
        say: `${label}: the bottom's right, but the top needs the same × ${k}.` });
      rules.push({ equivalent: `${n}/${d}`, status: "wrong",
        say: `${label}: equal to ${F(n, d)}, but it needs ${L} on the bottom.` });
      rules.push({ denominator: L, status: "wrong",
        say: `${label}: ${d} × ${k} = ${L}, so the top is ${n} × ${k}.` });
      rules.push({ any: true, status: "wrong",
        say: `${label}: what do you multiply ${d} by to get ${L}? Do that to the top too.` });
    } else {
      rules.push({ any: true, status: "wrong",
        say: `${label}: it already has ${L} on the bottom, so it stays as ${F(n, d)}.` });
    }
    return rules;
  }

  function generateQuestion(opts = {}) {
    const level = LEVELS[opts.level] ? opts.level : "hard";
    const { n1, d1, n2, d2, key } = pickProblem(opts.avoid, level);
    const L = lcm(d1, d2), P = d1 * d2;
    const k1 = L / d1, k2 = L / d2, c1 = n1 * k1, c2 = n2 * k2;
    const S = c1 + c2, g = gcd(S, L), fn = S / g, fd = L / g;
    const simplifies = g > 1;

    /* ---- step 1: common denominator ---- */
    let why1;
    if (L === Math.max(d1, d2)) why1 = `${Math.max(d1, d2)} is already in the ${Math.min(d1, d2)} times table, so it works as the common denominator.`;
    else if (L === P) why1 = `${d1} and ${d2} share no factor, so the smallest common denominator is just ${d1} × ${d2} = ${L}.`;
    else why1 = `${L} is the smallest number in both the ${d1} and ${d2} times tables. ${d1} × ${d2} = ${P} also works, but the numbers get big.`;

    const step1 = {
      methodStep: 1, lead: "Common denominator", say: "Line 1: a common denominator.",
      layout: [{ field: "n", type: "number" }],
      answer: { n: String(L) },
      rules: { n: [
        { exact: String(L), status: "correct" },
        ...(((d1 + d2) % L) ? [{ exact: String(d1 + d2), status: "wrong",
          say: `That's ${d1} + ${d2}. We need a number both ${d1} and ${d2} divide into exactly.` }] : []),
        { multipleOf: L, status: "close", useAnswer: true,
          say: `That works. ${L} is the smallest one, though, so we'll use ${L} to keep the numbers small.` },
        { any: true, status: "wrong", say: `Does ${d1} go into it exactly? Does ${d2}? It needs both.` }
      ] },
      correct: `Yes — ${L}.`,
      hints: [multiplesHint(d1, d2, L), `Does ${d1} go into ${L}? Does ${d2}?`],
      why: why1
    };

    /* ---- step 2: convert ---- */
    const hint1 = k1 > 1 && k2 > 1
      ? `${d1} × ${k1} = ${L} and ${d2} × ${k2} = ${L}. Do the same to each top.`
      : k1 > 1 ? `${F(n2, d2)} already has ${L} on the bottom. For the other one, ${d1} × ${k1} = ${L} — do the same to the top.`
               : `${F(n1, d1)} already has ${L} on the bottom. For the other one, ${d2} × ${k2} = ${L} — do the same to the top.`;
    const step2 = {
      methodStep: 2, lead: "Convert", say: "Line 2: convert both fractions.",
      layout: ["=", { field: "a", type: "fraction" }, "+", { field: "b", type: "fraction" }],
      answer: { a: `${c1}/${L}`, b: `${c2}/${L}` },
      rules: { a: convertRules(1, n1, d1, L), b: convertRules(2, n2, d2, L) },
      correct: `Yes, that's right. ${F(n1, d1)} = ${F(c1, L)} and ${F(n2, d2)} = ${F(c2, L)}.`,
      hints: [
        hint1,
        [k1 > 1 ? `${n1} × ${k1} = ${c1}` : `${F(n1, d1)} stays the same`,
         k2 > 1 ? `${n2} × ${k2} = ${c2}` : `${F(n2, d2)} stays the same`].join(", and ") + "."
      ],
      why: "Multiplying the top and bottom by the same number doesn't change the value — it just cuts the pieces smaller."
    };

    /* ---- step 3: add ---- */
    const addRules = [
      { exact: `${S}/${L}`, status: "correct" },
      { exact: `${S}/${2 * L}`, status: "wrong", say: `Careful — only the tops get added. The bottom stays ${L}.` }
    ];
    if (simplifies) {
      addRules.push({ equivalent: `${S}/${L}`, lowest: true, status: "correct", skip: 1,
        say: `Yes — and you've simplified already: ${F(S, L)} = ${F(fn, fd)}. That's the final answer.` });
      addRules.push({ equivalent: `${S}/${L}`, status: "close", useAnswer: true,
        say: `That's equal to ${F(S, L)} — you've started simplifying. Let's write ${F(S, L)} here and finish on the next line.` });
    } else {
      addRules.push({ equivalent: `${S}/${L}`, status: "close", useAnswer: true,
        say: `That's equal to ${F(S, L)}. We'll write it with ${L} on the bottom, since that's what we're working in.` });
    }
    addRules.push({ denominator: L, status: "wrong", say: `Bottom's right. Check the top: ${c1} + ${c2}.` });
    addRules.push({ any: true, status: "wrong", say: `Add the tops, ${c1} + ${c2}, and keep the bottom as ${L}.` });

    const step3 = {
      methodStep: 3, lead: "Add", say: "Line 3: add.",
      layout: ["=", { field: "s", type: "fraction" }],
      answer: { s: `${S}/${L}` },
      rules: { s: addRules },
      correct: `Yes — ${F(S, L)}.`,
      hints: [`Add the tops. The bottom stays ${L}.`, `${c1} + ${c2} = ?`],
      why: simplifies
        ? `${F(c1, L)} + ${F(c2, L)} = ${F(S, L)}: the pieces are the same size, so you just count them.`
        : `${F(c1, L)} + ${F(c2, L)} = ${F(S, L)}. ${S} and ${L} share no factor except 1, so there's nothing to simplify — that's the final answer.`
    };

    const steps = [step1, step2, step3];

    /* ---- step 4: simplify (only when it actually simplifies) ---- */
    if (simplifies) {
      steps.push({
        methodStep: 4, lead: "Simplify", say: "Line 4: simplify.",
        layout: ["=", { field: "f", type: "fraction" }],
        answer: { f: `${fn}/${fd}` },
        rules: { f: [
          { exact: `${fn}/${fd}`, status: "correct" },
          { exact: `${S}/${L}`, status: "wrong", say: `Can it go further? ${S} and ${L} are both in the ${g} times table.` },
          { equivalent: `${fn}/${fd}`, status: "wrong", say: "Equal, but not fully simplified yet — the top and bottom still share a factor." },
          { any: true, status: "wrong", say: `That isn't equal to ${F(S, L)}. Divide the top and bottom by the same number.` }
        ] },
        correct: `Yes, that's right. ${S} and ${L} both divide by ${g}, giving ${F(fn, fd)}.`,
        hints: [`${S} and ${L} are both in the ${g} times table.`, `${S} ÷ ${g} = ${fn}, and ${L} ÷ ${g} = ${fd}.`],
        why: `${fn} and ${fd} share no factor except 1, so ${F(fn, fd)} is in its simplest form.`
      });
    }

    return {
      type: "practice", solo: true, generated: true, key, level,
      problem: [{ f: `${n1}/${d1}` }, "+", { f: `${n2}/${d2}` }],
      answer: `${fn}/${fd}`,
      outro: `${F(n1, d1)} + ${F(n2, d2)} = ${F(fn, fd)}.` + (simplifies ? "" : " No simplifying needed on that one."),
      steps
    };
  }

  /* =========================================================
     Quiz questions: one answer line, one try, no hints (same levels as practice).
     Returns { key, problem, layout, rules, answerText, solvedText, why, say, tip }.
     ========================================================= */
  function generateQuizQuestion(opts = {}) {
    const g = generateQuestion({ avoid: opts.avoid, level: opts.level });
    const [n1, d1] = g.problem[0].f.split("/").map(Number), [n2, d2] = g.problem[2].f.split("/").map(Number);
    const [fn, fd] = g.answer.split("/").map(Number);
    const L = +g.steps[0].answer.n, c1 = +g.steps[1].answer.a.split("/")[0], c2 = +g.steps[1].answer.b.split("/")[0], S = c1 + c2;
    return {
      key: g.key, problem: g.problem,
      layout: ["=", { field: "f", type: "fraction" }],
      rules: { f: [
        { exact: `${fn}/${fd}`, status: "correct" },
        { exact: `${n1 + n2}/${d1 + d2}`, status: "wrong", say: "That's the tops added and the bottoms added. The pieces have to be the same size first." },
        { equivalent: `${fn}/${fd}`, status: "wrong", say: "Right value, but it isn't in its simplest form." },
        { denominator: L, status: "wrong", say: `Good common denominator. Check the tops: ${c1} + ${c2}.` },
        { any: true, status: "wrong", say: "Not quite." }
      ] },
      answerText: F(fn, fd),
      solvedText: `${F(n1, d1)} + ${F(n2, d2)} = ${F(fn, fd)}.`,
      why: `Common denominator ${L}: ${F(c1, L)} + ${F(c2, L)} = ${F(S, L)}` + (S !== fn ? ` = ${F(fn, fd)}.` : "."),
      say: `${F(n1, d1)} + ${F(n2, d2)}`,
      tip: "Give each answer in its simplest form."
    };
  }

  root.generateQuestion = generateQuestion;
  root.generateQuizQuestion = generateQuizQuestion;
  if (typeof module !== "undefined" && module.exports) module.exports = { generateQuestion, generateQuizQuestion, gcd, lcm, LEVELS };
})(typeof window !== "undefined" ? window : globalThis);
