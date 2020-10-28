import { Application } from 'https://deno.land/x/abc@v1.1.0/mod.ts';
import { createCheckers } from 'https://dev.jspm.io/ts-interface-checker/mod.ts';
import { MongoClient } from 'https://deno.land/x/mongo@v.013.0/mod.ts';
import { parse as parseToml } from 'https://deno.land/std@0.74.0/encoding/toml.ts';

import ConfigTI from './config-ti.ts';

// Setup type guards
const { ConfigGuard } = createCheckers(configTI);

// Load configuration
const cfg = parseToml(await Deno.readTextFile('./config.toml'));

// Define handlers
const app = new Application();

interface HealthResp {
    ok: boolean
}

app.get('/api/v0/health', (c) => {
    const resp: HealthResp = {
	   ok: true,
    };
    return c.json(resp);
});


// Start server
console.log(`starting HTTP API server on :${cfg.httpPort}`);
app.start({
    port: cfg.httpPort
});
