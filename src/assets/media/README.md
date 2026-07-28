# Screenshots

Drop image files here, then import one in an MDX case study and pass it to
`Figure`:

```mdx
import booking from '../../assets/media/booking-page.png';

<Figure src={booking} alt="A teacher's public booking page" caption="…" />
```

Astro optimises and serves responsive variants from the import, so use the
original export rather than a pre-resized copy.

Until an image is supplied, `<Figure>` renders a correctly sized placeholder.
Adding the real file shifts no layout.

**Constraint:** screenshots for the transit case study must not show a
recognisable map, route name, operator or city. See `scripts/check-stealth.mjs`.
