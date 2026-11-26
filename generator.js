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
  const ORDS = ["", "1st", "2nd"];

  const DENOMS = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15];
  const MAX_LCD = 60;                             // keeps every number within 3 keypad digits

  /* Pick two proper, simplified fractions with different denominators whose sum is below 1. */
  function pickProblem(avoid) {
    for (let tries = 0; tries < 500; tries++) {
      const d1 = DENOMS[rand(0, DENOMS.length - 1)], d2 = DENOMS[rand(0, DENOMS.length - 1)];
      if (d1 === d2 || lcm(d1, d2) > MAX_LCD) continue;
      const n1 = rand(1, d1 - 1), n2 = rand(1, d2 - 1);
      if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1) continue;
      if (n1 * d2 + n2 * d1 >= d1 * d2) continue;           // sum must be less than 1
      const key = `${n1}/${d1}+${n2}/${d2}`;
      if (avoid && key === avoid) continue;
      // Favour problems that need simplifying at the end (about 2 in 3), like the lesson's examples.
      const L = lcm(d1, d2), S = n1 * (L / d1) + n2 * (L / d2);
      if (gcd(S, L) === 1 && Math.random() < 0.9) continue;
      return { n1, d1, n2, d2, key };
    }
    return { n1: 7, d1: 10, n2: 2, d2: 15, key: "7/10+2/15" };  // the lesson's own fallback
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
    const { n1, d1, n2, d2, key } = pickProblem(opts.avoid);
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
      type: "practice", solo: true, generated: true, key,
      problem: [{ f: `${n1}/${d1}` }, "+", { f: `${n2}/${d2}` }],
      answer: `${fn}/${fd}`,
      outro: `${F(n1, d1)} + ${F(n2, d2)} = ${F(fn, fd)}.` + (simplifies ? "" : " No simplifying needed on that one."),
      steps
    };
  }

  /* =========================================================
     Division with remainders: easy / medium / hard.
     One line: N ÷ d = [quotient] r [remainder]. The remainder has its own box.
     ========================================================= */
  const LEVELS = {
    // divisor range, dividend range, chance the answer has a remainder
    easy:   { d: [2, 5],  N: [4, 50],    rem: 0.5 },
    medium: { d: [3, 9],  N: [20, 99],   rem: 0.75 },
    hard:   { d: [6, 15], N: [100, 999], rem: 0.85 }
  };

  function pickDivision(level, avoid) {
    const cfg = LEVELS[level] || LEVELS.easy;
    for (let tries = 0; tries < 500; tries++) {
      const d = rand(cfg.d[0], cfg.d[1]);
      const R = Math.random() < cfg.rem ? rand(1, d - 1) : 0;   // decide the remainder first
      let qLo = Math.max(2, Math.ceil((cfg.N[0] - R) / d)), qHi = Math.floor((cfg.N[1] - R) / d);
      if (level === "easy") qHi = Math.min(qHi, 10);              // stay inside the times tables
      if (level === "medium" && Math.random() < 0.7) qHi = Math.min(qHi, 12);
      if (qLo > qHi) continue;
      const Q = rand(qLo, qHi), N = d * Q + R;
      const key = `${N}÷${d}`;
      if (key === avoid) continue;
      return { N, d, Q, R, key };
    }
    return { N: 47, d: 5, Q: 9, R: 2, key: "47÷5" };
  }

  function generateDivision(opts = {}) {
    const level = LEVELS[opts.level] ? opts.level : "easy";
    const { N, d, Q, R, key } = pickDivision(level, opts.avoid);
    const dQ = d * Q;
    const remText = R ? `remainder ${R}` : "remainder 0";

    /* quotient box */
    const qRules = [{ exact: String(Q), status: "correct" }];
    qRules.push({ min: Q + 1, status: "wrong",
      say: `Too big: ${d} × ${Q + 1} = ${d * (Q + 1)}, which is more than ${N}.` });
    if (Q > 1) qRules.push({ exact: String(Q - 1), status: "wrong",
      say: `Nearly. ${d} × ${Q - 1} = ${d * (Q - 1)}, which leaves ${N - d * (Q - 1)} over. That's ${d} or more, so one more ${d} fits.` });
    qRules.push({ any: true, status: "wrong",
      say: `Not enough ${d}s. Find the biggest number you can times ${d} by without going over ${N}.` });

    /* remainder box (only judged against the right quotient, so messages stay true) */
    const rRules = [{ exact: String(R), status: "correct" }];
    rRules.push({ min: d, status: "wrong",
      say: `A remainder can't be ${d} or more. If ${d} or more is left over, another ${d} still fits.` });
    if (R > 0) rRules.push({ exact: "0", status: "wrong",
      say: `Something's left over. ${d} × ${Q} = ${dQ}, and ${N} − ${dQ} = ?` });
    else rRules.push({ any: true, status: "wrong",
      say: `${d} × ${Q} = ${dQ} exactly, so nothing is left over. Put 0 in the remainder box.` });
    rRules.push({ any: true, status: "wrong",
      say: `Remainder: work out ${d} × ${Q} = ${dQ}, then ${N} − ${dQ}.` });

    /* hint ladder: nudge → more specific → (engine adds "Show me") */
    let hint1;
    if (level === "hard") {
      const ten = d * 10, chunks = Math.floor(Q / 10);
      hint1 = chunks >= 1
        ? `Chunk it. ${d} × 10 = ${ten}. How many lots of ${ten} fit into ${N}? Then deal with what's left.`
        : `Count up in ${d}s, or use ${d} × 5 = ${d * 5} as a stepping stone.`;
    } else {
      hint1 = `Go up the ${d} times table until the next step would pass ${N}.`;
    }
    const hint2 = R
      ? `${d} × ${Q} = ${dQ}. That's as close to ${N} as you can get without going over. What's left?`
      : `${d} × ${Q} = ${dQ}. That's exactly ${N}.`;

    const step = {
      say: `Work out ${N} ÷ ${d}. Put what's left over in the remainder box — 0 if nothing is left.`,
      layout: ["=", { field: "q", type: "number", label: "answer" }, { t: "r" }, { field: "r", type: "number", label: "remainder" }],
      answer: { q: String(Q), r: String(R) },
      rules: { q: qRules, r: rRules },
      correct: R
        ? `Yes — ${N} ÷ ${d} = ${Q} remainder ${R}.`
        : `Yes — ${N} ÷ ${d} = ${Q}, with nothing left over.`,
      hints: [hint1, hint2],
      reveal: `${N} ÷ ${d} = ${Q} ${remText}.`,
      why: R
        ? `Check it backwards: ${d} × ${Q} = ${dQ}, and ${dQ} + ${R} = ${N}. The remainder ${R} is smaller than ${d}, so no more ${d}s fit.`
        : `Check it backwards: ${d} × ${Q} = ${N} exactly, so nothing is left over.`
    };

    return {
      type: "practice", solo: true, generated: true, key, level,
      problem: [{ n: String(N) }, "÷", { n: String(d) }],
      answer: `${Q} r ${R}`,
      outro: R ? `${N} ÷ ${d} = ${Q} remainder ${R}.` : `${N} ÷ ${d} = ${Q} exactly.`,
      steps: [step]
    };
  }

  /* =========================================================
     Quiz questions: one answer line, one try, no hints.
     Returns { key, problem, layout, rules, answerText, solvedText, why, say, tip }.
     ========================================================= */
  function generateQuizQuestion(opts = {}) {
    if (opts.topic === "fractions") {
      const g = generateQuestion({ avoid: opts.avoid });
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
    const g = generateDivision(opts), s = g.steps[0];
    const N = g.problem[0].n, d = g.problem[2].n, Q = +s.answer.q, R = +s.answer.r;
    // Practice messages end in a question ("50 − 48 = ?") to prompt another try; a quiz gives one try, so state the result.
    const rRules = s.rules.r.map(r => r.exact === "0" && R > 0
      ? { ...r, say: `Something's left over: ${d} × ${Q} = ${d * Q}, and ${N} − ${d * Q} = ${R}.` } : r);
    return {
      key: g.key, problem: g.problem, layout: s.layout, rules: { q: s.rules.q, r: rRules },
      answerText: g.answer, solvedText: g.outro, why: s.why,
      say: `${N} ÷ ${d}`,
      tip: "Put what's left over in the remainder box, or 0 if nothing is left."
    };
  }

  root.generateQuestion = generateQuestion;
  root.generateDivision = generateDivision;
  root.generateQuizQuestion = generateQuizQuestion;
  if (typeof module !== "undefined" && module.exports) module.exports = { generateQuestion, generateDivision, generateQuizQuestion, gcd, lcm };
})(typeof window !== "undefined" ? window : globalThis);
