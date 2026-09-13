# ---------------------------------------------------------------------
# The rehearsal planner as a container.
#
# One stage is enough: there is no build step. Node runs the sources as
# they are - that is the point of the whole thing.
#
# NO DEPENDENCIES BY DEFAULT. Storage is one JSON file per project, and
# that needs nothing but Node. The image is therefore the base image plus
# a few hundred kilobytes of source; there is no node_modules at all.
#
#   --build-arg WITH_POSTGRES=true
#
# installs the pg driver for those who want a database. It is loaded on
# demand and only when PGUSER is set, so leaving it out costs nothing.
#
# THE PARSING TOOL IS NOT IN THIS IMAGE. theater-md.html is not part of
# the published repository, and the server needs it to read .docx. Mount
# it in:
#
#   docker run -v ./theater-md.html:/app/theater/werkzeug/theater-md.html:ro ...
#
# or point THEATER_WERKZEUG somewhere else. Without it the application
# starts and answers, but uploading a script fails with a message that
# says exactly this.
# ---------------------------------------------------------------------

FROM node:24-alpine

# tini reaps zombies and passes SIGTERM through, so the shutdown handler
# in app.js actually runs.
RUN apk add --no-cache tini

WORKDIR /app

ARG WITH_POSTGRES=false
COPY server/package.json ./
RUN if [ "$WITH_POSTGRES" = "true" ]; then \
      npm install pg --omit=dev --no-audit --no-fund && npm cache clean --force; \
    else \
      echo "no dependencies - storage is files"; \
    fi

COPY server/app.js ./
COPY server/theater-code.mjs ./
COPY server/theater ./theater

# The data directory belongs to the volume, not to the image.
ENV THEATER_DATEN=/data \
    HOST=0.0.0.0 \
    PORT=3011 \
    NODE_ENV=production
VOLUME ["/data"]

# node:alpine brings an unprivileged user called node. The data directory
# has to belong to it, or the first write fails. The mount point for the
# tool is created here so a read-only bind has somewhere to land.
RUN mkdir -p /data /app/theater/werkzeug \
 && chown -R node:node /data /app
USER node

EXPOSE 3011

# The health route answers without touching storage, so it stays cheap.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/gesund || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "app.js"]
