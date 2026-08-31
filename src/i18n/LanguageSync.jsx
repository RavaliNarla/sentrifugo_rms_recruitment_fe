import { useEffect } from "react";
import { useSelector } from "react-redux";
import i18n from "./i18n";

const LanguageSync = () => {
  const lang = useSelector((state) => state.language.lang);

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  return null;
};

export default LanguageSync;
