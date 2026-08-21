const LINKS = [
  { label: "Home", destination: "/", rel: "home" },
  { label: "New page", destination: "/new" },
];

export default function NavMenuCore(props: { pathname?: string }) {
  const { pathname = "/" } = props;

  return (
    <s-app-nav>
      {LINKS.map((link) => (
        <s-link
          href={link.destination}
          key={link.label}
          rel={link.rel}
          aria-current={pathname === link.destination ? "page" : undefined}
        >
          {link.label}
        </s-link>
      ))}
    </s-app-nav>
  );
}
