import { Application } from 'https://deno.land/x/abc@v1.1.0/mod.ts';
import { MongoClient } from 'https://deno.land/x/mongo@v0.13.0/mod.ts';
import { parse as parseToml } from 'https://deno.land/std@0.74.0/encoding/toml.ts';
import {
    validate,
    flattenMessages,
    required,
    isNumber,
    validateObject,
} from "https://deno.land/x/validasaur/mod.ts";

/**
 * Throws an exception if data does not pass validation.
 * @param data To validate.
 * @param schema Schema to test data.
 * @returns True if data is valid.
 * @throws string If data is not valid.
 */
async function isValid(data: any, schema: any): Promise<boolean> {
    const [ passes, errs ] = await validate(data, schema);
    if (passes === false) {
	   const flatErrs = flattenMessages(errs);
	   
	   let msgs = Object.keys(flatErrs).map((key: string) => {
		  let nameParts = key.split('.');
		  if (nameParts.length > 1) {
			 nameParts.splice(nameParts.length - 1, 1);
		  }

		  const name = nameParts.join('.');

		  return `for ${name}: ${flatErrs[key]}`;
	   });
	   
	   throw msgs.join(', ');
    }

    return true;
}

// Load configuration
/**
 * Application configuration file format.
 */
interface Config {
    /**
	* Port on which the HTTP API server will listen.
	*/ 
    httpPort: number
}

async function IsConfig(data: any): Promise<Config> {
    await isValid(data, {
	   http: validateObject(true, {
		  httpPort: [ required, isNumber ],
		  bar: required,
	   }),
    });
    return data as Config;
}

let cfg: Config = null;
try {
    cfg = await IsConfig(parseToml(await Deno.readTextFile('./config.toml')));
} catch (e) {
    console.error(`failed to get configuration: ${e}`);
    Deno.exit(1);
}

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
