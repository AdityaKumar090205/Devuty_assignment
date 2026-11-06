# Devuty_assignment
An assignment for an intern shorlisting at Devuty.

## Development

Run `npm ci`, then `npm run dev` to open the existing React demonstration locally.

## Deployment

Netlify runs `npm run build` and publishes `dist`, as configured in `netlify.toml`.
The HTML entry point mounts the React page and includes its compiled Tailwind styles.
Client routes fall back to the HTML entry point.

The CMS and API tester are demonstrations backed by React state; changes reset on
refresh and API responses are simulated.
