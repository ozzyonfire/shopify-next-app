import type { HTMLAttributes } from "react";

type AppNavProps = HTMLAttributes<HTMLElement>;
type AppNavLinkProps = HTMLAttributes<HTMLElement> & {
  href?: string;
  rel?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": AppNavProps;
      "s-link": AppNavLinkProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": AppNavProps;
      "s-link": AppNavLinkProps;
    }
  }
}
