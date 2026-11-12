# LEGEND Buttondown archive setup

This file records the intended Buttondown publication configuration. The archive theme stylesheet lives at docs/buttondown-legend-archive.css.

## Apply the archive theme

In the Buttondown dashboard, open **Settings → Web** (Buttondown's current area for archive and web-presence settings).

1. Choose the **Modern** archive theme.
2. Set the wide-screen archive layout to **two columns**.
3. Enable dark-mode support.
4. Enable the link to the latest published issue on the subscribe page.
5. Set the archive accent color to #d2ad6c.
6. Paste the complete contents of docs/buttondown-legend-archive.css into the archive's **Custom CSS** field and save.
7. Add navigation links for:
   - Realm Portal — https://tdtria.github.io/LEGEND-RPG/portal.html
   - Play LEGEND — https://tdtria.github.io/LEGEND-RPG/
   - Development Chronicle — https://tdtria.github.io/LEGEND-RPG/blog.html
   - Field Guide — https://tdtria.github.io/LEGEND-RPG/guide.html
8. Use the archive header/footer rich-text editor for the publication copy below.

The archive custom-CSS feature is plan-dependent. If the Custom CSS field is not available, do not upgrade the account automatically; use the closest built-in theme controls or ask the owner before changing plans.

## Suggested publication header

**LEGEND — The Development Dispatch**

Field notes from the making of LEGEND: The Awakening. Follow new builds, world design, gameplay systems, original art, soundtrack work, and milestones from the frontier.

## Suggested publication footer

LEGEND: The Awakening is an independent dark-fantasy browser RPG in active development.

[Enter the World](https://tdtria.github.io/LEGEND-RPG/) · [Realm Portal](https://tdtria.github.io/LEGEND-RPG/portal.html) · [Development Chronicle](https://tdtria.github.io/LEGEND-RPG/blog.html) · [Field Guide](https://tdtria.github.io/LEGEND-RPG/guide.html)

## Branding assets

Buttondown's publication icon appears in the newsletter header and archive. Use a square, high-contrast LEGEND emblem and export it at 300 × 300 PNG.

The share image appears in social previews. Use a 1200 × 630 image with the LEGEND wordmark, a clear dark-fantasy scene, and enough contrast that the title remains readable at small sizes. Keep text out of the outer margins so social-platform crops do not cut it off.

## Existing publication URLs

- Public issue supplied by the owner: https://buttondown.com/Legend-RPG/archive/welcome-to-the-recovered-build/
- Publication archive: https://buttondown.com/Legend-RPG

The individual issue URL is the confirmed link supplied for the existing publication. Check the archive's public-visibility setting in Buttondown before promoting the root archive URL as publicly accessible.

## Integration requirements

Buttondown is retained as the legacy publication and existing subscriber archive while the new Brevo subscription path is prepared. The current `updates.html` page contains a LEGEND-styled Brevo form that posts directly to the Brevo form endpoint and uses Brevo's hosted form handler. Its consent and double-opt-in workflow must remain intact.

Do not add a custom JavaScript fetch request or proxy that stores subscriber data on GitHub Pages. The website must never collect or store subscribers itself. Do not disable the Buttondown legacy link or migrate subscriber records until the Brevo signup flow has been published and successfully tested end to end.

## Dashboard changes still requiring authenticated account access

The stylesheet and recommended configuration are prepared in this repository. Saving custom CSS, changing the archive theme, editing the archive's header/footer, setting navigation links, and uploading the icon/share image are Buttondown account changes and must be performed in the authenticated Buttondown dashboard. No account credentials or subscriber data belong in this repository.