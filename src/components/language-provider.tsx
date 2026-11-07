"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Language = "en" | "ar";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
};

const translations: Record<string, string> = {
  "Dashboard": "لوحة التحكم",
  "Add Client": "إضافة عميل",
  "Show All Service Types": "عرض أنواع الخدمات",
  "Add Service Type": "إضافة نوع خدمة",
  "Add New Client": "إضافة عميل جديد",
  "Add Vehicle": "إضافة مركبة",
  "Add Record": "إضافة سجل",
  "Add Service Record": "إضافة سجل صيانة",
  "Service Reminder": "تذكير الصيانة",
  "Menu": "القائمة",
  "Quick Add Record": "إضافة سجل سريع",
  "Vehicle ID": "رقم المركبة",
  "Logout": "تسجيل الخروج",
  "Show All Clients": "عرض جميع العملاء",
  "Client": "العميل",
  "Clients": "العملاء",
  "Manage your clients and their contact information.": "إدارة العملاء ومعلومات التواصل الخاصة بهم.",
  "Search by name or mobile number...": "ابحث بالاسم أو رقم الهاتف...",
  "Name": "الاسم",
  "Mobile": "الهاتف",
  "Mobile Number": "رقم الهاتف",
  "Status": "الحالة",
  "Created": "تاريخ الإضافة",
  "Actions": "الإجراءات",
  "Couldn't load clients": "تعذّر تحميل العملاء",
  "Try again": "إعادة المحاولة",
  "No results for": "لا توجد نتائج لـ",
  "Try a different name or mobile number.": "جرّب اسمًا أو رقم هاتف مختلفًا.",
  "No clients yet": "لا يوجد عملاء بعد",
  "Add your first client to start tracking their vehicles and service reminders.": "أضف أول عميل لبدء متابعة مركباته وتذكيرات الصيانة.",
  "Active": "نشط",
  "Inactive": "غير نشط",
  "View {name}'s details": "عرض تفاصيل {name}",
  "View": "عرض",
  "'s details": "تفاصيل",
  "+ Add Vehicle": "+ إضافة مركبة",
  "Back": "رجوع",
  "Back to Dashboard": "العودة إلى لوحة التحكم",
  "Back to login": "العودة إلى تسجيل الدخول",
  "Back to Clients": "العودة إلى العملاء",
  "Manage your vehicle maintenance services and intervals.": "إدارة خدمات صيانة المركبات والفترات الزمنية بينها.",
  "Service Types": "أنواع الخدمات",
  "Loading service types...": "جارٍ تحميل أنواع الخدمات...",
  "Enter vehicle details for Client #": "أدخل بيانات المركبة للعميل رقم",
  "Add maintenance details for Vehicle #": "أدخل تفاصيل الصيانة للمركبة رقم",
  "WhatsApp": "واتساب",
  "Error fetching clients": "حدث خطأ أثناء تحميل العملاء",
  "Error fetching client": "حدث خطأ أثناء تحميل العميل",
  "Error updating client": "حدث خطأ أثناء تحديث العميل",
  "Error deactivating client": "حدث خطأ أثناء إلغاء تنشيط العميل",
  "Error activating client": "حدث خطأ أثناء تنشيط العميل",
  "Error adding vehicle": "حدث خطأ أثناء إضافة المركبة",
  "Invalid client id": "رقم العميل غير صالح",
  "Error creating service type": "حدث خطأ أثناء إنشاء نوع الخدمة",
  "Error fetching service types": "حدث خطأ أثناء تحميل أنواع الخدمات",
  "Error fetching dashboard": "حدث خطأ أثناء تحميل لوحة التحكم",
  "Error marking reminder as contacted": "حدث خطأ أثناء تسجيل التواصل بشأن التذكير",
  "Error postponing reminder": "حدث خطأ أثناء تأجيل التذكير",
  "Error generating WhatsApp link": "حدث خطأ أثناء إنشاء رابط واتساب",
  "Error creating service record": "حدث خطأ أثناء إنشاء سجل الصيانة",
  "Error fetching service records": "حدث خطأ أثناء تحميل سجلات الصيانة",
  "Error requesting password reset": "حدث خطأ أثناء طلب إعادة تعيين كلمة المرور",
  "Error resetting password": "حدث خطأ أثناء إعادة تعيين كلمة المرور",
  "Error logging in": "حدث خطأ أثناء تسجيل الدخول",
  "Close": "إغلاق",
  "failed to create client": "تعذّر إنشاء العميل",
  "failed to update client": "تعذّر تحديث بيانات العميل",
  "failed to deactivate client": "تعذّر إلغاء تنشيط العميل",
  "failed to activate client": "تعذّر تنشيط العميل",
  "failed to add vehicle to client": "تعذّرت إضافة المركبة للعميل",
  "failed to create service type": "تعذّر إنشاء نوع الخدمة",
  "Light mode": "الوضع الفاتح",
  "Dark mode": "الوضع الداكن",
  "Switch to light mode": "التبديل إلى الوضع الفاتح",
  "Switch to dark mode": "التبديل إلى الوضع الداكن",
  "Interval (months)": "الفترة (بالأشهر)",
  "months": "أشهر",
  "No service types found. Add your first service type to get started.": "لم يتم العثور على أنواع خدمات. أضف أول نوع خدمة للبدء.",
  "Create a maintenance service and define its interval.": "أنشئ خدمة صيانة وحدّد الفترة الزمنية لها.",
  "Service Name": "اسم الخدمة",
  "e.g. Oil Change": "مثال: تغيير الزيت",
  "e.g. 3": "مثال: 3",
  "Specify how often this service should be repeated.": "حدّد عدد الأشهر بين كل مرة وأخرى لهذه الخدمة.",
  "Saving...": "جارٍ الحفظ...",
  "Enter client details and their vehicle information.": "أدخل بيانات العميل ومعلومات مركبته.",
  "Client Name": "اسم العميل",
  "Enter client name": "أدخل اسم العميل",
  "Vehicle Details": "بيانات المركبة",
  "Plate Number": "رقم اللوحة",
  "Enter plate number": "أدخل رقم اللوحة",
  "Make": "الشركة المصنّعة",
  "e.g. Toyota": "مثال: تويوتا",
  "Model": "الطراز",
  "e.g. Corolla": "مثال: كورولا",
  "Year": "سنة الصنع",
  "e.g. 2022": "مثال: 2022",
  "Existing Client": "عميل حالي",
  "Existing Client ID": "رقم العميل الحالي",
  "Enter client ID": "أدخل رقم العميل",
  "Add Vehicle to Client": "إضافة مركبة للعميل",
  "Enter vehicle details for Client #{id}.": "أدخل بيانات المركبة للعميل رقم {id}.",
  "Plate": "اللوحة",
  "Vehicles": "المركبات",
  "Manage this client's vehicles and service records.": "إدارة مركبات هذا العميل وسجلات الصيانة الخاصة به.",
  "No vehicles yet": "لا توجد مركبات بعد",
  "Add a vehicle to start logging services and reminders for this client.": "أضف مركبة لبدء تسجيل الخدمات والتذكيرات لهذا العميل.",
  "Client Details": "تفاصيل العميل",
  "Edit Client": "تعديل العميل",
  "Update the client's contact information.": "حدّث معلومات التواصل الخاصة بالعميل.",
  "Save Changes": "حفظ التغييرات",
  "Save": "حفظ",
  "Cancel": "إلغاء",
  "Deactivate Client": "إلغاء تنشيط العميل",
  "Activate Client": "تنشيط العميل",
  "Client not found": "العميل غير موجود",
  "This client doesn't exist or may have been removed.": "هذا العميل غير موجود أو ربما تمت إزالته.",
  "Couldn't load this client": "تعذّر تحميل بيانات العميل",
  "Something went wrong while loading. Check your connection and try again.": "حدث خطأ أثناء التحميل. تحقق من اتصالك وحاول مجددًا.",
  "Deactivate {name}?": "إلغاء تنشيط {name}؟",
  "This client will be marked as inactive. You can reactivate them later from this page.": "سيتم وضع علامة غير نشط على هذا العميل. يمكنك إعادة تنشيطه لاحقًا من هذه الصفحة.",
  "Deactivating...": "جارٍ إلغاء التنشيط...",
  "Yes, deactivate": "نعم، ألغِ التنشيط",
  "Add maintenance details for Vehicle #{id}.": "أدخل تفاصيل الصيانة للمركبة رقم {id}.",
  "Service Type": "نوع الخدمة",
  "Select a service type": "اختر نوع الخدمة",
  "Service Date": "تاريخ الصيانة",
  "Odometer": "عداد المسافة",
  "Enter current mileage": "أدخل المسافة الحالية",
  "Enter the vehicle's current mileage.": "أدخل المسافة الحالية للمركبة.",
  "Couldn't load reminders": "تعذّر تحميل التذكيرات",
  "No reminders right now": "لا توجد تذكيرات حاليًا",
  "You're all caught up. Reminders appear here when a service is due within 7 days.": "أنت على اطلاع بكل شيء. ستظهر التذكيرات هنا عندما يحين موعد خدمة خلال 7 أيام.",
  "reminder pending contact": "تذكير بانتظار التواصل",
  "reminders pending contact": "تذكيرات بانتظار التواصل",
  "Vehicle": "المركبة",
  "Service": "الخدمة",
  "Due Date": "تاريخ الاستحقاق",
  "Contacted": "تم التواصل",
  "Pending": "قيد الانتظار",
  "Mark Contacted": "تحديد كتم التواصل",
  "Edit": "تعديل",
  "Postpone": "تأجيل",
  "Failed to mark as contacted": "تعذّر تسجيل التواصل",
  "Failed to postpone reminder": "تعذّر تأجيل التذكير",
  "Failed to generate WhatsApp link": "تعذّر إنشاء رابط واتساب",
  "Failed to update client": "تعذّر تحديث بيانات العميل",
  "Failed to deactivate client. Please try again.": "تعذّر إلغاء تنشيط العميل. حاول مجددًا.",
  "Failed to activate client": "تعذّر تنشيط العميل",
  "Deactivate": "إلغاء تنشيط",
  "Your workshop, organized": "ورشتك، منظمة",
  "Manage your": "أدر",
  "service business": "أعمال الصيانة",
  "with confidence.": "بكل ثقة.",
  "Keep track of clients, vehicles, maintenance records, and upcoming service reminders — all in one place.": "تابع العملاء والمركبات وسجلات الصيانة وتذكيرات الخدمات القادمة — كل ذلك في مكان واحد.",
  "Organized client records": "سجلات عملاء منظمة",
  "Keep customer information accessible.": "اجعل معلومات العملاء في متناولك.",
  "Maintenance reminders": "تذكيرات الصيانة",
  "Stay on top of upcoming services.": "تابع مواعيد الخدمات القادمة.",
  "Smart maintenance management. One simple workspace.": "إدارة ذكية للصيانة. مساحة عمل واحدة وبسيطة.",
  "SERVICE MANAGEMENT": "إدارة الخدمات",
  "Welcome back": "مرحبًا بعودتك",
  "Sign in": "تسجيل الدخول",
  "Enter your credentials to access your dashboard.": "أدخل بياناتك للوصول إلى لوحة التحكم.",
  "Email address": "البريد الإلكتروني",
  "you@example.com": "you@example.com",
  "Password": "كلمة المرور",
  "Enter your password": "أدخل كلمة المرور",
  "If an account exists for": "إذا كان هناك حساب مرتبط بـ",
  ", we sent a link to reset your password. It's valid for 15 minutes.": "، فقد أرسلنا رابطًا لإعادة تعيين كلمة المرور. الرابط صالح لمدة 15 دقيقة.",
  "Logging in...": "جارٍ تسجيل الدخول...",
  "Login to Dashboard": "تسجيل الدخول إلى لوحة التحكم",
  "Secure access to your workspace": "وصول آمن إلى مساحة عملك",
  "Password recovery": "استعادة كلمة المرور",
  "Forgot password?": "هل نسيت كلمة المرور؟",
  "Enter your email and we&apos;ll send you a link to choose a new password.": "أدخل بريدك الإلكتروني وسنرسل إليك رابطًا لاختيار كلمة مرور جديدة.",
  "Send reset link": "إرسال رابط إعادة التعيين",
  "Sending...": "جارٍ الإرسال...",
  "Check your email": "تحقق من بريدك الإلكتروني",
  "If an account exists for {email}, we sent a link to reset your password. It&apos;s valid for 15 minutes.": "إذا كان هناك حساب مرتبط بـ {email}، فقد أرسلنا رابطًا لإعادة تعيين كلمة المرور. الرابط صالح لمدة 15 دقيقة.",
  "Invalid reset link": "رابط إعادة التعيين غير صالح",
  "This link is missing its token. Request a new one.": "رمز التحقق غير موجود في هذا الرابط. اطلب رابطًا جديدًا.",
  "Request a new link": "طلب رابط جديد",
  "Password updated": "تم تحديث كلمة المرور",
  "Redirecting you to the login page...": "جارٍ تحويلك إلى صفحة تسجيل الدخول...",
  "Go to login now": "الانتقال إلى تسجيل الدخول الآن",
  "Choose a new password": "اختر كلمة مرور جديدة",
  "Use at least 8 characters.": "استخدم 8 أحرف على الأقل.",
  "New password": "كلمة المرور الجديدة",
  "Confirm new password": "تأكيد كلمة المرور الجديدة",
  "Updating...": "جارٍ التحديث...",
  "Update password": "تحديث كلمة المرور",
  "Password must be at least 8 characters": "يجب ألا تقل كلمة المرور عن 8 أحرف",
  "Passwords do not match": "كلمتا المرور غير متطابقتين",
  "Network error. Please try again.": "خطأ في الاتصال. حاول مجددًا.",
  "Failed to create service type": "تعذّر إنشاء نوع الخدمة",
  "Failed to load service types. Please refresh and try again.": "تعذّر تحميل أنواع الخدمات. حدّث الصفحة وحاول مجددًا.",
  "Overdue": "متأخر",
  "New Client this month": "عميل جديد",
  "Clients visited this month": "عملاء تمت زيارتهم",
  "Services this month": "الخدمات هذا الشهر",
  "Active clients": "العملاء النشطون",
  "All": "الكل",
  "No prior data": "لا توجد بيانات سابقة",
  "vs last month": "مقارنة بالشهر الماضي",
  "Not contacted yet":"لم يتم التواصل بعد",
  "All caught up":"تم التواصل مع الجميع",
  "Couldn't load dashboard data":"تعذّر تحميل بيانات لوحة التحكم",
  "new this month":"جديد هذا الشهر",
  "No reminders match this filter":"لا توجد تذكيرات مطابقة لهذا الفلتر",

};

const LanguageContext = createContext<LanguageContextValue | null>(null);

let currentLanguage: Language = "en";
const languageListeners = new Set<() => void>();

function getLanguageSnapshot(): Language {
  try {
    const savedLanguage = window.localStorage.getItem("reminder-car-language");
    if (savedLanguage === "ar" || savedLanguage === "en") {
      currentLanguage = savedLanguage;
    }
  } catch (error) {
    console.error("Failed to load saved language preference:", error);
  }
  return currentLanguage;
}

function subscribeToLanguage(listener: () => void) {
  languageListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== "reminder-car-language") return;
    currentLanguage = event.newValue === "ar" ? "ar" : "en";
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    (): Language => "en",
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    currentLanguage = nextLanguage;
    try {
      window.localStorage.setItem("reminder-car-language", nextLanguage);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
    languageListeners.forEach((listener) => listener());
  }, []);

  const t = useCallback(
    (text: string) => (language === "ar" ? translations[text] ?? text : text),
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
