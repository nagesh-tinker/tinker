# Tinker Project Status

Last updated: 2026-11-01
Project: Tinker
Repository: https://github.com/nagesh-tinker/tinker
Live site: https://tinker-kohl.vercel.app/

## Product direction

Tinker is a private, child-friendly conversational companion for children aged 8–12.

The interface should feel familiar like messaging apps, using friendly conversation bubbles, but without public feeds, followers, likes, or addictive social mechanics.

## Technology

- Next.js 16
- TypeScript
- Tailwind CSS
- Supabase Authentication
- Supabase PostgreSQL
- OpenAI Responses API
- GitHub
- Vercel Hobby plan

## Completed

- Created local project at `D:\Projects\tinker`
- Created the Next.js app
- Connected the project to GitHub
- Deployed the app to Vercel
- Added `.env.local` locally
- Connected Supabase
- Added Supabase client helper
- Enabled Supabase email authentication
- Created `conversations` table
- Created `messages` table
- Added `user_id` to `conversations`
- Enabled Row Level Security
- Added policies for authenticated users
- Added database permissions for the authenticated role
- Created and tested the login page
- Created and tested the chat page
- Added the OpenAI server route
- Successfully tested an OpenAI response
- Successfully saved user and assistant messages to Supabase

## Important files

- `app/page.tsx` — Tinker welcome page
- `app/login/page.tsx` — Login page
- `app/chat/page.tsx` — Chat interface
- `app/api/chat/route.ts` — Secure OpenAI server route
- `lib/supabase.ts` — Supabase client
- `.env.local` — Local secrets; never commit this file

## Database

### conversations

- `id`
- `user_id`
- `title`
- `created_at`

### messages

- `id`
- `conversation_id`
- `role`
- `content`
- `created_at`

Row Level Security is enabled.

## Environment variables

The local `.env.local` file contains:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Never include the values of these variables in this document or in chat.

## Current working feature

A signed-in user can:

1. Open `/chat`
2. Enter a message
3. Send it to the OpenAI server route
4. See the AI response
5. Save both messages in Supabase

## Next task

Improve the chat interface:

1. Add message bubbles
2. Clearly distinguish user and Tinker messages
3. Render response formatting cleanly
4. Add conversation history
5. Add loading and error states
6. Commit and push the changes
7. Confirm the Vercel deployment

## Safety and privacy requirements

- Never expose the OpenAI API key in browser code.
- Never commit `.env.local`.
- Keep Supabase Row Level Security enabled.
- Do not add public feeds, followers, likes, or unnecessary engagement mechanics.
- Before real child use, add stronger safety, moderation, privacy, and parent/guardian controls.

## Useful commands

```powershell
npm run dev
npm run build
git add .
git commit -m "Describe the change"
git push

## Completed milestone: polished chat interaction

- Added child-friendly messaging bubbles
- Added a fixed composer area
- Added internal scrolling for messages
- Automatically scrolls to the newest message
- Enter sends the message
- Shift+Enter creates a new line
- Automatically restores focus to the message box
- Added a thinking state
- Cleaned basic markdown formatting from AI replies

## Next milestone

- Load previous conversation history from Supabase
- Keep one conversation instead of creating a new one for every message
- Add a sign-out button

## Completed milestone: topic-based conversations

- One conversation is reused for multiple messages
- Active conversation ID is remembered locally
- Previous messages reload after refresh
- New topic clears the current view
- New topic creates a new database conversation on the next message
- Empty conversations are not created
- Topic ownership is protected by Supabase Row Level Security

## Next milestone

- Add a recent topics screen
- Let the user choose a previous topic
- Add sign-out
- Improve conversation titles

## Completed milestone: connected page flow

- Home page now links to `/login`
- Successful login now redirects to `/chat`
- Main user flow is now Home ? Login ? Chat

## Next milestone

- Build the recent topics screen
- Let users reopen previous conversations
- Add sign-out

## Completed milestone: Topics home

- Login now redirects to `/topics`
- Added recent topics screen
- Recent conversations load from Supabase
- Users can reopen a previous topic
- Users can start a new topic
- Added sign-out
- Added a `? Topics` link to the chat screen
- Preserved the child-friendly card-based experience

## Next milestone

- Improve conversation titles
- Add better loading and empty states
- Add authentication protection to chat
- Consider moving from localStorage routing to `/chat/[id]`
