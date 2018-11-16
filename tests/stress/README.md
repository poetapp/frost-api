# The Frost API Stress Tests

The stress tests are written with [K6](https://k6.io/)

## Running Local:

```bash
docker-compose up
```

```bash
docker-compose exec k6 bash
```

Inside the docker you can use the tool `K6`. 

Example:

```bash
k6 run ./tests/stress/createAccount.js
```

## Running against an External Domain:

```bash
docker-compose run -e NODE_HOST=https://domain k6 bash
```

Inside the docker you can use the tool `K6`. 

Example:

```bash
k6 run ./tests/stress/createAccount.js
```

## Options K6

--vus (int): k6 works with the concept of virtual users (VUs), which run scripts - they're essentially glorified, parallel while(true) loops.

Example:

`k6 run --vus 10 script.js`

--duration (int)s: Running a 30-second, 10-VU load test

Example:

`k6 run --vus 10 --duration 30s script.js`

More options on: https://docs.k6.io/docs/options

## Environment variables:

- FROST_HOST: The Frost API location

## Notes:

- For executing the test `createWork.js` you need to set the environment variable `VERIFIED_ACCOUNT` with true.
- For executing the test `createToken.js` you need to set the environment variable `MAX_API_TOKENS` with a high number.
