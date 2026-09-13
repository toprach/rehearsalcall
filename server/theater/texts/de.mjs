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

  /* ---------- wording used all over ---------- */
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
  'entry.code_hint':  'z. B. ruhig-probe-42',
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
  'mem.switch':     'Sitzt jemand mit Ihnen beisammen?',
  'mem.switch_what': 'Wählen Sie einen Namen, dann tragen Sie Zeiten für diese '
                    + 'Person ein und sehen deren Termine. Das kann jeder im '
                    + 'Ensemble – es ist für den Abend gedacht, an dem zwei '
                    + 'gemeinsam Termine ausmachen.',
  'mem.switch_who': 'arbeiten für \u2026',
  'mem.switch_go': 'umschalten',
  'mem.switch_confirm': 'Sie tragen ab jetzt für {name} ein. Fortfahren?',
  'mem.my_times': 'Meine Zeiten',
  'mem.my_rehearsals': 'Meine Proben',
  'mem.part_book':   'Rollenheft',
  'mem.full_script': 'Gesamtskript',
  'mem.evenings_yes':    '{n} Abende eingetragen – <a href="/theater/mit/zeiten">ändern</a>',
  'mem.evenings_no': '<span class="open">noch nichts</span> – '
                    + '<a href="/theater/mit/zeiten">jetzt eintragen</a>',
  'mem.rehearsals_yes':    '{n}, davon {fixed} mit festem Termin – '
                    + '<a href="/theater/mit/termine">ansehen</a>',
  'mem.rehearsals_no': '<span class="muted">noch kein Probenplan</span>',
  'mem.book_open':     '<a href="/theater/mit/heft" target="_blank" rel="noopener">öffnen</a> '
                    + '– nur meine Passagen, im Browser druckbar',
  'mem.no_script':    '<span class="muted">noch kein Drehbuch</span>',
  'mem.full_open':   '<a href="/theater/mit/gesamt" target="_blank" rel="noopener">öffnen</a>',

  /* ---------- the bar in a printed document ---------- */
  'bar.times':    'Meine Zeiten',
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
  'navm.times':    'Meine Zeiten',
  'navm.dates':   'Termine',

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
  'cast.who_plays':   'Wer spielt das?',
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
  'cast.help_person': '<b>eigene Person</b> – steht selbst auf der Probenliste. Hier '
                    + 'gehört der Name der Schauspielerin oder des Schauspielers dazu.',
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
  'text.scene_head':  '{act} \u00b7 Stichwort {from}\u2013{to} \u00b7 {min} min \u00b7 '
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
  'comp.col_short':   'Kürzel',
  'comp.col_name':      'Name',
  'comp.col_available':      'Verfügbarkeit',
  'comp.name_hint':   'Name',
  'comp.evenings':       '{n} Abende',
  'comp.entered':  'eingetragen',
  'comp.still_missing':   'fehlt noch',
  'comp.remove':    'entfernen',
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
  'date.confirm':  'bestätigen',
  'date.none_possible':       'kein Termin möglich',
  'date.none_yet':  'noch kein Termin',
  'date.also':         'auch möglich: {days}',
  'date.scenes_min':   '{scenes} Szenen, {min} min Spielzeit',
  'date.possible_n':   '{n} mögliche Abende',

  /* ---------- dates, the company's view ---------- */
  'mdate.title':       'Meine Termine',
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
  'my.title':        'Meine Zeiten',
  'my.holds':         'Das gilt derzeit für Sie: {n} Abende',
  'my.holds_1':       'Das gilt derzeit für Sie: ein Abend',
  'my.last_saved':      'Zuletzt gespeichert: {when}',
  'my.nothing':       'Sie haben noch keine Abende eingetragen. Tippen Sie im Kalender auf '
                    + 'einen Tag.',
  'my.needed_for':    'Sie werden für {n} Proben gebraucht: ',
  'my.with':          'mit {who}',
  'my.evenings_n':     '{n} Abend(e)',
  'my.all_others':  'alle anderen können',
  'my.half':      'mindestens die Hälfte',
  'my.one':        'einer',
  'my.me':          'ich habe zugesagt',
  'my.save':    'Speichern',
  'my.only_after':    ' — die Eintragungen gelten erst nach dem Speichern.',
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
  'my.cannot':   'ich kann nicht',
  'my.time_wrong':  'Die Zeit „bis“ muss nach „ab“ liegen.',

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
  'r.now_fixed': '{p1} ist jetzt fest vereinbart. Tragen Sie noch den Ort ein und sagen Sie ihn den anderen.',
  'r.released': '{p1} wieder freigegeben.',
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
