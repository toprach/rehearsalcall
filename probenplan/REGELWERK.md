# Finding rehearsal scenes — the rules

## 1. Timeline

The play is broken into **units** (a block of the script; in the second act a
table row is one unit, because the two columns run at the same time and cannot
be separated). 1,929 units, 15,616 spoken words, around 120 minutes of playing
time at 130 words per minute.

Counting is done in **people (level B)**, not in roles: it is Anna who
comes to the rehearsal, not MRS.CLACKETT.

For each unit we record

* who **speaks**, and how many words,
* who is **present without speaking** according to the stage directions
  (entrance, mime) — such a presence counts as 8 word-equivalents, because it
  costs no text but the person still has to be there,
* chorus lines ("ALLE", "DIE ANDEREN") — always counted as absent, because
  they call for the whole troupe (10 places in the play).

## 2. When is a passage a rehearsal scene?

For a group G, every word by a member is a gain and every word by an absent
person is a loss, because the director has to read it out. With

    λ = (1 − p) / p        p = tolerated substitution share

a passage has a positive sum **exactly when** its substitution share stays
below p:

    Σ own − λ·Σ foreign > 0   ⟺   foreign / (own + foreign) < 1/(1+λ) = p

p = 10 % gives λ = 9, p = 20 % gives λ = 4, p = 0 bars any substitution at
all. The threshold is therefore not guessed — it falls out of the arithmetic.

What we look for are the longest passages with a positive sum (Kadane).
Because the search starts over whenever the sum goes negative, **every
initial segment** keeps within the threshold — so a long clean stretch cannot
drag a long foreign stretch along with it.

On top of that:

* **at most 70 substitution words in a row** — 20 % spread evenly is a
  different thing from 20 % in a three-minute monologue read by the director;
* **at least 110 own words and 12 speeches**, otherwise coming together is not
  worth it;
* scenes begin and end with a word of one's own;
* act boundaries are not crossed;
* in the end only those count as the group who actually speak — a group of
  four in which only three get a word becomes a group of three.

## 3. The scoring function

**Yield** — what the rehearsal brings in:

    Yield(S,G) = Σ own words − λ(p) · Σ substitution words − setup
    setup = 60 word-equivalents (finding the place, setting up)

**Cost** — why small groups are better: if each person is free on any given
evening with probability q, a date for |G| people works out with q^|G|, so one
needs q^−|G| attempts. At q = 0.5, **every further person doubles the effort
of finding a date**.

    Value(S,G) = Yield(S,G) · q^(|G| − 2)          normalised to a pair

A group of five therefore has to get through eight times as much text as a
pair to be worth the same. In the result, that is true of exactly one thing:
the big run-through scene of the third act.

The knobs are in `szenen.mjs` (`STELLSCHRAUBEN`): q, setup, minimum size,
largest block of substitution.

## 4. Which substitution share?

Coverage of the spoken text by rehearsals with at most N people:

    Subst.   2      3       4       5     | director reads (plan of 5s)
       0%   24.7%   50.7%   62.1%   69.8%  |   0.0 min
       5%   24.7%   50.8%   62.1%   71.3%  |   0.2 min
      10%   25.4%   53.1%   64.0%   77.2%  |   1.3 min
      15%   28.4%   57.8%   70.1%   84.0%  |   5.5 min
      20%   36.6%   59.8%   73.1%   86.7%  |   8.8 min
      25%   44.2%   66.9%   77.8%   93.0%  |  21.8 min
      30%   47.1%   69.0%   84.2%   97.0%  |  39.0 min
      40%   58.1%   82.9%   96.3%   97.9%  |  42.8 min

* **5 % is pointless** — the play has no gaps that small.
* **20 % is the sweet spot**: against 0 %, coverage with pairs rises from 25 to
  37 %, with groups of five from 70 to 87 %, and in return the director reads
  out 8.8 minutes across the **whole plan** — spread over 23 rehearsals, not
  half a minute an evening.
* **From 25 % it tips over**: six points more coverage, but the reading jumps
  to 22 minutes, and at 30 % to 39. At that point the director is reading a
  third of the rehearsal, and it is no longer a rehearsal.

**Recommendation: 20 %.** Anyone who wants to be strict takes 10 % — it costs
14 points of coverage, but practically no reading aloud (1.3 minutes across
the whole plan).

## 5. From the catalogue of scenes to the rehearsal plan

What gets chosen is not a scene but a **cast**. If the evening for a given
cast is happening anyway, every further passage for the same people costs
nothing more — and that is exactly how rehearsing should go: a pair takes on
several places from all over the play in one evening.

Greedily: take the best cast by value, then hang every still-open scene of
that cast and of its subsets on the same evening, and repeat until no evening
reaches the minimum value any more.

## 6. Files

    timeline.mjs      timeline from struktur.json
    szenen.mjs        scene search + scoring function
    analyse.mjs       cross table of substitution share × group size
    knick.mjs         finer sampling of where the benefit stops
    probenplan.mjs    selection and bundling  ->  probenplan.json

    node probenplan.mjs [struktur.json] --ersatz 20 --max 5 --mindestwert 40
