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

      <div className="sec-h reveal" style={{ '--d': 0, position: 'relative', zIndex: 10 } as any}>
        <h3>ارتباط با ما</h3>
      </div>

      <div className={`panel reveal ${styles.contactPanel}`} style={{ '--d': 1 } as React.CSSProperties}>
        <div className={styles.headerBox}>
          <h2>ارتباط <span>مستقیم</span> با تایتان</h2>
          <p>تایتان فقط یک پلتفرم نیست؛ یک خانواده است. از طریق کانال‌های ویژه زیر با ما همراه شوید.</p>
        </div>

        <div className={styles.cardContainer}>
          {/* Discord - Primary */}
          <a href="#" className={`${styles.glitchCard} ${styles.discord}`}>
            <div className={styles.cardHighlight}></div>
            <div className={styles.cardContent}>
              <div className={styles.iconWrap}>
                <img src="/icons/discord.png" alt="دیسکورد" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              </div>
              <div className={styles.textWrap}>
                <h3>سرور دیسکورد تایتان</h3>
                <p>پیوستن به هزاران گیمر، پیدا کردن هم‌تیمی و ارتباط مستقیم با تیم مدیریت.</p>
              </div>
              <div className={styles.actionBtn}>عضویت <Icon name="arrow" /></div>
            </div>
          </a>

          <div className={styles.dualGrid}>
            {/* Telegram Channel */}
            <a href="#" className={`${styles.glitchCard} ${styles.teleChannel}`}>
              <div className={styles.cardHighlight}></div>
              <div className={styles.cardContent}>
                <div className={styles.iconWrap}>
                  <img src="/icons/speaker.png" alt="کانال تلگرام" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                </div>
                <div className={styles.textWrap}>
                  <h3>کانال تلگرام</h3>
                  <p>اخبار آپدیت‌ها، تخفیف‌ها و تورنمنت‌ها</p>
                </div>
              </div>
            </a>

            {/* Telegram Support */}
            <a href="#" className={`${styles.glitchCard} ${styles.teleSupport}`}>
              <div className={styles.cardHighlight}></div>
              <div className={styles.cardContent}>
                <div className={styles.iconWrap}>
                  <img src="/icons/telegram.png" alt="پشتیبانی تلگرام" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                </div>
                <div className={styles.textWrap}>
                  <h3>پشتیبانی تلگرام</h3>
                  <p>پیگیری سریع سفارش‌ها و مشکلات اکانت</p>
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
                  <img src="/icons/support.png" alt="پشتیبانی زنده" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                </div>
                <div className={styles.textWrap}>
                  <h3>پشتیبانی زنده</h3>
                  <p>چت مستقیم در سایت با کارشناسان ما</p>
                </div>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:support@titan.ir" className={`${styles.glitchCard} ${styles.email}`}>
              <div className={styles.cardHighlight}></div>
              <div className={styles.cardContent}>
                <div className={styles.iconWrap}>
                  <img src="/icons/email.png" alt="ایمیل" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                </div>
                <div className={styles.textWrap}>
                  <h3>ایمیل سازمانی</h3>
                  <p>ارتباطات رسمی، پیشنهادات و انتقادات</p>
                </div>
              </div>
            </a>
          </div>

          {/* Phone - Full Width */}
          <a href="tel:+982112345678" className={`${styles.glitchCard} ${styles.phone}`}>
            <div className={styles.cardHighlight}></div>
            <div className={styles.cardContent}>
              <div className={styles.iconWrap}>
                <img src="/icons/telephon-call.png" alt="تلفن" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              </div>
              <div className={styles.textWrap}>
                <h3>پشتیبانی تلفنی</h3>
                <p>تماس در ساعات اداری (۹ الی ۱۸) - ۰۲۱-۱۲۳۴۵۶۷۸</p>
              </div>
            </div>
          </a>

        </div>
      </div>
    </main>
  );
}
