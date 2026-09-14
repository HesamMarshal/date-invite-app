export default function StartBotHint({ href }: { href: string }) {
  return (
    <p className="text-center text-sm leading-relaxed text-zinc-600">
      برای خبر تلگرام،{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-pink-600 underline-offset-2 hover:underline"
      >
        ربات را استارت کن
      </a>
    </p>
  );
}
