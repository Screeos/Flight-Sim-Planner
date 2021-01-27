package main

import (
	"context"
	"os"
	"time"

	"github.com/Noah-Huppert/goconf"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	// "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	MOptions "go.mongodb.org/mongo-driver/mongo/options"
	// "go.mongodb.org/mongo-driver/mongo/readpref"
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

	// MongoURI contains the connection and
	// database details
	MongoURI string `default:"mongodb://127.0.0.1:27017/Dev-Tortoise"`
}

// FlightPlan describes the details of a simulator flight
type FlightPlan struct {
	// FromAirport ICAO
	FromAirport string

	// ToAirport ICAO
	ToAirport string

	// Route
	Route string
}

// HTTPAPI implements the API
type HTTPAPI struct {
	// Ctx is the background context
	Ctx context.Context

	// Config for server
	Config Config

	// DBClient is the mongodb client
	DBClient *mongo.Client
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
		Msgf("%s %s", c.Request.Method, c.Request.URL.Path)
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

// EPTCreateFlightPlanRes
type EPTCreateFlightPlanRes struct {
	// FlightPlan which was created
	FlightPlan FlightPlan
}

// EPTCreateFlightPlan creates a flight plan
func (a HTTPAPI) EPTCreateFlightPlan(c *gin.Context) {
	// Get plan to create
	var req EPTCreateFlightPlanReq
	c.BindJSON(&req)

	// TODO: Save in mongodb

	log.Debug().
		Msgf("Flight plan to create=%#v", req)

	c.JSON(200, EPTCreateFlightPlanRes{
		FlightPlan: req.FlightPlan,
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
	dbClient, err := mongo.NewClient(MOptions.Client().
		ApplyURI(cfg.MongoURI))
	CheckErr("failed to create mongodb client", err)

	dbConnCtx, _ := context.WithTimeout(ctx,
		10*time.Second)
	err = dbClient.Connect(dbConnCtx)
	CheckErr("failed to connect to mongodb", err)

	defer dbClient.Disconnect(ctx)

	// Start server
	api := HTTPAPI{
		Ctx:      ctx,
		Config:   cfg,
		DBClient: dbClient,
	}
	err = api.Start()
	CheckErr("failed to run API server", err)
}
