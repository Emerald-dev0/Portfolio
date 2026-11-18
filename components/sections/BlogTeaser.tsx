import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { BlogCard } from "../ui/BlogCard";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Section, SectionHeader } from "../ui/Section";
import { Reveal } from "../motion/Reveal";
import { listPublic } from "../../lib/server/blog-source";
import { blogHeading } from "../../lib/content";

/**
 * BLOG TEASER, the three latest published posts on the home page. Reads the
 * same database the blog does, so anything published in the dashboard appears
 * here and on /blog together.
 */
export async function BlogTeaser() {
  const posts = (await listPublic({ limit: 3 }));
  if (!posts.length) return null;

  return (
    <Section id="blog" className="pattern-dots bg-lagoon text-night">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-36 sm:pt-28">
        <SectionHeader
          pill={blogHeading.label}
          title={blogHeading.heading}
          copy={`${blogHeading.intro} ${blogHeading.note}`}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <BlogCard post={p} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12">
          <Button href="/blog" variant="ink">
            Read all posts
            <Icon icon={ArrowRight01Icon} size={16} />
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
