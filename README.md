# Unvibe

Write code like in StarTrek.

## Overview

Unvibe aims to making creating and managing complex projects easy and goal-oriented, without compromising on the quality and correctness of your code.
It provides a pluggable architecture & platform for managing code, using already existing tooling and libraries.

when you load up a project in Unvibe it will automatically analyze the tooling required for a good workflow, and provides a robust context for llms to work with.

### Getting Started

clone the repo in `~/projects` and follow instructions

```bash
gh repo clone unvibe/unvibe ~/projects/unvibe
```

1. **environment:** First you need to setup ur environment, make sure to add the following to ur `.env`

```sh
# for llms use
OPENAI_API_KEY= # Your OpenAI API key
GEMENI_API_KEY= # Your Gemeni API key
ANTHROPIC_API_KEY= # Your Anthropic API key

# for hosting images
AWS_ACCESS_KEY_ID=
AWS_ACCESS_SECRET_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_CLOUDFRONT_CDN_URL=
```

2. **Install dependencies:**

```bash
npm install
```

2. **Push Drizzle migrations:**

```bash
npx drizzle-kit push
```

3. **Run the frontend development server:**

```bash
npm run dev
```

4. **Run the backend server in development mode:**

```bash
npm run dev:server
```
