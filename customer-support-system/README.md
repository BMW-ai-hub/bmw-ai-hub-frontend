# Customer Support System (Person 2)

React app for the customer facing side, pre diagnostics chat plus a simple support ticket / knowledge base view.

## What to build today
1. Chat interface for pre diagnostics, question and answer flow, plus a file/photo upload for the complaint
2. Structured complaint summary screen, shows what the AI captured before it's sent off
3. Ticket status view, so a customer can see "in progress", "awaiting technician", etc.
4. Simple knowledge base search box (optional if time runs out)

## API contract you need from Person 3 / Person 5
- `POST /api/support/chat` — send a message, returns `{ reply, next_question, complaint_so_far }`
- `POST /api/support/complaint/media` — upload photo/video attached to a complaint
- `GET /api/support/tickets/:id` — ticket status

Agree on the exact JSON shape with Person 5 before building the chat flow, don't guess it.

## Run it
```bash
npm install
npm run dev
```
Runs on port 5174. Talks to the API Gateway at `http://localhost:8000`.
