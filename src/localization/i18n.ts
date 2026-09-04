import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { email } from "zod";

i18n.use(initReactI18next).init({
  fallbackLng: "en",

  resources: {
    en: {
      translation: {
        appName: "electron-shadcn",
        documentation: "Documentation",
        madeBy: "Made by LuanRoger",

        titleHomePage: "Home Page",
        titleSecondPage: "Second Page",

        // Navigation
        dashboard: "Dashboard",
        products: "Products",
        categories: "Categories",
        units: "Units",
        customers: "Customers",
        purchases: "Purchases",
        sales: "Sales",
        inventory: "Inventory",
        currencies: "Currencies",
        settings: "Settings",

        // Common
        percent: "Percent",
        add: "Add",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        cancel: "Cancel",
        search: "Search",
        close: "Close",
        confirm: "Confirm",
        back: "Back",
        actions: "Actions",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
        loading: "Loading...",
        noData: "No data found",
        description: "Description",
        mobile: "Mobile",
        email: "Email",
        phone: "Phone",
        address: "Address",
        postalCode: "PostalCode",

        // Categories
        category: "Category",
        categoryName: "Category Name",
        addCategory: "Add Category",
        editCategory: "Edit Category",
        deleteCategory: "Delete Category",
        categoryDescription: "Description",
        deleteCategoryDescription:
          "Are you sure you want to delete the category {{name}}?",
        selectCategory: "Select Category",

        // Products
        product: "Product",
        productName: "Product Name",
        addProduct: "Add Product",
        editProduct: "Edit Product",
        productsDescription: "Manage your products",
        deleteProduct: "Delete Product",
        deleteProductDescription:
          "Are you sure you want to delete the product {{name}} ?",

        // Units
        unit: "Unit",
        unitName: "Unit Name",
        symbol: "Symbol",
        addUnit: "Add Unit",
        editUnit: "Edit Unit",
        deleteUnit: "Delete Unit",
        unitDescription: "Description",
        deleteUnitDescription: "Description",
        selectUnit: "Select Unit",

        // CustomerTypes
        manageCustomerType: "Manage customer type",
        addCustomerType: "Add Customer type",
        editCustomerType: "Edit Customer type",
        deleteCustomerType: "Delete Customer type",
        customerTypeDescription: "Description",
        customerTypeName: "Name",
        customerTypeProfitPercent: "Profit Percent",
        deleteCustomerTypesDescription:
          "Are you sure you want to delete the customer types {{name}} ?",

        // Customers
        addCustomer: "Add Customer",
        editCustomer: "Edit Customer",
        deleteCustomer: "Delete Customer",
        customerDescription: "Description",
        customerName: "Name",
        customerProfitPercent: "Profit Percent",
        selectCustomerType: " Select Customer type",
        customerCode: "Customer Code   ",
        customerNationalId: "National Id",
        customProfitPercent: "Profit Percent",

        deleteCustomerDescription:
          "Are you sure you want to delete the customer  {{name}} ?",

        // Dashboard
        dashboardHeader: "Overview of your business system",
      },
    },

    fa: {
      translation: {
        appName: "نرم‌افزار مدیریت",
        documentation: "مستندات",
        madeBy: "ساخته شده توسط احمد حائری",

        titleHomePage: "خانه",
        titleSecondPage: "صفحه دوم",

        // Navigation
        dashboard: "داشبورد",
        products: "محصولات",
        categories: "دسته‌بندی‌ها",
        units: "واحدها",
        customers: "مشتریان",
        purchases: "خریدها",
        sales: "فروش‌ها",
        inventory: "انبار",
        currencies: "ارزها",
        settings: "تنظیمات",

        // Common
        percent: "درصد",
        add: "افزودن",
        edit: "ویرایش",
        delete: "حذف",
        save: "ذخیره",
        cancel: "لغو",
        search: "جستجو",
        close: "بستن",
        confirm: "تأیید",
        back: "بازگشت",
        actions: "عملیات",
        status: "وضعیت",
        active: "فعال",
        inactive: "غیرفعال",
        loading: "در حال بارگذاری...",
        noData: "داده‌ای یافت نشد",
        description: "توضیحات",
        mobile: "موبایل",
        email: "ایمیل",
        phone: "تلفن",
        address: "آدرس",
        postalCode: "کد پستی",
        date: "تاریخ",
        quantity: "تعداد",

        // Categories
        category: "دسته‌بندی",
        categoryName: "نام دسته‌بندی",
        addCategory: "افزودن دسته‌بندی",
        editCategory: "ویرایش دسته‌بندی",
        deleteCategory: "حذف دسته‌بندی",
        categoryDescription: "توضیحات",
        deleteCategoryDescription:
          "از حذف دسته بندی ' {{ name }} '  اطمینان دارید ؟",
        selectCategory: "انتخاب دسته‌بندی",

        // Products
        product: "محصول",
        selectProduct: "انتخاب محصول",
        productName: "نام محصول",
        addProduct: "افزودن محصول",
        editProduct: "ویرایش محصول",
        productsDescription: "مدیریت محصولات",
        deleteProduct: "حذف محصول",
        deleteProductDescription:
          "از حذف   محصول ' {{ name }} '  اطمینان دارید ؟",

        // Units
        unit: "واحد",
        unitName: "نام واحد",
        symbol: "نماد",
        addUnit: "افزودن واحد",
        editUnit: "ویرایش واحد",
        deleteUnit: "حذف واحد",
        unitDescription: "توضیحات",
        deleteUnitDescription: "از حذف   واحد ' {{ name }} '  اطمینان دارید ؟",
        selectUnit: "انتخاب واحد",

        // customerTypes
        customerType: "نوع مشتری",
        manageCustomerType: "مدیریت انواع مشتری",
        addCustomerType: "افزودن نوع مشتری",
        editCustomerType: "ویرایش نوع مشتری",
        deleteCustomerType: "حذف نوع مشتری",
        customerTypeDescription: "توضیحات",
        customerTypeName: "نام نوع مشتری",
        customerTypeProfitPercent: "درصد سود",
        deleteCustomerTypesDescription:
          "از حذف   نوع مشتری  ' {{ name }} '  اطمینان دارید ؟",

        // Customers
        addCustomer: "افزودن مشتری",
        editCustomer: "ویرایش مشتری",
        deleteCustomer: "حذف مشتری",
        customerDescription: "توضیحات",
        customerName: "نام",
        customerProfitPercent: "درصد سود",
        selectCustomerType: "انتخاب نوع مشتری",
        customerCode: "کد مشتری",
        customerNationalId: "کد ملی",
        customProfitPercent: "درصد سود",
        deleteCustomerDescription:
          "از حذف مشتری  ' {{ name }} '  اطمینان دارید ؟",

        // currencies
        selectCurrency: "انتخاب ارز",
        currency: "ارز",
        manageCurrency: "مدیریت انواع ارز",
        addCurrency: "افزودن ارز",
        editCurrency: "ویرایش ارز",
        deleteCurrency: "حذف ارز",
        deleteCurrencyDescription:
          "از حذف ارز  ' {{ name }} '  اطمینان دارید ؟",
        currencyDescription: "توضیحات",
        isBase: "ارز پیشفرض",
        currencyName: "نام ارز",
        currencyCode: "کد ارز",

        // currencyRate
        selectCurrencyRate: "انتخاب نرخ ارز",
        currencyRate: "نرخ ارز",
        addCurrencyRate: "افزودن نرخ ارز",
        deleteCurrencyRate: "حذف نرخ ارز",
        editCurrencyRate: "ویرایش نرخ ارز",
        deleteCurrencyRateDescription:
          "از حذف نرخ ارز  ' {{ name }} '  اطمینان دارید ؟",

        // purchases
        purchaseDescription: "توضیحات",
        addPurchaseInvoice: "افزودن فاکتور خرید",
        editPurchaseInvoice: "ویرایش فاکتور خرید",
        deletePurchaseInvoice: "حذف فاکتور خرید",
        purchaseInvoiceNumber: "شماره فاکتور",
        purchaseInvoiceDate: "تاریخ شمسی",
        deletePurchaseInvoiceDescription:
          "از حذف   فاکتور خرید ' {{ name }} '  اطمینان دارید ؟",
        // purchaseItems
        purchaseItems: "اقلام خرید",
        purchaseItemDescription: "توضیحات",
        addPurchaseItem: "افزودن آیتم خرید",
        editPurchaseItem: "ویرایش آیتم خرید",
        deletePurchaseItem: "حذف آیتم خرید",
        unitPrice: "قیمت واحد",
        freightShare: "حمل و نقل (%)",
        totalPrice: "قیمت خرید",
        remainingQuantity: "باقی مانده",
        deletePurchaseItemsDescription:
          "از حذف   محصول ' {{ name }} '  اطمینان دارید ؟",
        // Dashboard
        dashboardHeader: "مروری بر سیستم کسب‌وکار شما",
      },
    },
  },
});

export default i18n;
