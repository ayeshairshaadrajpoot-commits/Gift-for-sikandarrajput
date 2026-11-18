# Sikandar Birthday Surprise

## Replace the 5 photos
Put your pictures in `public/assets/images/` using these exact names (JPG, ~900x1100 portrait works best):
`photo-1.jpg  photo-2.jpg  photo-3.jpg  photo-4.jpg  photo-5.jpg`
Captions and the letter are in `public/src/js/content.js`. The letter text is exactly as supplied.

## Quick look (no setup)
Double-click `public/index.html`. This is **preview mode**: the spinner follows the fixed sequence in memory only; nothing is saved, no email is sent.

## Run for real on Windows
1. Install Node.js LTS from https://nodejs.org (Next, Next, Finish), then restart.
2. Extract the ZIP, finish the Supabase and Resend steps below.
3. Double-click `run.bat` (it creates `.env` for you; fill in the keys; run again). Open the address it prints (http://localhost:8888).

## Supabase (free)
1. https://supabase.com -> New project.
2. SQL Editor -> paste all of `supabase/schema.sql` -> Run.
3. Project Settings -> API: copy the Project URL into `SUPABASE_URL` and the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`. Never put it in frontend code or share it.

## Resend (free)
1. https://resend.com -> API Keys -> create one -> `RESEND_API_KEY`.
2. Without a domain, you can only send from `onboarding@resend.dev` and **only to the email your Resend account was registered with**. So either sign up to Resend with `ayeshairshaadrajpoot@gmail.com`, or verify a domain (Resend -> Domains -> add the DNS records) and set `RESEND_FROM="Birthday <hello@yourdomain.com>"`.
3. Set `TOKEN_SALT` to any long random text.

## Deploy free on Netlify
1. Push the folder to GitHub (`.env` is git-ignored), or drag the folder to https://app.netlify.com/drop (functions need the Git or CLI route).
2. New site from Git. Publish directory `public`, functions `netlify/functions` (already in `netlify.toml`).
3. Site configuration -> Environment variables: add every key from `.env.example`. Redeploy.

## Limits of one-time restriction
The visitor ID lives in the browser's localStorage. Progress and results are enforced on the server, but if the visitor clears site data, uses another browser, private mode or another device, they get a new ID and a new set of spins. This cannot be fully prevented without logging in.

## Troubleshooting
- "Could not reach the server": you opened the file directly or the function failed; use `run.bat`, check Supabase keys, check Netlify function logs.
- Submit fails: Resend limits (see step 2 above) or wrong `RESEND_FROM`.
- Want to retest: delete your row in Supabase (Table Editor -> visitors) and clear localStorage.
