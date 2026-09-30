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
      <div className={styles.watermark}>CONTACT</div>
      <div className={styles.ambientGlow1}></div>
      <div className={styles.ambientGlow2}></div>

      <div className="sec-h reveal" style={{ '--d': 0 } as React.CSSProperties, { position: 'relative', zIndex: 10 } as any}>
        <h3>ارتباط با ما</h3>
      </div>

      <div className={`panel reveal ${styles.contactPanel}`} style={{ '--d': 1 } as React.CSSProperties}>
        <div className={styles.headerBox}>
          <h2>ارتباط <span>مستقیم</span> با هسته تایتان</h2>
          <p>تایتان فقط یک پلتفرم نیست؛ یک خانواده است. از طریق کانال‌های ویژه زیر با ما همراه شوید.</p>
        </div>

        <div className={styles.cardContainer}>
          {/* Discord - Primary */}
          <a href="#" className={`${styles.glitchCard} ${styles.discord}`}>
            <div className={styles.cardHighlight}></div>
            <div className={styles.cardContent}>
              <div className={styles.iconWrap}>
                <Icon name="users" />
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2L15 22L11 13L2 9L22 2z"></path></svg>
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
                  <Icon name="chat" />
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
                  <Icon name="play" />
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
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
