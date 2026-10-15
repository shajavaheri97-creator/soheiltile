// ⚠️ SAMPLE CONTENT — edit these values, rebuild, and redeploy.
// mapUrl: open the place in Google Maps → Share → copy link (any google.com/maps or maps.app.goo.gl link works).

export type Place = {
  id: "office" | "warehouse";
  addressFa: string;
  addressEn: string;
  hoursFa: string;
  hoursEn: string;
  mapUrl: string;
};

export const siteConfig = {
  phone: "+982126244920", // used in tel: links
  phoneDisplay: "021-26244920",
  email: "info@example.com",
  yearsExperience: +10,
  places: [
    {
      id: "office",
      addressFa: "تهران، خیابان بنی هاشم ، بن بست تبری ، ساختمان ارغوان طبقه اول واحد ۴",
      addressEn: "1st Floor, Unit 4, Arghavan Building, Tabari Dead End, Bani Hashem Street, Tehran, Iran",
      hoursFa: "شنبه تا پنج شنبه، ۹ تا ۱۸",
      hoursEn: "Sat–Thu, 9:00–17:00",
      mapUrl: "https://maps.app.goo.gl/HP7VeGTEMkE3WwAg9",
    },
    {
      id: "warehouse",
      addressFa: "سعیدآباد خیابان شهرک صنعتی گلگون روبروی شهرک صنعتی گلگون پلاک ۵ انبار سهیل",
      addressEn: "Soheil Warehouse, No. 5, Opposite Golgoon Industrial Estate, Shahrak Sanati Golgoon Street, Saeedabad, Tehran, Iran",
      hoursFa: "شنبه تا پنجشنبه، ۹ تا ۱۸",
      hoursEn: "Sat–Thu, 9:00–18:00",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=35.7000,51.2500",
    },
  ] as Place[],
};
