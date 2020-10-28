# Server
Flight Sim Planner server.

# Table Of Contents
- [Overview](#overview)
- [Development](#development)

# Overview
DenoJs Typescript HTTP REST API.

# Development
DenoJs and Typescript are used.

Type guards are automatically built for interfaces. Install 
`ts-interface-builder` by running:

```
npm install -g ts-interface-builder
```

Then run the `guards` Make target any time a relevant type guard definition 
is changed:

```
make guards
```

To start the server run:

```
deno run main.ts
# Or
make run
```
