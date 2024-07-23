# Create developer-friendly backend projects fast 🚀

## Create your project

Clone this repository

```
git clone https://github.com/den59k/nebula-stack.git
```

Install dependencies

```
yarn install
```

Create `.env` file with db connection url

```
PG_DATABASE_URL=postgresql://postgres:5678@localhost:5432/nebula-test
```

Run prisma migrations

```
yarn prisma migrate deploy
```

Run initial migration (create user "root" with password "111111")

```
yarn migrate init
```

Start dev server
```
yarn dev
```