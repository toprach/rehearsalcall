# Two plays to try things out with

Complete, public-domain plays in the format the tool reads, so that the
software can be tried and tested without anybody's copyrighted script.

| File | What |
|---|---|
| `a-midsummer-nights-dream.md` | *A Midsummer Night's Dream*, five acts, 27 speaking parts |
| `macbeth.md` | *Macbeth*, five acts, 38 speaking parts |
| `midsummer-cast.json` | a casting for the *Dream* for the tool (`Konfiguration laden`): every part a person of its own, invented actor names |
| `midsummer-prompt-book.md` | a prompt book for the *Dream*: scenes, beats, cues, props, entrances and exits, and sample director's notes |
| `gutenberg-to-md.mjs` | the converter that made the two `.md` files; works for any play in the Project Gutenberg HTML edition |

## Where the texts come from

The plays are the Project Gutenberg editions, eBook #1514 (*A Midsummer
Night's Dream*) and #1533 (*Macbeth*), fetched from gutenberg.org and
converted with the script in this directory:

    node gutenberg-to-md.mjs pg1514-images.html a-midsummer-nights-dream.md
    node gutenberg-to-md.mjs pg1533-images.html macbeth.md

Shakespeare's text is in the public domain everywhere. The Project
Gutenberg header, footer and licence have been removed, as the Project
Gutenberg licence provides for when the files are not distributed under
its trademark; nothing of Project Gutenberg's own remains in these files.

The conversion keeps the Gutenberg way of writing the speaker - the name
alone on its line, in capitals, ending in a full stop:

    BANQUO.
    How goes the night, boy?

The tool recognises that style by itself (see `DREHBUCH-FORMAT.md`), and
these two files are what exercises it. The only other change the
converter makes is to set the names in stage directions in capitals
(`Enter OBERON`), which is how the tool tells an entrance from a word;
the HTML edition marks them, so nothing is guessed.

## The prompt book and the casting

`midsummer-prompt-book.md` and `midsummer-cast.json` were written for
this repository. They are released under **CC0 1.0** (public domain
dedication): use them for anything, no attribution needed. The actor
names in the casting are invented.

## Using them

Server: upload `a-midsummer-nights-dream.md` on the script page, take
the casting over as proposed (every name a person of its own; `ALL` and
`CHORUS` are recognised as the whole troupe), derive the plan. The
end-to-end test does exactly that:

    node test/workflow.mjs http://127.0.0.1:3011 <access-code> ../beispiel/shakespeare/a-midsummer-nights-dream.md

Tool: open `theater-md.html`, load the `.md` file, then load
`midsummer-cast.json` as the configuration.
