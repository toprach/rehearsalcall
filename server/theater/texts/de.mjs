/* ---------------------------------------------------------------------
   German - the first translation.

   The keys stand in the same order as in en.mjs; whatever is missing
   here is taken from there. So when adding entries, do not re-sort, or
   the gaps become impossible to find.
   --------------------------------------------------------------------- */

export const de = {
  /* ---------- chrome ---------- */
  'app.name':        'Probenplanung',
  'app.for':        'Für Theatergruppen',
  'nav.dark':     'Dunkle Seite',
  'nav.settings': 'Einstellungen',
  'nav.share':    'Link zu meinem Rollenheft teilen',
  'nav.copied':   'Link kopiert',
  'nav.light':    'Helle Seite',
  'nav.language':     'Sprache',
  'nav.overview':  'Übersicht',
  'nav.company':    'Ensemble',
  'nav.script':      'Skript',
  'nav.casting':   'Besetzung',
  'nav.rehearsals':        'Probenplan',
  'nav.dates':     'Termine',
  'nav.print':     'Drucken',
  'nav.audiobook':    'Hörbuch',
  'nav.signout':    'Abmelden',
  'nav.comments':   'Kommentare',
  'nav.project':    'Projekt',
  'nav.calendar_for': 'Kalender f\u00fcr \u2026',

  /* ---------- wording used all over ---------- */
  'common.close':   'schlie\u00dfen',
  'common.save':    'sichern',
  'common.copy':   'kopieren',
  'common.copied':    'kopiert',
  'common.selected':   'markiert – mit Strg+C kopieren',
  'common.back':    'Zurück',
  'common.error':     'Fehler',
  'common.place_hint':  'Ort, z. B. Bühne oder Probenraum',
  'common.hours':    '{h}:{m} h',
  'common.minutes':    '{n} min',

  /* ---------- entry page ---------- */
  'entry.what':         'Proben in kleinen Gruppen ansetzen, ohne Terminketten in der ' +
                     'WhatsApp-Gruppe. Jede und jeder trägt einmal ein, wann Zeit ' +
                     'ist – das Programm rechnet daraus die Termine.',
  'entry.code':        'Zugangscode',
  'entry.code_hint':  'z. B. k7mq2x',
  'entry.continue':      'Weiter',
  'entry.no_access': 'Noch keinen Zugang?',
  'entry.request':   'Schreiben Sie ein Mail an <a href="mailto:{mail}?subject={subject}">{mail}</a> ' +
                     'mit dem Betreff „{subject}“. Sie bekommen einen Code zurück, ' +
                     'den Sie hier eingeben.',
  'entry.request_subject': 'Bitte Zugang zur Probenplanung schicken',
  'entry.request_none': 'Fragen Sie nach einem Zugangscode, wer diese Installation betreibt.',
  'entry.by_hand':  'Kein Formular, keine Anmeldung, keine Datensammlung – bei einer ' +
                     'Handvoll Bühnen ist Handarbeit das kleinere Übel.',
  'entry.more':        'Ausführlich beschrieben: <a href="/software-de.html">was die Software rechnet und warum</a>.',
  'entry.demo_title':    'Ausprobieren',
  'entry.demo_what':     'Zwei gemeinfreie St\u00fccke sind als Demo-Projekte eingerichtet. Dort darf '
                       + 'jeder hineinschauen und \u00e4ndern; alle 24 Stunden werden sie in den '
                       + 'Ausgangszustand zur\u00fcckgesetzt. Drehbuch hochladen und H\u00f6rbuch sind '
                       + 'darin abgeschaltet.',
  'entry.demo_director': 'als Regie',
  'entry.demo_member':   'als Ensemble-Mitglied',
  'demo.banner':         'Demo-Projekt \u2013 hier darf jeder \u00e4ndern; alle 24 Stunden wird es in '
                       + 'den Ausgangszustand zur\u00fcckgesetzt, das n\u00e4chste Mal gegen {when}.',
  'entry.open_source':       'Die Werkzeuge dahinter sind offen einsehbar: ' +
                     '<a href="https://github.com/toprach/rehearsalcall">' +
                     'github.com/toprach/rehearsalcall</a>',

  /* ---------- why no date could be found ---------- */
  'why.waiting':    'wartet auf: {folks}',
  'why.too_long':   'braucht {needs}, aber das längste gemeinsame Fenster ist ' +
                     '{window} – aufteilen oder länger Zeit nehmen',
  'why.no_evening':'kein gemeinsamer Abend; meist verhindert: {folks}',
  'why.taken':    '{n} Abende wären möglich, aber dort proben diese Leute schon',
  'why.nothing':'kein gemeinsamer Abend',

  /* ---------- member area ---------- */
  'mem.hello':        'Hallo {name}',
  'mem.for_other':  'Sie arbeiten <b>für {name}</b>, nicht für sich selbst.',
  'mem.back_to':   'zurück zu {name}',
  'mem.switch_who': 'arbeiten für \u2026',
  'mem.switch_go': 'umschalten',
  'mem.my_times': 'Meine Verfügbarkeit',
  'mem.my_rehearsals': 'Meine Proben',
  'mem.part_book':   'Rollenheft',
  'mem.full_script': 'Gesamtskript',
  'mem.evenings_yes':    '{n} Abende eingetragen – <a href="/theater/mit/zeiten">ändern</a>',
  'mem.call_title':  'Ihre Verf\u00fcgbarkeit fehlt noch',
  'mem.call_what':   'Termine f\u00fcr Ihre Proben lassen sich erst finden, wenn Sie gesagt haben, '
                   + 'an welchen Abenden Sie k\u00f6nnen. Das dauert f\u00fcnf Minuten.',
  'mem.call_go':     'Jetzt Verf\u00fcgbarkeit eintragen',
  'mem.director_note': 'Als Regie tragen Sie keine Abende ein: Sie gelten an jedem Abend als verf\u00fcgbar. '
                   + 'Streichen Sie im Kalender die Tage, an denen keine Probe stattfinden kann \u2013 das gilt f\u00fcr alle.',
  'mem.director_go': 'Tage streichen',
  'mem.director_always': 'immer, als Regie \u2013 au\u00dfer an gestrichenen Tagen',
  'mem.evenings_no': '<span class="open">noch nichts</span> – '
                    + '<a href="/theater/mit/zeiten">jetzt eintragen</a>',
  'mem.rehearsals_yes':    '{n}, davon {fixed} mit festem Termin – '
                    + '<a href="/theater/mit/termine">ansehen</a>',
  'mem.rehearsals_no': '<span class="muted">noch kein Probenplan</span>',
  'mem.book_open':     '<a href="/theater/mit/heft">öffnen</a> – meine Passagen, mit Lernmodus; '
                    + 'die Druckfassung liegt auf der Skripte-Seite',
  'mem.no_script':    '<span class="muted">noch kein Drehbuch</span>',
  'mem.full_open':   '<a href="/theater/mit/gesamt">öffnen</a>',
  'mem.plan_book':   'Probenplan im Drehbuch',
  'mem.plan_open':   '<a href="{url}">öffnen</a> \u2013 das ganze '
                    + 'St\u00fcck mit eingezeichneten Proben',
  'mem.docs':        'Alle Skripte und Rollenhefte an einer Stelle: <a href="{url}">Skripte</a> \u2013 '
                    + '\u00f6ffnen und im Browser drucken.',

  /* ---------- the bar in a printed document ---------- */
  'bar.times':    'Meine Verfügbarkeit',
  'bar.dates':   'Meine Probentermine',
  'bar.full':    'Gesamtskript, für mich markiert',
  'bar.hint':   'Diese Knöpfe werden nicht mitgedruckt.',

  /* ---------- asking before working as somebody else ---------- */
  'switch.title':   'Für jemand anderen arbeiten',
  'switch.question':   'Sie sind als <b>{current}</b> angemeldet. Weiter als <b>{target}</b>?',
  'switch.what':     'Ab dann tragen Sie Zeiten für {target} ein und sehen deren Termine. '
                   + 'Das kann jeder im Ensemble – es ist für den Abend gedacht, an dem '
                   + 'zwei gemeinsam Termine ausmachen. {current} ist mit einem Klick '
                   + 'wieder erreichbar.',
  'switch.yes':      'Ja, für {target} arbeiten',
  'switch.no':    'Nein, {current} bleiben',

  /* ---------- overview ---------- */
  'proj.project':      'Projekt',
  'proj.company':     'Ensemble',
  'proj.script':     'Drehbuch',
  'proj.casting':    'Besetzung',
  'proj.rehearsals':         'Probenplan',
  'proj.availability': 'Verf\u00fcgbarkeit',
  'proj.avail_n':    '{m} von {n} eingetragen',
  'proj.dates_n':    '{n} von {m} fixiert',
  'proj.steps_what': 'Jede Karte f\u00fchrt auf ihre Seite; die Terminvorschl\u00e4ge werden bei jedem Besuch neu berechnet.',
  'proj.dates':      'Termine',
  'proj.people_yes':     '{n} Personen, davon {m} mit eingetragener Verfügbarkeit – '
                    + '<a href="/theater/leute">ansehen</a>',
  'proj.people_no':  '<span class="muted">kommt mit dem Drehbuch</span>',
  'proj.script_yes':      '{source} – {n} Sprechernamen',
  'proj.script_no':  'noch keines',
  'proj.script_upload':    'jetzt hochladen',
  'proj.cast_yes':       '{speeches} Repliken, {people} Personen, {roles} Bühnenrollen',
  'proj.cast_open':    'noch nicht übernommen',
  'proj.cast_assign': 'jetzt zuordnen',
  'proj.cast_waits':   '<span class="muted">wartet auf das Drehbuch</span>',
  'proj.plan_yes':      '{n} Proben bei höchstens {substitution} Ersatz, Abdeckung {coverage}',
  'proj.plan_no':  'noch keiner',
  'proj.plan_derive':'jetzt ableiten',
  'proj.plan_waits':  '<span class="muted">wartet auf die Besetzung</span>',
  'proj.dates_yes':   '<a href="/theater/termine">Vorschläge ansehen</a>',
  'proj.dates_waits':'<span class="muted">wartet auf den Probenplan</span>',
  'proj.link_company':'Link fürs Ensemble',
  'proj.link_company_what': 'Ein Link für die ganze Truppe – jede und jeder wählt darauf '
                    + 'den eigenen Namen und kann dann Zeiten eintragen, Termine ansehen '
                    + 'und bestätigen sowie das eigene Rollenheft laden.',
  'proj.link_director':   'Link für die Regie',
  'proj.link_director_what': 'Führt ohne Zugangscode hierher – zum Weitergeben an die '
                    + 'Regieassistenz, oder um selbst zwischen mehreren Projekten zu '
                    + 'wechseln. <b>Wer ihn hat, darf alles</b>, was Sie hier dürfen. '
                    + 'Also nicht in die WhatsApp-Gruppe.',
  'proj.link_new':     'neuen erzeugen',
  'proj.link_new_confirm':'Der alte Regie-Link gilt dann nicht mehr. Fortfahren?',
  'proj.language':      'Sprache f\u00fcrs Ensemble',
  'proj.language_what': 'Was das Ensemble auf seinen Seiten sieht, solange niemand in der '
                      + 'Kopfzeile umschaltet. Ohne Wahl entscheidet der Browser.',
  'proj.language_browser': 'wie der Browser',
  'r.language_saved':   'Sprache gespeichert.',
  'proj.period':        'Probenzeitraum',
  'proj.period_what':   'In diesem Zeitraum werden Termine gesucht, und diese Tage bekommt das '
                      + 'Ensemble im Kalender angeboten. Ohne Ende: drei Monate ab heute.',
  'proj.period_from':   'von',
  'proj.period_to':     'bis',
  'r.period_saved':     'Probenzeitraum gespeichert.',
  'proj.place':         'Probenort',
  'proj.place_what':    'Der \u00fcbliche Ort. Er ist beim Fixieren eines Termins vorausgef\u00fcllt und wird dort best\u00e4tigt oder ge\u00e4ndert.',
  'proj.place_label':   'Standard-Probenort',
  'r.place_saved':      'Probenort gespeichert.',
  'proj.road':          'Der Weg',
  'proj.road_1':        '<b>Drehbuch hochladen</b> – Word oder Markdown.',
  'proj.road_2':        '<b>Besetzung zuordnen</b> – wer ist eine Person, was ist eine '
                    + 'Bühnenrolle. Daraus entsteht das Ensemble.',
  'proj.road_3':        '<b>Probenplan ableiten</b> – Ersatzanteil und Gruppengröße '
                    + 'einstellbar.',
  'proj.road_4':        '<b>Ensemble-Link verschicken</b> – jede Person trägt einmal ein, '
                    + 'wann sie kann.',
  'proj.road_5':        '<b>Termine ansehen</b> – sie rechnen sich bei jedem Aufruf neu.',

  /* ---------- uploading the script ---------- */
  'upl.step':      'Schritt 1',
  'upl.title':        'Drehbuch hochladen',
  'upl.what':          'Eine Word-Datei (<code>.docx</code>) oder Markdown '
                    + '(<code>.md</code>). Das Stück wird gelesen, die Sprecher werden '
                    + 'gesucht – zuordnen können Sie sie gleich danach.',
  'upl.doc_title':    'Titel im Dokument',
  'upl.blocks':      'Blöcke',
  'upl.speakers':     'Sprechernamen',
  'upl.speakers_n':   '{n} verschiedene',
  'upl.speeches':     'Repliken',
  'upl.people':     'Personen',
  'upl.to_casting':'Zur Besetzung',
  'upl.read_full':  'Drehbuch lesen',
  'upl.read_plan':  'Probenplan lesen',
  'upl.field':         'Drehbuch',
  'upl.upload':    'Hochladen und lesen',
  'upl.replaces':      ' — ersetzt ein vorhandenes Drehbuch.',
  'upl.format':       'Wie ein Drehbuch formatiert sein muss – Sprecher, '
                    + 'Regieanweisungen, Akte – steht in <a href="https://github.com/'
                    + 'toprach/rehearsalcall/blob/main/DREHBUCH-FORMAT.md">'
                    + 'DREHBUCH-FORMAT.md</a>. Word ist die bessere Vorlage als '
                    + 'Markdown: dort steht ausdrücklich, wo ein Absatz endet.',

  /* ---------- printable documents ---------- */
  'docs.title':    'Drehbücher',
  'docs.what':      'Öffnen, dann im Browser <i>Drucken</i> wählen. Diese Seite zeigt '
                    + 'immer den aktuellen Stand.',
  'docs.full':   'Gesamtskript',
  'docs.plan':     'Probenplan im Drehbuch',
  'docs.original': 'Originaldatei ({name})',
  'docs.booklets':    'Rollenhefte',

  /* ---------- picking a name ---------- */
  'pick.title':       'Wer sind Sie?',
  'pick.what':         'Wählen Sie Ihren Namen. Das Gerät merkt sich die Wahl – beim '
                    + 'nächsten Mal geht es gleich weiter.',
  'pick.nobody':     'In diesem Projekt ist noch niemand angelegt.',

  /* ---------- company navigation ---------- */
  'navm.times':    'Meine Verfügbarkeit',
  'navm.dates':   'Probentermine',
  'navm.scripts': 'Skripte',
  'navm.book':    'Rollenheft',
  'navm.times_short': 'Verf\u00fcgbarkeit',
  'navm.tab_avail': 'Verf\u00fcgbar',
  'navm.tab_dates': 'Termine',
  'navm.tab_book':  'Rolle',
  'navm.tab_notes': 'Notizen',

  /* ---------- casting ---------- */
  'cast.step':      'Schritt 2',
  'cast.title':        'Besetzung',
  'cast.title_long':   'Besetzung zuordnen',
  'cast.no_script':    'Zuerst muss das <a href="/theater/skript">Drehbuch hochgeladen</a> '
                    + 'werden.',
  'cast.kind_person':   'eigene Person',
  'cast.kind_role':    'Rolle von \u2026',
  'cast.kind_alias':    'Schreibweise von \u2026',
  'cast.kind_group':   'Gruppe (alle zugleich)',
  'cast.kind_ignore':'kein Sprecher',
  'cast.kind_auto':     'löst sich von selbst',
  'cast.times':          '{n}\u00d7',
  'cast.stuck':       'nicht aufgelöst',
  'cast.open_title':  'Noch nicht aufgelöst:',
  'cast.open_where':     '– unten hervorgehoben.',
  'cast.open_what':    'Bei Namen mit Schrägstrich wie <code>EINBRECHER/GREGG</code> heißt '
                    + '„löst sich von selbst“: die linke Hälfte muss eine '
                    + '<b>Bühnenrolle</b> sein und die rechte eine <b>eigene Person</b>. '
                    + 'Ist eine davon noch nicht zugeordnet, bleibt der Name hängen. Also '
                    + 'entweder die Hälften richtigstellen – oder diese Zeile auf '
                    + '<i>Schreibweise von …</i> setzen und die linke Hälfte wählen.',
  'cast.what':          'Zu jedem Namen aus dem Drehbuch gehört eine Entscheidung. Das '
                    + 'meiste ist vorgeschlagen – prüfen Sie vor allem, welche Namen '
                    + '<b>Bühnenrollen</b> sind, die jemand anderer spielt. Nur das kann '
                    + 'das Programm nicht wissen.',
  'cast.help_person': '<b>eigene Person</b> – steht selbst auf der Probenliste. Das Kürzel '
                    + 'ist der Name im Drehbuch; der Name der Schauspielerin oder des '
                    + 'Schauspielers wird auf der <a href="/theater/leute">Ensemble-Seite</a> '
                    + 'eingetragen.',
  'cast.names_where': 'Namen der Spielenden, Regie und Assistenz werden auf der '
                    + '<a href="/theater/leute">Ensemble-Seite</a> gepflegt.',
  'cast.help_role':  '<b>Rolle von …</b> – eine Bühnenrolle; zur Probe kommt die Person '
                    + 'dahinter. Im Stück im Stück spielt etwa <i>Anna</i> die '
                    + '<i>Mrs. Clackett</i>.',
  'cast.help_alias':  '<b>Schreibweise von …</b> – derselbe Name, anders geschrieben.',
  'cast.help_group': '<b>Gruppe</b> – „Alle“, „Die anderen“: da spricht die ganze Truppe.',
  'cast.help_none': '<b>kein Sprecher</b> – versehentlich erkannt, gehört nicht dazu.',
  'cast.help_auto':   '<b>löst sich von selbst</b> – Doppelsprecher und Rollentausch; das '
                    + 'erkennt das Werkzeug aus den Teilen.',
  'cast.col_name':      'Name im Drehbuch',
  'cast.col_is':       'ist',
  'cast.col_of':       'von',
  'cast.col_actor':       'Schauspieler',
  'cast.take_over':  'Übernehmen und Struktur bauen',
  'cast.results_in':       'Daraus werden {n} Personen: {folks}',

  /* ---------- rehearsal plan ---------- */
  'plan.step':     'Schritt 3',
  'plan.title':       'Probenplan',
  'plan.no_cast':   'Zuerst muss die <a href="/theater/besetzung">Besetzung '
                    + 'übernommen</a> werden.',
  'plan.what':         'Das Programm sucht die Abschnitte, die sich in kleinen Gruppen '
                    + 'proben lassen, und bündelt sie zu Terminen. Gewählt wird nicht eine '
                    + 'Szene, sondern eine <b>Besetzung</b> – steht der Termin ohnehin an, '
                    + 'kostet jede weitere Stelle für dieselben Leute nichts mehr.',
  'plan.acts':          'Akte',
  'plan.derive_add':    'Neu ableiten (ergänzen)',
  'plan.derive_replace': 'Neu ableiten (ersetzen)',
  'plan.modes_what':    '<b>Ergänzen</b> behält jede Probe und leitet für die gewählten Akte '
                      + 'weitere ab, nur für Text, den noch keine Probe abdeckt. <b>Ersetzen</b> '
                      + 'verwirft die Proben der gewählten Akte und leitet sie neu ab. Eine Probe '
                      + 'mit festem Termin bleibt in beiden Fällen unberührt.',
  'plan.replace_confirm': 'Die Proben der gewählten Akte ersetzen? Handarbeit dort geht verloren; '
                      + 'Proben mit festem Termin bleiben.',
  'plan.reset':         'Plan zurücksetzen',
  'plan.reset_confirm': 'Alle Proben und alle festen Termine dieses Plans löschen? Drehbuch und '
                      + 'Ensemble bleiben.',
  'r.plan_reset':       'Plan zurückgesetzt: {p1} Proben und {p2} feste Termine gelöscht.',
  'r.no_acts':          'Mindestens einen Akt wählen.',
  'r.derived_added':    '{p1} Proben für {acts} ergänzt; der Plan hat jetzt {total}, Abdeckung {p2}.',
  'r.derived_replaced': 'Proben für {acts} neu abgeleitet: {p1} neu, {p3} wegen festem Termin '
                      + 'behalten; der Plan hat jetzt {total}, Abdeckung {p2}.',
  'plan.rederive_confirm':   'Neu ableiten wirft alle Änderungen von Hand weg. Fortfahren?',
  'plan.substitution':      'Ersatzanteil höchstens',
  'plan.sub_0':    '0\u202f% – kein fremder Text',
  'plan.sub_10':   '10\u202f% – streng',
  'plan.sub_20':   '20\u202f% – empfohlen',
  'plan.until':         'Geprobt wird bis',
  'plan.max_group':   'Größte Gruppe',
  'plan.people_n':  '{n} Personen',
  'plan.period_what':'Der <b>Probenzeitraum</b> reicht bis zur Generalprobe. Er steuert, '
                    + 'welche Tage das Ensemble angeboten bekommt und in welchem Fenster '
                    + 'Termine gesucht werden.',
  'plan.sub_what':  'Der <b>Ersatzanteil</b> ist der Anteil Text abwesender Personen, den '
                    + 'die Regie während der Probe vorliest. 0\u202f% lässt nur ganz '
                    + 'saubere Abschnitte zu und findet wenig; 20\u202f% ist der '
                    + 'günstigste Punkt – darunter findet man kaum mehr, darüber liest die '
                    + 'Regie einen wachsenden Teil der Probe selbst vor.',
  'plan.derive':    'Ableiten',
  'plan.rederive':'Neu ableiten',
  'plan.n_rehearsals':    '{n} Proben',
  'plan.figures':  'Bei höchstens {substitution} Ersatz, Gruppen bis {max} Personen. '
                    + 'Abdeckung <b>{coverage}</b> des gesprochenen Textes.',
  'plan.revised':  '<br><b>Von Hand nachgebessert</b> am {when} – neu ableiten wirft '
                    + 'das weg.',
  'plan.col_rehearsal':    'Probe',
  'plan.col_cast':'Besetzung',
  'plan.edit':       'Probe {id} bearbeiten',
  'plan.edit_title': 'Probe {id}',
  'plan.col_revise':      'Nachbessern',
  'plan.the_rest':     'alles Übrige',
  'plan.scenes_min':  '{scenes} Szenen \u00b7 {min} min \u00b7 Regie liest {substitution}',
  'plan.add':        'Person dazu \u2026',
  'plan.remove':         'Person weg \u2026',
  'plan.merge':    'zusammenlegen mit \u2026',
  'plan.note':       'Notiz',
  'plan.drop':   'streichen',
  'plan.drop_confirm': '{id} streichen? Der Text dieser Probe kommt dann nirgends '
                    + 'mehr vor.',
  'plan.gleaning_what':'Die hervorgehobene Probe sammelt auf, was sich nicht in kleinen '
                    + 'Gruppen proben lässt – damit kommt <b>jede Zeile</b> des Stücks '
                    + 'einmal dran.',
  'plan.help_title': 'Was die Eingriffe bewirken',
  'plan.help_add':  '<b>Person dazu</b> – sie kommt zur Probe; ihr Text zählt nicht mehr '
                    + 'als Ersatz. Der Ersatzanteil sinkt, der Termin wird schwerer zu '
                    + 'finden.',
  'plan.help_remove':   '<b>Person weg</b> – die Regie liest deren Text mit. Der Ersatzanteil '
                    + 'steigt.',
  'plan.help_merge':   '<b>Zusammenlegen</b> – aus zwei Proben wird eine mit beiden '
                    + 'Besetzungen. Sinnvoll, wenn die Leute ohnehin miteinander können.',
  'plan.help_drop':   '<b>Streichen</b> – die Probe fällt weg. Ihr Text kommt dann nirgends '
                    + 'mehr vor; die Abdeckung sinkt entsprechend.',
  'plan.help_rest':  'Nach jedem Eingriff werden Spielzeit, Ersatzanteil und Abdeckung neu '
                    + 'gerechnet. Die Kennungen bleiben, festgehaltene Termine wandern mit.',
  'plan.help_click': 'Ein Klick auf die <b>Probenkennung</b> zeigt, welche Textstellen '
                    + 'dabei drankommen.',

  /* ---------- the passages of one rehearsal ---------- */
  'text.back':     '\u2190 Probenplan',
  'text.title':       'Probe {id}',
  'text.figures':  '{scenes} Szenen \u00b7 {min} min Spielzeit \u00b7 Ersatzanteil '
                    + '{substitution}.',
  'text.counted':    '{own} Repliken sprechen die Anwesenden',
  'text.counted_read': ', {n} liest die Regie vor',
  'text.counted_chorus':  ', {n} sind gemeinsam gesprochen',
  'text.silent':       '<br>Ohne Text, aber laut Regieanweisung auf der Bühne und nicht '
                    + 'dabei: {folks} – auch das zählt in den Ersatzanteil hinein.',
  'text.gleaning':    '<br>Diese Probe sammelt auf, was sich nicht in kleinen Gruppen '
                    + 'proben lässt.',
  'text.note':       'Notiz',
  'text.legend':     'Farbig, was die <b>Anwesenden</b> sprechen. Blass mit dem Vermerk '
                    + '„Regie liest“, was ersatzweise vorgelesen wird. Kursiv die '
                    + 'Regieanweisungen.',
  'text.scene':       'Szene {n}',
  'text.scene_head':  '{act} \u00b7 Repliken {from}\u2013{to} \u00b7 {min} min \u00b7 '
                    + 'Regie liest {substitution}',
  'text.reads_for':    'Die Regie liest hier mit für: {folks}',
  'text.silent_scene': 'Laut Regieanweisung ohne Text auf der Bühne, aber nicht dabei: '
                    + '{folks}',
  'text.no_text':   'Zu dieser Szene ist kein Text auffindbar.',
  'text.backstage':      'hinter der Bühne',
  'text.onstage':       'auf der Bühne',
  'text.director_reads': '\u2013 Regie liest',
  'text.carries_on':      '\u2013 Rede läuft schon',
  'text.back_long':'\u2190 zurück zum Probenplan',
  'text.back_member': '\u2190 Proben',

  /* ---------- printing ---------- */
  'print.output':      'Ausgabe',
  'print.title':        'Drehbücher',
  'print.print':      'Drucken',
  'print.no_script':    'Zuerst muss das <a href="/theater/skript">Drehbuch hochgeladen</a> '
                    + 'werden.',
  'print.what':          'Die Drehbücher öffnen sich im Browser – dort <i>Drucken</i> wählen '
                    + 'und bei Bedarf als PDF sichern. A4 hoch, in der Schrift Ihrer '
                    + 'Vorlage, damit die Zeilen genauso umbrechen wie im Original.',
  'print.addresses':     '<b>Diese Adressen bleiben gültig.</b> Sie liefern immer den '
                    + 'aktuellen Stand – ändert sich der Probenplan, genügt ein Neuladen. '
                    + 'Zum Weitergeben ans Ensemble geeignet; wer den Link hat, darf das '
                    + 'Stück lesen.',
  'print.full':       'Gesamtskript',
  'print.full_what':   'Das ganze Stück mit aufgelösten Sprechernamen.',
  'print.open':      'Öffnen',
  'print.plan':         'Probenplan im Drehbuch',
  'print.plan_what':     'Das ganze Stück mit eingezeichneten Proben: senkrechter Strich neben '
                    + 'dem Text, bei jedem Wechsel ein Kopfblock mit Besetzung und einer '
                    + 'Zeile für den Termin.',
  'print.plan_missing':   'Dafür braucht es zuerst einen <a href="/theater/plan">Probenplan</a>.',
  'print.booklets':        'Rollenhefte',
  'print.booklets_what':    'Nur die Passagen einer Person. Ausgelassene Strecken werden mit '
                    + 'Umfang und Spieldauer ausgewiesen – so weiß man beim Lesen, wie '
                    + 'lange es dauert, bis man wieder dran ist. Jede Person findet ihr '
                    + 'Heft auch über den Ensemble-Link.',
  'print.col_person':    'Person',
  'print.col_address':   'Adresse',
  'print.open_small':'öffnen',
  'print.context':      'Weniger oder mehr Stichwort-Kontext: <code>?kontext=0</code> bis '
                    + '<code>?kontext=3</code> an die Adresse hängen.',
  'print.original':     'Originaldatei',
  'print.original_what': 'Die Datei, die hochgeladen wurde – unverändert.',
  'print.download':'herunterladen',
  'print.download_file': 'als Datei speichern',
  'print.original_none':'Noch keine hinterlegt – sie entsteht beim nächsten '
                    + '<a href="/theater/skript">Hochladen</a>.',
  'print.takes_time':        'Das Setzen dauert ein paar Sekunden: die Dateien sind einige hundert '
                    + 'Kilobyte groß, weil die Schrift eingebettet ist.',

  /* ---------- the company ---------- */
  'comp.who':          'Wer mitspielt',
  'comp.title':        'Ensemble',
  'comp.link_title':   'Link für die ganze Truppe',
  'comp.link_what':     'Einmal verschicken – jede und jeder wählt darauf den eigenen Namen. '
                    + 'Danach: Zeiten eintragen, Termine ansehen und bestätigen, eigenes '
                    + 'Rollenheft laden.',
  'comp.link_new':     'neuen Link erzeugen',
  'comp.link_new_confirm':'Der alte Link gilt dann nicht mehr. Fortfahren?',
  'comp.missing':       'Im Probenplan kommen Kürzel vor, zu denen niemand angelegt ist: '
                    + '{folks}',
  'comp.col_short':   'Name im Drehbuch',
  'comp.col_role':      'Rolle',
  'comp.show_link':     'pers\u00f6nlichen Link zeigen',
  'comp.col_name':      'Name',
  'comp.col_available':      'Verfügbarkeit',
  'comp.name_hint':   'Name der Schauspielerin / des Schauspielers',
  'comp.evenings':       '{n} Abende',
  'comp.entered':  'eingetragen',
  'comp.still_missing':   'fehlt noch',
  'comp.director_always': 'Regie: immer da, au\u00dfer an gestrichenen Tagen',
  'comp.remove':    'entfernen',
  'comp.director':  'Regie',
  'comp.assistant': 'Regieassistenz',
  'comp.director_what': 'Regie und Regieassistenz d\u00fcrfen alles auf diesen Seiten \u2013 \u00fcber ihren '
                    + '<b>pers\u00f6nlichen Link</b> unter ihrer Zeile, nicht \u00fcber den Ensemble-Link, '
                    + 'auf dem jeder jeden Namen w\u00e4hlen kann. Die Regie ist bei jeder Probe dabei: '
                    + 'ein Termin wird nur f\u00fcr Abende vorgeschlagen, an denen die Regie kann.',
  'comp.personal_link': 'Pers\u00f6nlicher Link f\u00fcr {who} \u2013 tr\u00e4gt die Regie-Rechte, also '
                    + 'nicht weitergeben:',
  'comp.remove_confirm':'{who} wirklich entfernen? Eingetragene Zeiten gehen mit.',
  'comp.comes_from':     'Das Ensemble entsteht beim Übernehmen der '
                    + '<a href="/theater/besetzung">Besetzung</a>. Hier lässt es sich '
                    + 'nachbessern.',
  'comp.nobody':      'Noch niemand – das Ensemble entsteht beim Übernehmen der '
                    + '<a href="/theater/besetzung">Besetzung</a>.',
  'comp.add':        'Person von Hand hinzufügen',
  'comp.as_in_script':  'wie im Drehbuch',
  'comp.full_name':   'Vor- und Zuname',
  'comp.create':      'Anlegen',

  /* ---------- dates ---------- */
  'date.title':        'Termine',
  'date.step':      'Schritt 4',
  'date.title_long':   'Terminvorschläge',
  'date.until':          'Bis {date}. Die knappste Probe wird zuerst vergeben – sonst '
                    + 'belegen die leicht zu terminierenden Kleingruppen genau die Abende, '
                    + 'an denen als einziges die große Szene möglich gewesen wäre.',
  'date.what':          'Vorschläge rechnen sich bei jedem Aufruf neu. <b>Festgehaltene</b> '
                    + 'Termine bleiben stehen, die übrigen weichen ihnen aus. Der '
                    + '<b>Ort</b> wird nicht verschickt – bitte den Leuten sagen',
  'date.fixed_n':       ' – derzeit {n} von {m}',
  'date.no_plan':    'Noch kein Probenplan hinterlegt.',
  'date.col_rehearsal':     'Probe',
  'date.col_cast': 'Besetzung',
  'date.col_date':    'Termin',
  'date.clock':          '{from}\u2013{to} Uhr',
  'date.fixed': 'festgehalten',
  'date.proposal':    'Vorschlag',
  'date.release':       'lösen',
  'date.fix':   'festhalten',
  'date.confirm':  'Alle Teilnehmer haben Zeit, Termin jetzt fixieren',
  'date.none_possible':       'kein Termin möglich',
  'date.none_yet':  'noch kein Termin',
  'date.also_short':   'auch:',
  'date.also':         'auch möglich: {days}',
  'date.director':     'Regie',
  'date.scenes_min':   '{scenes} Szenen, {min} min Spielzeit',
  'date.possible_n':   '{n} mögliche Abende',

  /* ---------- fixing a date: the dialog, and the message to pass on ---------- */
  'fix.title':       'Probe {id} fixieren',
  'fix.when':        '{weekday}, {date}, {from}\u2013{to} Uhr',
  'fix.with':        'Dabei',
  'fix.place':       'Ort',
  'fix.place_what':  'Vorausgef\u00fcllt ist der Standard-Probenort aus den Stammdaten des Projekts \u2013 bitte pr\u00fcfen oder \u00e4ndern.',
  'fix.place_none':  'Die Regie hat noch keinen Standard-Probenort eingetragen (Projektseite).',
  'fix.go':          'Termin fixieren',
  'fix.cancel':      'abbrechen',
  'share.title':     'Nachricht an die Mitspielenden',
  'share.what':      'Zum Weiterleiten, etwa in die WhatsApp-Gruppe. Der Link f\u00fchrt zur Probe; wer noch nicht angemeldet ist, w\u00e4hlt zuerst seinen Namen.',
  'share.whatsapp':  'Per WhatsApp',
  'share.share':     'Teilen \u2026',
  'share.copy':      'Kopieren',
  'share.copied':    'kopiert',
  'share.line_head': 'Probe {id} \u2013 {title}',
  'share.line_place': 'Ort: {place}',
  'share.line_place_open': 'Ort: noch offen',
  'share.line_with': 'Dabei: {who}',
  'share.line_link': 'Was geprobt wird: {link}',

  /* ---------- dates, the company's view ---------- */
  'mdate.title':       'Meine Proben',
  'mdate.mine':        'Meine Proben',
  'mdate.all':         'Alle Proben',
  'mdate.all_what':    'Der ganze Plan, wie die Regie ihn sieht. Ein Klick auf die Kennung zeigt, '
                    + 'was in dieser Probe gesprochen wird.',
  'mdate.none':       'Für Sie ist noch keine Probe vorgesehen.',
  'mdate.alone':      'allein',
  'mdate.with':         'mit {who}',
  'mdate.col_with':     'mit',
  'mdate.fixed':        'Fest vereinbart',
  'mdate.fixed_place':    'Den <b>Ort</b> kann jede und jeder eintragen. Das Programm '
                    + 'verschickt nichts – sagen Sie ihn bitte auch den anderen.',
  'mdate.nothing_fixed': 'Noch nichts bestätigt.',
  'mdate.proposals': 'Vorschläge',
  'mdate.proposal_what':'Diese rechnen sich bei jedem Aufruf neu und können sich ändern, '
                    + 'solange sie nicht bestätigt sind.',
  'mdate.all_arranged':  'Alles vereinbart.',

  /* ---------- my times: the calendar ---------- */
  'my.title':        'Meine Verfügbarkeit',
  'my.holds':         'Das gilt derzeit für Sie: {n} Abende',
  'my.holds_1':       'Das gilt derzeit für Sie: ein Abend',
  'my.last_saved':      'Zuletzt gespeichert: {when}',
  'my.director_note': 'Sie sind Regie: F\u00fcr die Terminsuche gelten Sie an jedem Abend als verf\u00fcgbar, eintragen m\u00fcssen Sie nichts. '
                   + 'Tage, an denen nichts geht, streichen Sie f\u00fcr alle \u2013 Tag antippen, dann \u201evon der Regie gestrichen\u201c.',
  'my.nothing':       'Sie haben noch keine Abende eingetragen. Tippen Sie im Kalender auf '
                    + 'einen Tag.',
  'my.needed_for':    'Sie werden für {n} Proben gebraucht: ',
  'my.with':          'mit {who}',
  'my.evenings_n':     '{n} Abend(e)',
  'my.fixed_with_me': 'fester Termin einer meiner Proben',
  'my.all_with_me': 'alle Benötigten können, ich auch',
  'my.all_others':  'alle anderen können \u2013 nur mein Ja fehlt',
  'my.half':      'mindestens die Hälfte',
  'my.one':        'einer',
  'my.me':          'ich habe zugesagt',
  'my.save':    'Speichern',
  'my.only_after':    ' — die Eintragungen gelten erst nach dem Speichern.',
  'my.autosave':      'Jede Eintragung wird sofort gespeichert.',
  'my.saving':        'speichere \u2026',
  'my.saved':         'gespeichert {when}',
  'my.save_failed':   'Speichern fehlgeschlagen \u2013 bitte noch einmal.',
  /* fremde Kalender, nur in diesem Browser */
  'my.sources_title': 'Mit meinem Kalender verkn\u00fcpfen',
  'my.sources_what':  'Adressen eigener Kalender eintragen (etwa der private ICS-Link eines Google-Kalenders) oder eine '
                    + '.ics-Datei laden, gern mehrere. Der Server holt einen Kalender f\u00fcr Sie ab und vergisst ihn '
                    + 'sofort. Die Adressen sind mit einem vierstelligen PIN verschl\u00fcsselt und liegen so auch am '
                    + 'Server \u2013 am Handy gen\u00fcgt derselbe PIN, um sie zu sehen; ohne PIN zeigt die Seite '
                    + 'keine Termine, und lesen kann der Server sie nicht. Geladene Dateien bleiben auf dem Ger\u00e4t.',
  'my.pin':           'PIN',
  'my.pin_repeat':    'PIN wiederholen',
  'my.pin_ok':        'Festlegen',
  'my.pin_set_title': 'Zuerst einen PIN festlegen',
  'my.pin_set_what':  'Vier Ziffern. Damit werden Ihre Kalender verschl\u00fcsselt \u2013 hier und am Server; derselbe PIN \u00f6ffnet sie auf jedem Ger\u00e4t. Ohne PIN zeigt die Seite keine Termine.',
  'my.pin_enter':     'PIN eingeben, um die Kalender zu sehen.',
  'my.pin_unlock':    'Entsperren',
  'my.pin_wrong':     'Falscher PIN.',
  'my.pin_lock':      'Sperren',
  'my.pin_mismatch':  'Die beiden Eingaben sind verschieden.',
  'my.pin_format':    'Vier Ziffern, bitte.',
  'my.pin_forget':    'PIN vergessen?',
  'my.pin_forget_what': 'Entfernt die Kalender von diesem Ger\u00e4t und vom Server; danach neu einbinden.',
  'my.pin_forget_confirm': 'Alle Kalender von diesem Ger\u00e4t und vom Server entfernen?',
  'my.source_local':  'nur auf diesem Ger\u00e4t',
  'my.source_name':   'Name',
  'my.source_url':    'ICS-Adresse',
  'my.source_add':    'Hinzuf\u00fcgen',
  'my.source_file':   '.ics-Datei laden',
  'my.source_remove': 'entfernen',
  'my.source_none':   'Noch kein Kalender eingebunden.',
  'my.source_unreachable': 'nicht abrufbar \u2013 Adresse pr\u00fcfen oder die .ics-Datei laden',
  'my.source_n':      '{n} Termine im Zeitraum',
  'my.day_title':     'Aus meinen Kalendern:',
  'my.day_free':      'nichts eingetragen',
  'my.allday':        'ganzt\u00e4gig',
  'my.bad_url':       'Bitte eine Adresse mit https:// angeben.',
  'my.bad_file':      'Diese Datei lie\u00df sich nicht als Kalender lesen.',
  'my.ics_title':     'Kalender-Abo',
  'my.ics_what':      'Diese Adresse im eigenen Kalender abonnieren (Google: \u201ePer URL\u201c, iPhone: '
                    + 'Kalenderabonnement): alle Proben mit Termin, Vorschl\u00e4ge als vorl\u00e4ufig und die eigenen '
                    + 'Abende. Der Link steht f\u00fcr Sie pers\u00f6nlich.',
  /* der Kalender selbst */
  'ics.with_me':      'Probe {id}: ich + {others}',
  'ics.with_me_alone': 'Probe {id}: ich',
  'ics.without_me':   'Probe {id} ohne mich \u2013 geprobt wird {who}',
  'ics.proposal':     'Vorschlag: ',
  'ics.proposal_what': 'Vorl\u00e4ufig \u2013 der Vorschlag wird bei jeder Eintragung neu berechnet.',
  'ics.cast':         'Besetzung: {who}',
  'ics.place':        'Ort: {place}',
  'ics.passages':     'Passagen: {url}',
  'ics.free':         'Bin verf\u00fcgbar f\u00fcr Probe',
  'ics.free_what':    'Eingetragen in der Probenplanung \u201e{title}\u201c.',
  'my.nobody':      'niemand',
  'my.can_n':    '{n} können',
  'my.best':        '{rehearsal}: {here} von {total} können',
  'my.fixed_on':      'Fest vereinbart: ',
  'my.still_missing':   ' – es fehlt noch: ',
  'my.only_you':      ' – es fehlen nur noch Sie',
  'my.no_rehearsal':  'Keine Ihrer Proben kommt an diesem Tag weiter.',
  'my.free_then':   'Zeit haben: ',
  'my.from':           'ab',
  'my.to':          'bis',
  'my.can':         'ich kann',
  'my.cannot':   'Tag f\u00fcr mich streichen',
  'my.open':     'offen lassen',
  'my.day_full': 'ganz frei',
  'my.legend_nein': 'von mir gestrichen',
  'my.pref_title': 'Bevorzugtes Zeitfenster',
  'my.legend':     'Legende',
  'my.time_wrong':  'Die Zeit „bis“ muss nach „ab“ liegen.',
  'my.legend_blocked': 'von der Regie gestrichen',
  'my.blocked':     'Die Regie hat diesen Tag gestrichen \u2013 keine Probe, wer auch immer k\u00f6nnte.',
  'my.block':       'Tag f\u00fcr alle streichen',
  'my.unblock':     'Tag wieder freigeben',

  /* ---------- audiobook ---------- */
  'ab.title':         'Hörbuch',
  'ab.what':           'Das Stück wird von <b>ElevenLabs</b> gesprochen – eine Stimme je '
                    + 'Person, Spielanweisungen wie „(schreit)“ werden in den Ton '
                    + 'übernommen. Wer seinen Text lernt, hört ihn lieber, als ihn zu '
                    + 'lesen, und hört die Stichworte der anderen gleich mit.',
  'ab.step_key':  '1. Schlüssel',
  'ab.key_what':'Ein eigener ElevenLabs-Schlüssel ist nötig; die Erzeugung geht auf '
                    + 'Ihr Guthaben. Der Schlüssel wird <b>am Projekt gespeichert</b> – '
                    + 'anders ginge es nicht, weil die Erzeugung lange läuft. Wer das nicht '
                    + 'will, entfernt ihn nach getaner Arbeit wieder.',
  'ab.key':    'Schlüssel',
  'ab.key_stored':    'hinterlegt – zum Ändern neu eingeben',
  'ab.change':       'Ändern',
  'ab.remove_key':     'Schlüssel entfernen',
  'ab.remove_key_confirm':'Schlüssel entfernen?',
  'ab.step_voices':     '2. Stimmen',
  'ab.no_voices': 'Aus dem Konto liessen sich keine Stimmen holen. Stimmt der '
                    + 'Schlüssel?',
  'ab.voices_what':   'Eine Stimme je <b>Person</b>, nicht je Rolle – im Stück spielt ja '
                    + 'dieselbe Person ihre Bühnenrolle. Unterschiedlich ist nur die '
                    + 'Spielweise: als Rolle wird theatralischer gesprochen, hinter der '
                    + 'Bühne nüchterner. Der <b>Erzähler</b> liest die Regieanweisungen.',
  'ab.no_voice':  '\u2014 keine Stimme \u2014',
  'ab.plays':        'spielt {roles}',
  'ab.model':        'Modell',
  'ab.save_voices':'Stimmen sichern',
  'ab.step_generate':    '3. Erzeugen',
  'ab.generate_what':  'Ein ganzes Stück sind über tausend Abschnitte und dauert Stunden. '
                    + 'Zum Ausprobieren lieber mit einer Probe anfangen – das sind ein paar '
                    + 'Dutzend.',
  'ab.pick_rehearsal':    'Probe {id} – {group}, {min} min',
  'ab.act_n':         'Akt {n}',
  'ab.narrator':      'Erzähler',
  'ab.narrator_what': 'spricht die Regieanweisungen',
  'ab.everything':         'Das ganze Stück',
  'ab.speak_it':      'Sprechen lassen',
  'ab.progress':   '{done} von {total} Abschnitten',
  'ab.skipped': '({n} ohne Stimme übersprungen)',
  'ab.generated':       '{mb} MB erzeugt.',
  'ab.running':        'Läuft – die Seite aktualisiert sich selbst.',
  'ab.cancelled':   'Abgebrochen.',
  'ab.done':        'Fertig.',
  'ab.cancel':     'abbrechen',
  'ab.listen':      '{file} anhören oder sichern',

  /* ---------- messages from the application ---------- */
  'msg.rehearsal_gone':    'Diese Probe gibt es nicht.',
  'msg.one_gone':   'Eine der beiden Proben gibt es nicht.',
  'msg.same_one':        'Das ist dieselbe Probe.',
  'msg.dropped':   '{id} gestrichen. Abdeckung jetzt {coverage} – der Text dieser '
                    + 'Probe kommt nirgends mehr vor.',
  'msg.merged':     '{a} und {b} zusammengelegt: {group}, {min} min.',
  'msg.not_in_company':'{who} steht nicht im Ensemble.',
  'msg.already_there':  '{who} ist schon dabei.',
  'msg.not_there':    '{who} ist gar nicht dabei.',
  'msg.needs_one':  'Eine Probe braucht mindestens eine Person.',
  'msg.joined':         '{who} kommt zu {id} dazu – Ersatzanteil jetzt {share}.',
  'msg.left':          '{who} ist bei {id} nicht mehr dabei – die Regie liest deren Text '
                    + 'mit, Ersatzanteil jetzt {share}.',
  'msg.note_saved':     'Notiz zu {id} gesichert.',
  'msg.note_gone':    'Notiz zu {id} gelöscht.',

  'msg.hb_busy':    'Es läuft bereits ein Auftrag für dieses Projekt.',
  'msg.hb_no_key':  'Es fehlt der ElevenLabs-Schlüssel.',
  'msg.hb_no_narrator':  'Für den Erzähler ist noch keine Stimme gewählt.',
  'msg.hb_no_text': 'Für diesen Umfang findet sich kein Text.',
  'msg.hb_started':       '{what}: {n} Abschnitte werden gesprochen. Das dauert; die Seite '
                    + 'zeigt den Fortschritt.',
  'msg.hb_idle': 'Es läuft kein Auftrag.',
  'msg.hb_cancelling':   'Wird abgebrochen; der bisherige Teil bleibt erhalten.',
  'msg.hb_key_refused':'Der Schlüssel wird nicht angenommen.',
  'msg.hb_answered':   'ElevenLabs antwortet mit {status}.',
  'msg.hb_rehearsal':     'Probe {id}',
  'msg.hb_act':       '{n}. Akt',
  'msg.hb_all':     'Das ganze Stück',

  'msg.no_plan':    'Kein Probenplan hinterlegt.',
  'msg.without_date':  '{open} von {total} Proben haben noch keinen Termin.',

  /* ---------- messages from the router ---------- */
  'r.name_gone': 'Diesen Namen gibt es nicht (mehr).',
  'r.unknown_action': 'Unbekannter Eingriff.',
  'r.person_gone': 'Diese Person gibt es nicht.',
  'r.thats_you': 'Das sind Sie schon.',
  'r.not_yours': 'Das ist keine Ihrer Proben.',
  'r.no_date': 'Für diese Probe steht noch kein Termin.',
  'r.now_fixed': '{p1} ist jetzt fest vereinbart. Die Nachricht unten k\u00f6nnen Sie den anderen weiterleiten.',
  'r.released': '{p1} wieder freigegeben.',
  /* ---------- Einstellungen f\u00fcr dieses Ger\u00e4t ---------- */
  'set.eyebrow':       'Dieses Ger\u00e4t',
  'set.title':         'Einstellungen',
  'set.person':        'Wessen Seiten',
  'set.person_what':   'Sie arbeiten als {name}. Ein Wechsel bleibt auf diesem Ger\u00e4t, bis Sie zur\u00fcckwechseln.',
  'set.switch':        'wechseln',
  'set.device':        'Dieses Ger\u00e4t',
  'set.what':          'Nur in diesem Browser gespeichert \u2013 jedes Handy und jeder Computer hat seine eigenen.',
  'set.language':      'Sprache',
  'set.language_auto': 'wie das Projekt oder der Browser',
  'set.theme':         'Darstellung',
  'set.theme_light':   'hell',
  'set.theme_dark':    'dunkel',
  'set.font':          'Schriftgr\u00f6\u00dfe',
  'set.font_small':    'klein',
  'set.font_normal':   'normal',
  'set.font_large':    'gro\u00df',
  'set.font_xlarge':   'sehr gro\u00df',

  'r.throttled': 'Zu viele Fehlversuche. Bitte in {p1} Minute{p2} noch einmal versuchen.',
  'r.code_unknown': 'Diesen Zugangscode kennen wir nicht.',
  'r.expired': 'Die Anmeldung ist abgelaufen. Bitte den Zugangscode noch einmal eingeben – danach die Datei erneut hochladen.',
  'r.no_file': 'Es kam keine Datei an.',
  'r.bad_extension': 'Nur .docx, .md oder .txt \\u2013 diese Datei endet anders.',
  'r.read_failed': 'Die Datei liess sich nicht lesen: {reason}',
  'r.no_speaker': 'Darin wurde kein einziger Sprecher gefunden. Steht vor dem Text jeweils ein Name mit Doppelpunkt?',
  'r.no_person': 'Keine einzige Person \\u2013 mindestens eine Zeile muss \\u201eeigene Person\\u201c sein.',
  'r.structure_failed': 'Die Struktur liess sich nicht bauen: {reason}',
  'r.taken_over': '{p1} Repliken, {p2} Personen. Weiter zum Probenplan.',
  'r.no_key_entered': 'Kein Schluessel eingegeben.',
  'r.key_stored': 'Schluessel geprueft und hinterlegt.',
  'r.key_removed': 'Der Schluessel ist entfernt.',
  'r.voices_saved': '{p1} Stimmen gesichert.',
  'r.unknown_action2': 'Unbekannter Eingriff.',
  'r.without_cast': 'Ohne Besetzung lässt sich nichts ableiten.',
  'r.no_plan_to_revise': 'Es gibt noch keinen Plan zum Nachbessern.',
  'r.merge_with_what': 'Womit zusammenlegen?',
  'r.add_whom': 'Wen dazunehmen?',
  'r.remove_whom': 'Wen herausnehmen?',
  'r.unknown_action3': 'Unbekannter Eingriff.',
  'r.derive_failed': 'Die Ableitung ist gescheitert: {reason}',
  'r.no_rehearsal_found': 'Es hat sich keine einzige Probe ergeben. Ein höherer Ersatzanteil oder eine größere Gruppe hilft.',
  'r.derived': '{p1} Proben abgeleitet, Abdeckung {p2} des gesprochenen Textes.',
  'r.person_gone2': 'Diese Person gibt es nicht mehr.',
  'r.removed': '{p1} entfernt.',
  'r.person_gone3': 'Diese Person gibt es nicht mehr.',
  'r.name_saved': '{p1}: Name gesichert.',
  'r.link_new': 'Neuer Ensemble-Link erzeugt. Der alte gilt nicht mehr.',
  'r.director_link_new': 'Neuer Regie-Link erzeugt. Der alte gilt nicht mehr.',
  'r.without_short': 'Ohne Kürzel geht es nicht.',
  'r.already_exists': '{p1} gibt es schon.',
  'r.created': '{p1} angelegt.',
  'r.no_script_stored': 'Kein Drehbuch hinterlegt.',
  'r.typeset_failed': 'Das Dokument liess sich nicht setzen: {reason}',
  'r.no_date2': 'Für diese Probe steht noch kein Termin.',
  'r.fixed': '{p1} festgehalten. Die übrigen Proben weichen aus.',
  'r.released2': '{p1} wieder freigegeben.',
  'f.link_gone_t': 'Link unbekannt',
  'f.link_gone': 'Dieser Link gehört zu niemandem. Vielleicht wurde er beim Kopieren abgeschnitten.',
  'f.link_gone2_t': 'Link unbekannt',
  'f.link_gone2': 'Dieser Link gehört zu keinem Projekt. Vielleicht wurde er beim Kopieren abgeschnitten, oder es gibt inzwischen einen neuen.',
  'f.person_gone_t': 'Unbekannte Person',
  'f.person_gone': 'Zu diesem Namen gibt es im Projekt kein Ensemble-Mitglied.',
  'f.no_original_t': 'Kein Original',
  'f.no_original': 'Zu diesem Projekt ist keine Originaldatei hinterlegt. Sie entsteht beim nächsten Hochladen des Drehbuchs.',
  'f.no_script_t': 'Kein Drehbuch',
  'f.no_script': 'Die Regie hat noch kein Drehbuch eingespielt.',
  'f.not_found_t': 'Nicht gefunden',
  'f.not_found': 'Diese Seite gibt es nicht.',
  'f.failed_t': 'Ging nicht',
  'f.failed': 'Das Dokument liess sich nicht setzen: {reason}',
  'f.link_gone3_t': 'Link unbekannt',
  'f.link_gone3': 'Dieser Link gehört zu keinem Projekt. Vielleicht wurde er beim Kopieren abgeschnitten, oder es gibt inzwischen einen neuen.',
  'f.not_signed_in_t': 'Nicht angemeldet',
  'f.not_signed_in': 'Bitte den Link vom Ensemble noch einmal öffnen und den eigenen Namen wählen.',
  'f.no_script2_t': 'Kein Drehbuch',
  'f.no_script2': 'Die Regie hat noch kein Drehbuch eingespielt.',
  'f.failed2_t': 'Ging nicht',
  'f.failed2': 'Das Dokument liess sich nicht setzen: {reason}',
  'f.not_found2_t': 'Nicht gefunden',
  'f.not_found2': 'Diese Seite gibt es nicht.',
  'f.demo_gone_t':    'Keine solche Demo',
  'f.demo_gone':      'Ein Demo-Projekt mit diesem Namen gibt es nicht.',
  'f.demo_locked_t':  'Nicht in der Demo',
  'f.demo_locked':    'Drehbuch hochladen und H\u00f6rbuch erzeugen sind in den Demo-Projekten '
                    + 'abgeschaltet. Alles andere ist offen \u2013 <a href="/theater/projekt">zur\u00fcck</a>.',
  'f.no_structure_t': 'Kein Skript',
  'f.no_structure': 'Zuerst muss ein Drehbuch eingespielt und die Besetzung uebernommen werden.',
  'f.no_plan_t': 'Noch kein Plan',
  'f.no_plan': 'Es gibt noch keinen Probenplan.',
  'f.failed3_t': 'Ging nicht',
  'f.failed3': 'Die Textstellen liessen sich nicht zusammenstellen: {reason}',
  'f.rehearsal_gone_t': 'Unbekannte Probe',
  'f.rehearsal_gone': 'Eine Probe mit dieser Kennung gibt es im aktuellen Plan nicht. Vielleicht wurde sie gestrichen oder zusammengelegt.',
  'f.not_found3_t': 'Nicht gefunden',
  'f.not_found3': 'Diese Seite gibt es nicht.',
  'r.taken_over_new': '{p1} Repliken, {p2} Personen. {p3} neu angelegt. Weiter zum Probenplan.',
  'r.derived_released': '{p1} Proben abgeleitet, Abdeckung {p2} des gesprochenen Textes. {p3} festgehaltene Termine wurden dabei gelöst – die Probenkennungen sind neu vergeben.',

  /* ---------- added with the translated modules ---------- */
  'r.times_saved':      'Gespeichert \u2013 {n} Abende. Danke!',
  'r.times_saved_1':    'Gespeichert \u2013 ein Abend. Danke!',
  'r.times_saved_none': 'Gespeichert, aber kein einziger Abend angekreuzt \u2013 '
                      + 'so l\u00e4sst sich keine Probe ansetzen.',
  'r.place_set':        'Ort f\u00fcr {id}: {place}. Bitte sagen Sie es den anderen \u2013 '
                      + 'das Programm verschickt nichts.',
  'r.place_cleared':    'Ort f\u00fcr {id} gel\u00f6scht.',
  'r.too_large': 'Die Datei ist zu groß (über {mb} MB).',
  'r.no_boundary': 'Dem Formular fehlt die Trennmarke.',
  'r.no_readable_text': 'Aus der Datei kam kein lesbarer Text.',
  'r.person_not_in_cast': 'Diese Person steht nicht in der Besetzung.',
  'r.no_plan_yet': 'Es gibt noch keinen Probenplan.',

  /* ---------- ueber ---------- */
  'about.title':        'Über',
  'about.source':       'Quelltext',
  'about.what':         'Probenplanung für Theatergruppen: vom Drehbuch zur Besetzung, '
                      + 'zum Plan der Kleingruppenproben, zu Terminen, die allen passen. '
                      + 'Freie Software; jede Bühne betreibt sie selbst.',
  'about.version':      'Version',
  'about.source_code':  'Quelltext',
  'about.author':       'Autor',
  'about.licence':      'Lizenz',
  'about.licence_text': '{licence} – siehe <a href="{url}" rel="noopener">LICENSE</a>. '
                      + 'Der Text eines Stücks ist nicht Teil der Software; jede Bühne '
                      + 'bringt ihren eigenen mit.',
  'about.contact':      'Kontakt',
  'about.format':       'Wie ein Drehbuch formatiert sein muss, steht in '
                      + '<a href="https://github.com/toprach/rehearsalcall/blob/main/'
                      + 'DREHBUCH-FORMAT.md">DREHBUCH-FORMAT.md</a>; zwei gemeinfreie '
                      + 'Stücke von Shakespeare liegen als Beispiele beim Quelltext.',

  /* ---------- Verwaltung ---------- */
  'admin.title':        'Verwaltung',
  'admin.login_what':   'F\u00fcr die Betreiber dieser Installation: Projekte anlegen, '
                      + 'Zugangscodes vergeben, Erledigtes l\u00f6schen. Der Schl\u00fcssel '
                      + 'wurde bei der Einrichtung des Servers festgelegt.',
  'admin.key':          'Verwaltungsschl\u00fcssel',
  'admin.projects':     'Projekte',
  'admin.none':         'Noch keine Projekte.',
  'admin.col_title':    'Projekt',
  'admin.col_created':  'Angelegt',
  'admin.col_email':    'Regie',
  'admin.col_state':    'Stand',
  'admin.figures':      '{people} Personen, {rehearsals} Proben, {entered} mit Verf\u00fcgbarkeit',
  'admin.new':          'Projekt anlegen',
  'admin.field_title':  'Titel',
  'admin.field_email':  'E-Mail-Adresse der Regie',
  'admin.email_what':   'Das Programm verschickt selbst nichts: der Code wird einmal '
                      + 'angezeigt, Sie schicken ihn. Die Adresse bleibt beim Projekt, '
                      + 'damit sp\u00e4ter ein neuer Code an dieselbe Person gehen kann.',
  'admin.create':       'Anlegen',
  'admin.new_code':     'neuer Zugangscode',
  'admin.new_code_confirm': 'Der alte Zugangscode gilt dann nicht mehr. Fortfahren?',
  'admin.delete':       'l\u00f6schen',
  'admin.delete_what':  'zum L\u00f6schen den Titel eintippen',
  'admin.delete_confirm': '\u201e{title}\u201c mit Drehbuch, Ensemble, Plan und Ton l\u00f6schen? '
                      + 'Das l\u00e4sst sich nicht r\u00fcckg\u00e4ngig machen.',
  'admin.delete_note':  'L\u00f6schen entfernt den Datensatz und alle Beilagen. Vorher den '
                      + 'Titel des Projekts ins Feld tippen \u2013 ein Klick allein ist daf\u00fcr '
                      + 'zu wenig.',
  'admin.fresh_title':  'Zugangscode f\u00fcr {title}',
  'admin.fresh_code':   'Zugangscode:',
  'admin.fresh_what':   'Wird einmal angezeigt. Gespeichert ist nur ein Streuwert; geht er '
                      + 'verloren, einen neuen erzeugen.',
  'admin.fresh_email':  'Regie:',
  'admin.send_mail':    'Mail schreiben',
  'admin.mail_subject': 'Zugang zur Probenplanung: {title}',
  'admin.mail_body':    'Hallo,\n\nhier ist der Zugang zur Probenplanung.\n\n'
                      + 'Projekt: {title}\nEinstieg: {url}\nZugangscode: {code}\n\n'
                      + 'Den Code auf der Einstiegsseite eingeben; alles Weitere ergibt '
                      + 'sich dort. Der Code ist pers\u00f6nlich \u2013 das Ensemble bekommt '
                      + 'sp\u00e4ter von Ihnen einen eigenen Link.\n',
  'f.no_admin_t':       'Keine Verwaltung',
  'f.no_admin':         'Diese Installation hat keinen Verwaltungsschl\u00fcssel (THEATER_ADMIN). '
                      + 'Projekte werden stattdessen auf der Kommandozeile angelegt.',
  'r.admin_wrong':      'Das ist nicht der Verwaltungsschl\u00fcssel.',
  'r.admin_no_title':   'Ein Titel ist n\u00f6tig.',
  'r.admin_no_email':   'Die E-Mail-Adresse der Regie ist n\u00f6tig, und sie muss wie eine '
                      + 'aussehen.',
  'r.admin_created':    '{p1} angelegt. Der Zugangscode steht unten \u2013 einmal.',
  'r.admin_gone':       'Dieses Projekt gibt es nicht.',
  'r.admin_code_new':   'Neuer Zugangscode f\u00fcr {p1}. Der alte gilt nicht mehr.',
  'r.admin_confirm':    'Zum L\u00f6schen den Titel genau so eintippen: {p1}',
  'r.admin_deleted':    '{p1} gel\u00f6scht, mit allem, was dazugeh\u00f6rt.',

  /* ---------- Fassungen des Drehbuchs ---------- */
  'upl.versions':       'Fassungen',
  'upl.versions_what':  'Jedes hochgeladene Drehbuch bleibt erhalten. Der Vergleich zeigt die '
                      + 'Repliken, die ge\u00e4ndert, neu oder gestrichen sind \u2013 Formatierung '
                      + 'z\u00e4hlt nicht. Der Probenplan wird inhaltlich mitgef\u00fchrt: jede '
                      + 'Textstelle wird \u00fcber ihre erste und ihre letzte Replik wiedergefunden.',
  'upl.col_version':    'Fassung',
  'upl.col_uploaded':   'Hochgeladen',
  'upl.col_file':       'Datei',
  'upl.col_speeches':   'Repliken',
  'upl.col_changes':    '\u00c4nderungen gegen\u00fcber der vorigen',
  'upl.changes':        '{changed} ge\u00e4ndert, {added} neu, {removed} gestrichen',
  'upl.first':          'erste Fassung',
  'upl.current':        'aktuell',
  'upl.restored_from':  'wiederhergestellt aus Fassung {nr}',
  'upl.restore':        'wieder aktuell machen',
  'upl.restore_confirm': 'Fassung {nr} zum aktuellen Drehbuch machen? Der Plan wird mitgef\u00fchrt, '
                      + 'die jetzt aktuelle Fassung bleibt ebenfalls erhalten.',
  'upl.new_names':      'Neue Sprechernamen, noch nicht zugeordnet: {names} \u2013 '
                      + '<a href="/theater/besetzung">jetzt zuordnen</a>.',
  'upl.plan_unsure':    'Der Probenplan passt m\u00f6glicherweise nicht mehr: bei {ids} wurde Anfang '
                      + 'oder Ende einer Textstelle im neuen Drehbuch nicht gefunden. Diese Proben '
                      + 'ansehen oder den <a href="/theater/plan">Plan neu ableiten</a>. Sonst wurde '
                      + 'nichts ge\u00e4ndert.',
  'upl.plan_rebuilt':   'Bei {ids} hat sich innerhalb der Textstelle viel ge\u00e4ndert. Die Stellen '
                      + 'stimmen noch; ansehen lohnt sich.',
  'ver.title':          'Fassung {nr} gegen\u00fcber Fassung {before}',
  'ver.files':          '{before} \u2192 {now}',
  'ver.summary':        '{changed} ge\u00e4ndert, {added} neu, {removed} gestrichen, {equal} unver\u00e4nderte Repliken.',
  'ver.none':           'Kein Unterschied in den Repliken.',
  'ver.col_cue':        'Nr.',
  'ver.col_who':        'Sprecher',
  'ver.col_old':        'Vorher',
  'ver.col_new':        'Jetzt',
  'ver.col_rehearsal':  'Probe',
  'ver.changed':        'ge\u00e4ndert',
  'ver.added':          'neu',
  'ver.removed':        'gestrichen',
  'ver.back':           '\u2190 Drehbuch',
  'ver.print':          'F\u00fcrs Ensemble: diese Seite als \u00c4nderungsblatt drucken. Die '
                      + 'Stichwort-Nummern stehen alt und neu \u2013 gedruckte Rollenhefte tragen '
                      + 'die alten.',
  'plan.unsure_notice': 'Nach dem letzten Hochladen des Drehbuchs wurde bei {ids} Anfang oder Ende '
                      + 'einer Textstelle nicht gefunden. Dort passt der Plan m\u00f6glicherweise '
                      + 'nicht mehr. Diese Proben ansehen oder den Plan neu ableiten \u2013 das '
                      + 'verwirft jede Handarbeit und jeden festen Termin.',
  'plan.unsure_row':    'Anfang oder Ende im neuen Drehbuch nicht gefunden',
  'plan.rebuilt_row':   'innen viel ge\u00e4ndert \u2013 Textstellen ansehen',
  'r.no_version':       'Diese Fassung gibt es nicht.',
  'f.no_version_t':     'Keine solche Fassung',
  'f.no_version':       'Eine Fassung mit dieser Nummer gibt es nicht, oder es gibt nichts zum Vergleichen.',
  'r.version_taken':    'Fassung {nr} \u00fcbernommen: {changed} ge\u00e4ndert, {added} neu, {removed} gestrichen.',
  'r.version_kept':     'Fassung {nr} \u00fcbernommen: {changed} ge\u00e4ndert, {added} neu, {removed} gestrichen. '
                      + 'Der Probenplan ist mitgef\u00fchrt; jede Textstelle wurde wiedergefunden.',
  'r.version_rebuilt':  'Fassung {nr} \u00fcbernommen: {changed} ge\u00e4ndert, {added} neu, {removed} gestrichen. '
                      + 'Bei {rebuilt} hat sich innen viel ge\u00e4ndert \u2013 die Stellen stimmen noch, '
                      + 'aber ansehen.',
  'r.version_unsure':   'Fassung {nr} \u00fcbernommen: {changed} ge\u00e4ndert, {added} neu, {removed} gestrichen. '
                      + '<b>Der Probenplan passt m\u00f6glicherweise nicht mehr:</b> bei {unsure} wurde '
                      + 'Anfang oder Ende einer Textstelle nicht gefunden. Diese Proben ansehen oder '
                      + 'den Plan neu ableiten; sonst wurde nichts ge\u00e4ndert.',
  'r.version_new_names': 'Fassung {nr} \u00fcbernommen: {changed} ge\u00e4ndert, {added} neu, {removed} gestrichen. '
                      + '{fresh} neue Sprechernamen \u2013 auf der <a href="/theater/besetzung">Besetzungsseite</a> '
                      + 'zuordnen; bis dahin gelten sie als eigene Personen.',

  /* ---------- das Rollenheft am Bildschirm ---------- */
  'book.title':      'Rollenheft',
  'book.title_for':  'Rollenheft \u2013 {name}',
  'book.figures':    '{passages} Passagen, etwa {words} W\u00f6rter',
  'book.what':       'Jede Passage mit ihrem Stichwort. Mit \u201eLernen\u201c sind die eigenen Zeilen '
                   + 'verdeckt, bis Sie sie einblenden; \u201esitzt\u201c markiert, was Sie k\u00f6nnen, '
                   + 'und das merkt sich dieses Ger\u00e4t.',
  'book.plan_doc':   'Probenplan',
  'book.filter_note': 'Nur die Passagen der Probe {id}.',
  'book.filter_adhoc': 'Ad-hoc-Probe mit {who}: nur die Eins\u00e4tze, die Sie von ihnen bekommen.',
  'book.adhoc_title': 'Ad-hoc-Probe',
  'book.adhoc_what':  'Wer ist gerade da? Ankreuzen, dann lernen Sie genau die Eins\u00e4tze, die Sie von diesen Leuten bekommen.',
  'book.adhoc_go':    'Diese Eins\u00e4tze lernen',
  'mdate.adhoc':      'Ad-hoc-Probe',
  'book.filter_all': 'alle Passagen',
  'book.filter_back': 'zur\u00fcck zur Probe',
  'text.learn_this': 'Diese Probe lernen',
  'text.learn_this_what': 'der Lernmodus, nur mit den Passagen, die hier drankommen',
  'book.play_link':  'das ganze St\u00fcck lesen',
  'play.title':      'Das St\u00fcck',
  'play.what':       'Alle Zeilen, die eigenen hervorgehoben ({n}). Die Leiste unten springt zur vorigen und n\u00e4chsten eigenen Stelle; ein Doppeltipp \u00f6ffnet die Kommentare.',
  'play.to_book':    'Zu meinem Rollenheft.',
  'play.rehearsal_from': 'Probe {id} ab hier',
  'mem.play':        'Das St\u00fcck',
  'mem.play_open':   '<a href="/theater/mit/stueck">lesen</a> \u2013 alle Zeilen am Bildschirm, meine markiert',
  'book.mode_read':  'Lesen',
  'book.mode_learn': 'Lernen',
  'book.mode_hard':  'Die heiklen',
  'book.read_what':  'Jede Passage mit ihrem Stichwort. Die Pfeile zeigen mehr von dem, was davor und danach kommt.',
  'book.learn_what': 'Das Stichwort steht da, der eigene Text ist verdeckt. Laut sprechen, aufdecken, selbst beurteilen. '
                   + 'Zuerst kommt, was von fr\u00fcheren Tagen f\u00e4llig ist, dann Neues in der Reihenfolge des St\u00fccks, '
                   + 'in Paketen zu sechs, die in zuf\u00e4lliger Reihenfolge wiederkommen, bis jede Passage zweimal sa\u00df. '
                   + 'Was sitzt, kommt nach einem Tag wieder, dann nach drei, sieben, vierzehn, drei\u00dfig.',
  'book.hard_what':  'Die Passagen, die bei den letzten zehn Versuchen mindestens zweimal danebengingen, die schlechteste zuerst.',
  'book.due':        'heute f\u00e4llig: {n}',
  'book.fresh':      'neu: {n}',
  'book.sitting':    'sitzt: {p} %',
  'book.steps':      'Passagen je Stufe, 0 bis 5',
  'book.step':       'Stufe {i}: {n}',
  'book.step_short': 'Stufe {i}',
  'book.new':        'neu',
  'book.part':       'Teil {k} von {n}',
  'book.progress':   '{done} von {total} erledigt',
  'book.cue_nr':     'Replik {nr}',
  'book.entry_n':    'Einsatz {n}',
  'book.resume':     'Weiter bei {what}, Passage {k} von {n}.',
  'book.resume_read': 'Weiter, wo Sie zuletzt gelesen haben ({what}).',
  'book.resume_restart': 'von vorn',
  'book.resume_all': 'alle Passagen',
  'book.filter_probe': 'Probe {id}',
  'book.filter_adhoc_short': 'Ad-hoc-Probe',
  'book.filter_all_label': 'allen Passagen',
  'book.no_cue':     '(kein Stichwort \u2013 die Passage er\u00f6ffnet)',
  'book.own_before': '(du, direkt davor)',
  'book.first_time': 'Zum ersten Mal: einmal lesen, dann kommt sie verdeckt wieder.',
  'book.next':       'Weiter',
  'book.say_aloud':  'Sprich deinen Text laut \u2013 dann aufdecken.',
  'book.hint':       'Hinweis',
  'book.reveal':     'Aufdecken',
  'book.intent':     'Was will ich hier?',
  'book.intent_private': 'private Notiz \u2013 niemand sonst sieht sie',
  'book.intent_hint': '(ein paar Worte \u2013 die Absicht tr\u00e4gt den Text)',
  'book.again':      'nochmal',
  'book.with_help':  'mit Hilfe',
  'book.knew':       'kann ich',
  'book.done_title': 'F\u00fcr heute fertig',
  'book.done_text':  '{n} Passagen erledigt. Morgen f\u00e4llig: {tomorrow}. Lieber jeden Tag eine kurze Runde als einmal eine lange.',
  'book.once_more':  'noch eine Runde',
  'book.nothing_hard': 'Noch nichts Heikles',
  'book.nothing_hard_what': 'Hier landet eine Passage, wenn sie bei ihren letzten zehn Versuchen zweimal danebenging.',
  'book.mode_review': 'Wiederholen',
  'book.review_what': 'Was schon gelernt ist, in der Reihenfolge des St\u00fccks \u2013 auch wenn es heute nicht f\u00e4llig w\u00e4re. '
                   + 'Die Antworten z\u00e4hlen wie beim Lernen.',
  'book.nothing_learnt': 'Noch nichts gelernt',
  'book.nothing_learnt_what': 'Hier steht, was unter \u201eLernen\u201c schon einmal beantwortet wurde.',
  'book.back':       'Zur\u00fcck',
  'book.back_what':  'Die Passage davor, noch einmal offen.',
  'book.applause_title': 'Applaus \u2013 zehn Minuten ge\u00fcbt!',
  'book.applause_text': '{n} Passagen in dieser Runde. Lieber jeden Tag ein bisschen: jetzt weiterlernen oder morgen weitermachen?',
  'book.continue':   'Weiterlernen',
  'book.tomorrow':   'Lieber morgen',
  'book.dbl_hint':   'Ein Doppeltipp auf eine Passage \u00f6ffnet ihre Kommentare.',
  'book.more_before': '\u25b2 mehr davor',
  'book.more_after': '\u25bc mehr danach',
  'book.none':       'Keine eigenen Passagen im Drehbuch.',
  'book.link_title': 'Link zu meinem Rollenheft',
  'book.link_what':  '\u00d6ffnet dieses Heft auf jedem Ger\u00e4t ohne Anmeldung \u2013 zum Speichern am Handy '
                   + 'oder zum Weiterleiten. Er steht f\u00fcr die Person, der das Heft geh\u00f6rt, und geht nur an sie.',
  'book.share':      'teilen \u2026',
  /* die t\u00e4gliche Erinnerung */
  'book.remind':     'Erinnerung',
  'book.remind_what': 'Das Handy meldet sich t\u00e4glich zur gew\u00e4hlten Zeit mit dem Stand des Tages \u2013 und eine Stunde vor jeder fixierten Probe, bei der du dabei bist.',
  'book.remind_time': 'Uhrzeit',
  'book.remind_on':  'Einschalten',
  'book.remind_off': 'Ausschalten',
  'book.remind_test': 'Probe schicken',
  'book.remind_active': 'Erinnerung an, t\u00e4glich um {zeit}.',
  'book.remind_elsewhere': 'Auf einem anderen Ger\u00e4t eingeschaltet, um {zeit}. Hier zus\u00e4tzlich:',
  'book.remind_inactive': 'Aus.',
  'book.remind_unsupported': 'Dieser Browser kann keine Mitteilungen empfangen.',
  'book.remind_ios': 'Am iPhone geht das erst, wenn die Seite als App am Home-Bildschirm liegt (Teilen \u2192 \u201eZum Home-Bildschirm\u201c).',
  'book.remind_denied': 'Mitteilungen sind f\u00fcr diese Seite gesperrt \u2013 in den Browser-Einstellungen freigeben.',
  'book.remind_failed': 'Das hat nicht geklappt. Noch einmal versuchen.',
  'book.remind_sent': 'Probe unterwegs \u2013 sie sollte gleich auftauchen.',
  'push.title':      '{title}: Zeit f\u00fcr deinen Text',
  'push.body':       'Heute f\u00e4llig: {due} \u00b7 neu: {fresh}. Eine kurze Runde reicht.',
  'push.body_done':  'Alles sitzt \u2013 eine Runde Wiederholen h\u00e4lt es warm.',
  'push.body_none':  'Noch kein Text im Heft \u2013 schau nach, ob das Drehbuch schon da ist.',
  'push.next_rehearsal': 'N\u00e4chste Probe {id}: {when} {von}.',
  'push.today':      'heute',
  'push.tomorrow':   'morgen',
  'push.rehearsal_title': '{title}: Probe {id} in einer Stunde',
  'push.rehearsal_body':  'Um {von}{bis}{ort}{with}.',
  'push.with':       'mit {who}',
  'push.test_title': 'Probe-Mitteilung',
  'push.test_body':  'So sieht die Erinnerung aus. Sie kommt t\u00e4glich um {zeit}.',

  /* ---------- die App am Handy ---------- */
  'pwa.short':         'Proben',
  'pwa.install_title': 'Als App aufs Handy',
  'pwa.install_title_play': '\u201e{title}\u201c als App aufs Handy',
  'pwa.install_what':  'Dann liegen Rollenheft und Kalender wie eine App am Startbildschirm, ohne Browserleiste.',
  'pwa.install':       'Installieren',
  'pwa.later':         'sp\u00e4ter',
  'pwa.ios':           'Am iPhone: das Teilen-Symbol in Safari, dann \u201eZum Home-Bildschirm\u201c.',
  'pwa.android':       'Im Browser-Men\u00fc (\u22ee) \u201eApp installieren\u201c oder \u201eZum Startbildschirm hinzuf\u00fcgen\u201c w\u00e4hlen.',
  'pwa.offline_t':     'Offline',
  'pwa.offline':       'Keine Verbindung. Sobald das Netz wieder da ist, geht es weiter.',
  'pwa.retry':         'Noch einmal versuchen',

  /* ---------- Kommentare ---------- */
  'kd.new':          'Neuer Kommentar bei Replik {nr}',
  'kd.text':         'Kommentar',
  'kd.question':     'Frage an die Regie',
  'kd.question_mark': 'Frage an die Regie',
  'kd.done':         'beantwortet',
  'kd.save':         'Sichern',
  'kd.cancel':       'Abbrechen',
  'kd.close':        'Schlie\u00dfen',
  'kd.comments':     'Kommentare',
  'kd.answer':       'Antwort',
  'kd.delete':       'l\u00f6schen',
  'kd.signin':       'Zum Kommentieren das Skript \u00fcber den Ensemble-Link oder das eigene '
                   + 'Rollenheft \u00f6ffnen \u2013 dann tr\u00e4gt der Kommentar Ihren Namen.',
  'kd.hint':         'Doppelklick auf eine Zeile: Kommentar dazu.',
  'kd.scenes':       'Szenen dieser Probe',
  'kd.all_rehearsals': 'Alle Proben',
  'kd.failed':       'Das lie\u00df sich nicht speichern.',
  'kd.rehearsal':    'Probe',
  'kd.scene':        'Szene',
  'kd.prev_comment': 'voriger Kommentar',
  'kd.next_comment': 'n\u00e4chster Kommentar',
  'kd.prev_mine':    'meine vorige Stelle',
  'kd.next_mine':    'meine n\u00e4chste Stelle',
  'kd.no_comments':  'keine Kommentare',
  'kd.person':       'Person',
  'kd.zoom_in':      'Schrift gr\u00f6\u00dfer',
  'kd.zoom_out':     'Schrift kleiner',
  'kd.scene_of':     'Szene {k} von {n}',
  'kd.check':        'Abpr\u00fcfen',
  'kd.check_title':  'Text der gew\u00e4hlten Person verdecken und abfragen',
  'kd.check_hint':   'Abpr\u00fcfen: Klick auf eine verdeckte Stelle zeigt die Anfangsbuchstaben, der n\u00e4chste den Text. Dann H\u00e4kchen oder Kreuz.',
  'kd.check_ok':     'sitzt',
  'kd.check_no':     'nochmal',
  'kd.check_step':   'Stufe {s}',
  'cmt.title':       'Kommentare',
  'cmt.what':        'Was das Ensemble ins Skript, in die Rollenhefte und in den Probenplan '
                   + 'geschrieben hat. Fragen an die Regie stehen zuerst; eine Antwort geht an die '
                   + 'Person zur\u00fcck und erscheint neben der Zeile in ihrem Skript.',
  'cmt.questions':   'Fragen an die Regie',
  'cmt.no_questions': 'Keine offenen Fragen.',
  'cmt.all':         'Alle anderen Kommentare',
  'cmt.none':        'Noch keine Kommentare.',
  'cmt.question':    'Frage an die Regie',
  'cmt.done':        'beantwortet',
  'cmt.done_mark':   'als beantwortet markieren',
  'cmt.reopen':      'wieder \u00f6ffnen',
  'cmt.delete':      'l\u00f6schen',
  'cmt.delete_confirm': 'Diesen Kommentar l\u00f6schen?',
  'cmt.answer':      'Antwort',
  'cmt.answer_hint': 'antworten \u2026',
  'cmt.answer_save': 'antworten',
  'cmt.director':    'Regie',
  'cmt.at':          'Stichwort {nr}',
  'cmt.doc_gesamt':  'Gesamtskript',
  'cmt.doc_rolle':   'Rollenheft',
  'cmt.doc_probenplan': 'Probenplan',
  'mcmt.title':      'Meine Kommentare',
  'mcmt.what':       'Doppelklick auf eine Zeile im Skript, im Rollenheft oder im Probenplan: '
                   + 'Kommentar dazu. Mit H\u00e4kchen \u201eFrage an die Regie\u201c erscheint die '
                   + 'Antwort hier und neben der Zeile.',
  'mcmt.none':       'Noch keine Kommentare.',
  'r.comment_gone':  'Diesen Kommentar gibt es nicht.',
  'r.answer_saved':  'Antwort gespeichert \u2013 die Person sieht sie neben der Zeile.',
  'r.answer_removed': 'Antwort entfernt.',
  'r.comment_done':  'Als beantwortet markiert.',
  'r.comment_reopened': 'Wieder ge\u00f6ffnet.',
  'r.comment_deleted': 'Kommentar gel\u00f6scht.',

  /* ---------- wie die Sprecher geschrieben sind ---------- */
  'upl.style':        'Sprecher im Text',
  'upl.style_auto':   'automatisch erkennen',
  'upl.style_colon':  'NAME: Text – Name mit Doppelpunkt vor der Replik',
  'upl.style_dot':    'NAME. allein auf der Zeile, die Replik darunter (Gutenberg-Ausgaben)',
  'upl.style_what':   'Meist erkennt das Programm selbst, welche der beiden Formen es ist. '
                    + 'Wenn nicht, sagt es das, und Sie wählen hier und laden noch einmal hoch.',
  'r.style_unknown':  'Es ist nicht klar, wie die Sprecher geschrieben sind: {colon} Zeilen sehen '
                    + 'aus wie „NAME: Text“, {dot} wie „NAME.“ allein auf der '
                    + 'Zeile. Bitte unten die Form wählen und die Datei noch einmal hochladen.',
  'r.no_speaker_dot': 'Darin wurde kein einziger Sprecher gefunden. In dieser Form steht der Name '
                    + 'allein auf seiner Zeile, in Grossbuchstaben, mit Punkt – etwa '
                    + '„BANQUO.“ – und die Replik folgt auf der nächsten Zeile.',
};
