package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/Noah-Huppert/goconf"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/bson"
	mprimitive "go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	moptions "go.mongodb.org/mongo-driver/mongo/options"
)

// CheckErr asserts that err is nil. If not logs with
// msg at the Fatal level.
func CheckErr(msg string, err error) {
	if err != nil {
		log.Fatal().Err(err).Msg(msg)
	}
}

// Config for server
type Config struct {
	// HTTP API port
	HTTPHost string `default:":8000"`

	// MongoURI contains the connection details
	MongoURI string `default:"mongodb://dev-tortoise:dev-tortoise@127.0.0.1:27017/"`

	// DBName is the name of mongodb database to
	// store data
	DBName string `default:"Dev-Tortoise"`
}

// FlightPlan describes the details of a simulator flight
type FlightPlan struct {
	// ID unique identifier
	ID mprimitive.ObjectID `bson:"_id"`

	// FromAirport ICAO
	FromAirport string

	// ToAirport ICAO
	ToAirport string

	// Route
	Route string
}

// DBCtx stores relevant database connections
type DBCtx struct {
	// Client is the mongodb client
	Client *mongo.Client

	// DB is a handle for the selected mongodb database
	DB *mongo.Database

	// FlightPlans collection
	FlightPlans *mongo.Collection
}

// HTTPAPI implements the API
type HTTPAPI struct {
	// Ctx is the background context
	Ctx context.Context

	// Config for server
	Config Config

	// DB is the mongodb context
	DB DBCtx
}

// ErrorResp includes details of an error
type ErrorResp struct {
	// Message describing what is happening
	Message string
}

// RespondErr sends a response with code with a body of
// ErrorResp which contains the msg. The err will never
// be sent to the user but might be logged. Msg should
// be written for a user and not start with a capital
// letter (unless first word is an acronym) or end with
// any punctuation, use "we" when refering to the server
// or database ect. For err to be logged the code must
// be 500 or greater and not err cannot be nil.
func (a HTTPAPI) RespondErr(c *gin.Context, code int, msg string, err error) {
	c.JSON(code, ErrorResp{
		Message: msg,
	})

	if code >= 500 && err != nil {
		log.Error().
			Err(err).
			Int("http error code", code).
			Bool("foo", code >= 500).
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Msg(msg)
	}
}

// CheckRespondErr will use RespondErr if err is not
// nil. In this case true will be returned, false
// otherwise. The caller shouldn't continue an endpoint
// handler if true is returned. If code is -1 then
// http.StatusInternalServerError is used by default
func (a HTTPAPI) CheckRespondErr(c *gin.Context, code int, msg string, err error) bool {
	if code == -1 {
		code = http.StatusInternalServerError
	}

	if err != nil {
		a.RespondErr(c, code, msg, err)
		return true
	}
	return false
}

// Start the API via a Gin server
func (a HTTPAPI) Start() error {
	// Setup API
	router := gin.New()

	// Middleware
	router.Use(a.MWLog)

	corsCfg := cors.DefaultConfig()
	corsCfg.AllowAllOrigins = true
	router.Use(cors.New(corsCfg))

	// Routes
	router.GET("/api/v0/health",
		a.EPTHealth)
	router.POST("/api/v0/flight_plan",
		a.EPTCreateFlightPlan)
	router.GET("/api/v0/flight_plan/:id",
		a.EPTGetFlightPlan)

	return router.Run(a.Config.HTTPHost)
}

// MWLog logs every request
func (a HTTPAPI) MWLog(c *gin.Context) {
	log.Debug().
		Str("method", c.Request.Method).
		Str("path", c.Request.URL.Path).
		Msg("http request")
}

// EPTHealthResp health check response.
type EPTHealthResp struct {
	// Indicates if API is okay.
	Ok bool
}

// EPTHealth provides an indication of the APIs
// current health.
func (a HTTPAPI) EPTHealth(c *gin.Context) {
	c.JSON(http.StatusOK, EPTHealthResp{
		Ok: true,
	})
}

// EPTCreateFlightPlanReq
type EPTCreateFlightPlanReq struct {
	// FlightPlan to create
	FlightPlan FlightPlan
}

// EPTCreateFlightPlanResp
type EPTCreateFlightPlanResp struct {
	// FlightPlan which was created
	FlightPlan FlightPlan
}

// EPTCreateFlightPlan creates a flight plan
func (a HTTPAPI) EPTCreateFlightPlan(c *gin.Context) {
	// Get plan to create
	var req EPTCreateFlightPlanReq
	c.BindJSON(&req)

	// Save mongodb
	insertRes, err := a.DB.FlightPlans.InsertOne(
		a.Ctx, req.FlightPlan)
	if a.CheckRespondErr(c, -1,
		"we got your flight plan but failed to "+
			"save it", err) {
		return
	}

	// Respond with inserted
	insertedFP := req.FlightPlan
	insertedFP.ID = insertRes.InsertedID.(mprimitive.ObjectID)

	c.JSON(http.StatusOK, EPTCreateFlightPlanResp{
		FlightPlan: insertedFP,
	})
}

// EPTGetFlightPlanResp provides a requested flight plan
type EPTGetFlightPlanResp struct {
	// FlightPlan which was requested
	FlightPlan FlightPlan
}

// EPTGetFlightPlan retrieves a flight plan who's ID is
// specified as the id url parameter
func (a HTTPAPI) EPTGetFlightPlan(c *gin.Context) {
	// Get requested ID
	fpID, err := mprimitive.ObjectIDFromHex(
		c.Param("id"))
	if a.CheckRespondErr(c, -1,
		"we failed to read the flight plan ID "+
			"you specified", err) {
		return
	}

	// Query database for flight plan
	dbRes := a.DB.FlightPlans.FindOne(a.Ctx, bson.D{{
		"_id", fpID,
	}})
	if dbRes.Err() == mongo.ErrNoDocuments {
		a.RespondErr(c, http.StatusNotFound,
			"no flight plan with that ID was found",
			nil)
		return
	}

	if a.CheckRespondErr(c, -1,
		"we ran into trouble looking for "+
			"flight plans", dbRes.Err()) {
		return
	}

	var foundFP FlightPlan
	if a.CheckRespondErr(c, -1,
		"a flight plan was found but we ran into "+
			"trouble processing the results",
		dbRes.Decode(&foundFP)) {
		return
	}

	// Respond
	c.JSON(http.StatusOK, EPTGetFlightPlanResp{
		FlightPlan: foundFP,
	})
}

func main() {
	ctx := context.Background()

	// Setup logging
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})

	// Load config
	cfgLdr := goconf.NewLoader()
	cfgLdr.AddConfigPath("config.toml")
	cfg := Config{}
	err := cfgLdr.Load(&cfg)
	CheckErr("failed to load config", err)

	// Connect to mongodb
	dbClient, err := mongo.NewClient(moptions.Client().
		ApplyURI(cfg.MongoURI))
	CheckErr("failed to create mongodb client", err)

	dbConnCtx, _ := context.WithTimeout(ctx,
		10*time.Second)
	err = dbClient.Connect(dbConnCtx)
	CheckErr("failed to connect to mongodb", err)

	defer dbClient.Disconnect(ctx)

	db := dbClient.Database(cfg.DBName)
	dbFlightPlans := db.Collection("FlightPlans")

	// Start server
	api := HTTPAPI{
		Ctx:    ctx,
		Config: cfg,
		DB: DBCtx{
			Client:      dbClient,
			DB:          db,
			FlightPlans: dbFlightPlans,
		},
	}
	err = api.Start()
	CheckErr("failed to run API server", err)
}
