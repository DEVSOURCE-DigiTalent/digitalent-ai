import { Languages } from 'lucide-react';
import { useLanguageStore } from '@/lib/i18n';
import './language-switcher.css';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();
  return <div className="language-switcher" role="group" aria-label={language === 'vi' ? 'Ngôn ngữ giao diện' : 'Interface language'}>
    <Languages size={15} aria-hidden="true" />
    {(['vi', 'en'] as const).map(code => <button key={code} type="button" lang={code}
      aria-label={code === 'vi' ? 'Tiếng Việt' : 'English'} aria-pressed={language === code}
      title={code === 'vi' ? 'Tiếng Việt' : 'English'} onClick={() => setLanguage(code)}>{code.toUpperCase()}</button>)}
  </div>;
}
