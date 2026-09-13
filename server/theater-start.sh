#!/bin/sh
# ---------------------------------------------------------------------
# Haelt die Probenplanung am Leben.
#
# Laeuft sie schon, tut das Skript nichts. Laeuft sie nicht, wird sie
# gestartet. Gedacht fuer den Crontab, alle paar Minuten aufgerufen -
# dann steht der Dienst nach Absturz oder Serverneustart von selbst
# wieder.
#
# Apache reicht /theater per .htaccess hierher durch; deshalb genuegt
# es, auf 127.0.0.1 zu lauschen. Von aussen ist der Port ohnehin
# gesperrt.
# ---------------------------------------------------------------------

VERZEICHNIS=$HOME/theater-app
SKRIPT=app.js
LOG=$HOME/node.log

# Ein Neustart wurde gewuenscht.
#
# Ohne Shell-Zugang gibt es keinen anderen Weg, den laufenden Dienst zum
# Aufgeben zu bewegen: neue Dateien liegen dann schon da, aber Node hat
# die alten im Speicher. Also legt man eine Datei namens neustart.bitte
# ab, und beim naechsten Crontab-Aufruf raeumt dieses Skript auf.
#
# Die Datei wird ZUERST geloescht. Sonst koennte der Dienst in einer
# Dauerschleife aus Beenden und Starten haengen.
if [ -f "$VERZEICHNIS/neustart.bitte" ]; then
  rm -f "$VERZEICHNIS/neustart.bitte"
  echo "[$(date -Iseconds)] Neustart gewuenscht - beende den Dienst" >> "$LOG"
  pkill -u "$(id -u)" -f "node $SKRIPT"

  # Warten, bis er WIRKLICH weg ist.
  #
  # Der Dienst faehrt auf SIGTERM geordnet herunter, und das dauert
  # laenger als ein paar Sekunden. Weiter unten prueft pgrep, ob schon
  # einer laeuft - ein sterbender Prozess wuerde den Neustart also
  # verhindern, und danach liefe gar nichts mehr. Genau das ist
  # passiert, zweimal.
  i=0
  while pgrep -u "$(id -u)" -f "node $SKRIPT" > /dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -gt 20 ]; then
      echo "[$(date -Iseconds)] geht nicht freiwillig - SIGKILL" >> "$LOG"
      pkill -9 -u "$(id -u)" -f "node $SKRIPT"
    fi
    [ "$i" -gt 25 ] && break
    sleep 1
  done
fi

# Laeuft er schon? Dann Schluss.
if pgrep -u "$(id -u)" -f "node $SKRIPT" > /dev/null 2>&1; then
  exit 0
fi

cd "$VERZEICHNIS" || exit 1

# Zugangsdaten und Geheimnis - die Datei ist nur fuer mich lesbar
if [ -f "$VERZEICHNIS/.env" ]; then
  set -a
  . "$VERZEICHNIS/.env"
  set +a
fi

export PORT=3011
export HOST=127.0.0.1

# Log nicht ins Unendliche wachsen lassen
if [ -f "$LOG" ] && [ "$(wc -c < "$LOG")" -gt 2000000 ]; then
  tail -c 500000 "$LOG" > "$LOG.neu" && mv "$LOG.neu" "$LOG"
fi

echo "[$(date -Iseconds)] Dienst war nicht da - starte neu" >> "$LOG"
setsid nohup node "$SKRIPT" >> "$LOG" 2>&1 &
exit 0
