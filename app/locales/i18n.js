
import { default as i18n, default as I18n } from "i18n-js";
import memoize from "lodash.memoize"; // Use for caching/memoize for better performance
import { getSavedTranslation } from "../utils/AsyncStorageHelper";
import { debugLog } from "../utils/EDConstants";

const getLocalTranslations = {
  // lazy requires (metro bundler does not support symlinks)

  en: () => require("../locales/en_new.json"),
  fr: () => require("../locales/fr_new.json"),
  ar: () => require("../locales/ar_new.json")
}

export const getServerTranslations = async (lan) => {
  // lazy requires (metro bundler does not support symlinks)

  let temp = undefined

  await getSavedTranslation(
    value => {
      if
        (value !== undefined &&
        value !== null &&
        value !== 0) {
        JSON.parse(value).map(data => {
          if (data.key === lan) {
            temp = data
          }
        })

      }
    },
    err => {
    }
  )
  
  return temp
}

export const strings = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
)

export const isRTLCheck = () => {
  return I18n.currentLocale().indexOf('ar') === 0;
}

export const setI18nConfig = (lan) => {




  // clear translation cache
  strings.cache.clear()

  // set i18n-js config
  const languageTag = lan !== undefined && lan !== null && lan !== "" ? lan : I18n.currentLocale()

  getServerTranslations(languageTag).then(value => {
    if (value !== undefined && value !== null)
      i18n.translations = {
        [languageTag]: value
      }
    else
      i18n.translations = { [languageTag]: getLocalTranslations[languageTag]() };
  })

  i18n.locale = languageTag

}