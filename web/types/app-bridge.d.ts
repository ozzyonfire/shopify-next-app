import type { HTMLAttributes } from "react";

type AppNavProps = HTMLAttributes<HTMLElement>;
type AppNavLinkProps = Omit<HTMLAttributes<HTMLElement>, "rel"> & {
  href?: string;
  key?: string;
  rel?: never;
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
