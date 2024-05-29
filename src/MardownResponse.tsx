import { responseAtom, activerHoverBoxAtom } from "./atoms";
import { useAtom } from "jotai";
import Markdown from "react-markdown";
import { replaceLinkFormat } from "./utils";
import { useEffect, useRef } from "react";
import breaks from "remark-breaks";

export function MardownResponse() {
  const [, setActiveHoverBox] = useAtom(activerHoverBoxAtom);
  const markdownWrapperRef = useRef<HTMLDivElement | null>(null);
  const [response] = useAtom(responseAtom);

  useEffect(() => {
    const wrapperRef = markdownWrapperRef.current;

    function handleMouseOver(event: MouseEvent) {
      // Check if the target of the event is an 'a' element
      const target = event.target as HTMLElement;
      if (target && target.tagName === "A") {
        const targetRef = target.getAttribute("href");
        if (targetRef && targetRef.startsWith("#bb-")) {
          setActiveHoverBox(targetRef.replace("#bb-", ""));
        }
      }
    }

    function handleMouseEnter() {
      setActiveHoverBox("active");
    }

    function handleMouseLeave() {
      setActiveHoverBox(null);
    }

    if (wrapperRef) {
      wrapperRef.addEventListener("mouseover", handleMouseOver);
      wrapperRef.addEventListener("mouseenter", handleMouseEnter);
      wrapperRef.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (wrapperRef) {
        wrapperRef.removeEventListener("mouseover", handleMouseOver);
        wrapperRef.removeEventListener("mouseenter", handleMouseEnter);
        wrapperRef.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [markdownWrapperRef, setActiveHoverBox]);

  return (
    <div ref={markdownWrapperRef}>
      <Markdown
        className="w-full pb-4 mx-auto prose text-black"
        remarkPlugins={[breaks]}
      >
        {replaceLinkFormat(response)}
      </Markdown>
    </div>
  );
}