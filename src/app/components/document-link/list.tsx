import DocumentLinkItem from "./item";

const items = [
  {
    href: "https://nextjs.org/blog/next-15-rc",
    text: "Next.js 15 RC",
  },
  {
    href: "https://lucia-auth.com/",
    text: "Lucia Auth",
  },
  {
    href: "https://www.prisma.io/",
    text: "Prisma",
  },
  {
    href: "https://supabase.com/",
    text: "Supabase",
  },
];

export default function DocumentLinkList() {
  return (
    <>
      {items.map((item) => (
        <DocumentLinkItem key={item.href} {...item} />
      ))}
    </>
  );
}
