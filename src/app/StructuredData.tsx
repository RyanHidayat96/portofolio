import { createPortfolioJsonLd, serializeJsonLd } from "@/config/structured-data";

export function StructuredData(): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(createPortfolioJsonLd())
      }}
    />
  );
}
