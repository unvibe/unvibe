# Unvibe

Write code like you're in Star Trek.

## Overview

Unvibe aims to make creating and managing complex projects easy and goal-oriented, without compromising on code quality and correctness.
It provides a pluggable architecture & platform for managing code, using already existing tooling and libraries.

When you load up a project in Unvibe, it will automatically analyze the required tooling for a productive workflow and provide a robust context for LLMs to work with.

### Getting Started

Clone the repo to `~/projects` and follow the instructions below.

```bash
gh repo clone unvibe/unvibe ~/projects/unvibe
```

1. **Environment:** First, set up your environment. Add the following to your `.env` file:

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

3. **Push Drizzle migrations:**

```bash
npx drizzle-kit push
```

4. **Run the frontend development server:**

```bash
npm run dev
```

5. **Run the backend server in development mode:**

```bash
npm run dev:server
```
