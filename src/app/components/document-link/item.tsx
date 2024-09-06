import Image from "next/image";

export default function DocumentLinkItem({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  return (
    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        aria-hidden
        src="/file-text.svg"
        alt="File icon"
        width={16}
        height={16}
      />
      {text}
    </a>
  );
}
