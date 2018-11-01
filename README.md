# zombie-net

Live demo running [here](https://zombie-net.herokuapp.com/), graphql exposed on `/graphql`

API documentation available through [GraphiQL interface](https://zombie-net.herokuapp.com/graphql) and `schema.gql`

### Environment
```dotenv
# Typeorm settings
TYPEORM_CONNECTION = sqlite
TYPEORM_DATABASE = database.sqlite
TYPEORM_SYNCHRONIZE = true
TYPEORM_LOGGING = false
TYPEORM_ENTITIES = ./src/entities/**/*.ts # development
# TYPEORM_ENTITIES = ./dist/entities/**/*.js # production

# Application port
PORT = 3333

# 3rd party integrations
MARKETPLACE_URL = https://zombie-items-api.herokuapp.com/api/items
EXCHANGE_RATES_API = http://api.nbp.pl/api/exchangerates/tables/A/last/

# Application environment
NODE_ENV = production
```

### Development
```
git clone
npm install
npm run dev
```

### Tests
GraphQL resolvers are tested via `npm test`
