# Security Policy

## Supported version

The current `0.1.x` local experiment is the only supported line.

## Trust boundary

NoteDock is a static local browser app. It has no server-side storage, authentication, analytics,
remote model, or provider integration. Pasted notes remain in the active tab. Browser-created
downloads are the only intentional data egress.

Treat revision notes as client-confidential material:

- run the app on a trusted machine;
- do not expose the local server on a network;
- review exports before sharing;
- clear or close the tab when finished; and
- do not paste credentials, private keys, or access tokens.

Text is rendered with DOM `textContent`, not HTML injection. NoteDock never executes pasted text.
CSV cells beginning with spreadsheet-formula control characters are prefixed with an apostrophe
before export so pasted client text is not interpreted as a formula when opened.

## Reporting

Do not include confidential client notes in a report. Provide a minimal synthetic reproduction,
affected version, browser, operating system, and expected versus observed behavior through a
private maintainer channel before public disclosure.

## Out of scope

Security claims for hosted deployment, shared workspaces, cloud storage, NLE plugins, or provider
connections are out of scope because those surfaces do not exist.
