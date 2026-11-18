import type { ReactNode } from "react";
import { Footer } from "../../components/sections/Footer";
import { Nav } from "../../components/sections/Nav";

/**
 * Blog layout, the same floating pill nav and footer as the home page,
 * so the blog feels like part of the site, not a separate island.
 */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
