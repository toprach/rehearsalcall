# How the script has to be formatted

The tool reads **`.docx`** (Word, LibreOffice, Google Docs → "Download as
Word") and **`.md`**. Take `.docx` if you have the choice: Word states
explicitly where a paragraph ends and where a line merely wraps. In the
Markdown export the tool has to guess, and it guesses wrong now and then.

**One paragraph, one line.** On the Markdown path every source line is read on
its own. A stage direction wrapping across two lines therefore falls into two
pieces, and the asterisks end up visible in the text. In a `.docx` this is a
non-issue — there a paragraph may wrap as much as it likes. One more reason
for Word.

None of this is a rigid schema — the rules are built so that a normally
typeset theatre script already fits. The points below say what matters when
something is not recognised.

---

## 1. Who is speaking

A paragraph begins with the name, followed by a **colon**:

    ROGER: But darling, why did you lock the door?

That is enough. Bold is allowed but not needed — all formatting in the name
zone is ignored. Everything below is recognised alike:

    ROGER: …            **ROGER**: …            **ROGER:** …
    MRS.CLACKETT: …     **MRS C**.: …           ROGER : …

**Limits.** The colon has to appear within the first 60 characters, the name
may be at most 40 characters long and consist of letters, digits, `.`, `/`,
`'`, `-` and spaces. That is why

    …off to the dressing rooms. VICKI: Anyone there?

is *not* read as a speaker line — and rightly so, because the sentence before
it still belongs to the previous speech. A speaker line always starts a new
paragraph.

**Without a colon**, a bold name followed by a tab works too:

    **Mrs Clackett**→Yes, yes, let it ring…

**Two speakers at once** — both say the same line:

    PHILIP: und FLAVIA: No!
    MACBETH: and LENNOX: What's the matter?

The tool splits double speakers on `/` and on the words `und` and `and`.

**Name alone on its line.** Editions from Project Gutenberg, and many
older printed plays, write the speaker without a colon, in capitals, alone
on a line and ending in a full stop; the speech follows underneath:

    BANQUO.
    How goes the night, boy?

The tool recognises that style by itself: it counts both forms, and when
one of them clearly wins (at least ten times, and three times as often as
the other) it takes that one. When the count is not conclusive it says so,
and you choose the style by hand — in the tool next to the file field, on
the server on the upload page. In this style a name must be in capitals
and stand alone; `Exeunt.` and `ACT II.` are not taken for speakers, and a
colon in the middle of a verse line does not make one either. Two names
joined by a comma, `MACBETH, LENNOX.`, are both speakers of the line. Two
complete plays in this style are in
[`beispiel/shakespeare/`](beispiel/shakespeare).

**Continuation.** All further paragraphs belong to the same speaker until a
new speaker, a heading or a table comes along. Blank lines and stage
directions in between do **not** end the speech — which is exactly how most
scripts are written:

    MRS.CLACKETT: Yes, yes, let it ring.

    (Puts down the sardines and picks up the receiver.)

    Hello…? No, Mr Brent isn't here.

The last paragraph still belongs to Mrs Clackett.

**Misspellings and short forms** do not have to be corrected in the text. The
tool lists every speaker it cannot place and suggests the closest known
spelling ("EINBRECHER/S." → "EINBRECHER"). The assignment is kept in the
configuration.

## 2. Stage directions

A paragraph counts as a stage direction if it is **entirely italic** **or**
entirely **in brackets**:

    *Enter ROGER, with the cardboard box.*
    (Opens the door to the service quarters.)

In the middle of a speech, put them in brackets, italic as well if you like:

    ROGER: *(puts the box down)* Through here, through here.

A speaker line stays a speaker line even when all the rest is italic — the
known name trumps the italic rule.

**Names in stage directions** are recognised when they are in **capital
letters**. That is the only way entrances, exits and mime reach the right
person's part book and the rehearsal planning. So `Enter ROGER`, not
`Enter Roger`.

## 3. Acts and chapters

The tool recognises acts by their heading, in German or in English — bold or
as a heading, it makes no difference; there may be as many acts as the play
has:

    ERSTER AKT      ZWEITER AKT     DRITTER AKT     FÜNFTER AKT
    ACT ONE         ACT TWO         ACT THREE       ACT FIVE
    ACT I           ACT II          ACT 3
    FIRST ACT       SECOND ACT      THIRD ACT

The number does not come from the word: acts are counted in the order their
headings appear, so any of these spellings gives the same result. Further
levels of division use Markdown headings or Word heading styles:

    # ACT ONE
    ## Before the curtain
    ### Number 3

The chapter list in the interface can then be shown and hidden entry by entry
— handy for leaving out everything from the third act onwards, say.

A heading that looks like a stage direction (`# *Enter MICKEY*`) stays a stage
direction. Bare page numbers and horizontal rules are skipped.

## 4. Cut passages

Struck-through text is kept but marked as cut, and can be left out entirely on
request. In Word use ordinary strikethrough, in Markdown `~~like this~~`.

## 5. Two columns running at the same time

For passages where something happens backstage and on stage at once (in
„Der nackerte Waunsinn" that is the whole second act), use a **table with two
columns**: backstage on the left, on stage on the right.

| Backstage | On stage |
|---|---|
| *Enter MICKEY* | *Enter MRS.CLACKETT with a plate of sardines* |
| | MRS.CLACKETT: Yes, yes, let it ring… |

A table row is one unit: it is never torn apart, neither in the part book nor
in the rehearsal planning. **Blank lines inside a cell time the two columns
against each other** — put as many blank lines on the left as it takes for the
matching passage to sit beside it on the right. That is exactly how it was
typeset in the original, and that is how it is carried over.

## 6. Fonts

So that lines break in print the way they do in your template, the tool takes
over the **font embedded in the `.docx`**. In Word: *File → Options → Save →
Embed fonts in the file*. Without an embedded font, Liberation Sans is used —
metrically like Arial, so the line breaks may differ slightly.

Printing is A4 portrait, single column, through Chrome's print preview.

## 7. The casting

The assignment of names is not guessed from the text but entered once and
saved as JSON. Two examples are included:

* [`beispiel/demo-einfach.json`](beispiel/demo-einfach.json) — an ordinary
  play. There is the **role** and the **actor**; `roles` stays empty.
* [`beispiel/demo-stueck-im-stueck.json`](beispiel/demo-stueck-im-stueck.json)
  — a play within a play, as in *Noises Off*: the **actor** plays a **company
  member** who on stage steps into a **role**. `innerTitle` is the title of
  the inner play.

If nobody has an entry under `roles`, the output leaves out the third level by
itself: no grey boxes, no extra column on the title page. You do not have to
set anything for that.

Further fields:

| Field | Meaning |
|---|---|
| `b` | name as it stands before the colon in the script |
| `bFull` | full name for the title page and the cast list |
| `a` | the actor |
| `funktion` | director, stage manager, prompter … (does not speak) |
| `ich` | marks your own person: text in yellow, own name highlighted |
| `aliases` | divergent spellings that point to this name |
| `roles[].c` | role on stage (only for a play within a play) |
| `roles[].voiceC` | voice description for the speech output |
| `tokenMap` | additional assignments the interface creates itself |

## 8. For trying it out

[`beispiel/demo-stueck.md`](beispiel/demo-stueck.md) is a short, entirely
invented play on which everything can be followed: speakers, stage
directions, acts, a sub-heading, a cut line. It is in German; an English script
works just as well. Load
[`beispiel/demo-einfach.json`](beispiel/demo-einfach.json) as the
configuration to go with it.

Two complete plays in English, *A Midsummer Night's Dream* and *Macbeth*,
are in [`beispiel/shakespeare/`](beispiel/shakespeare), together with a
casting for the *Dream* and a prompt book that shows what a director's
working copy can hold. They also serve as the test material for the
server (see `server/test/`).

## 9. When something is not recognised

After loading, the interface shows a list of **all** speakers it found with
the number of their appearances, and above it a separate list of the
**unassigned** ones. If something is in there that is not a speaker, assign it
to "ignore"; if somebody is missing, the colon has usually slipped or the name
is not at the start of the paragraph.
