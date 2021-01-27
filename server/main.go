package main

import (
	"os"

	"github.com/Noah-Huppert/goconf"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// Config for server
type Config struct {
	// HTTP API port
	HTTPHost string `default:":8000"`
}

// HTTPAPI implements the API
type HTTPAPI struct {
	// Config for server
	Config Config
}

// Start the API via a Gin server
func (a HTTPAPI) Start() error {
	router := gin.New()

	// Middleware
	router.Use(a.MWLog)

	// Routes
	router.GET("/api/v0/health", a.EPTHealth)
	// TODO: Make create flight plan endpoint

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

// EndpointHealth provides an indication of the APIs
// current health.
func (a HTTPAPI) EPTHealth(c *gin.Context) {
	c.JSON(200, EPTHealthResp{
		Ok: true,
	})
}

func main() {
	// Setup logging
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})

	// Load config
	cfgLdr := goconf.NewLoader()
	cfgLdr.AddConfigPath("config.toml")
	cfg := Config{}
	if err := cfgLdr.Load(&cfg); err != nil {
		log.Fatal().
			Err(err).
			Msgf("failed to load config")
	}

	// Start server
	api := HTTPAPI{
		Config: cfg,
	}
	if err := api.Start(); err != nil {
		log.Fatal().
			Err(err).
			Msgf("failed to run API server")
	}
}
