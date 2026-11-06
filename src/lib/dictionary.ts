import { Locale } from '../types/index.ts';

export interface DictionaryStrings {
  appName: string;
  yourAddress: string;
  copy: string;
  copied: string;
  newInbox: string;
  extend: string;
  expiresIn: string;
  waiting: string;
  noSubject: string;
  from: string;
  to: string;
  date: string;
  loadImages: string;
  imagesBlocked: string;
  qrTitle: string;
  close: string;
  expired: string;
  createFailed: string;
  connectionProblem: string;
  advertisement: string;
  footerCredit: string;
  keepInbox: string;
  messageList: string;
  openMessagePane: string;
  selectMessagePrompt: string;
  deleteMessage: string;
  unread: string;
  attachments: string;
  codeChipLabel: string;
  helpTitle: string;
  helpContent: string;
  helpButton: string;
  refresh: string;
  expiringSoon: string;
  expiredTitle: string;
  expiredDesc: string;
  createNewInbox: string;
  backToList: string;
  emptyInboxDesc: string;
  minutesRemaining: string;
  generatingAddress: string;
  durationLabel: string;
  duration10m: string;
  duration2h: string;
  duration6h: string;
  duration24h: string;
  changeDuration: string;
  extendHours: string;
  extend10m: string;
}

export const dictionaries: Record<Locale, DictionaryStrings> = {
  ar: {
    appName: "SnapMail",
    yourAddress: "عنوان بريدك المؤقت",
    copy: "نسخ العنوان",
    copied: "تم النسخ!",
    newInbox: "صندوق جديد",
    extend: "تمديد 10 دقائق",
    expiresIn: "ينتهي خلال",
    waiting: "في انتظار وصول الرسائل...",
    noSubject: "(بدون موضوع)",
    from: "من",
    to: "إلى",
    date: "التاريخ",
    loadImages: "عرض الصور الخارجية",
    imagesBlocked: "[تم حجب الصور الخارجية لأمانك]",
    qrTitle: "رمز الاستجابة السريعة (QR)",
    close: "إغلاق",
    expired: "انتهت صلاحية الصندوق",
    createFailed: "تعذر إنشاء صندوق البريد، يرجى المحاولة مرة أخرى",
    connectionProblem: "مشكلة في الاتصال بالخدمة، جارٍ إعادة المحاولة تلقائياً...",
    advertisement: "إعلان",
    footerCredit: "Developed & Designed by Malek Hassan Ashour",
    keepInbox: "الاحتفاظ بهذا الصندوق بعد إغلاق المتصفح",
    messageList: "صندوق الرسائل الواردة",
    openMessagePane: "تفاصيل الرسالة",
    selectMessagePrompt: "اختر رسالة من القائمة لعرض محتواها بأمان",
    deleteMessage: "حذف الرسالة",
    unread: "غير مقروءة",
    attachments: "المرفقات",
    codeChipLabel: "رمز التحقق المكتشف",
    helpTitle: "حول SnapMail",
    helpContent: "SnapMail يوفر لك عنوان بريد إلكتروني مؤقت ومجاني فوراً. احمِ بريدك الحقيقي من الرسائل المزعجة والإعلانات وسجل في المواقع بأمان تام. الرسائل تصل مباشرة وتنتهي الصلاحية تلقائياً بعد انتهاء العد التنازلي.",
    helpButton: "مساعدة",
    refresh: "تحديث الآن",
    expiringSoon: "ينتهي قريباً",
    expiredTitle: "انتهى وقت هذا الصندوق المؤقت",
    expiredDesc: "تم حذف عنوان البريد الإلكتروني وجميع رسائله نهائياً للحفاظ على خصوصيتك وأمانك.",
    createNewInbox: "إنشاء صندوق بريد جديد",
    backToList: "العودة للقائمة",
    emptyInboxDesc: "شارك العنوان أعلاه لتلقي الرسائل ورموز التفعيل لحظة بلحظة.",
    minutesRemaining: "دقائق",
    generatingAddress: "جارٍ تجهيز العنوان المؤقت...",
    durationLabel: "مدة الصلاحية",
    duration10m: "10 دقائق",
    duration2h: "ساعتان (2h)",
    duration6h: "6 ساعات (6h)",
    duration24h: "24 ساعة (يوم)",
    changeDuration: "تغيير مدة الصلاحية",
    extendHours: "تمديد +1 ساعة",
    extend10m: "تمديد +10 د",
  },
  en: {
    appName: "SnapMail",
    yourAddress: "Your Temporary Email",
    copy: "Copy Address",
    copied: "Copied!",
    newInbox: "New Inbox",
    extend: "Extend +10m",
    expiresIn: "Expires in",
    waiting: "Waiting for incoming messages...",
    noSubject: "(No subject)",
    from: "From",
    to: "To",
    date: "Date",
    loadImages: "Load remote images",
    imagesBlocked: "[Remote images blocked for safety]",
    qrTitle: "QR Code",
    close: "Close",
    expired: "Inbox Expired",
    createFailed: "Could not create an inbox, please try again",
    connectionProblem: "Connection problem, retrying automatically...",
    advertisement: "Advertisement",
    footerCredit: "Developed & Designed by Malek Hassan Ashour",
    keepInbox: "Keep this inbox after closing browser",
    messageList: "Inbox List",
    openMessagePane: "Message Details",
    selectMessagePrompt: "Select a message from the list to view it safely",
    deleteMessage: "Delete message",
    unread: "Unread",
    attachments: "Attachments",
    codeChipLabel: "Detected Verification Code",
    helpTitle: "About SnapMail",
    helpContent: "SnapMail gives you an instant, secure disposable email address. Protect your personal inbox from spam, newsletters, and trackers when signing up for services. Incoming emails arrive live and are safely rendered.",
    helpButton: "Help",
    refresh: "Refresh now",
    expiringSoon: "Expiring soon",
    expiredTitle: "This temporary inbox has expired",
    expiredDesc: "The disposable address and its messages have been safely deleted to protect your privacy.",
    createNewInbox: "Create New Inbox",
    backToList: "Back to list",
    emptyInboxDesc: "Share the address above to receive messages and verification codes in real-time.",
    minutesRemaining: "mins",
    generatingAddress: "Generating temporary address...",
    durationLabel: "Duration",
    duration10m: "10 Minutes",
    duration2h: "2 Hours",
    duration6h: "6 Hours",
    duration24h: "24 Hours (1 Day)",
    changeDuration: "Change Duration",
    extendHours: "Extend +1h",
    extend10m: "Extend +10m",
  }
};
