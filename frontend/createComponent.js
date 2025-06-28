import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

// Получаем эквивалент __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Создаем интерфейс для ввода
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const createReactComponent = (componentName) => {
  // Путь к папке компонента
  const componentFolder = path.join(__dirname, 'src', 'Components', componentName)

  // Создаем папку, если не существует
  if (!fs.existsSync(componentFolder)) {
    fs.mkdirSync(componentFolder, { recursive: true })
    console.log(`Папка для компонента ${componentName} создана.`)
  } else {
    console.log(`Папка ${componentName} уже существует.`)
  }

  // Пути к файлам
  const componentFile = path.join(componentFolder, `${componentName}.tsx`)
  const scssFile = path.join(componentFolder, `${componentName}.module.scss`)

  // Шаблон компонента
  const componentContent = `
'use client';
import React from 'react';
import styles from './${componentName}.module.scss';

interface ${componentName}Props {
  // Определи пропсы, если нужно
}

const ${componentName}: React.FC<${componentName}Props> = () => {
  return (
    <div className={styles.${componentName.toLowerCase()}}>
      <div className={styles['${componentName.toLowerCase()}__item']}></div>
      <div className={styles['${componentName.toLowerCase()}__item']}></div>
      <div className={styles['${componentName.toLowerCase()}__item']}></div>
    </div>
  );
};

export default ${componentName};
  `.trim()

  // Шаблон SCSS
  const scssContent = `
@import '@/scss/common/colors';

.${componentName.toLowerCase()} {
  &__item {
    /* Стили для элементов */
  }
}
  `.trim()

  // Записываем файлы
  fs.writeFileSync(componentFile, componentContent, 'utf8')
  console.log(`Компонент ${componentName}.tsx создан: ${componentFile}`)
  fs.writeFileSync(scssFile, scssContent, 'utf8')
  console.log(`Стили ${componentName}.module.scss созданы: ${scssFile}`)
}

// Запрашиваем имя компонента
rl.question('Введите название компонента: ', (componentName) => {
  if (!componentName) {
    console.log('Имя компонента не может быть пустым.')
    rl.close()
    process.exit(1)
  }

  createReactComponent(componentName)
  rl.close()
  process.exit(0)
})
