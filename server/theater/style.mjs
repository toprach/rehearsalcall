/* ---------------------------------------------------------------------
   How it looks.

   Every colour is a custom property at the top - once for light, once
   for dark. That is not tidiness but self-defence: while the colours
   still stood beside the components, the specificity rule bit twice.
   input[type=text] is more specific than input, and table.cal td is more
   specific than td.level3 - both times fields came out unreadable, and
   both times it could not be seen, only reasoned out.
   --------------------------------------------------------------------- */

export const STYLE = `
  :root {
    --ground:#fbfaf8; --card:#fff; --ink:#1c1a18; --muted:#5f5950;
    --rule:#e6e1da; --accent:#b3272d; --good:#166b34;
    --field:#fff; --field-ink:#1c1a18; --field-edge:#a9a29a;
    --chip:#eceae5; --chip-ink:#2a2622;
  }
  * { box-sizing:border-box }
  [hidden] { display:none !important }
  /* The type size is a setting per device; everything is in rem, so the
     root size carries it through. */
  html { font-size:16px }
  html[data-font="klein"] { font-size:14px }
  html[data-font="gross"] { font-size:18px }
  html[data-font="sehrgross"] { font-size:21px }
  body { margin:0; background:var(--ground); color:var(--ink);
         font:1rem/1.6 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;
         -webkit-font-smoothing:antialiased }
  .frame { max-width:60rem; margin:0 auto; padding:2.5rem 1.5rem 5rem }
  .foot { border-top:1px solid var(--rule); margin-top:2rem }
  .foot .inner { max-width:60rem; margin:0 auto; padding:1rem 1.5rem 2rem }
  .foot a { color:var(--muted); text-decoration:none }
  .foot a:hover { color:var(--accent) }
  .narrow { max-width:38rem }
  a { color:var(--accent) }
  h1 { font-size:1.75rem; letter-spacing:-.02em; margin:0 0 .3rem }
  h2 { font-size:1.1rem; margin:2.5rem 0 .8rem }
  .eyebrow { text-transform:uppercase; letter-spacing:.2em; font-size:.72rem;
             font-weight:700; color:var(--accent); margin:0 0 .5rem }
  .muted { color:var(--muted) }
  p { margin:0 0 1rem }
  .box { background:var(--card); border:1px solid var(--rule); border-radius:4px;
         padding:1.2rem 1.4rem; margin:1.2rem 0 }
  .box.important { border-left:4px solid var(--accent) }
  label { display:block; font-weight:600; font-size:.9rem; margin:1rem 0 .3rem }
  input[type=text], input[type=date], input[type=time], input[type=number],
  input[type=search], input[type=password], select, textarea {
    width:100%; padding:.55rem .7rem; border:1px solid var(--field-edge);
    border-radius:3px; font:inherit;
    background:var(--field); color:var(--field-ink) }
  input::placeholder, textarea::placeholder { color:var(--muted); opacity:1 }
  input:focus, select:focus, textarea:focus {
    border-color:var(--accent); outline:2px solid rgba(179,39,45,.25); outline-offset:0 }
  textarea { min-height:10rem; font-family:ui-monospace,Consolas,monospace; font-size:.85rem }
  button, .btn { display:inline-block; background:var(--accent); color:#fff; border:0;
    border-radius:3px; padding:.65rem 1.3rem; font:inherit; font-weight:700;
    cursor:pointer; text-decoration:none; margin-top:1.2rem }
  button.quiet, .btn.quiet { background:var(--card); color:var(--ink);
    border:1.5px solid var(--field-edge); font-weight:600 }
  table { border-collapse:collapse; width:100%; margin:.6rem 0 }
  th,td { text-align:left; padding:.45rem .6rem; border-bottom:1px solid var(--rule);
          vertical-align:top }
  th { font-size:.78rem; text-transform:uppercase; letter-spacing:.06em; color:var(--muted) }
  .notice { padding:.8rem 1.1rem; border-radius:3px; margin:1rem 0; font-size:.93rem }
  .notice.error { background:#fdecec; border-left:4px solid var(--accent) }
  .notice.good { background:#e9f5ed; border-left:4px solid var(--good) }
  .notice.demo { background:#eef2fb; border-left:4px solid #4a6fd0; font-size:.9rem }
  /* --- the sheet that asks to install the app: fixed, the whole width --- */
  .pwasheet { position:fixed; left:0; right:0; bottom:0; z-index:80; background:rgba(0,0,0,.45);
              display:flex; align-items:flex-end; justify-content:center; top:0 }
  .pwasheet[hidden] { display:none }
  .pwasheet .inner { width:100%; max-width:40rem; background:var(--card); color:var(--ink); padding:1.2rem 1.5rem 1.5rem;
                     border-radius:14px 14px 0 0; box-shadow:0 -8px 30px rgba(0,0,0,.3); text-align:center }
  .pwasheet .inner p { margin:.4rem 0 .8rem }
  .pwasheet button.big { display:block; width:100%; margin:0 0 .6rem; padding:.9rem 1rem; font-size:1.1rem; font-weight:700 }
  .pwasheet button.quiet { margin:0 }
  .pwasheet .how { background:var(--ground); border-radius:6px; padding:.5rem .7rem }
  html[data-theme="dark"] .notice.demo { background:#1d2540 }
  .box.demos p { margin:.4rem 0 .8rem } .box.demos p:last-child { margin-bottom:0 }
  .box.demos .btn { margin:.3rem .3rem 0 0 }
  .row { display:flex; gap:.6rem; align-items:end; flex-wrap:wrap }
  .row > * { flex:1; min-width:7rem }
  .row label { margin-top:0 }
  .small { font-size:.86rem }
  .head { border-bottom:1px solid var(--rule); background:var(--card) }
  .head .inner { max-width:60rem; margin:0 auto; padding:.8rem 1.5rem; display:flex;
                 gap:1.2rem; align-items:baseline; flex-wrap:wrap }
  .head a.brand { font-weight:800; letter-spacing:.18em; font-size:.85rem;
                  text-decoration:none; color:var(--ink); flex:0 0 auto;
                  white-space:nowrap }
  /* The nav is what gives way when the line is full: it may shrink and
     wrap its links, while brand and language picker keep their places.
     Without min-width:0 a flex item refuses to go below its content
     width, and the picker was pushed onto a second line instead; with
     a basis of 0 it is never the item that wraps as a whole. */
  .head nav { margin-left:auto; display:flex; flex-wrap:wrap; gap:.35rem 1.1rem;
              justify-content:flex-end; flex:1 1 0; min-width:0 }
  .head nav a { font-size:.88rem; text-decoration:none; color:var(--muted) }
  .head nav a.on { color:var(--ink); font-weight:700 }
  .head nav .grp { display:inline-flex; gap:.7rem; padding-left:.9rem; border-left:1px solid var(--rule) }
  .head nav .grp:first-child { padding-left:0; border-left:0 }
  /* --- the overview: the road as a strip of steps --- */
  .steps { display:grid; grid-template-columns:repeat(5, 1fr); gap:.6rem; margin:1rem 0 .4rem }
  .step { display:flex; flex-direction:column; gap:.2rem; text-decoration:none; color:var(--ink);
          border:1px solid var(--rule); border-radius:6px; background:var(--card); padding:.7rem .8rem }
  .step .num { display:inline-flex; align-items:center; justify-content:center; width:1.6rem; height:1.6rem;
               border-radius:50%; background:var(--chip); color:var(--chip-ink); font-weight:700; font-size:.85rem }
  .step .name { font-weight:700 }
  .step .detail { color:var(--muted) }
  .step.done { border-color:var(--good) }
  .step.done .num { background:var(--good); color:#fff }
  .step.open .num { background:var(--accent); color:#fff }
  .step.waits { opacity:.6 }
  @media (max-width:900px) { .steps { grid-template-columns:repeat(2, 1fr) } }
  @media (max-width:520px) { .steps { grid-template-columns:1fr } }
  /* --- the plan: editing behind a pencil --- */
  table.plan td.actions { width:auto; white-space:nowrap }
  table.plan tr.editor[hidden] { display:none }
  table.plan tr.editor td { padding:0; border:0 }
  table.plan .overlay .box form.inline { margin-bottom:.4rem }
  table.plan .overlay .box select, table.plan .overlay .box input[type=text] { padding:.25rem .4rem; font-size:.88rem }
  /* --- the dates: alternatives as chips --- */
  .alts { margin-top:.3rem; line-height:1.9 }
  /* --- the company: name, role and the link in one cell --- */
  form.person { flex-wrap:wrap; gap:.3rem .6rem }
  form.person .role { display:inline-flex; gap:.6rem; white-space:nowrap }
  details.personal { margin-top:.3rem }
  details.personal summary { cursor:pointer; color:var(--muted) }
  .chip { display:inline-block; background:var(--chip);
          color:var(--chip-ink); border-radius:3px;
          padding:.1rem .45rem; font-size:.82rem; font-weight:600; margin-right:.3rem }
  .date { font-weight:700 }
  .date.fixed { color:var(--good) }
  tr.isfixed td { background:rgba(29,122,62,.07) }
  tr.gleaning td { background:rgba(179,39,45,.06) }
  table.plan td.actions { width:21rem }
  table.plan td.actions form.inline { margin-bottom:.25rem }
  table.plan td.actions select, table.plan td.actions input[type=text] {
    padding:.2rem .35rem; font-size:.82rem }
  tr.stuck td { background:rgba(179,39,45,.10) }
  tr.unsure td { background:rgba(180,116,26,.14) }
  /* --- one version against the one before --- */
  table.diff td.kind { white-space:nowrap; text-transform:uppercase; letter-spacing:.05em;
                       font-weight:700; color:var(--muted) }
  table.diff tr.changed td.kind { color:#b4741a }
  table.diff tr.added td.kind { color:var(--good) }
  table.diff tr.removed td.kind { color:var(--accent) }
  table.diff del { background:#fdecec; text-decoration:line-through; color:var(--muted) }
  table.diff ins { background:#e9f5ed; text-decoration:none }
  table.diff tr.gap td { border:0; height:.8rem; background:transparent }
  @media print { .head, .foot, .notice { display:none } .frame { padding:0 } }
  form.inline { display:flex; gap:.3rem; margin:0; align-items:center }
  form.inline input[type=text] { padding:.3rem .45rem; font-size:.9rem }
  form.placefield { margin-top:.4rem; max-width:22rem }
  button.mini, .btn.mini { margin:0; padding:.3rem .7rem; font-size:.82rem }
  form.choice { margin:0 }
  .calhead { display:flex; align-items:center; gap:.8rem; margin:1.5rem 0 .6rem }
  .calhead b { font-size:1.05rem }
  .calhead .small { margin-left:auto }
  .legend { display:flex; flex-wrap:wrap; gap:.3rem 1rem; align-items:center;
            color:var(--muted); margin-bottom:.6rem }
  .dot { display:inline-block; width:.8rem; height:.8rem; border-radius:2px;
         vertical-align:-1px; margin-right:.15rem; border:1px solid var(--rule) }
  table.cal { width:100%; border-collapse:separate; border-spacing:3px; table-layout:fixed }
  table.cal th { text-align:center; font-size:.72rem; padding:0 0 .2rem }
  table.cal td { height:3.4rem; vertical-align:top; padding:.25rem .3rem;
                 border:1px solid var(--rule); border-radius:4px;
                 background:var(--card); cursor:pointer; text-align:left }
  table.cal td.empty { background:transparent; border-color:transparent; cursor:default }
  table.cal td .num { font-size:.85rem; font-weight:600; color:var(--muted) }
  table.cal td .time { display:block; font-size:.7rem; margin-top:.15rem;
                       color:var(--ink); font-weight:600 }
  /* The more of the people from one of my rehearsals can make that day,
     the stronger the cell. Pale tones would not be told apart in a
     calendar - here clarity matters more than delicacy.

     The rule "table.cal td" carries the class .cal and is therefore more
     specific than "td.level3" - the cells would otherwise stay white.
     Hence table.cal in front here as well. */
  table.cal td.level1, .dot.level1 { background:#fbe6a8; border-color:#e0c274 }
  table.cal td.level2, .dot.level2 { background:#f3cf6f; border-color:#d3ad48 }
  /* Orange: everyone else can, only my yes is missing - that is the
     signal that I make the rehearsal possible. */
  table.cal td.level3, .dot.level3 { background:#f5a45a; border-color:#d9822e }
  /* Light green: everyone needed can, me included. */
  table.cal td.level3.me, .dot.level3.me { background:#a8dfbb; border-color:#75bc90 }
  table.cal td.me { outline:3px solid var(--accent); outline-offset:-3px }
  /* Struck by the director: no rehearsal that day, whoever could. */
  table.cal td.blocked, .dot.blocked {
    background:repeating-linear-gradient(135deg, var(--chip) 0 6px, var(--card) 6px 12px);
    border-color:var(--field-edge) }
  table.cal td.blocked .num { text-decoration:line-through }
  table.cal td.nein { background:#e9e5df; border-color:#d0cac2; color:var(--muted) }
  table.cal td.nein .num { text-decoration:line-through }
  html[data-theme="dark"] table.cal td.nein { background:#2a2a30; border-color:#3a3a42 }
  .dot.nein { background:#e9e5df; border-color:#c9c3ba }
  .pref { display:flex; flex-wrap:wrap; gap:.4rem 1rem; align-items:center; margin:1rem 0 0 }
  .pref input[type=time] { margin:0; padding:.2rem .35rem; width:auto }
  .pref label.inline { margin:0 }
  /* how much of the preferred window is still free, from one's own calendars */
  table.cal td.day .frei { position:absolute; left:.3rem; right:.3rem; bottom:.25rem; height:5px; background:var(--rule); border-radius:3px; overflow:hidden }
  table.cal td.day .frei i { position:absolute; top:0; bottom:0; background:#1d7a3e; display:block }
  table.cal td.day .frei.voll { background:#1d7a3e }
  .dot.me { background:transparent; border:2px solid var(--accent) }
  /* Dark green: a fixed date of one of my rehearsals. */
  table.cal td.fixed, table.cal td.day.fixed.me, table.cal td.day.level3.fixed.me, .dot.fixed { background:#2f8a4f; border-color:#256d3f; color:#fff }
  table.cal td.fixed .num, table.cal td.fixed .time { color:#fff }
  /* the fixed rehearsal named in the cell, not only by colour */
  table.cal td.fixed .fix { display:block; font-size:.62rem; line-height:1.2; font-weight:700; color:#fff;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:.1rem 0 }
  table.cal td:hover { border-color:var(--accent) }
  /* a button at work: spinner in front of its label, no second press */
  .spin { display:inline-block; width:.9em; height:.9em; border:2px solid currentColor; border-right-color:transparent;
    border-radius:50%; margin-right:.45em; vertical-align:-.1em; animation:spin .8s linear infinite }
  @keyframes spin { to { transform:rotate(360deg) } }
  @media (prefers-reduced-motion: reduce) { .spin { animation-duration:2s } }
  button[aria-busy="true"] { cursor:progress; opacity:.8 }
  .copyable { display:inline-flex; gap:.5rem; align-items:center; flex-wrap:wrap }
  .copyable code { user-select:all }
  button.wide { width:100%; text-align:left; margin:.25rem 0; padding:.6rem .8rem }
  .open { color:var(--accent); font-weight:600 }
  code { background:var(--chip); color:var(--chip-ink);
         padding:.12rem .4rem; border-radius:2px; font-size:.88em }

  /* You are working for somebody else. That has to be seen without
     looking for it - otherwise times go into the wrong calendar. */
  .notice.foreign { background:#fdf3e3; border-left:4px solid #b4741a;
                    display:flex; flex-wrap:wrap; gap:.6rem; align-items:center }
  .notice.foreign form { margin:0 }

  /* --- the language picker in the head --- */
  .langpick { display:flex; align-items:center; flex:0 0 auto; order:1;
              margin:0 0 0 .8rem }
  .themepick { flex:0 0 auto; order:2; margin:0 0 0 .4rem }
  .head a.settings { flex:0 0 auto; order:3; margin-left:.5rem; text-decoration:none; color:var(--muted);
                     font-size:1.15rem; line-height:1 }
  .head a.settings:hover { color:var(--ink) }
  .head button.share { flex:0 0 auto; order:4; margin:0 0 0 .5rem; padding:.2rem; background:none; border:0;
                       color:var(--muted); cursor:pointer; line-height:0 }
  .head button.share svg { width:1.3rem; height:1.3rem }
  .head button.share:hover { color:var(--ink) }
  .toast { position:fixed; left:50%; bottom:5rem; transform:translateX(-50%); background:var(--ink); color:var(--ground);
           padding:.5rem 1rem; border-radius:6px; font-size:.9rem; z-index:70; box-shadow:0 6px 20px rgba(0,0,0,.3) }
  form.settings .choices { display:flex; flex-wrap:wrap; gap:.4rem 1.2rem; margin:.2rem 0 .6rem }
  form.settings label.choice { font-weight:400; font-size:1rem; margin:0 }
  .themepick button { margin:0; padding:.25rem .5rem; line-height:1; font-size:1rem;
                      border-radius:6px }
  .whopick { display:inline-block; margin:0 }
  /* --- a member on a phone: the links move into a bar at the bottom --- */
  .tabbar { display:none }
  /* A long link or word must never make the page wider than the
     screen: on a phone that drags the fixed bar out of sight. */
  html, body { overflow-x:hidden; overflow-x:clip }
  .copyable { max-width:100% }
  .copyable code { min-width:0; max-width:100%; overflow-wrap:anywhere; word-break:break-all }
  @media (max-width:700px) {
    .head.member nav a, .head.member .whopick, .head.member .langpick,
    .head.member .themepick, .head.member a.settings { display:none }
    .head.member button.share { margin-left:auto }
    .head.member button.share svg { width:22px; height:22px }
    .head.member nav { flex:0 1 auto; margin-left:0 }
    .tabbar a { min-width:0; overflow:hidden }
    .tabbar { display:flex; position:fixed; left:0; right:0; bottom:0; z-index:40;
              background:var(--card); border-top:1px solid var(--rule);
              padding:.3rem 0 max(.3rem, env(safe-area-inset-bottom)) }
    /* The bar keeps its size whatever the type setting: five labels
       have to fit a phone's width. */
    .tabbar a { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px;
                font-size:11px; line-height:1.25; text-align:center; color:var(--muted); text-decoration:none; padding:3px 0 }
    .tabbar a svg { width:22px; height:22px; flex:0 0 auto }
    .tabbar a { white-space:nowrap; justify-content:center }
    .tabbar a.on { color:var(--accent); font-weight:700 }
    .frame.hastabs { padding-bottom:6rem }
    .overlay { align-items:flex-start; padding-top:1rem }
    body .bookstep { bottom:3.9rem }
  }
  /* --- the part book on the screen --- */
  .bookbar { display:flex; flex-wrap:wrap; gap:.4rem 1rem; align-items:center; margin:.6rem 0 1rem }
  .pass { border:1px solid var(--rule); border-radius:6px; background:var(--card); padding:.8rem 1rem; margin:.8rem 0 }
  .pass .passhead { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; margin-bottom:.4rem }
  .pass .pno { font-weight:700; color:var(--accent) }
  .pass .passhead .sits { margin-left:auto }
  .pass .cue { color:var(--muted); margin:0 0 .4rem; padding-left:.6rem; border-left:3px solid var(--rule) }
  .pass .dir { color:var(--muted); font-style:italic; margin:.2rem 0 }
  .pass .say { margin:.25rem 0; font-size:1.05rem }
  /* The book is for reading at arm's length: the type-size setting
     counts for more here than on the other pages. */
  html[data-font="gross"] .pass .say { font-size:1.3rem; line-height:1.5 }
  html[data-font="gross"] .pass .cue, html[data-font="gross"] .pass .dir { font-size:1.1rem }
  html[data-font="sehrgross"] .pass .say { font-size:1.7rem; line-height:1.45 }
  html[data-font="sehrgross"] .pass .cue, html[data-font="sehrgross"] .pass .dir { font-size:1.25rem }
  html[data-font="sehrgross"] .pass .reveal, html[data-font="sehrgross"] .bookstep #next { font-size:1.2rem }
  .pass .say.cut { text-decoration:line-through; opacity:.6 }
  .pass .reveal { display:none; margin:.3rem 0 }
  .pass.sits { border-color:var(--good) }
  .pass.sits .pno { color:var(--good) }
  .heft-modes { display:flex; gap:.4rem; margin:.8rem 0 1rem; flex-wrap:wrap }
  .heft-modes button { margin:0; background:var(--card); color:var(--ink); border:1px solid var(--field-edge) }
  .heft-modes button.on { background:var(--accent); color:#fff; border-color:var(--accent) }
  .pass .cue.own { border-left-color:var(--accent) }
  /* A double tap opens the comments; it must not select a word instead. */
  .pass { -webkit-user-select:none; user-select:none }
  .pass .cbadge { display:inline-block; margin-left:.4em; padding:0 .45em; border-radius:1em; border:1px solid var(--accent);
                  color:var(--accent); font-size:.75rem; font-weight:600; cursor:pointer }
  .pass .cbadge.q { background:var(--accent); color:#fff }
  .cmt-item { border-top:1px solid var(--rule); padding:.5rem 0 }
  .cmt-item .who { font-size:.85em; color:var(--muted) }
  .cmt-item .q { color:var(--accent); font-weight:600; font-size:.85em }
  .cmt-item .ans { margin:.3rem 0 0 1rem; padding-left:.6rem; border-left:3px solid var(--good) }
  .cmt-item .del { float:right; font-size:.8em; color:var(--accent); background:none; border:0; padding:0; margin:0; cursor:pointer }
  .overlay .box textarea { width:100%; min-height:5rem; margin:.3rem 0 }
  .pass .ctxwrap .ctx-more { margin:.2rem 0 }
  .pass .ctx .ctxline, .pass .ctx .dir { opacity:.7; font-size:.95rem }
  .pass .intent { color:var(--muted); margin:.4rem 0 0 }
  .pass .notebtn { display:inline-block; vertical-align:baseline; margin:0 0 0 .35em; padding:0; border:0; background:none;
                   color:var(--muted); cursor:pointer; line-height:0 }
  .pass .notebtn svg { width:1em; height:1em; vertical-align:-.1em }
  .pass .notebtn.has { color:var(--accent) }
  .pass .notebox { margin:.3rem 0 .5rem }
  .pass .notebox input { width:100%; margin:.2rem 0 0 }
  .pass.learn .speak { margin:.6rem 0 .2rem }
  .pass.learn .hinted { color:var(--muted); letter-spacing:.02em }
  .pass.learn .acts { margin-top:.6rem }
  .pass.learn .acts button { margin:.2rem .3rem .2rem 0 }
  .pass.learn .rate { display:flex; gap:.4rem; flex-wrap:wrap; margin-top:.5rem }
  .pass.learn .rate button { flex:1 1 6rem; margin:0 }
  .pass.learn .intentbox input { width:100%; margin:.2rem 0 .4rem }
  .pass.learn .batch { margin-left:auto }
  /* --- the whole play on the screen --- */
  .play h2 { margin:1.6rem 0 .4rem } .play h3 { margin:1.2rem 0 .3rem; font-size:1.05rem }
  .play .say { margin:.35rem 0; -webkit-user-select:none; user-select:none }
  .play .say.mine { border-left:3px solid var(--accent); padding-left:.5rem; margin-left:-.6rem; background:rgba(179,39,45,.05) }
  .play .say.cur { outline:2px solid var(--accent); outline-offset:3px; border-radius:3px }
  .play .say.cut { text-decoration:line-through; opacity:.6 }
  .play .dir { color:var(--muted); font-style:italic; margin:.3rem 0 }
  .play mark.me { background:#ffe58a; color:inherit; font-weight:700; padding:0 .1em }
  .play .rehearsal-from { margin:.6rem 0 .2rem }
  .play .rehearsal-from .chip { text-decoration:none }
  .play .cbadge { display:inline-block; margin-left:.4em; padding:0 .45em; border-radius:1em; border:1px solid var(--accent);
                  color:var(--accent); font-size:.75rem; font-weight:600; cursor:pointer }
  .play .cbadge.q { background:var(--accent); color:#fff }
  .playbar { position:fixed; left:0; right:0; bottom:0; z-index:41; display:flex; gap:.6rem; align-items:center;
             justify-content:center; padding:.4rem .8rem; background:var(--card); border-top:1px solid var(--rule) }
  .playbar button { margin:0 }
  @media (max-width:700px) { body .playbar { bottom:3.9rem } }
  /* --- the fixed bar with the learning buttons: always in the same place --- */
  .learnbar { position:fixed; left:0; right:0; bottom:0; z-index:41; display:flex; gap:.5rem; align-items:center;
              justify-content:center; padding:.5rem .8rem; background:var(--card); border-top:1px solid var(--rule) }
  .learnbar button { flex:1 1 0; max-width:14rem; margin:0; padding:.7rem .5rem; font-weight:700 }
  .learnbar .rate-again { background:#c9302c; border-color:#c9302c; color:#fff }
  .learnbar .rate-help { background:#e08a1e; border-color:#e08a1e; color:#fff }
  .learnbar .rate-knew { background:#1d7a3e; border-color:#1d7a3e; color:#fff }
  .learnbar button.back { flex:0 1 auto; max-width:7rem }
  .applause { text-align:center }
  .applause .clap { font-size:3rem; line-height:1.2; margin:0 0 .3rem }
  .applause button { margin:.6rem .3rem 0 }
  body.learning .frame { padding-bottom:9rem }
  @media (max-width:700px) { body .learnbar { bottom:3.9rem } body.learning .frame.hastabs { padding-bottom:12rem } }
  /* --- other calendars in the availability page --- */
  table.cal td.day { position:relative }
  table.cal td.day .ics-dot { position:absolute; right:.2rem; top:.2rem; font-size:.62rem; line-height:1.4;
                              background:#4a6fd0; color:#fff; border-radius:1em; padding:0 .35em; font-weight:700 }
  #kalender-quellen .quelle { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; margin:.3rem 0 }
  #kalender-quellen .row input { margin:0 }
  .ics-ev { margin:.15rem 0 }
  .figures { margin:.4rem 0 .8rem }
  .remind { margin:.4rem 0 1.2rem; border:1px solid var(--rule); border-radius:4px; padding:.5rem .9rem; background:var(--card) }
  .remind summary { cursor:pointer; font-weight:600 }
  .remind summary svg { width:1em; height:1em; vertical-align:-.15em; margin-right:.2em }
  .remind .row { align-items:end }
  .remind .row > div:first-child { flex:1 1 9rem }
  .remind .row > div:last-child { flex:2 1 12rem }
  .remind input[type=time] { min-width:8rem }
  .remind button { margin:0 .3rem 0 0 }
  .remind label { margin-top:.4rem }
  .figures .steps { display:flex; height:.5rem; margin-top:.4rem; border-radius:3px; overflow:hidden; background:var(--rule) }
  .figures .steps i { display:block; min-width:0 }
  .figures .steps .s0 { background:#c9512f } .figures .steps .s1 { background:#d9962b } .figures .steps .s2 { background:#d7c22b }
  .figures .steps .s3 { background:#9cc63a } .figures .steps .s4 { background:#5aa843 } .figures .steps .s5 { background:#1d7a3e }
  .figures .steps .s- { background:transparent }
  .bookstep { position:fixed; left:0; right:0; bottom:0; z-index:41; display:flex; gap:.6rem;
              align-items:center; justify-content:center; padding:.5rem .8rem;
              background:var(--card); border-top:1px solid var(--rule) }
  .bookstep button { margin:0 }
  .bookstep #pos { white-space:nowrap }
  .bookstep #next { flex:0 1 20rem }
  label.inline { display:inline-flex; gap:.3rem; align-items:center; font-weight:400;
                 font-size:.82rem; margin:0 .2rem; white-space:nowrap }
  label.inline input { margin:0 }
  .acts { display:flex; flex-wrap:wrap; gap:.4rem 1rem; margin:.2rem 0 .6rem }
  .box.cmt { padding:.8rem 1rem; margin:.6rem 0 }
  .box.callout { text-align:center; padding:1.4rem 1.4rem 1.6rem }
  .box.callout p { margin:0 0 .5rem }
  .btn.big { font-size:1.15rem; padding:.9rem 1.8rem; margin-top:.6rem; width:100%; text-align:center }
  .box.cmt .answer { margin:.4rem 0 .2rem .8rem; padding-left:.7rem; border-left:3px solid var(--good) }
  .box.cmt form.inline input[type=text] { max-width:28rem }
  .acts label.inline { font-size:.9rem }
  .chip.muted { opacity:.6; font-weight:500 }
  .tabs a { margin-right:1.2rem; text-decoration:none; padding-bottom:.15rem }
  .tabs a.on { font-weight:700; border-bottom:2px solid var(--accent) }
  /* The calendar's day panel floats above the calendar instead of
     pushing it around below. */
  .overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,.45);
             display:flex; align-items:center; justify-content:center; z-index:50; padding:1rem }
  /* display:flex would beat the browser's [hidden] rule - say it again. */
  .overlay[hidden] { display:none }
  .overlay .box { width:100%; max-width:34rem; margin:0; max-height:90vh; overflow:auto;
                  box-shadow:0 12px 40px rgba(0,0,0,.35) }
  .whopick select,
  .langpick select { padding:.15rem .3rem; font-size:.82rem; margin:0;
                     background:var(--field); color:var(--field-ink);
                     border:1px solid var(--field-edge); border-radius:.25rem }

  /* --- audiobook --- */
  .bar { height:.5rem; background:var(--chip); border-radius:.25rem;
         overflow:hidden; margin:.5rem 0 }
  .bar i { display:block; height:100%; background:var(--accent);
           transition:width .4s }
  table.voices td { padding:.3rem .5rem; vertical-align:middle }
  table.voices select { min-width:16rem }
  .keyfield { font-family:ui-monospace,Consolas,monospace }

  /* --- the passages of one rehearsal --- */
  .line { border-left:3px solid var(--rule); padding:.15rem 0 .15rem .9rem;
          margin:.1rem 0 }
  .line.own { border-left-color:var(--accent) }
  .line .speaker { font-weight:700; font-size:.82rem; letter-spacing:.04em;
                   color:var(--muted) }
  .line.own .speaker { color:var(--accent) }
  .line.chorus .speaker { color:var(--good) }
  .line .words { display:block }
  .line.readout .words { color:var(--muted) }
  .line.cut .words { text-decoration:line-through; opacity:.5 }
  .direction { color:var(--muted); font-style:italic; margin:.5rem 0 .5rem .9rem }
  .scenehead { display:flex; flex-wrap:wrap; gap:.6rem; align-items:baseline;
               margin:1.8rem 0 .6rem; padding-bottom:.3rem;
               border-bottom:1px solid var(--rule) }
  .scenehead h3 { margin:0; font-size:1.05rem }
  table.twocol { width:100%; border-collapse:collapse; margin:.6rem 0 }
  table.twocol td { width:50%; vertical-align:top; padding:.3rem .7rem;
                    border:1px solid var(--rule) }
  table.twocol th { font-size:.78rem; color:var(--muted); text-align:left;
                    padding:.2rem .7rem; font-weight:600 }
  @media (max-width:640px) {
    table.twocol td { display:block; width:auto }
  }
  /* --- the dark look: only when chosen in the head ---
     Most people read on a light page; the dark one is a choice that
     the browser keeps as a cookie, not a guess from the system. */
  html[data-theme="dark"] {
    --ground:#15151a; --card:#1e1e25; --ink:#eceae5; --muted:#aaa49a;
    --rule:#33333d; --accent:#ef6b70; --good:#5ec27f;
    --field:#23232c; --field-ink:#f2f0eb; --field-edge:#4e4e5a;
    --chip:#2e2e38; --chip-ink:#eceae5;
  }
  html[data-theme="dark"] .notice.foreign { background:#3a2c16; border-left-color:#d59b4a }
  html[data-theme="dark"] .notice.error { background:#3a1d1f }
  html[data-theme="dark"] .notice.good { background:#16301f }
  html[data-theme="dark"] table.diff del { background:#3a1d1f }
  html[data-theme="dark"] table.diff ins { background:#16301f }
  html[data-theme="dark"] .box.important { background:var(--card) }
  html[data-theme="dark"] table.cal td.level1, html[data-theme="dark"] .dot.level1 { background:#5c5026; border-color:#7a6c39 }
  html[data-theme="dark"] table.cal td.level2, html[data-theme="dark"] .dot.level2 { background:#6e5a22; border-color:#8d7533 }
  html[data-theme="dark"] table.cal td.level3, html[data-theme="dark"] .dot.level3 { background:#8a4a14; border-color:#b3651f }
  html[data-theme="dark"] table.cal td.level3.me, html[data-theme="dark"] .dot.level3.me { background:#255c39; border-color:#39794f }
  html[data-theme="dark"] table.cal td.fixed, html[data-theme="dark"] table.cal td.day.level3.fixed.me, html[data-theme="dark"] .dot.fixed { background:#1f6b3a; border-color:#2f8a4f }
  html[data-theme="dark"] button.quiet, html[data-theme="dark"] .btn.quiet { background:var(--card); border-color:var(--field-edge);
                             color:var(--ink) }
`;
