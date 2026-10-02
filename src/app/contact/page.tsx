import React from 'react';
import styles from './page.module.css';
import { Icon } from '@/components/Icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ارتباط با ما | تایتان',
  description: 'راه‌های ارتباطی با تیم تایتان',
};

export default function ContactPage() {
  return (
    <main className={`main ${styles.contactMain}`}>
      {/* Background Elements */}
      <div className={styles.bgGrid}></div>
      <div className={styles.ambientGlow1}></div>
      <div className={styles.ambientGlow2}></div>

      <div className={`panel reveal ${styles.contactPanel}`} style={{ '--d': 1 } as React.CSSProperties}>
        <div className={styles.topSection}>
          <div className={styles.headerContent}>
            <div className={styles.onlineBadge}>
              <span className={styles.dot}></span>
              تیم پشتیبانی آنلاین است
            </div>
            <h2>ارتباط <span>مستقیم</span> با تایتان</h2>
            <p>تایتان فقط یک پلتفرم نیست؛ یک خانواده است. از طریق کانال‌های زیر همیشه در کنار ما باشید.</p>
          </div>
          <div className={styles.robotImageWrapper}>
            <img src="/images/support-robot.png" alt="پشتیبانی تایتان" className={styles.robotImage} />
          </div>
        </div>

        <div className={styles.cardContainer}>
          {/* Discord - Primary */}
          <a href="#" className={`${styles.glitchCard} ${styles.discord}`}>
            <div className={styles.cardHighlight}></div>
            <div className={styles.cardContent}>
              <div className={styles.rightContent}>
                <div className={styles.iconWrap}>
                  <img src="/icons/discord.png" alt="دیسکورد" />
                </div>
                <div className={styles.textWrap}>
                  <h3>سرور دیسکورد تایتان</h3>
                  <p>پیوستن به هزاران گیمر، پیدا کردن هم‌تیمی و گفتگو با تیم مدیریت</p>
                </div>
              </div>
              <div className={styles.actionBtn}><Icon name="arrow" style={{transform: 'rotate(180deg)'}} /> عضویت</div>
            </div>
          </a>

          <div className={styles.dualGrid}>
            {/* Telegram Channel */}
            <a href="#" className={`${styles.glitchCard} ${styles.teleChannel}`}>
              <div className={styles.cardHighlight}></div>
              <div className={styles.cardContent}>
                <div className={styles.iconWrap}>
                  <img src="/icons/speaker.png" alt="کانال تلگرام" />
                </div>
                <div className={styles.textWrap}>
                  <h3>کانال تلگرام</h3>
                  <p>اخبار آپدیت‌ها، تخفیف‌ها و تورنمنت‌ها</p>
                  <span className={styles.cardLink}>&larr; دنبال کردن</span>
                </div>
              </div>
            </a>

            {/* Telegram Support */}
            <a href="#" className={`${styles.glitchCard} ${styles.teleSupport}`}>
              <div className={styles.cardHighlight}></div>
              <div className={styles.cardContent}>
                <div className={styles.iconWrap}>
                  <img src="/icons/telegram.png" alt="پشتیبانی تلگرام" />
                </div>
                <div className={styles.textWrap}>
                  <h3>پشتیبانی تلگرام</h3>
                  <p>پیگیری سریع سفارش‌ها و مشکلات اکانت</p>
                  <span className={styles.cardLink}>&larr; شروع گفتگو</span>
                </div>
              </div>
            </a>
          </div>

          <div className={styles.dualGrid}>
            {/* Online Chat */}
            <a href="#" className={`${styles.glitchCard} ${styles.onlineSupport}`}>
              <div className={styles.cardHighlight}></div>
              <div className={styles.cardContent}>
                <div className={styles.iconWrap}>
                  <img src="/icons/support.png" alt="پشتیبانی زنده" />
                </div>
                <div className={styles.textWrap}>
                  <h3>
                    پشتیبانی زنده 
                    <span className={styles.liveBadge}><span className={styles.dot}></span> آنلاین</span>
                  </h3>
                  <p>چت مستقیم در سایت با کارشناسان ما</p>
                  <span className={styles.cardLink}>&larr; چت کنید</span>
                </div>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:support@titan.ir" className={`${styles.glitchCard} ${styles.email}`}>
              <div className={styles.cardHighlight}></div>
              <div className={styles.cardContent}>
                <div className={styles.iconWrap}>
                  <img src="/icons/email.png" alt="ایمیل" />
                </div>
                <div className={styles.textWrap}>
                  <h3>ایمیل سازمانی</h3>
                  <p>ارتباطات رسمی، پیشنهادها و انتقادها</p>
                  <span className={styles.cardLink}>&larr; ارسال ایمیل</span>
                </div>
              </div>
            </a>
          </div>

          {/* Phone - Full Width */}
          <a href="tel:+982112345678" className={`${styles.glitchCard} ${styles.phone}`}>
            <div className={styles.cardHighlight}></div>
            <div className={styles.cardContent}>
              <div className={styles.iconWrap}>
                <img src="/icons/telephon-call.png" alt="تلفن" />
              </div>
              <div className={styles.textWrap}>
                <h3>پشتیبانی تلفنی</h3>
                <p>همه روزه از ۹ صبح تا ۱۰ شب</p>
                <span className={styles.cardLink}>&larr; تماس</span>
              </div>
            </div>
          </a>

        </div>
      </div>
    </main>
  );
}
