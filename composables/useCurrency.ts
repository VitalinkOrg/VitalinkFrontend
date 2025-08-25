export const useCurrency = () => {
  const formatCurrency = (
    amount: number | string,
    decimalPlaces: number = 2
  ): string => {
    const numericAmount = Number(amount) || 0;
    return (
      "₡" +
      numericAmount.toLocaleString("es-CR", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })
    );
  };

  return {
    formatCurrency,
  };
};
