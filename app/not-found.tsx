import { Button } from "../components/ui/Button";
import { Doodle } from "../components/ui/Doodle";

/**
 * 404, a sticker card on the dot pattern. The work and the contact
 * details are both a click away.
 */
export default function NotFound() {
  return (
    <main id="main" className="pattern-dots grid min-h-screen place-items-center bg-paper px-5 py-28">
      <div className="sticker max-w-lg rotate-[-1deg] p-8 text-center sm:p-10">
        <Doodle name="asterisk" className="mx-auto w-14 text-tang animate-wiggle" strokeWidth={5} />
        <p className="display-hero mt-4">404</p>
        <h1 className="display-card mt-2">That page isn&rsquo;t here.</h1>
        <p className="mt-3 leading-relaxed opacity-80">
          The link may be out of date, or the page may have moved. The work and the contact
          details are both a click away.
        </p>
        <Button href="/" variant="leaf" className="mt-7">
          Back to the portfolio
        </Button>
      </div>
    </main>
  );
}
