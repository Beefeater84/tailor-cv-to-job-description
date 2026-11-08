# Tailor CV

ИИ-агент, который помогает подогнать резюме (CV) под вакансию. Работает в [Claude Code](https://claude.com/claude-code) на вашем компьютере.

English version: [README.md](README.md).

## Что умеет сейчас (v0.1.0)

- **Проверить CV по правилам.** Вы даёте Claude Code своё CV, он проверяет его по правилам из [`tailor-cv/rules/`](tailor-cv/rules/README.md) (шапка, summary, навыки, опыт, перерывы в работе, проекты, образование, общие правила) и по правилам стиля из [`tailor-cv/style/`](tailor-cv/style/README.md) (признаки текста, написанного ИИ). В ответ — список того, что нарушает правила, почему это важно для рекрутера и как исправить.
- **Проверить CV под вакансию.** Добавьте ссылку на вакансию, и проверка покажет ещё, насколько CV ей соответствует: требования и ключевые слова.
- **Прочитать вакансию по ссылке.** Модуль vacancy reader открывает страницу, достаёт название, компанию и описание вакансии и сохраняет их в Markdown. Подробности: [`vacancy-reader/README.md`](vacancy-reader/README.md).

Пока нет: автоматического написания CV и сопроводительного письма под вакансию и создания PDF. До этого можно попросить Claude Code переписать CV по правилам прямо в чате.

## Установка на Windows

Для Claude Code нужен аккаунт Claude с тарифом Pro или Max (или аккаунт Anthropic Console).

Откройте **PowerShell** (меню Пуск → наберите «PowerShell») и выполните шаги по очереди.

### 1. Git и Node.js

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

Закройте PowerShell и откройте снова, чтобы он увидел новые программы. Проверка:

```powershell
git --version
node --version   # нужна v24 или новее
```

### 2. Claude Code

```powershell
irm https://claude.ai/install.ps1 | iex
```

Снова откройте PowerShell и запустите `claude`. Он попросит войти в аккаунт Claude через браузер. Потом наберите `/exit`.

Если удобнее работать в редакторе, поставьте [VS Code](https://code.visualstudio.com/) и расширение «Claude Code»: работает так же.

### 3. Скачать проект

```powershell
cd $HOME\Documents
git clone https://github.com/Beefeater84/tailor-cv-to-job-description.git tailor-cv
cd tailor-cv
```

### 4. Настроить чтение вакансий

Нужно только для чтения вакансий по ссылке.

```powershell
cd vacancy-reader
npm ci
npm run setup
cd ..
```

`npm run setup` скачивает браузер (Chromium) для чтения страниц вакансий, это займёт несколько минут.

Необязательно: ключ Anthropic API позволяет читать вакансии с сайтов, для которых нет правила (сейчас правило есть только для careers-page.com). Скопируйте `vacancy-reader\.env.example` в `vacancy-reader\.env` и впишите ключ после `ANTHROPIC_API_KEY=`. Без ключа Claude Code прочитает такую страницу сам.

### 5. Папка для вашего CV

```powershell
mkdir my-cv
```

Положите туда своё CV в PDF (в Word: Файл → Сохранить как → PDF) или в виде Markdown или текстового файла. Папку `my-cv/` git игнорирует, так что через этот проект ваше CV никуда не уйдёт с компьютера.

## Как пользоваться

Запустите Claude Code в папке проекта:

```powershell
cd $HOME\Documents\tailor-cv
claude
```

И напишите обычными словами, что нужно, на любом языке.

**Проверить CV по правилам:**

> Проверь моё CV my-cv/cv.pdf по правилам. Отчёт запиши в my-cv/report.md.

**Проверить CV под вакансию:**

> Проверь моё CV my-cv/cv.pdf по правилам и под эту вакансию: https://…

**Прочитать вакансию:**

> Прочитай вакансию: https://…

**Исправить CV:**

> Перепиши summary по правилам. Используй только факты из моего CV, а чего не хватает — спроси у меня.

Агент никогда не придумывает опыт: если правилу нужен факт, которого нет в CV (цифра, результат, часовой пояс), он спросит вас.

### Обновление

```powershell
cd $HOME\Documents\tailor-cv
git pull
cd vacancy-reader
npm ci
```
