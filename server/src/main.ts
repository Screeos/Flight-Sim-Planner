import { Status } from "https://deno.land/std@0.79.0/http/http_status.ts";

import {
    Application,
    BadRequestException
} from "https://deno.land/x/abc@v1.1.0/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.13.0/mod.ts";
import { parse as parseToml } from "https://deno.land/std@0.74.0/encoding/toml.ts";
import {
    validate,
    firstMessages,
    required,
    isNumber,
    isString,
    validateObject,
    validateArray,
} from "https://deno.land/x/validasaur/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";
import { nanoid } from "https://deno.land/x/nanoid/mod.ts";

/**
 * Throws an exception if data does not pass validation.
 * @param data To validate.
 * @param schema Schema to test data.
 * @returns True if data is valid, never returns false instead throws an exception.
 * @throws string If data is not valid.
 */
async function isValid(data: any, schema: any): Promise<boolean> {
    const [ passes, errs ] = await validate(data, schema);
    if (passes === false) {
	   const firstErrs = firstMessages(errs);
	   
	   let msgs = Object.keys(firstErrs).map((key: string) => {
		  let nameParts = key.split(".");
		  if (nameParts.length > 1) {
			 nameParts.splice(nameParts.length - 1, 1);
		  }

		  const name = nameParts.join(".");

		  return `for ${name}: ${firstErrs[key]}`;
	   });
	   
	   throw new BadRequestException(msgs.join(", "));
    }

    return true;
}

/**
 * Validasaur schema for a MongoDB ObjectID key.
 */
const DBKeySchema = {
    _id: validateObject(true, {
	   $oid: [ required, isString ],
    }),
};

/**
 * Plan stored in database. Includes secret and database information.
 */
interface SecretDBPlan extends SecretPlan {
    /**
	* MongoDB object ID.
	*/
    _id: { $oid: string },
}

/**
 * Plan stored in database without secret information.
 */
interface PublicDBPlan extends PublicPlan {
    /**
	* MongoDB object ID.
	*/
    _id: { $oid: string },
}

/**
 * Plan stored in a database. Adds secret information which API clients should never 
 * receive.
 */
interface SecretPlan extends PublicPlan {
    /**
	* BCrypt hash of secret value which can be used to grant admin access to a plan.
	*/
    secretHash: string,
}

/**
 * Records a location. 
 */
interface Location {
    /**
	* Latitude, always required.
	*/
    latitude: number,
    
    /**
	* Longitude, always required.
	*/
    longitude: number,

    /**
	* Altitude in meters.
	*/
    altitudeMeters: number,

    /**
	* Heading in degrees from true north.
	*/
    heading: number,

    /**
	* If an airport, its ICAO, null if not an airport or unknown.
	*/
    airportICAO: string | null,
}

/**
 * Validasaur schema for Location interface.
 */
const LocationSchema = {
    latitude: [ required, isNumber ],
    longitude: [ required, isNumber ],
    altitudeMeters: [ required, isNumber ],
    heading: [ required, isNumber ],
    airportICAO: [ isNumber ],
};

/**
 * Leg of a flight. Includes position and time data. Probably more IFR sort of information
 * later as well.
 */
interface FlightLeg {
    /**
	* Location.
	*/
    location: Location,

    /**
	* Time in real world unix time (not game time!).
	*/
    time: number,
}

/**
 * Validasaur schema for FlightLeg interface.
 */
const FlightLegSchema = {
    location: validateObject(true, LocationSchema),
    time: [ required, isNumber ],
};

/**
 * How and when a flight traveled or will travel. Can be used to represent a plan by
 * setting the parameters aspirationly or as a recording of a flight by recording
 * parameters how they were. However to the user there is never this wishy washyness. They
 * will only be able to record and do recording things to Flight's meant as recordings. 
 * And only be able to plan and doing planning things to Flight's meant as plans.
 */
interface Flight {
    /**
	* Type of aircraft being flown. Must be an ICAO aircraft type designator.
	*/
    aircraft: string,
    
    /**
	* Legs of the flight. Made up as a series of 5-dimensional (x, y, z, heading, time)
	* points on the earth. There must / will always be at least two legs. The first is
	* the origin of the flight, and the second is the destination. Each point in between 
	* these is the enroute path of the flight.
	*/
    legs: FlightLeg[],
}

/**
 * Validasaur schema for Flight interface.
 */
const FlightSchema = {
    aircraft: [ required, isString ],
    legs: validateArray(true, validateObject(true, FlightLegSchema)),
};

/**
 * A recording of a flight. Time and position data for the flight is still recorded using
 * the Flight interface. This interface's purpose is to assign some player identity 
 * information to this flight.
 */
interface FlightRecording {
    /**
	* Name of player. Should be a gamer tag / user name.
	*/
    playerName: string,

