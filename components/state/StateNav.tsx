/**
 * Sticky section nav.
 *
 * Built from the sections the page actually rendered, so an overview state
 * never offers a link to a shop it does not have. Plain anchors and
 * `position: sticky` — no scroll-spy, no listener on every scroll frame.
 *
 * It sticks below the site bar; the offset is shared with `scroll-margin-top`
 * on the sections so an anchor jump does not land under either bar.
 */
export interface NavLink { href: string; label: string }

export default function StateNav({ links }: { links: NavLink[] }) {
  /* One link is not a navigation, it is a redundant button. */
  if (links.length < 2) return null;

  return (
    <nav className="kk-st-nav" aria-label="Sections">
      <ul className="kk-st-nav-list">
        {links.map(l => (
          <li key={l.href}>
            <a className="kk-st-nav-link kk-label" href={l.href}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
