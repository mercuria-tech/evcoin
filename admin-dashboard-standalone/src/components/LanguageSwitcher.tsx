import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.setAttribute('dir', lng === 'ar' || lng === 'fa' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-foreground">Language:</span>
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ar">العربية</SelectItem>
          <SelectItem value="fa">فارسی</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
