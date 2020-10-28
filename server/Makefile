.PHONY: run

MAIN_FILE := src/main.ts
GUARD_FILES := src/models.ts src/config.ts

run:
	deno run ${MAIN_FILE}

guards: ${GUARD_FILES}
	ts-interface-builder ${GUARD_FILES}
	sed -i 's/from "ts-interface-builder"/from "https://dev.jspm.io/ts-interface-builder/mod.ts"/g' src/*-ti.ts
