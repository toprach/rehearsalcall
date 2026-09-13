# audio/

Two small command-line tools for trying out speech with ElevenLabs.
They are not needed to run the application - the server produces
audiobooks on its own (see `server/theater/audiobook.mjs`); these are for
listening to a passage or comparing voice settings before committing
credit to a whole act.

The rules that turn a stage direction into an audio tag live in
`server/theater/emotion.mjs`. There is one copy, and both sides use it.

    node elevenlabs-test.mjs <struktur.json> [count] [start]
    node elevenlabs-vergleich.mjs

The key is looked for in `ELEVENLABS_API_KEY`, then in a `.env` beside
these files, then in `elevenlabs.key`. None of those belong in the
repository - see `.gitignore`.
