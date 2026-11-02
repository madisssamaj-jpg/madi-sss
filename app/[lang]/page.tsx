"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import en from "../../public/locales/en/common.json";
import ne from "../../public/locales/ne/common.json";

export default function HomePage() {
  const pathname = usePathname();
  const currentLang = pathname?.split('/')?.[1] || "ne";
  const t: Record<string, any> = currentLang === "ne" ? ne : en;

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section id="hero" className="bg-[#01366E] text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {currentLang === "ne" ? "मादी (संखुवासभा) सरोकार समाज, काठमाडौं" : "Madi Sankhuwasabha Sarokar Samaj, Kathmandu"}
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          {currentLang === "ne" ? "“मादीदेखि काठमाडौंसम्म, एकता र सहकार्यको साझा अभियान।”" : "“From Madi to Kathmandu, a shared initiative for unity and collaboration.”"}
        </p>
        <div className="flex justify-center gap-4">
          <Link href="#about" className="bg-[#FB6C01] hover:bg-[#e55a00] text-white py-2 px-4 rounded">
            {currentLang === "ne" ? "हाम्रो बारेमा" : "Learn More"}
          </Link>
          <Link href="#membership" className="bg-white hover:bg-gray-200 text-[#01366E] py-2 px-4 rounded">
            {t.membership || "सदस्यता"}
          </Link>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {t.aboutUs || (currentLang === "ne" ? "हाम्रो बारेमा" : "About the Society")}
        </h2>
        <p className="mb-4">
          {currentLang === "ne"
            ? "[विवरण: संस्थाको परिचय तथा पृष्ठभूमिसम्बन्धी जानकारी यथाशीघ्र उपलब्ध गराइनेछ।]"
            : "[Placeholder: Brief description about the society and its background.]"}
        </p>
        <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-500 rounded">
          {currentLang === "ne" ? "तस्वीर स्थान (Placeholder)" : "Image Placeholder"}
        </div>
      </section>

      {/* OBJECTIVES */}
      <section id="objectives" className="py-16 px-4 bg-gray-50 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {currentLang === "ne" ? "उद्देश्यहरू" : "Objectives"}
        </h2>
        <ul className="list-disc list-inside space-y-2">
          {currentLang === "ne"
            ? [
                "[उद्देश्य १: मादीबाट काठमाडौं आएका नागरिकहरूबीच पारस्परिक सहयोग तथा भाइचारा अभिवृद्धि।]",
                "[उद्देश्य २: सामाजिक, सांस्कृतिक तथा रचनात्मक गतिविधिको प्रवर्द्धन।]",
                "[उद्देश्य ३: आपतविपतमा परेका समुदायका सदस्यहरूलाई ऐक्यबद्धता तथा सहयोग।]",
              ].map((item: string, idx: number) => <li key={idx}>{item}</li>)
            : [
                "[Objective 1: Promote mutual support and brotherhood among community members in Kathmandu.]",
                "[Objective 2: Facilitate social, cultural, and developmental activities.]",
                "[Objective 3: Provide solidarity and assistance to community members in times of need.]",
              ].map((item: string, idx: number) => <li key={idx}>{item}</li>)}
        </ul>
      </section>

      {/* ACTIVITIES */}
      <section id="activities" className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {t.events || (currentLang === "ne" ? "कार्यक्रमहरू" : "Community Activities")}
        </h2>
        <p className="mb-4">
          {currentLang === "ne"
            ? "[विवरण: संस्थाले सञ्चालन गरेका तथा आगामी कार्यक्रमहरूको संक्षिप्त जानकारी।]"
            : "[Placeholder: Summary of community activities and upcoming gatherings.]"}
        </p>
        <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-500 rounded">
          {currentLang === "ne" ? "तस्वीर स्थान (Placeholder)" : "Image Placeholder"}
        </div>
      </section>

      {/* SUPPORT */}
      <section id="support" className="py-16 px-4 bg-gray-50 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {t.socialSupport || (currentLang === "ne" ? "सामाजिक सहयोग" : "Social Support and Assistance")}
        </h2>
        <p className="mb-4">
          {currentLang === "ne"
            ? "[विवरण: अप्ठ्यारोमा परेका नागरिकहरूलाई सामाजिक तथा कल्याणकारी सहयोगसम्बन्धी व्यवस्था।]"
            : "[Placeholder: Information on community welfare and emergency assistance services.]"}
        </p>
      </section>

      {/* NEWS */}
      <section id="news" className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {currentLang === "ne" ? "ताजा सूचना तथा समाचार" : "Latest News and Events"}
        </h2>
        <p>
          {currentLang === "ne"
            ? "[सूचना: आधिकारिक सूचना तथा समाचार छिट्टै प्रकाशन गरिनेछ।]"
            : "[Placeholder: Official announcements and updates will be published here.]"}
        </p>
      </section>

      {/* MEMBERSHIP */}
      <section id="membership" className="py-16 px-4 bg-gray-50 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">
          {t.membership || (currentLang === "ne" ? "सदस्यता आह्वान" : "Membership Invitation")}
        </h2>
        <p className="mb-4">
          {currentLang === "ne"
            ? "[विवरण: समाजको साधारण तथा आजन्म सदस्यतासम्बन्धी प्रक्रिया चाँडै सार्वजनिक गरिनेछ।]"
            : "[Placeholder: Membership application process and requirements will be announced soon.]"}
        </p>
        <Link href="#contact" className="bg-[#FB6C01] hover:bg-[#e55a00] text-white py-2 px-4 rounded inline-block">
          {t.contact || (currentLang === "ne" ? "सम्पर्क गर्नुहोस्" : "Contact Us")}
        </Link>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {t.contact || (currentLang === "ne" ? "सम्पर्क" : "Contact")}
        </h2>
        <p>
          {currentLang === "ne"
            ? "[सम्पर्क विवरण: आधिकारिक ठेगाना, सम्पर्क नम्बर तथा इमेल प्रमाणीकरणपछि राखिनेछ।]"
            : "[Contact Information: Official address, verified phone numbers, and email will be posted once confirmed.]"}
        </p>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#01366E] text-white py-4 text-center">
        <p>
          {currentLang === "ne"
            ? "© २०८१/२०८२ मादी (संखुवासभा) सरोकार समाज, काठमाडौं। सर्वाधिकार सुरक्षित।"
            : "© 2026 Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu. All rights reserved."}
        </p>
      </footer>
    </div>
  );
}