    /**
	* Actual flight data.
	*/
    flight: Flight,
}

/**
 * Validasaur schema for FlightRecording interface.
 */
const FlightRecordingSchema = {
    playerName: [ required, isString ],
    flight: validateObject(true, FlightSchema),
}

/**
 * Plan for a flight. This encompasses everything involved in the before, during, and
 * after of the event.
 */
interface PublicPlan {
    /**
	* Headline of plan which is show to describe the event. Should be relatively short.
	*/
    title: string,

    /**
	* When the event will occur. Unix time in real life (not game).
	*/
    when: number,

    /**
	* Organizer's name, can be a screen name.
	*/
    organizerName: string,

    /**
	* Description of event. Can use markdown.
	*/
    description: string,

    /**
	* The details of the flight plan.
	*/
    flightPlan: Flight,

    /**
	* Recording of actual flight which took place, from all user's who joined this plan.
	*/
    flightRecording: FlightRecording[],
}

/**
 * Validasaur schema for Plan interface.
 */
const PublicPlanSchema = {
    title: [ required, isString ],
    when: [ required, isNumber ],
    organizerName: [ required, isString ],
    description: [ required, isString ],
    flightPlan: validateObject(true, FlightSchema),
    flightRecording: validateArray(true, validateObject(true, FlightRecordingSchema)),
};

// Load configuration
/**
 * Application configuration file format.
 */
interface Config {
    http: {
	   /**
	    * Port on which the HTTP API server will listen.
	    */
	   port: number,
    },
    db: {
	   /**
	    * Mongo connection URI.
	    */
	   uri: string,

	   /**
	    * Name of the database of which to store data.
	    */
	   dbName: string,
    },
}

/**
 * HTTP API server configuration.
 */
interface HTTPConfig {
    /**
	* Port on which the HTTP API server will listen.
	*/ 
    port: number,
}

/**
 * MongoDB configuration.
 */
interface DBConfig {
    /**
	* Mongo connection URI.
	*/
    uri: string,

    /**
	* Name of the database of which to store data.
	*/
    dbName: string,
}

async function IsConfig(data: any): Promise<Config> {
    await isValid(data, {
	   http: validateObject(true, {
		  port: [ required, isNumber ],
	   }),
	   db: validateObject(true, {
		  uri: [ required, isString ],
		  dbName: [ required, isString ],
	   }),
    });
    return data as Config;
}

let cfg = await IsConfig(parseToml(await Deno.readTextFile("./config.toml")));

// Connect to MongoDB
const dbClient = new MongoClient();
await dbClient.connectWithUri(cfg.db.uri);

const db = dbClient.database(cfg.db.dbName);
const dbPlans = db.collection<SecretDBPlan>("plans");

// Define handlers
const app = new Application();

/* Endpoint.
 * ---
 * Get API health.
 * 
 * Request method: GET
 * 
 * Responses:
 *   - Code: 200
 *     Body: HealthResp
 * ---
 */

interface HealthResp {
    ok: boolean
}

app.get("/api/v0/health", (c) => {
    const resp: HealthResp = {
	   ok: true,
    };
    return c.json(resp);
});

/* Endpoint.
 * ---
 * Create a plan. This will store it in the database and return the resulting
 * object. The plain text secret value will also be returned for the only time.
 *
 * Request method: POST 
 * Request body: CreatePlanReq
 *
 * Responses:
 *   - Code: 201
 *     Body: CreatePlanResp
 * ---
 */

interface CreatePlanReq {
    /**
	* The plan to create.
	*/
    plan: PublicPlan,
}

interface CreatePlanResp {
    /**
	* Created plan.
	*/
    plan: PublicDBPlan,

    /**
	* Secret code which can be used to authenticate that the user is an admin of this
	* plan. Only provided this one time.
	*/
    secret: string,
}

app.post("/api/v0/plans", async (c) => {
    // Get plan to create from body
    const rawBody = await c.body as CreatePlanReq;
    
    await isValid(rawBody, {
	   plan: validateObject(true, PublicPlanSchema),
    });
    const body = rawBody as CreatePlanReq;

    // Generate random secret
    // According to https://zelark.github.io/nano-id-cc/ 14 characters at 10,000 ID / hour
    // it would take 7 thousand years to have a 1% change of collision.
    const secret = nanoid(14);
    const secretHash = await bcrypt.hash(secret);

    // Store plan in DB
    const insertedId = await dbPlans.insertOne({
	   secretHash: secretHash,
	   ...body.plan,
    });

    // Respond
    const resp: CreatePlanResp = {
	   plan: {
		  _id: insertedId,
		  ...body.plan,
	   },
	   secret: secret,
    };
    
    return c.json(resp, Status.Created);
});

// Start server
console.log(`starting HTTP API server on :${cfg.http.port}`);
app.start({
    port: cfg.http.port
});
