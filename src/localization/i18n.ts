import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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

        // Dashboard
        dashboardHeader: "مروری بر سیستم کسب‌وکار شما",
      },
    },
  },
});

export default i18n;
