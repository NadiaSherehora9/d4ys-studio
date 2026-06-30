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
  description = "Сучасна танцювальна студія в Білій Церкві. Авторська хореографія та Jazz-Funk. Професійні тренери, комфортний зал, дружня атмосфера.",
  keywords = "танці Біла Церква, танцювальна студія, хореографія, jazz-funk, джазфанк, навчання танцям, D4YS, days studio",
  image = "/og-image.png",
  url = "https://d4ys-studio.com/",
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

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};
