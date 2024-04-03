# Odoo template vsf

Template base to start new odoo vsf projects using vsf SDK

## Tech stack

1. Nuxt 3
2. VSF 2
3. SFUI-2


## How to start ?

```sh
2. yarn install
3. copy apps/web/.env.example to apps/web/.env
4. yarn dev
5. You can access with http://localhost:3000
```

## Docker


Test docker build:

```bash
cat .env.docker | grep -v '^#' | xargs -I {} echo --build-arg {} | xargs docker build . -t vsf-test
```

Production mode with docker-compose

```bash
# Test docker build
cd .docker && docker-compose up --build -d
```
