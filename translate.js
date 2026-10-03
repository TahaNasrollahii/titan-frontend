const fs = require('fs');
const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
  // Navigation
  'data-label="Home"': 'data-label="خانه"',
  'data-label="Games"': 'data-label="بازی‌ها"',
  'data-label="Gift cards"': 'data-label="گیفت کارت"',
  'data-label="Tournaments"': 'data-label="تورنمنت‌ها"',
  'data-label="Statistics"': 'data-label="آمار"',
  'data-label="Gear store"': 'data-label="فروشگاه"',
  'data-label="Messages"': 'data-label="پیام‌ها"',
  'data-label="Create a squad"': 'data-label="ساخت تیم"',
  'aria-label="Create a squad"': 'aria-label="ساخت تیم"',
  
  // Header & search
  '<span id="greetWord">Good evening,</span>': '<span id="greetWord">عصر بخیر،</span>',
  'userName: \\\'Player\\\'': 'userName: \\\'بازیکن\\\'',
  'placeholder="Search"': 'placeholder="جستجو"',
  'aria-label="Search games, gear and tournaments"': 'aria-label="جستجوی بازی‌ها، تجهیزات و تورنمنت‌ها"',
  '<h5>Popular searches</h5>': '<h5>جستجوهای پرطرفدار</h5>',
  'No results for “${esc(q.trim())}”': 'بدون نتیجه برای “${esc(q.trim())}”',
  'Opening page…': 'در حال باز کردن صفحه...',
  
  // Cart & Bell
  'Added to cart': 'به سبد خرید اضافه شد',
  '"You\\\'re all caught up"': '"همه چیز مرتب است"',
  'No new notifications': 'اعلان جدیدی ندارید',
  
  // Hero section
  'Popular': 'محبوب',
  'Starts in <b id="cd">': 'شروع در <b id="cd">',
  '</b> watching': '</b> در حال تماشا',
  'Added to your favourites': 'به علاقه‌مندی‌های شما اضافه شد',
  
  // Sections
  '<h3>New Games</h3>': '<h3>بازی‌های جدید</h3>',
  'See More': 'مشاهده همه',
  '<h3>Last Downloads</h3>': '<h3>آخرین دانلودها</h3>',
  'Sports simulator': 'شبیه‌ساز ورزشی',
  '<h3>Your Statistic</h3>': '<h3>آمار شما</h3>',
  'Total hours': 'مجموع ساعات',
  
  // Downloads
  'Paused': 'متوقف شد',
  'Cancelled': 'لغو شد',
  'Ready to play': 'آماده بازی',
  ' hour ': ' ساعت ',
  ' min.': ' دقیقه.',
  ' min ': ' دقیقه ',
  '} s\`;': '} ثانیه\`;',
  ' GB installed': ' گیگابایت نصب شد',
  ' MB of ': ' مگابایت از ',
  'Installed and ready to play': 'نصب شد و آماده بازی است',
  'Launching…': 'در حال اجرا...',
  'Download cancelled': 'دانلود لغو شد',
  
  // Friends & Chats
  'In game — ': 'در بازی — ',
  'Online': 'آنلاین',
  'Away': 'آفلاین',
  '<span class="ingame">In Game</span>': '<span class="ingame">در بازی</span>',
  'Invite sent': 'دعوت‌نامه ارسال شد',
  ' will see it in their lobby': ' آن را در لابی خود خواهد دید',
  'Opening chat…': 'در حال باز کردن چت...',
  'started playing ': 'شروع به بازی کرد: ',
  'is online': 'آنلاین است',
  'New squad': 'تیم جدید',
  'Invite friends to your lobby': 'دوستان خود را به لابی دعوت کنید',
  
  // Announcements
  'Registration closes in 10 minutes': 'ثبت‌نام تا 10 دقیقه دیگر بسته می‌شود',
  'Flash sale': 'فروش ویژه',
  'Titan Pro Headset — 20% off for the next hour': 'هدست تایتان پرو — 20٪ تخفیف برای یک ساعت آینده',
  'Rocket Series': 'سری راکت',
  'Round 2 bracket is live': 'براکت دور دوم شروع شد',
  
  // Greetings Logic
  'Good night,': 'شب بخیر،',
  'Good morning,': 'صبح بخیر،',
  'Good afternoon,': 'ظهر بخیر،',
  'Good evening,': 'عصر بخیر،',

  // Misc aria-labels
  'aria-label="Your profile"': 'aria-label="پروفایل شما"',
  'aria-label="Friends"': 'aria-label="دوستان"',
  'aria-label="Main navigation"': 'aria-label="منوی اصلی"',
  'aria-label="Titan home"': 'aria-label="خانه تایتان"',
  'aria-label="Search"': 'aria-label="جستجو"',
  'aria-label="Cart"': 'aria-label="سبد خرید"',
  'aria-label="Notifications"': 'aria-label="اعلان‌ها"',
  'aria-label="New games"': 'aria-label="بازی‌های جدید"',
  'aria-label="Next games"': 'aria-label="بازی‌های بعدی"',
  'aria-label="Pause download"': 'aria-label="توقف دانلود"',
  'aria-label="Cancel download"': 'aria-label="لغو دانلود"',
  'aria-label="Open statistics"': 'aria-label="باز کردن آمار"',
  'aria-label="Watch trailer"': 'aria-label="تماشای تریلر"',
  'aria-label="Resume download"': 'aria-label="ادامه دانلود"',
  'aria-label="Launch game"': 'aria-label="اجرای بازی"',
  
  // "Add ... to cart"
  'aria-label="Add ${esc(g.t)} to cart"': 'aria-label="افزودن ${esc(g.t)} به سبد خرید"',

  // "Show ..."
  'aria-label="Show ${esc(s.title)}"': 'aria-label="نمایش ${esc(s.title)}"',
  
  // "Loading trailer..."
  'Loading trailer…': 'در حال بارگذاری تریلر...',
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.replaceAll(key, value);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Translated successfully.');
