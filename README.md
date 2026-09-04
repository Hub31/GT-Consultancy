# GT Consultancy Website

The live site for GT Consultancy (Godfrey Tuda Otieno) — a static site (plain HTML/CSS/JS), built per the 6-document Hub31 planning process (PRD → TRD → Site Structure → UI/UX Brief → Backend Schema → this build).

## How this is hosted

- **Hosting:** Netlify, connected to this GitHub repository.
- **Deployment:** Automatic. Every time changes are pushed to the `main` branch, Netlify rebuilds and republishes the live site within about a minute. There is no manual "publish" step.
- **Domain:** `gtconsultancy.pro`, connected to this Netlify site via DNS (see Document 6-equivalent notes below for the exact steps, if not already done).
- **Forms:** The contact form on `contact.html` uses Netlify's built-in form handling (`data-netlify="true"`) — no separate backend or paid service needed. Submissions email to the domain's wildcard address, which redirects to `gtuda2040@gmail.com`.

## File structure

```
/index.html            Home page
/about.html             About page
/services.html          Services page
/case-studies.html      Track Record / Case Studies page
/contact.html           Contact page (quote form + WhatsApp panel)
/success.html           Shown after a successful form submission
/netlify.toml           Netlify configuration
/data/services.json     The 8 service categories — edit this to change service text
/data/case-studies.json The case studies — edit this to add/change a case study
/assets/css/style.css   All site styling
/assets/js/main.js      Nav toggle, animations, and the code that reads the /data files
/assets/images/         Logo, photos, and the WhatsApp QR code
```

## Making a content change (no coding experience needed for most of this)

- **To add or edit a case study:** open `/data/case-studies.json`, copy an existing entry's format, and fill in the fields. Save, commit, and push — the live site updates automatically.
- **To add or edit a service:** same idea, in `/data/services.json`.
- **To change other text** (headlines, bio, etc.): open the relevant `.html` file and edit the text directly — everything is in plain, readable sentences, not code logic.
- **To swap an image:** replace the file in `/assets/images/` with a new one of the same filename, or update the filename referenced in the HTML.

If any of this feels unclear, the safest approach is still: describe the change you want, and have Claude/Hub31 make the edit and push it — no risk of accidentally breaking something.

## Known open items (see the planning documents for full context)

- Certification credentials are listed as text, not official third-party logos (see Document 4, Section 11, item D2, for why).
- Case study specifics (exact years, institution names) were drafted from CV summary evidence — please verify accuracy with Godfrey before treating them as final, publishable fact.
