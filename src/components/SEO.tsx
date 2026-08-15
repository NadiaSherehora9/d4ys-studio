import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEO = ({
  title = "D4YS Studio — Танцювальна студія в Білій Церкві",
  description = "D4YS Studio (ді форс студія) — сучасна танцювальна студія в Білій Церкві. Дитячі та дорослі групи: Хореографія, Jazz-Funk. Професійні тренери, затишний зал у ТРЦ Вега. Запишись на пробне заняття!",
  keywords = "танці Біла Церква, дитячі танці Біла Церква, танці для дітей Біла Церква, ді форс студія, D4YS Studio, хореографія Біла Церква, jazz-funk Біла Церква, школа танців Біла Церква, танці для дорослих Біла Церква",
  image = "https://www.d4ys-bc.com/favicon.png",
  url = "https://www.d4ys-bc.com/",
}: SEOProps) => {
  const siteTitle =
    title === "D4YS Studio — Танцювальна студія в Білій Церкві"
      ? title
      : `${title} | D4YS Studio`;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="uk_UA" />
      <meta property="og:site_name" content="D4YS Studio" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};
