const links = [
  { label: "Home", destination: "/", rel: "home" },
  { label: "New page", destination: "/new" },
];

export default function NavMenuCore(props: { pathname?: string }) {
  return (
    <s-app-nav>
      {links.map((link) => (
        <s-link
          href={link.destination}
          key={link.label}
          // @ts-expect-error - rel is not a valid prop for s-link
          rel={link.rel}
        >
          {link.label}
        </s-link>
      ))}
    </s-app-nav>
  );
}
