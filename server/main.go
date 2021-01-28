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
	"go.mongodb.org/mongo-driver/bson/primitive"
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
	ID string

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

// RespondErr sends an error response if err is not nil.
// The response will be a ErrorResp and code 500. The
// err will be logged.
// Returns true when a response was sent and endpoint
// execution should stop. False when no response is sent
// and everything should continue
func (a HTTPAPI) RespondErr(c *gin.Context, msg string, err error) bool {
	if err != nil {
		c.JSON(http.StatusInternalServerError,
			ErrorResp{
				Message: msg,
			})
		log.Error().
			Err(err).
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Msg(msg)
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
	router.GET("/api/v0/health", a.EPTHealth)
	router.POST("/api/v0/flight_plan",
		a.EPTCreateFlightPlan)

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
	c.JSON(200, EPTHealthResp{
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
	sent := a.RespondErr(c,
		"failed to save in database", err)
	if sent {
		return
	}

	// Respond with inserted
	insertedFP := req.FlightPlan
	insertedFP.ID = insertRes.InsertedID.(primitive.ObjectID).Hex()

	c.JSON(200, EPTCreateFlightPlanResp{
		FlightPlan: insertedFP,
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
