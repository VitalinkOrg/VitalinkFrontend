import type { Package, Product } from "~/types";

/**
 * Composable for handling assessment appointment packages.
 * Provides utilities to create, identify, and manage standard assessment packages.
 */
export const useAssessmentPackage = () => {
  const ASSESSMENT_PRODUCT_CODE = "ASSESSMENT_APPOINTMENT";
  const DEFAULT_PRICE = 18000;
  const DEFAULT_NAME = "Cita de Valoración";
  const DEFAULT_DESCRIPTION = "Cita de valoración médica inicial";
  const DEFAULT_ASSESSMENT_DETAILS = [
    "MEDICAL_CONSULTATION",
    "CLINICAL_EVALUATION",
    "INITIAL_DIAGNOSIS",
  ];

  /**
   * Creates a standardized assessment appointment package.
   *
   * @param price - The base price in the smallest currency unit (e.g., colones). Default: 18000.
   * @param discount - Discount percentage (0–100). Default: 0.
   * @param packageId - Optional package ID. Default: 0.
   * @returns A fully formed `Package` object.
   *
   * @example
   * const assessment = createAssessmentPackage(20000, 10, 1001); // ₡20,000 with 10% off and ID 1001
   */
  const createAssessmentPackage = (
    price: number = DEFAULT_PRICE,
    discount: number = 0,
    packageId: number = 0
  ): Package => {
    const discountRate = discount / 100;
    const discountedPrice = price * (1 - discountRate);

    const product: Product = {
      id: 9999,
      code: ASSESSMENT_PRODUCT_CODE,
      name: DEFAULT_NAME,
      type: "MEDICAL_PRODUCT",
      description: DEFAULT_DESCRIPTION,
      father_code: null,
      value1: price.toString(),
      value2: null,
      created_date: new Date().toISOString(),
      updated_date: null,
      is_deleted: 0,
    };

    return {
      id: packageId,
      product,
      reference_price: price,
      discount,
      discounted_price: discountedPrice,
      services_offer: {
        ASSESSMENT_DETAILS: DEFAULT_ASSESSMENT_DETAILS,
      },
      is_king: 0,
      observations: "",
      postoperative_assessments: null,
      is_deleted: 0,
      created_date: new Date().toISOString(),
      updated_date: null,
    };
  };

  /**
   * Checks if a given package is an assessment appointment package.
   *
   * @param pkg - The package to check.
   * @returns `true` if the package is an assessment type, `false` otherwise.
   *
   * Detection is based on:
   * - Product code equals 'ASSESSMENT_APPOINTMENT'
   * - Or product name contains 'valoración' or 'assessment' (case-insensitive)
   */
  const isAssessmentPackage = (pkg: Package): boolean => {
    const { code, name } = pkg.product;
    return (
      code === ASSESSMENT_PRODUCT_CODE ||
      name.toLowerCase().includes("valoración") ||
      name.toLowerCase().includes("assessment")
    );
  };

  /**
   * Adds an assessment package to the beginning of a package list.
   *
   * @param packages - Existing list of packages.
   * @param price - Optional custom price for the assessment.
   * @param discount - Optional discount percentage.
   * @param packageId - Optional package ID.
   * @returns New array with the assessment package prepended.
   *
   * @example
   * const updated = addAssessmentPackage(existingPackages, 20000, 0, 1001);
   */
  const addAssessmentPackage = (
    packages: Package[],
    price?: number,
    discount?: number,
    packageId?: number
  ): Package[] => {
    const assessment = createAssessmentPackage(price, discount, packageId);
    return [assessment, ...packages];
  };

  /**
   * Filters and returns only assessment packages from a list.
   *
   * @param packages - List of packages to filter.
   * @returns Array containing only assessment packages.
   */
  const getAssessmentPackages = (packages: Package[]): Package[] => {
    return packages.filter(isAssessmentPackage);
  };

  /**
   * Returns a new array excluding all assessment packages.
   *
   * @param packages - List of packages to filter.
   * @returns Array without assessment packages.
   */
  const removeAssessmentPackages = (packages: Package[]): Package[] => {
    return packages.filter((pkg) => !isAssessmentPackage(pkg));
  };

  return {
    createAssessmentPackage,
    isAssessmentPackage,
    addAssessmentPackage,
    getAssessmentPackages,
    removeAssessmentPackages,
  };
};
