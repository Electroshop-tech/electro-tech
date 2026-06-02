import Image from "next/image";
import Link from "next/link";

export default function WhyUsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#050814]">
      <Link
        href="/produits"
        aria-label="Voir nos produits"
        className="block"
      >
        {/* Desktop / tablet */}
        <Image
          src="/images/hero section web-vr.png"
          alt="Pourquoi nous choisir ElectroShop-Tech"
          width={1536}
          height={1024}
          priority
          sizes="100vw"
          className="hidden sm:block w-full h-auto"
        />
        {/* Mobile */}
        <Image
          src="/images/hero section mobile-vr.png"
          alt="Pourquoi nous choisir ElectroShop-Tech"
          width={853}
          height={1844}
          priority
          sizes="100vw"
          className="block sm:hidden w-full h-auto"
        />
      </Link>
    </section>
  );
}
