import type { AppLocale } from "@/i18n/routing";

export const uiCopy: Record<
  AppLocale,
  {
    repo: string;
    searchPlaceholder: string;
    docs: string;
    more: string;
    previous: string;
    next: string;
    onThisPage: string;
    updated: string;
    edit: string;
  }
> = {
  ru: {
    repo: "Репозиторий",
    searchPlaceholder: "Поиск по документации...",
    docs: "Документация",
    more: "Дополнительно",
    previous: "Назад",
    next: "Вперед",
    onThisPage: "На странице",
    updated: "Обновлено",
    edit: "Редактировать",
  },
  en: {
    repo: "Repository",
    searchPlaceholder: "Search docs...",
    docs: "Docs",
    more: "More",
    previous: "Previous",
    next: "Next",
    onThisPage: "On this page",
    updated: "Updated",
    edit: "Edit page",
  },
};
