export const useCountries = () => {
  // ISO 3166-1 alpha-3 codes
  const countryNames: Record<string, string> = {
    AFG: "Afganistán",
    ALB: "Albania",
    DZA: "Argelia",
    AND: "Andorra",
    AGO: "Angola",
    ARG: "Argentina",
    ARM: "Armenia",
    AUS: "Australia",
    AUT: "Austria",
    AZE: "Azerbaiyán",
    BOL: "Bolivia",
    BRA: "Brasil",
    CAN: "Canadá",
    CHL: "Chile",
    COL: "Colombia",
    CRC: "Costa Rica",
    CUB: "Cuba",
    DEU: "Alemania",
    DOM: "República Dominicana",
    ECU: "Ecuador",
    ESP: "España",
    FRA: "Francia",
    GBR: "Reino Unido",
    GTM: "Guatemala",
    HND: "Honduras",
    ITA: "Italia",
    MEX: "México",
    NIC: "Nicaragua",
    PAN: "Panamá",
    PER: "Perú",
    PRY: "Paraguay",
    PRT: "Portugal",
    RUS: "Rusia",
    SLV: "El Salvador",
    URY: "Uruguay",
    USA: "Estados Unidos",
    VEN: "Venezuela",
  };

  const getCountryName = (isoCode: string): string => {
    if (!isoCode) return "";
    return countryNames[isoCode.toUpperCase()] || isoCode;
  };

  const getAllCountries = () => {
    return Object.entries(countryNames).map(([code, name]) => ({
      code,
      name,
    }));
  };

  const findCountryByName = (name: string): string | undefined => {
    const entry = Object.entries(countryNames).find(([, countryName]) =>
      countryName.toLowerCase().includes(name.toLowerCase())
    );
    return entry?.[0];
  };

  return {
    getCountryName,
    getAllCountries,
    findCountryByName,
    countryNames: readonly(countryNames),
  };
};
