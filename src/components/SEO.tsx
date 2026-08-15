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
  description = "D4YS Studio — сучасна танцювальна студія в Білій Церкві. Hip-Hop, K-Pop, High Heels, Jazz-Funk. Професійні тренери, комфортний зал, дружня атмосфера. Запишись на пробне заняття!",
  keywords = "танці Біла Церква, танцювальна студія Біла Церква, хіп-хоп Біла Церква, k-pop танці, high heels Біла Церква, jazz-funk, хореографія Біла Церква, навчання танцям, D4YS Studio, школа танців Біла Церква",
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
