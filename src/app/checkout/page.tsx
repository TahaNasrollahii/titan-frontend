'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icons';
import { useAppContext } from '@/context/AppContext';
import './checkout.css';

type GameAccount = {
  id: string;
  title: string;
  username: string;
  password?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, addToast } = useAppContext();

  // Mocked saved accounts from "dashboard"
  const [savedAccounts, setSavedAccounts] = useState<GameAccount[]>([
    { id: 'acc1', title: 'اکانت اصلی فورتنایت', username: 'pro_gamer_99' },
    { id: 'acc2', title: 'اکانت ولورانت', username: 'titan_slayer' }
  ]);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    savedAccounts.length > 0 ? savedAccounts[0].id : null
  );

  const [isAddingNew, setIsAddingNew] = useState(savedAccounts.length === 0);
  const [newAccTitle, setNewAccTitle] = useState('');
  const [newAccUser, setNewAccUser] = useState('');
  const [newAccPass, setNewAccPass] = useState('');

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSaveNewAccount = () => {
    if (!newAccTitle.trim() || !newAccUser.trim() || !newAccPass.trim()) {
      addToast({ title: 'خطا', text: 'لطفاً تمام فیلدهای اکانت را پر کنید', icon: 'info' });
      return;
    }
    const newAcc = {
      id: Math.random().toString(36).substring(7),
      title: newAccTitle,
      username: newAccUser,
      password: newAccPass, // In a real app this should be handled securely
    };
    setSavedAccounts([...savedAccounts, newAcc]);
    setSelectedAccountId(newAcc.id);
    setIsAddingNew(false);
    setNewAccTitle('');
    setNewAccUser('');
    setNewAccPass('');
    addToast({ title: 'موفق', text: 'اکانت با موفقیت ذخیره شد', icon: 'check' });
  };

  const handlePaymentSubmit = () => {
    if (!selectedAccountId) {
      addToast({ title: 'خطا', text: 'لطفاً یک اکانت بازی برای دریافت سفارش انتخاب کنید', icon: 'info' });
      return;
    }
    
    // Process redirect to gateway
    addToast({ title: 'در حال انتقال...', text: 'در حال انتقال به درگاه پرداخت', icon: 'cart' });
    
    // Mock the delay of gateway redirect
    setTimeout(() => {
       // Since it's a demo, we can just show a success message or navigate home
       // router.push('/payment-gateway-mock');
       alert('انتقال به درگاه پرداخت... (پایان دمو)');
    }, 1500);
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page reveal" style={{ '--d': 1 } as React.CSSProperties}>
        <div className="checkout-empty">
          <Icon name="cart" />
          <h2>سبد خرید شما خالی است</h2>
          <Link href="/store" className="chk-btn primary">بازگشت به فروشگاه</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page reveal" style={{ '--d': 1 } as React.CSSProperties}>
      <div className="checkout-header">
        <h1>تکمیل سفارش</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          
          <div className="chk-section reveal" style={{ '--d': 2 } as React.CSSProperties}>
            <div className="chk-sec-header">
              <div className="chk-sec-icon"><Icon name="user" /></div>
              <h2>اطلاعات اکانت بازی</h2>
            </div>
            <p className="chk-sec-desc">
              محصولات خریداری شده مستقیماً روی اکانت شما فعال می‌شوند. لطفاً اکانت مورد نظر را انتخاب کرده یا اکانت جدیدی اضافه کنید.
            </p>

            {!isAddingNew ? (
              <div className="accounts-list">
                {savedAccounts.map(acc => (
                  <div 
                    key={acc.id} 
                    className={`account-card ${selectedAccountId === acc.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAccountId(acc.id)}
                  >
                    <div className="acc-radio">
                      <div className="acc-radio-inner"></div>
                    </div>
                    <div className="acc-info">
                      <h4>{acc.title}</h4>
                      <span>Username: {acc.username}</span>
                    </div>
                  </div>
                ))}

                <button className="add-acc-btn" onClick={() => setIsAddingNew(true)}>
                  <Icon name="plus" /> افزودن اکانت جدید
                </button>
              </div>
            ) : (
              <div className="new-account-form">
                <div className="form-group">
                  <label>عنوان اکانت (مثلاً اکانت اصلی)</label>
                  <input 
                    type="text" 
                    value={newAccTitle} 
                    onChange={e => setNewAccTitle(e.target.value)} 
                    placeholder="اکانت استیم / اپیک گیمز..." 
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>نام کاربری (Username / Email)</label>
                    <input 
                      type="text" 
                      value={newAccUser} 
                      onChange={e => setNewAccUser(e.target.value)} 
                      placeholder="username@email.com" 
                      dir="ltr"
                    />
                  </div>
                  <div className="form-group">
                    <label>رمز عبور (Password)</label>
                    <input 
                      type="password" 
                      value={newAccPass} 
                      onChange={e => setNewAccPass(e.target.value)} 
                      placeholder="••••••••" 
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="chk-btn primary" onClick={handleSaveNewAccount}>ذخیره و انتخاب</button>
                  {savedAccounts.length > 0 && (
                    <button className="chk-btn secondary" onClick={() => setIsAddingNew(false)}>انصراف</button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="chk-section reveal" style={{ '--d': 3 } as React.CSSProperties}>
            <div className="chk-sec-header">
              <div className="chk-sec-icon"><Icon name="card" /></div>
              <h2>روش پرداخت</h2>
            </div>
            
            <div className="payment-methods">
              <div className="pay-method selected">
                <div className="acc-radio">
                  <div className="acc-radio-inner"></div>
                </div>
                <div className="pay-info">
                  <h4>درگاه پرداخت اینترنتی زرین‌پال</h4>
                  <span>پرداخت با تمامی کارت‌های عضو شتاب</span>
                </div>
                <div className="pay-logo">
                  <span>ZarrinPal</span>
                </div>
              </div>
              <div className="pay-method disabled">
                <div className="acc-radio"></div>
                <div className="pay-info">
                  <h4>پرداخت از کیف پول</h4>
                  <span>موجودی ناکافی (موجودی: ۰ تومان)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="checkout-sidebar reveal" style={{ '--d': 4 } as React.CSSProperties}>
          <div className="chk-summary">
            <h3>فاکتور نهایی</h3>
            
            <div className="chk-items">
              {cartItems.map(item => (
                <div key={item.id} className="chk-item">
                  <img src={item.image} alt={item.title} className="chk-item-img" />
                  <div className="chk-item-details">
                    <span className="chk-item-title">{item.title}</span>
                    <span className="chk-item-qty">{item.quantity}x</span>
                  </div>
                  <span className="chk-item-price">{(item.price * item.quantity).toLocaleString('fa-IR')}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>
            
            <div className="summary-row">
              <span>مبلغ کل کالاها:</span>
              <span>{totalPrice.toLocaleString('fa-IR')} تومان</span>
            </div>
            
            <div className="summary-row total">
              <span>قابل پرداخت:</span>
              <span className="total-val">{totalPrice.toLocaleString('fa-IR')} <small>تومان</small></span>
            </div>

            <button className="chk-btn submit-btn block" onClick={handlePaymentSubmit}>
              پرداخت و ثبت سفارش <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} />
            </button>
            <p className="secure-text">
              <Icon name="lock" /> پرداخت امن و رمزنگاری شده
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
