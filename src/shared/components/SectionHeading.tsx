import { chakra, Heading, type HeadingProps } from "@chakra-ui/react";
import { useState } from "react";
import { LuCheck, LuLink } from "react-icons/lu";
import { trackEvent } from "../analytics";
import { sectionLinkCopiedToast, toaster } from "./toaster";

type SectionHeadingProps = HeadingProps & {
  // Id of the section this heading titles. Without it, this is a plain heading.
  anchorId?: string;
};

// Heading with a copy-link button that shows on hover or keyboard focus, and
// always on touch screens.
export function SectionHeading({
  anchorId,
  children,
  ...props
}: SectionHeadingProps) {
  if (!anchorId) return <Heading {...props}>{children}</Heading>;

  return (
    <Heading className="group" {...props}>
      {children}
      <SectionLink id={anchorId} />
    </Heading>
  );
}

function SectionLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <chakra.a
      href={`#${id}`}
      aria-label="Copy link to this section"
      title="Copy link to this section"
      display="inline-flex"
      verticalAlign="middle"
      ms={2}
      color="fg.muted"
      opacity={0}
      transition="opacity 0.15s"
      _groupHover={{ opacity: 1 }}
      _focusVisible={{ opacity: 1 }}
      _hover={{ color: "fg" }}
      css={{ "@media (hover: none)": { opacity: 1 } }}
      onClick={async (event: React.MouseEvent<HTMLAnchorElement>) => {
        // Modified clicks keep their browser default (new tab, download, ...).
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        event.preventDefault();

        const url = `${window.location.href.split("#")[0]}#${id}`;
        window.history.replaceState(null, "", `#${id}`);

        let didCopy = false;
        if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(url);
            didCopy = true;
          } catch (error) {
            console.warn("Failed to copy section link.", error);
          }
        }

        setCopied(didCopy);
        if (didCopy) window.setTimeout(() => setCopied(false), 1400);
        toaster.create(sectionLinkCopiedToast(didCopy));
        trackEvent("cta_clicked", {
          cta_type: "share",
          content_id: `section-link-${id}`,
        });
      }}
    >
      {copied ? (
        <LuCheck size="0.8em" aria-hidden="true" />
      ) : (
        <LuLink size="0.8em" aria-hidden="true" />
      )}
    </chakra.a>
  );
}
