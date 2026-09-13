/* ---------------------------------------------------------------------
   English - the source language.

   Keys are grouped by page. A value may contain markup we wrote
   ourselves; anything coming from a user arrives through a {name}
   placeholder and is escaped on the way in.

   Adding a language: copy this file, translate the right-hand side,
   register it in texte.mjs. Nothing else.
   --------------------------------------------------------------------- */

export const en = {
  /* ---------- chrome ---------- */
  'app.name':        'Rehearsal Planner',
  'app.for':        'For theatre groups',
  'nav.dark':     'Dark page',
  'nav.settings': 'Settings',
  'nav.share':    'share the link to my part book',
  'nav.copied':   'Link copied',
  'nav.light':    'Light page',
  'nav.language':     'Language',
  'nav.overview':  'Overview',
  'nav.company':    'Company',
  'nav.script':      'Script',
  'nav.casting':   'Casting',
  'nav.rehearsals':        'Rehearsals',
  'nav.dates':     'Dates',
  'nav.print':     'Print',
  'nav.audiobook':    'Audiobook',
  'nav.signout':    'Sign out',
  'nav.comments':   'Comments',
  'nav.project':    'Project',
  'nav.calendar_for': 'calendar for \u2026',

  /* ---------- wording used all over ---------- */
  'common.close':   'close',
  'common.save':    'save',
  'common.copy':   'copy',
  'common.copied':    'copied',
  'common.selected':   'selected – press Ctrl+C to copy',
  'common.back':    'Back',
  'common.error':     'Error',
  'common.place_hint':  'Place, e.g. stage or rehearsal room',
  'common.hours':    '{h}:{m} h',
  'common.minutes':    '{n} min',

  /* ---------- entry page ---------- */
  'entry.what':         'Schedule rehearsals in small groups without endless date ' +
                     'threads in the group chat. Everyone enters once when they ' +
                     'are free – the program works out the dates.',
  'entry.code':        'Access code',
  'entry.code_hint':  'e.g. k7mq2x',
  'entry.continue':      'Continue',
  'entry.no_access': 'No access yet?',
  'entry.request':   'Send an email to <a href="mailto:{mail}?subject={subject}">{mail}</a> ' +
                     'with the subject “{subject}”. You will get a code to enter here.',
  'entry.request_subject': 'Please send access for the rehearsal planner',
  'entry.request_none': 'Ask whoever runs this installation for an access code.',
  'entry.by_hand':  'No sign-up form, no account, no data collection – with a ' +
                     'handful of stages, doing it by hand is the lesser evil.',
  'entry.more':        'Described at length: <a href="/software-en.html">what the software works out, and why</a>.',
  'entry.demo_title':    'Try it out',
  'entry.demo_what':     'Two plays in the public domain are set up as demo projects. Anyone may '
                       + 'look around and change things there; every 24 hours they go back to how '
                       + 'they were. Uploading a script and the audiobook are switched off in them.',
  'entry.demo_director': 'as the director',
  'entry.demo_member':   'as a member of the company',
  'demo.banner':         'Demo project \u2013 everyone may change things here; it is put back '
                       + 'to its starting state every 24 hours, next around {when}.',
  'entry.open_source':       'The tools behind it are open to inspect: ' +
                     '<a href="https://github.com/toprach/rehearsalcall">' +
                     'github.com/toprach/rehearsalcall</a>',

  /* ---------- why no date could be found ---------- */
  'why.waiting':    'waiting for: {folks}',
  'why.too_long':   'needs {needs}, but the longest window everyone shares is ' +
                     '{window} – split it up or allow more time',
  'why.no_evening':'no evening in common; most often unavailable: {folks}',
  'why.taken':    '{n} evenings would work, but those people are already ' +
                     'rehearsing then',
  'why.nothing':'no evening in common',

  /* ---------- member area ---------- */
  'mem.hello':        'Hello {name}',
  'mem.for_other':  'You are working <b>for {name}</b>, not for yourself.',
  'mem.back_to':   'back to {name}',
  'mem.switch_who': 'work for \u2026',
  'mem.switch_go': 'switch',
  'mem.my_times': 'Availability',
  'mem.my_rehearsals': 'Rehearsals',
  'mem.part_book':   'Part book',
  'mem.full_script': 'Full script',
  'mem.evenings_yes':    '{n} evenings entered \u2013 <a href="/theater/mit/zeiten">change</a>',
  'mem.call_title':  'Your availability is still missing',
  'mem.call_what':   'The dates for your rehearsals can only be found once you have said '
                   + 'which evenings you can make. It takes five minutes.',
  'mem.call_go':     'Enter my availability now',
  'mem.evenings_no': '<span class="open">nothing yet</span> \u2013 '
                    + '<a href="/theater/mit/zeiten">enter them now</a>',
  'mem.rehearsals_yes':    '{n}, {fixed} of them with a fixed date \u2013 '
                    + '<a href="/theater/mit/termine">look</a>',
  'mem.rehearsals_no': '<span class="muted">no rehearsal plan yet</span>',
  'mem.book_open':     '<a href="/theater/mit/heft">open</a> \u2013 my passages, with a learning '
                    + 'mode; the printable version is on the scripts page',
  'mem.no_script':    '<span class="muted">no script yet</span>',
  'mem.full_open':   '<a href="/theater/mit/gesamt" target="_blank" rel="noopener">open</a>',
  'mem.plan_book':   'Rehearsal plan in the script',
  'mem.plan_open':   '<a href="{url}" target="_blank" rel="noopener">open</a> \u2013 the whole '
                    + 'play with the rehearsals drawn in',
  'mem.docs':        'All scripts and part books in one place: <a href="{url}">Scripts</a> \u2013 '
                    + 'open one and print it in the browser.',

  /* ---------- the bar in a printed document ---------- */
  'bar.times':    'My availability',
  'bar.dates':   'My rehearsal dates',
  'bar.full':    'Full script, marked for me',
  'bar.hint':   'These buttons are not printed.',

  /* ---------- asking before working as somebody else ---------- */
  'switch.title':   'Working as somebody else',
  'switch.question':   'You are signed in as <b>{current}</b>. Go on as <b>{target}</b>?',
  'switch.what':     'From then on you enter times and see dates for {target}. Everyone '
                   + 'in the company can do this – it is meant for the evening '
                   + 'when two of you sort out dates together. {current} stays reachable '
                   + 'with one click.',
  'switch.yes':      'Yes, work as {target}',
  'switch.no':    'No, stay {current}',

  /* ---------- overview ---------- */
  'proj.project':      'Project',
  'proj.company':     'Company',
  'proj.script':     'Script',
  'proj.casting':    'Casting',
  'proj.rehearsals':         'Rehearsals',
  'proj.dates':      'Dates',
  'proj.availability': 'Availability',
  'proj.avail_n':    '{m} of {n} entered',
  'proj.dates_n':    '{n} of {m} fixed',
  'proj.steps_what': 'Every card leads to its page; proposals for dates are recomputed on every visit.',
  'proj.people_yes':     '{n} people, {m} of them with availability entered \u2013 '
                    + '<a href="/theater/leute">look</a>',
  'proj.people_no':  '<span class="muted">comes with the script</span>',
  'proj.script_yes':      '{source} \u2013 {n} speaker names',
  'proj.script_no':  'none yet',
  'proj.script_upload':    'upload one now',
  'proj.cast_yes':       '{speeches} speeches, {people} people, {roles} stage roles',
  'proj.cast_open':    'not taken over yet',
  'proj.cast_assign': 'assign them now',
  'proj.cast_waits':   '<span class="muted">waiting for the script</span>',
  'proj.plan_yes':      '{n} rehearsals at no more than {substitution} substitution, '
                    + 'coverage {coverage}',
  'proj.plan_no':  'none yet',
  'proj.plan_derive':'derive it now',
  'proj.plan_waits':  '<span class="muted">waiting for the casting</span>',
  'proj.dates_yes':   '<a href="/theater/termine">look at the proposals</a>',
  'proj.dates_waits':'<span class="muted">waiting for the rehearsal plan</span>',
  'proj.link_company':'Link for the company',
  'proj.link_company_what': 'One link for the whole troupe \u2013 everyone picks their '
                    + 'own name on it and can then enter times, look at dates and '
                    + 'confirm them, and fetch their own part book.',
  'proj.link_director':   'Link for the director',
  'proj.link_director_what': 'Leads here without an access code \u2013 to pass on to an '
                    + 'assistant director, or to switch between several projects '
                    + 'yourself. <b>Whoever has it may do everything</b> you may do '
                    + 'here. So not into the group chat.',
  'proj.link_new':     'make a new one',
  'proj.link_new_confirm':'The old director link will stop working. Go on?',
  'proj.language':      'Language for the company',
  'proj.language_what': 'What the company sees on its pages, unless someone switches in the '
                      + 'page head. Without a choice, the browser decides.',
  'proj.language_browser': 'as the browser says',
  'r.language_saved':   'Language saved.',
  'proj.period':        'Rehearsal period',
  'proj.period_what':   'Dates are looked for in this window, and the company is offered these '
                      + 'days in the calendar. Without an end, three months from today.',
  'proj.period_from':   'from',
  'proj.period_to':     'until',
  'r.period_saved':     'Rehearsal period saved.',
  'proj.road':          'The road',
  'proj.road_1':        '<b>Upload the script</b> \u2013 Word or Markdown.',
  'proj.road_2':        '<b>Assign the casting</b> \u2013 who is a person, what is a stage '
                    + 'role. The company follows from that.',
  'proj.road_3':        '<b>Derive the rehearsal plan</b> \u2013 substitution share and '
                    + 'group size can be set.',
  'proj.road_4':        '<b>Send the company link</b> \u2013 everyone enters once when they '
                    + 'can.',
  'proj.road_5':        '<b>Look at the dates</b> \u2013 they are recomputed on every visit.',

  /* ---------- uploading the script ---------- */
  'upl.step':      'Step 1',
  'upl.title':        'Upload the script',
  'upl.what':          'A Word file (<code>.docx</code>) or Markdown (<code>.md</code>). '
                    + 'The play is read and the speakers are looked for \u2013 you can '
                    + 'assign them straight afterwards.',
  'upl.doc_title':    'Title in the document',
  'upl.blocks':      'Blocks',
  'upl.speakers':     'Speaker names',
  'upl.speakers_n':   '{n} different ones',
  'upl.speeches':     'Speeches',
  'upl.people':     'People',
  'upl.to_casting':'On to the casting',
  'upl.read_full':  'Read the script',
  'upl.read_plan':  'Read the rehearsal plan',
  'upl.field':         'Script',
  'upl.upload':    'Upload and read',
  'upl.replaces':      ' \u2014 replaces an existing script.',
  'upl.format':       'How a script has to be formatted \u2013 speakers, stage directions, '
                    + 'acts \u2013 is described in <a href="https://github.com/toprach/'
                    + 'rehearsalcall/blob/main/DREHBUCH-FORMAT.md">DREHBUCH-FORMAT.md</a>. '
                    + 'Word is the better source than Markdown: there it says explicitly '
                    + 'where a paragraph ends.',

  /* ---------- printable documents ---------- */
  'docs.title':    'Scripts',
  'docs.what':      'Open one, then choose <i>Print</i> in the browser. This page always '
                    + 'shows the current state.',
  'docs.full':   'Full script',
  'docs.plan':     'Rehearsal plan drawn into the script',
  'docs.original': 'Original file ({name})',
  'docs.booklets':    'Part books',

  /* ---------- picking a name ---------- */
  'pick.title':       'Who are you?',
  'pick.what':         'Pick your name. The device remembers the choice \u2013 next time it '
                    + 'goes straight on.',
  'pick.nobody':     'Nobody has been set up in this project yet.',

  /* ---------- company navigation ---------- */
  'navm.times':    'My availability',
  'navm.dates':   'Rehearsal dates',
  'navm.scripts': 'Scripts',
  'navm.book':    'Part book',
  'navm.times_short': 'Availability',
  'navm.tab_avail': 'Available',
  'navm.tab_dates': 'Dates',
  'navm.tab_book':  'Part',
  'navm.tab_notes': 'Notes',

  /* ---------- casting ---------- */
  'cast.step':      'Step 2',
  'cast.title':        'Casting',
  'cast.title_long':   'Assign the casting',
  'cast.no_script':    'The <a href="/theater/skript">script has to be uploaded</a> first.',
  'cast.kind_person':   'a person of their own',
  'cast.kind_role':    'role played by \u2026',
  'cast.kind_alias':    'spelling of \u2026',
  'cast.kind_group':   'group (everyone at once)',
  'cast.kind_ignore':'not a speaker',
  'cast.kind_auto':     'sorts itself out',
  'cast.times':          '{n}\u00d7',
  'cast.stuck':       'not resolved',
  'cast.open_title':  'Not resolved yet:',
  'cast.open_where':     '\u2013 highlighted below.',
  'cast.open_what':    'For names with a slash such as <code>EINBRECHER/GREGG</code>, '
                    + '\u201csorts itself out\u201d means: the left half must be a '
                    + '<b>stage role</b> and the right half <b>a person of their own</b>. '
                    + 'If either is still unassigned, the name stays stuck. So either put '
                    + 'the halves right \u2013 or set this row to <i>spelling of \u2026</i> '
                    + 'and pick the left half.',
  'cast.what':          'Every name from the script needs a decision. Most of it is already '
                    + 'proposed \u2013 check above all which names are <b>stage roles</b> '
                    + 'played by somebody else. That is the one thing the program cannot '
                    + 'know.',
  'cast.help_person': '<b>a person of their own</b> \u2013 appears on the rehearsal list '
                    + 'in their own right. The short name is the name in the script; the '
                    + 'actor\u2019s name is entered on the <a href="/theater/leute">company '
                    + 'page</a>.',
  'cast.names_where': 'Names of the actors, director and assistant are kept on the '
                    + '<a href="/theater/leute">company page</a>.',
  'cast.help_role':  '<b>role played by \u2026</b> \u2013 a stage role; the person behind '
                    + 'it comes to the rehearsal. In the play within the play, '
                    + '<i>Anna</i> plays <i>Mrs Clackett</i>.',
  'cast.help_alias':  '<b>spelling of \u2026</b> \u2013 the same name, written differently.',
  'cast.help_group': '<b>group</b> \u2013 \u201cEveryone\u201d, \u201cThe others\u201d: '
                    + 'the whole troupe speaks.',
  'cast.help_none': '<b>not a speaker</b> \u2013 picked up by mistake, does not belong.',
  'cast.help_auto':   '<b>sorts itself out</b> \u2013 double speakers and swapped roles; '
                    + 'the tool works that out from the parts.',
  'cast.col_name':      'Name in the script',
  'cast.col_is':       'is',
  'cast.col_of':       'of',
  'cast.col_actor':       'Actor',
  'cast.take_over':  'Take over and build the structure',
  'cast.results_in':       'That makes {n} people: {folks}',

  /* ---------- rehearsal plan ---------- */
  'plan.step':     'Step 3',
  'plan.title':       'Rehearsal plan',
  'plan.no_cast':   'The <a href="/theater/besetzung">casting has to be taken over</a> '
                    + 'first.',
  'plan.what':         'The program looks for the passages that can be rehearsed in small '
                    + 'groups and bundles them into evenings. What gets chosen is not a '
                    + 'scene but a <b>cast</b> \u2013 if the evening is happening anyway, '
                    + 'every further passage for the same people costs nothing more.',
  'plan.acts':          'Acts',
  'plan.derive_add':    'Derive (add)',
  'plan.derive_replace': 'Derive (replace)',
  'plan.modes_what':    '<b>Add</b> keeps every rehearsal and derives more for the chosen acts, '
                      + 'only for text no rehearsal covers yet. <b>Replace</b> throws away the '
                      + 'rehearsals of the chosen acts and derives them afresh. A rehearsal '
                      + 'with a fixed date is never touched either way.',
  'plan.replace_confirm': 'Replace the rehearsals of the chosen acts? Changes made by hand there '
                      + 'are lost; rehearsals with a fixed date stay.',
  'plan.reset':         'reset the plan',
  'plan.reset_confirm': 'Delete every rehearsal and every fixed date of this plan? The script '
                      + 'and the company stay.',
  'r.plan_reset':       'Plan reset: {p1} rehearsals and {p2} fixed dates deleted.',
  'r.no_acts':          'Choose at least one act.',
  'r.derived_added':    '{p1} rehearsals added for {acts}; the plan now has {total}, coverage {p2}.',
  'r.derived_replaced': 'Rehearsals for {acts} derived afresh: {p1} new, {p3} kept because of a '
                      + 'fixed date; the plan now has {total}, coverage {p2}.',
  'plan.rederive_confirm':   'Deriving again throws away every change made by hand. Go on?',
  'plan.substitution':      'Substitution share at most',
  'plan.sub_0':    '0% \u2013 no foreign text',
  'plan.sub_10':   '10% \u2013 strict',
  'plan.sub_20':   '20% \u2013 recommended',
  'plan.until':         'Rehearsing until',
  'plan.max_group':   'Largest group',
  'plan.people_n':  '{n} people',
  'plan.period_what':'The <b>rehearsal period</b> runs up to the dress rehearsal. It '
                    + 'governs which days the company is offered and in which window '
                    + 'dates are looked for.',
  'plan.sub_what':  'The <b>substitution share</b> is the portion of absent people\u2019s '
                    + 'text that the director reads out during the rehearsal. 0% admits '
                    + 'only entirely clean passages and finds little; 20% is the sweet '
                    + 'spot \u2013 below it you hardly find more, above it the director '
                    + 'reads out a growing part of the rehearsal.',
  'plan.derive':    'Derive',
  'plan.rederive':'Derive again',
  'plan.n_rehearsals':    '{n} rehearsals',
  'plan.figures':  'At no more than {substitution} substitution, groups of up to {max} people. '
                    + 'Coverage <b>{coverage}</b> of the spoken text.',
  'plan.revised':  '<br><b>Revised by hand</b> on {when} \u2013 deriving again throws '
                    + 'that away.',
  'plan.col_rehearsal':    'Rehearsal',
  'plan.col_cast':'Cast',
  'plan.col_revise':      'Revise',
  'plan.edit':       'edit rehearsal {id}',
  'plan.edit_title': 'Rehearsal {id}',
  'plan.the_rest':     'all the rest',
  'plan.scenes_min':  '{scenes} scenes \u00b7 {min} min \u00b7 director reads {substitution}',
  'plan.add':        'add someone \u2026',
  'plan.remove':         'remove someone \u2026',
  'plan.merge':    'merge with \u2026',
  'plan.note':       'Note',
  'plan.drop':   'drop',
  'plan.drop_confirm': 'Drop {id}? Its text will then appear nowhere at all.',
  'plan.gleaning_what':'The highlighted rehearsal gathers up what cannot be rehearsed in '
                    + 'small groups \u2013 so that <b>every line</b> of the play comes up '
                    + 'once.',
  'plan.help_title': 'What the changes do',
  'plan.help_add':  '<b>Add someone</b> \u2013 they come to the rehearsal; their text no '
                    + 'longer counts as substitution. The share falls, the date gets '
                    + 'harder to find.',
  'plan.help_remove':   '<b>Remove someone</b> \u2013 the director reads their text along. '
                    + 'The share rises.',
  'plan.help_merge':   '<b>Merge</b> \u2013 two rehearsals become one with both casts. '
                    + 'Sensible when those people can make it together anyway.',
  'plan.help_drop':   '<b>Drop</b> \u2013 the rehearsal goes. Its text then appears nowhere; '
                    + 'coverage falls accordingly.',
  'plan.help_rest':  'After every change, playing time, substitution share and coverage '
                    + 'are recomputed. The identifiers stay, fixed dates travel with them.',
  'plan.help_click': 'A click on the <b>rehearsal identifier</b> shows which passages come '
                    + 'up in it.',

  /* ---------- the passages of one rehearsal ---------- */
  'text.back':     '\u2190 Rehearsal plan',
  'text.title':       'Rehearsal {id}',
  'text.figures':  '{scenes} scenes \u00b7 {min} min of playing time \u00b7 substitution '
                    + 'share {substitution}.',
  'text.counted':    '{own} speeches are spoken by those present',
  'text.counted_read': ', {n} are read out by the director',
  'text.counted_chorus':  ', {n} are spoken together',
  'text.silent':       '<br>Without text, but on stage according to the directions and not '
                    + 'present: {folks} \u2013 that counts towards the substitution share '
                    + 'as well.',
  'text.gleaning':    '<br>This rehearsal gathers up what cannot be rehearsed in small '
                    + 'groups.',
  'text.note':       'Note',
  'text.legend':     'In colour, what those <b>present</b> speak. Pale, with the remark '
                    + '\u201cdirector reads\u201d, what is read out instead. Stage '
                    + 'directions in italics.',
  'text.scene':       'Scene {n}',
  'text.scene_head':  '{act} \u00b7 cue {from}\u2013{to} \u00b7 {min} min \u00b7 director '
                    + 'reads {substitution}',
  'text.reads_for':    'The director reads along here for: {folks}',
  'text.silent_scene': 'On stage without text according to the directions, but not present: '
                    + '{folks}',
  'text.no_text':   'No text can be found for this scene.',
  'text.backstage':      'backstage',
  'text.onstage':       'on stage',
  'text.director_reads': '\u2013 director reads',
  'text.carries_on':      '\u2013 speech already running',
  'text.back_long':'\u2190 back to the rehearsal plan',
  'text.back_member': '\u2190 Rehearsals',

  /* ---------- printing ---------- */
  'print.output':      'Output',
  'print.title':        'Scripts',
  'print.print':      'Print',
  'print.no_script':    'The <a href="/theater/skript">script has to be uploaded</a> first.',
  'print.what':          'The scripts open in the browser \u2013 choose <i>Print</i> there and '
                    + 'save as PDF if you like. A4 portrait, in the font of your template, '
                    + 'so the lines break exactly as they do in the original.',
  'print.addresses':     '<b>These addresses stay valid.</b> They always deliver the current '
                    + 'state \u2013 if the rehearsal plan changes, a reload is enough. '
                    + 'Suitable for passing on to the company; whoever has the link may '
                    + 'read the play.',
  'print.full':       'Full script',
  'print.full_what':   'The whole play with speaker names resolved.',
  'print.open':      'Open',
  'print.plan':         'Rehearsal plan in the script',
  'print.plan_what':     'The whole play with the rehearsals drawn in: a vertical bar beside '
                    + 'the text, and at every change a header block with the cast and a '
                    + 'line for the date.',
  'print.plan_missing':   'That needs a <a href="/theater/plan">rehearsal plan</a> first.',
  'print.booklets':        'Part books',
  'print.booklets_what':    'Only one person\u2019s passages. The stretches left out are listed '
                    + 'with their length and playing time \u2013 so while reading you know '
                    + 'how long it is until your next entrance. Everyone finds their book '
                    + 'through the company link as well.',
  'print.col_person':    'Person',
  'print.col_address':   'Address',
  'print.open_small':'open',
  'print.context':      'Less or more cue context: append <code>?kontext=0</code> to '
                    + '<code>?kontext=3</code> to the address.',
  'print.original':     'Original file',
  'print.original_what': 'The file that was uploaded \u2013 unchanged.',
  'print.download':'download',
  'print.download_file': 'save as a file',
  'print.original_none':'None kept yet \u2013 it appears at the next '
                    + '<a href="/theater/skript">upload</a>.',
  'print.takes_time':        'Typesetting takes a few seconds: the files are a few hundred '
                    + 'kilobytes because the font is embedded.',

  /* ---------- the company ---------- */
  'comp.who':          'Who is in it',
  'comp.title':        'Company',
  'comp.link_title':   'Link for the whole troupe',
  'comp.link_what':     'Send it once \u2013 everyone picks their own name on it. After that: '
                    + 'enter times, look at dates and confirm them, fetch their own part '
                    + 'book.',
  'comp.link_new':     'make a new link',
  'comp.link_new_confirm':'The old link will stop working. Go on?',
  'comp.missing':       'The rehearsal plan contains short names nobody is set up for: {folks}',
  'comp.col_short':   'Name in the script',
  'comp.col_name':      'Name',
  'comp.col_role':      'role',
  'comp.show_link':     'show personal link',
  'comp.col_available':      'Availability',
  'comp.name_hint':   'name of the actor',
  'comp.evenings':       '{n} evenings',
  'comp.entered':  'entered',
  'comp.still_missing':   'still missing',
  'comp.remove':    'remove',
  'comp.director':  'director',
  'comp.assistant': 'assistant director',
  'comp.director_what': 'Director and assistant director may do everything on these pages \u2013 '
                    + 'through their <b>personal link</b>, shown below their row, not through the '
                    + 'company link, which lets anyone pick any name. The director is needed at '
                    + 'every rehearsal: a date is only proposed for an evening the director can make.',
  'comp.personal_link': 'Personal link for {who} \u2013 carries the director\u2019s rights, so '
                    + 'keep it to yourself:',
  'comp.remove_confirm':'Really remove {who}? Times entered go with them.',
  'comp.comes_from':     'The company comes into being when the '
                    + '<a href="/theater/besetzung">casting</a> is taken over. It can be '
                    + 'touched up here.',
  'comp.nobody':      'Nobody yet \u2013 the company comes into being when the '
                    + '<a href="/theater/besetzung">casting</a> is taken over.',
  'comp.add':        'Add a person by hand',
  'comp.as_in_script':  'as in the script',
  'comp.full_name':   'First and last name',
  'comp.create':      'Create',

  /* ---------- dates ---------- */
  'date.title':        'Dates',
  'date.step':      'Step 4',
  'date.title_long':   'Proposed dates',
  'date.until':          'Up to {date}. The scarcest rehearsal is placed first \u2013 '
                    + 'otherwise the small groups, which are easy to schedule, take '
                    + 'exactly the evenings that were the only ones on which the big '
                    + 'scene would have been possible.',
  'date.what':          'Proposals are recomputed on every visit. <b>Fixed</b> dates stay '
                    + 'put and the rest give way to them. The <b>place</b> is not sent to '
                    + 'anyone \u2013 please tell people yourself',
  'date.fixed_n':       ' \u2013 currently {n} of {m}',
  'date.no_plan':    'No rehearsal plan stored yet.',
  'date.col_rehearsal':     'Rehearsal',
  'date.col_cast': 'Cast',
  'date.col_date':    'Date',
  'date.clock':          '{from}\u2013{to}',
  'date.fixed': 'fixed',
  'date.proposal':    'proposal',
  'date.release':       'release',
  'date.fix':   'fix',
  'date.confirm':  'confirm',
  'date.none_possible':       'no date possible',
  'date.none_yet':  'no date yet',
  'date.also':         'also possible: {days}',
  'date.also_short':   'also:',
  'date.director':     'director',
  'date.scenes_min':   '{scenes} scenes, {min} min of playing time',
  'date.possible_n':   '{n} possible evenings',

  /* ---------- dates, the company\u2019s view ---------- */
  'mdate.title':       'My rehearsals',
  'mdate.mine':        'My rehearsals',
  'mdate.all':         'All rehearsals',
  'mdate.all_what':    'The whole plan, as the director sees it. A click on the identifier shows '
                    + 'what is spoken in that rehearsal.',
  'mdate.none':       'No rehearsal is planned for you yet.',
  'mdate.alone':      'alone',
  'mdate.with':         'with {who}',
  'mdate.col_with':     'with',
  'mdate.fixed':        'Firmly arranged',
  'mdate.fixed_place':    'Anyone can enter the <b>place</b>. The program sends nothing '
                    + '\u2013 please tell the others as well.',
  'mdate.nothing_fixed': 'Nothing confirmed yet.',
  'mdate.proposals': 'Proposals',
  'mdate.proposal_what':'These are recomputed on every visit and can change as long as '
                    + 'they are not confirmed.',
  'mdate.all_arranged':  'Everything arranged.',

  /* ---------- my times: the calendar ---------- */
  'my.title':        'My availability',
  'my.holds':         'This is what currently holds for you: {n} evenings',
  'my.holds_1':       'This is what currently holds for you: one evening',
  'my.last_saved':      'Last saved: {when}',
  'my.nothing':       'You have not entered any evenings yet. Tap a day in the calendar.',
  'my.needed_for':    'You are needed for {n} rehearsals: ',
  'my.with':          'with {who}',
  'my.evenings_n':     '{n} evening(s)',
  'my.fixed_with_me': 'fixed date of one of my rehearsals',
  'my.all_with_me': 'everyone needed can, me included',
  'my.all_others':  'everyone else can \u2013 only my yes is missing',
  'my.half':      'at least half',
  'my.one':        'one person',
  'my.me':          'I have said yes',
  'my.save':    'Save',
  'my.only_after':    ' \u2014 entries only count once saved.',
  'my.nobody':      'nobody',
  'my.can_n':    '{n} can',
  'my.best':        '{rehearsal}: {here} of {total} can',
  'my.fixed_on':      'Firmly arranged: ',
  'my.still_missing':   ' \u2013 still missing: ',
  'my.only_you':      ' \u2013 only you are missing',
  'my.no_rehearsal':  'None of your rehearsals gets any further on this day.',
  'my.free_then':   'Free that evening: ',
  'my.from':           'from',
  'my.to':          'until',
  'my.can':         'I can make it',
  'my.cannot':   'I cannot',
  'my.time_wrong':  'The \u201cuntil\u201d time has to be later than \u201cfrom\u201d.',
  'my.legend_blocked': 'struck by the director',
  'my.blocked':     'The director has struck this day \u2013 no rehearsal, whoever could.',
  'my.block':       'strike this day for everyone',
  'my.unblock':     'release this day again',

  /* ---------- audiobook ---------- */
  'ab.title':         'Audiobook',
  'ab.what':           'The play is spoken by <b>ElevenLabs</b> \u2013 one voice per person, '
                    + 'and playing directions such as \u201c(shouts)\u201d carry over into '
                    + 'the sound. Anyone learning their text would rather hear it than read '
                    + 'it, and hears the others\u2019 cues along the way.',
  'ab.step_key':  '1. Key',
  'ab.key_what':'You need an ElevenLabs key of your own; generating goes on your '
                    + 'credit. The key is <b>stored with the project</b> \u2013 there is no '
                    + 'other way, because generating takes a long time. If you would rather '
                    + 'not, remove it once the work is done.',
  'ab.key':    'Key',
  'ab.key_stored':    'stored \u2013 enter a new one to change it',
  'ab.change':       'Change',
  'ab.remove_key':     'Remove the key',
  'ab.remove_key_confirm':'Remove the key?',
  'ab.step_voices':     '2. Voices',
  'ab.no_voices': 'No voices could be fetched from the account. Is the key right?',
  'ab.voices_what':   'One voice per <b>person</b>, not per role \u2013 in the play it is '
                    + 'the same person who takes a stage role. Only the manner differs: as '
                    + 'a role the delivery is more theatrical, backstage it is plainer. The '
                    + '<b>narrator</b> reads the stage directions.',
  'ab.no_voice':  '\u2014 no voice \u2014',
  'ab.plays':        'plays {roles}',
  'ab.model':        'Model',
  'ab.save_voices':'Save the voices',
  'ab.step_generate':    '3. Generate',
  'ab.generate_what':  'A whole play is over a thousand sections and takes hours. To try it '
                    + 'out, start with one rehearsal \u2013 that is a few dozen.',
  'ab.pick_rehearsal':    'Rehearsal {id} \u2013 {group}, {min} min',
  'ab.act_n':         'Act {n}',
  'ab.narrator':      'Narrator',
  'ab.narrator_what': 'reads the stage directions',
  'ab.everything':         'The whole play',
  'ab.speak_it':      'Have it spoken',
  'ab.progress':   '{done} of {total} sections',
  'ab.skipped': '({n} skipped for want of a voice)',
  'ab.generated':       '{mb} MB generated.',
  'ab.running':        'Running \u2013 the page refreshes itself.',
  'ab.cancelled':   'Cancelled.',
  'ab.done':        'Finished.',
  'ab.cancel':     'cancel',
  'ab.listen':      'listen to {file} or save it',

  /* ---------- messages from the application ---------- */
  'msg.rehearsal_gone':    'There is no such rehearsal.',
  'msg.one_gone':   'One of the two rehearsals does not exist.',
  'msg.same_one':        'That is the same rehearsal.',
  'msg.dropped':   '{id} dropped. Coverage is now {coverage} \u2013 the text of this '
                    + 'rehearsal appears nowhere any more.',
  'msg.merged':     '{a} and {b} merged: {group}, {min} min.',
  'msg.not_in_company':'{who} is not in the company.',
  'msg.already_there':  '{who} is already there.',
  'msg.not_there':    '{who} is not there at all.',
  'msg.needs_one':  'A rehearsal needs at least one person.',
  'msg.joined':         '{who} joins {id} \u2013 substitution share now {share}.',
  'msg.left':          '{who} is no longer at {id} \u2013 the director reads their text '
                    + 'along, substitution share now {share}.',
  'msg.note_saved':     'Note on {id} saved.',
  'msg.note_gone':    'Note on {id} deleted.',

  'msg.hb_busy':    'A job is already running for this project.',
  'msg.hb_no_key':  'The ElevenLabs key is missing.',
  'msg.hb_no_narrator':  'No voice has been chosen for the narrator yet.',
  'msg.hb_no_text': 'No text can be found for that scope.',
  'msg.hb_started':       '{what}: {n} sections will be spoken. That takes a while; the page '
                    + 'shows the progress.',
  'msg.hb_idle': 'No job is running.',
  'msg.hb_cancelling':   'Cancelling; the part done so far is kept.',
  'msg.hb_key_refused':'The key is not accepted.',
  'msg.hb_answered':   'ElevenLabs answers with {status}.',
  'msg.hb_rehearsal':     'Rehearsal {id}',
  'msg.hb_act':       'Act {n}',
  'msg.hb_all':     'The whole play',

  'msg.no_plan':    'No rehearsal plan stored.',
  'msg.without_date':  '{open} of {total} rehearsals have no date yet.',

  /* ---------- messages from the router ---------- */
  'r.name_gone': 'There is no such name (any more).',
  'r.unknown_action': 'Unknown action.',
  'r.person_gone': 'There is no such person.',
  'r.thats_you': 'That is you already.',
  'r.not_yours': 'That is not one of your rehearsals.',
  'r.no_date': 'There is no date for this rehearsal yet.',
  'r.now_fixed': '{p1} is now firmly arranged. Enter the place as well and tell the others.',
  'r.released': '{p1} released again.',
  /* ---------- settings for this device ---------- */
  'set.eyebrow':       'This device',
  'set.title':         'Settings',
  'set.person':        'Whose pages',
  'set.person_what':   'You are working as {name}. Switching is remembered on this device until you switch back.',
  'set.switch':        'switch',
  'set.device':        'This device',
  'set.what':          'Kept in this browser only \u2013 every phone and computer has its own.',
  'set.language':      'Language',
  'set.language_auto': 'as the project or the browser says',
  'set.theme':         'Look',
  'set.theme_light':   'light',
  'set.theme_dark':    'dark',
  'set.font':          'Type size',
  'set.font_small':    'small',
  'set.font_normal':   'normal',
  'set.font_large':    'large',
  'set.font_xlarge':   'very large',

  'r.throttled': 'Too many failed attempts. Please try again in {p1} minute(s).',
  'r.code_unknown': 'We do not know this access code.',
  'r.expired': 'The session has expired. Please enter the access code again – then upload the file once more.',
  'r.no_file': 'No file arrived.',
  'r.bad_extension': 'Only .docx, .md or .txt – this file ends differently.',
  'r.read_failed': 'The file could not be read: {reason}',
  'r.no_speaker': 'Not a single speaker was found in it. Is there a name followed by a colon in front of each speech?',
  'r.no_person': 'Not a single person – at least one row has to be “a person of their own”.',
  'r.structure_failed': 'The structure could not be built: {reason}',
  'r.taken_over': '{p1} speeches, {p2} people. On to the rehearsal plan.',
  'r.no_key_entered': 'No key entered.',
  'r.key_stored': 'Key checked and stored.',
  'r.key_removed': 'The key has been removed.',
  'r.voices_saved': '{p1} voices saved.',
  'r.unknown_action2': 'Unknown action.',
  'r.without_cast': 'Nothing can be derived without a casting.',
  'r.no_plan_to_revise': 'There is no plan to revise yet.',
  'r.merge_with_what': 'Merge with what?',
  'r.add_whom': 'Add whom?',
  'r.remove_whom': 'Remove whom?',
  'r.unknown_action3': 'Unknown action.',
  'r.derive_failed': 'Deriving failed: {reason}',
  'r.no_rehearsal_found': 'Not a single rehearsal came out of it. A higher substitution share or a larger group helps.',
  'r.derived': '{p1} rehearsals derived, coverage {p2} of the spoken text.',
  'r.person_gone2': 'This person no longer exists.',
  'r.removed': '{p1} removed.',
  'r.person_gone3': 'This person no longer exists.',
  'r.name_saved': '{p1}: name saved.',
  'r.link_new': 'New company link created. The old one no longer works.',
  'r.director_link_new': 'New director link created. The old one no longer works.',
  'r.without_short': 'It does not work without a short name.',
  'r.already_exists': '{p1} already exists.',
  'r.created': '{p1} created.',
  'r.no_script_stored': 'No script stored.',
  'r.typeset_failed': 'The document could not be typeset: {reason}',
  'r.no_date2': 'There is no date for this rehearsal yet.',
  'r.fixed': '{p1} fixed. The remaining rehearsals give way.',
  'r.released2': '{p1} released again.',
  'f.link_gone_t': 'Link unknown',
  'f.link_gone': 'This link does not belong to anyone. Perhaps it was cut short while copying.',
  'f.link_gone2_t': 'Link unknown',
  'f.link_gone2': 'This link does not belong to any project. Perhaps it was cut short while copying, or there is a new one by now.',
  'f.person_gone_t': 'Unknown person',
  'f.person_gone': 'There is no company member of that name in the project.',
  'f.no_original_t': 'No original',
  'f.no_original': 'No original file is stored for this project. It appears at the next upload of the script.',
  'f.no_script_t': 'No script',
  'f.no_script': 'The director has not brought in a script yet.',
  'f.not_found_t': 'Not found',
  'f.not_found': 'There is no such page.',
  'f.failed_t': 'That did not work',
  'f.failed': 'The document could not be typeset: {reason}',
  'f.link_gone3_t': 'Link unknown',
  'f.link_gone3': 'This link does not belong to any project. Perhaps it was cut short while copying, or there is a new one by now.',
  'f.not_signed_in_t': 'Not signed in',
  'f.not_signed_in': 'Please open the link from the company once more and pick your own name.',
  'f.no_script2_t': 'No script',
  'f.no_script2': 'The director has not brought in a script yet.',
  'f.failed2_t': 'That did not work',
  'f.failed2': 'The document could not be typeset: {reason}',
  'f.not_found2_t': 'Not found',
  'f.not_found2': 'There is no such page.',
  'f.demo_gone_t':    'No such demo',
  'f.demo_gone':      'There is no demo project of that name.',
  'f.demo_locked_t':  'Not in the demo',
  'f.demo_locked':    'Uploading a script and generating an audiobook are switched off in the '
                    + 'demo projects. Everything else is open \u2013 <a href="/theater/projekt">back</a>.',
  'f.no_structure_t': 'No script',
  'f.no_structure': 'A script has to be brought in and the casting taken over first.',
  'f.no_plan_t': 'No plan yet',
  'f.no_plan': 'There is no rehearsal plan yet.',
  'f.failed3_t': 'That did not work',
  'f.failed3': 'The passages could not be put together: {reason}',
  'f.rehearsal_gone_t': 'Unknown rehearsal',
  'f.rehearsal_gone': 'There is no rehearsal with that identifier in the current plan. Perhaps it was dropped or merged.',
  'f.not_found3_t': 'Not found',
  'f.not_found3': 'There is no such page.',
  'r.taken_over_new': '{p1} speeches, {p2} people. {p3} newly created. On to the rehearsal plan.',
  'r.derived_released': '{p1} rehearsals derived, coverage {p2} of the spoken text. {p3} fixed dates were released in the process – the rehearsal identifiers have been assigned anew.',

  /* ---------- added with the translated modules ---------- */
  'r.times_saved':      'Saved \u2013 {n} evenings. Thank you!',
  'r.times_saved_1':    'Saved \u2013 one evening. Thank you!',
  'r.times_saved_none': 'Saved, but not a single evening is ticked \u2013 '
                      + 'no rehearsal can be set that way.',
  'r.place_set':        'Place for {id}: {place}. Please tell the others \u2013 '
                      + 'the program sends nothing.',
  'r.place_cleared':    'Place for {id} removed.',
  'r.too_large': 'The file is too large (over {mb} MB).',
  'r.no_boundary': 'The form is missing its boundary mark.',
  'r.no_readable_text': 'No readable text came out of the file.',
  'r.person_not_in_cast': 'This person is not in the cast.',
  'r.no_plan_yet': 'There is no rehearsal plan yet.',

  /* ---------- about ---------- */
  'about.title':        'About',
  'about.source':       'source code',
  'about.what':         'Rehearsal planning for theatre groups: from the script to the '
                      + 'cast, to a plan of small-group rehearsals, to dates that fit '
                      + 'everyone. Free software; every company runs it on its own.',
  'about.version':      'Version',
  'about.source_code':  'Source code',
  'about.author':       'Author',
  'about.licence':      'Licence',
  'about.licence_text': '{licence} – see <a href="{url}" rel="noopener">LICENSE</a>. '
                      + 'The text of a play is not part of the software; every company '
                      + 'brings its own.',
  'about.contact':      'Contact',
  'about.format':       'How a script has to be formatted is described in '
                      + '<a href="https://github.com/toprach/rehearsalcall/blob/main/'
                      + 'DREHBUCH-FORMAT.md">DREHBUCH-FORMAT.md</a>; two public-domain '
                      + 'plays by Shakespeare come with the source as examples.',

  /* ---------- administration ---------- */
  'admin.title':        'Administration',
  'admin.login_what':   'For whoever runs this installation: create projects, hand out '
                      + 'access codes, delete what is finished. The key was set when the '
                      + 'server was installed.',
  'admin.key':          'Administrator key',
  'admin.projects':     'Projects',
  'admin.none':         'No projects yet.',
  'admin.col_title':    'Project',
  'admin.col_created':  'Created',
  'admin.col_email':    'Director',
  'admin.col_state':    'State',
  'admin.figures':      '{people} people, {rehearsals} rehearsals, {entered} with availability',
  'admin.new':          'Create a project',
  'admin.field_title':  'Title',
  'admin.field_email':  'Email address of the director',
  'admin.email_what':   'The program sends nothing itself: the code is shown once and you '
                      + 'send it. The address is kept with the project, so a new code can '
                      + 'be sent to the same person later.',
  'admin.create':       'Create',
  'admin.new_code':     'new access code',
  'admin.new_code_confirm': 'The old access code stops working. Go on?',
  'admin.delete':       'delete',
  'admin.delete_what':  'type the title to delete',
  'admin.delete_confirm': 'Delete \u201c{title}\u201d with its script, company, plan and '
                      + 'audio? This cannot be undone.',
  'admin.delete_note':  'Deleting removes the record and every attachment. Type the '
                      + 'project\u2019s title into the field first \u2013 a click alone is '
                      + 'too little for that.',
  'admin.fresh_title':  'Access code for {title}',
  'admin.fresh_code':   'Access code:',
  'admin.fresh_what':   'Shown once. It is kept only as a hash; if it is lost, make a new one.',
  'admin.fresh_email':  'Director:',
  'admin.send_mail':    'write the email',
  'admin.mail_subject': 'Access to the rehearsal planner: {title}',
  'admin.mail_body':    'Hello,\n\nhere is your access to the rehearsal planner.\n\n'
                      + 'Project: {title}\nEntry: {url}\nAccess code: {code}\n\n'
                      + 'Enter the code on the entry page; everything else follows from '
                      + 'there. The code is personal \u2013 the company gets a link of its '
                      + 'own from you later.\n',
  'f.no_admin_t':       'No administration',
  'f.no_admin':         'This installation has no administrator key (THEATER_ADMIN). '
                      + 'Projects are created on the command line instead.',
  'r.admin_wrong':      'That is not the administrator key.',
  'r.admin_no_title':   'A title is needed.',
  'r.admin_no_email':   'The director\u2019s email address is needed, and it has to look '
                      + 'like one.',
  'r.admin_created':    '{p1} created. The access code is shown below \u2013 once.',
  'r.admin_gone':       'There is no such project.',
  'r.admin_code_new':   'New access code for {p1}. The old one no longer works.',
  'r.admin_confirm':    'To delete, type the title exactly as it stands: {p1}',
  'r.admin_deleted':    '{p1} deleted, with everything in it.',

  /* ---------- versions of the script ---------- */
  'upl.versions':       'Versions',
  'upl.versions_what':  'Every uploaded script is kept. The comparison shows the speeches '
                      + 'that changed, came in or were cut \u2013 formatting does not count. '
                      + 'The rehearsal plan is carried along by content: every passage is '
                      + 'found again by its first and its last speech.',
  'upl.col_version':    'Version',
  'upl.col_uploaded':   'Uploaded',
  'upl.col_file':       'File',
  'upl.col_speeches':   'Speeches',
  'upl.col_changes':    'Changes since the one before',
  'upl.changes':        '{changed} changed, {added} new, {removed} cut',
  'upl.first':          'first version',
  'upl.current':        'current',
  'upl.restored_from':  'restored from version {nr}',
  'upl.restore':        'make current again',
  'upl.restore_confirm': 'Make version {nr} the current script? The plan is carried along, '
                      + 'and the version that is current now is kept as well.',
  'upl.new_names':      'New speaker names, not assigned yet: {names} \u2013 '
                      + '<a href="/theater/besetzung">assign them</a>.',
  'upl.plan_unsure':    'The rehearsal plan may no longer fit: for {ids} the beginning or the '
                      + 'end of a passage was not found in the new script. Look at those '
                      + 'rehearsals, or <a href="/theater/plan">derive the plan again</a>. '
                      + 'Nothing else was changed.',
  'upl.plan_rebuilt':   'Much changed inside {ids}. The passages still hold; have a look at them.',
  'ver.title':          'Version {nr} compared with version {before}',
  'ver.files':          '{before} \u2192 {now}',
  'ver.summary':        '{changed} changed, {added} new, {removed} cut, {equal} unchanged speeches.',
  'ver.none':           'No difference in the speeches.',
  'ver.col_cue':        'Cue',
  'ver.col_who':        'Speaker',
  'ver.col_old':        'Before',
  'ver.col_new':        'Now',
  'ver.col_rehearsal':  'Rehearsal',
  'ver.changed':        'changed',
  'ver.added':          'new',
  'ver.removed':        'cut',
  'ver.back':           '\u2190 Script',
  'ver.print':          'For the company: print this page as the change sheet. Cue numbers '
                      + 'are given before and after \u2013 printed part books carry the old ones.',
  'plan.unsure_notice': 'After the last upload of the script, the beginning or the end of a '
                      + 'passage was not found for {ids}. The plan may no longer fit there. '
                      + 'Look at those rehearsals, or derive the plan again \u2013 that throws '
                      + 'away every change made by hand and every fixed date.',
  'plan.unsure_row':    'beginning or end not found in the new script',
  'plan.rebuilt_row':   'much changed inside \u2013 look at the passages',
  'r.no_version':       'There is no such version.',
  'f.no_version_t':     'No such version',
  'f.no_version':       'There is no version with that number, or nothing to compare it with.',
  'r.version_taken':    'Version {nr} taken in: {changed} changed, {added} new, {removed} cut.',
  'r.version_kept':     'Version {nr} taken in: {changed} changed, {added} new, {removed} cut. '
                      + 'The rehearsal plan is carried along; every passage was found again.',
  'r.version_rebuilt':  'Version {nr} taken in: {changed} changed, {added} new, {removed} cut. '
                      + 'Much changed inside {rebuilt} \u2013 the passages still hold, but '
                      + 'look at them.',
  'r.version_unsure':   'Version {nr} taken in: {changed} changed, {added} new, {removed} cut. '
                      + '<b>The rehearsal plan may no longer fit:</b> for {unsure} the beginning '
                      + 'or the end of a passage was not found. Look at those rehearsals or '
                      + 'derive the plan again; nothing else was changed.',
  'r.version_new_names': 'Version {nr} taken in: {changed} changed, {added} new, {removed} cut. '
                      + '{fresh} new speaker name(s) \u2013 assign them on the '
                      + '<a href="/theater/besetzung">casting page</a>; until then they are '
                      + 'read as persons of their own.',

  /* ---------- the part book on the screen ---------- */
  'book.title':      'Part book',
  'book.title_for':  'Part book \u2013 {name}',
  'book.figures':    '{passages} passages, about {words} words',
  'book.print':      'A4 for printing',
  'book.what':       'Every passage with its cue. Tick \u201clearning\u201d and the own lines are '
                   + 'hidden until you reveal them; \u201csits\u201d marks what you know, and that '
                   + 'is remembered on this device.',
  'book.plan_doc':   'rehearsal plan',
  'book.play_link':  'read the whole play',
  'play.title':      'The play',
  'play.what':       'Every line, yours marked ({n}). The bar below hops to your previous and next line; a double tap opens the comments.',
  'play.to_book':    'To my part book.',
  'play.rehearsal_from': 'rehearsal {id} from here',
  'mem.play':        'The play',
  'mem.play_open':   '<a href="/theater/mit/stueck">read</a> \u2013 every line on the screen, mine marked',
  'book.mode_read':  'Read',
  'book.mode_learn': 'Learn',
  'book.mode_hard':  'The hard ones',
  'book.read_what':  'Every passage with its cue. The arrows show more of what comes before and after.',
  'book.learn_what': 'The cue is shown, your lines are hidden. Say them out loud, reveal, judge yourself. '
                   + 'Passages due from earlier days come first, then new ones in the order of the play, '
                   + 'in batches of six that repeat in random order until each has sat twice. '
                   + 'What you know comes back after one day, then three, seven, fourteen, thirty.',
  'book.hard_what':  'The passages that went wrong at least twice in the last ten tries, worst first.',
  'book.due':        'due today: {n}',
  'book.fresh':      'new: {n}',
  'book.sitting':    'sitting: {p} %',
  'book.steps':      'passages per step, 0 to 5',
  'book.step':       'step {i}: {n}',
  'book.step_short': 'step {i}',
  'book.new':        'new',
  'book.part':       'part {k} of {n}',
  'book.progress':   '{done} of {total} done',
  'book.cue_nr':     'cue {nr}',
  'book.no_cue':     '(no cue \u2013 the passage opens)',
  'book.own_before': '(you, just before)',
  'book.first_time': 'First time: read it once, then it comes back hidden.',
  'book.next':       'Next',
  'book.say_aloud':  'Say your lines out loud \u2013 then reveal.',
  'book.hint':       'Hint',
  'book.reveal':     'Reveal',
  'book.intent':     'What do I want here?',
  'book.intent_private': 'private note \u2013 nobody else sees it',
  'book.intent_hint': '(a few words \u2013 the intention carries the text)',
  'book.again':      'again',
  'book.with_help':  'with help',
  'book.knew':       'knew it',
  'book.done_title': 'Done for today',
  'book.done_text':  '{n} passages done. Due tomorrow: {tomorrow}. Better a short round every day than a long one once.',
  'book.once_more':  'once more',
  'book.nothing_hard': 'Nothing hard yet',
  'book.nothing_hard_what': 'A passage lands here after it went wrong twice in its last ten tries.',
  'book.dbl_hint':   'A double tap on a passage opens its comments.',
  'book.more_before': '\u25b2 more before',
  'book.more_after': '\u25bc more after',
  'book.none':       'No passages of yours in the script.',
  'book.link_title': 'Link to my part book',
  'book.link_what':  'Opens this book on any device without signing in \u2013 to save on the phone or '
                   + 'to send on. It stands for the person whose book this is, so it goes to them alone.',
  'book.share':      'share \u2026',

  /* ---------- the app on the phone ---------- */
  'pwa.short':         'Rehearsals',
  'pwa.install_title': 'Put it on the phone as an app',
  'pwa.install_title_play': '\u201c{title}\u201d as an app on the phone',
  'pwa.install_what':  'Then the part book and the calendar sit on the home screen like an app, without the browser bar.',
  'pwa.install':       'Install',
  'pwa.later':         'later',
  'pwa.ios':           'On the iPhone: the share symbol in Safari, then \u201cAdd to Home Screen\u201d.',
  'pwa.android':       'In the browser menu (\u22ee) choose \u201cInstall app\u201d or \u201cAdd to Home screen\u201d.',
  'pwa.offline_t':     'Offline',
  'pwa.offline':       'No connection. As soon as the network is back, it goes on.',
  'pwa.retry':         'Try again',

  /* ---------- comments ---------- */
  'kd.new':          'New comment at cue {nr}',
  'kd.text':         'Comment',
  'kd.question':     'Question to the director',
  'kd.question_mark': 'question to the director',
  'kd.done':         'answered',
  'kd.save':         'Save',
  'kd.cancel':       'Cancel',
  'kd.close':        'Close',
  'kd.comments':     'Comments',
  'kd.answer':       'Answer',
  'kd.delete':       'delete',
  'kd.signin':       'To comment, open the script through your company link or your part book '
                   + '\u2013 then the comment carries your name.',
  'kd.hint':         'Double-click a line to comment on it.',
  'kd.scenes':       'Scenes of this rehearsal',
  'kd.all_rehearsals': 'All rehearsals',
  'kd.failed':       'That could not be saved.',
  'kd.rehearsal':    'Rehearsal',
  'kd.scene':        'Scene',
  'kd.prev_comment': 'previous comment',
  'kd.next_comment': 'next comment',
  'kd.prev_mine':    'my previous line',
  'kd.next_mine':    'my next line',
  'kd.no_comments':  'no comments',
  'cmt.title':       'Comments',
  'cmt.what':        'What the company wrote into the script, the part books and the rehearsal '
                   + 'plan. Questions to the director come first; an answer goes back to the person '
                   + 'and appears beside the line in their script.',
  'cmt.questions':   'Questions to the director',
  'cmt.no_questions': 'No open questions.',
  'cmt.all':         'All other comments',
  'cmt.none':        'No comments yet.',
  'cmt.question':    'question to the director',
  'cmt.done':        'answered',
  'cmt.done_mark':   'mark as answered',
  'cmt.reopen':      'reopen',
  'cmt.delete':      'delete',
  'cmt.delete_confirm': 'Delete this comment?',
  'cmt.answer':      'Answer',
  'cmt.answer_hint': 'answer \u2026',
  'cmt.answer_save': 'answer',
  'cmt.director':    'Director',
  'cmt.at':          'cue {nr}',
  'cmt.doc_gesamt':  'full script',
  'cmt.doc_rolle':   'part book',
  'cmt.doc_probenplan': 'rehearsal plan',
  'mcmt.title':      'My comments',
  'mcmt.what':       'Double-click a line in the script, your part book or the rehearsal plan to '
                   + 'comment on it. Tick \u201cquestion to the director\u201d and the answer '
                   + 'appears here and beside the line.',
  'mcmt.none':       'No comments yet.',
  'r.comment_gone':  'There is no such comment.',
  'r.answer_saved':  'Answer saved \u2013 the person sees it beside the line.',
  'r.answer_removed': 'Answer removed.',
  'r.comment_done':  'Marked as answered.',
  'r.comment_reopened': 'Reopened.',
  'r.comment_deleted': 'Comment deleted.',

  /* ---------- how the speakers are written ---------- */
  'upl.style':        'Speakers in the text',
  'upl.style_auto':   'detect automatically',
  'upl.style_colon':  'NAME: text – name and colon in front of the speech',
  'upl.style_dot':    'NAME. alone on its line, the speech below it (Gutenberg editions)',
  'upl.style_what':   'Usually the program can tell which of the two it is. When it '
                    + 'cannot, it says so, and you choose here and upload once more.',
  'r.style_unknown':  'It is not clear how the speakers are written: {colon} lines look '
                    + 'like “NAME: text”, {dot} like “NAME.” alone on a '
                    + 'line. Please choose the style below and upload the file again.',
  'r.no_speaker_dot': 'Not a single speaker was found in it. In this style a name stands '
                    + 'alone on its line, in capitals, with a full stop – like '
                    + '“BANQUO.” – and the speech follows on the next line.',
};
