https://ulon-graphql.vercel.app
Сдержанные цвета: основной UI нейтральный, интерактивные элементы ярче.
Используй иконки с подсказками — сразу понятно, что делает кнопка.
Возможность скрывать/показывать направляющие сетки и рамки элементов.
Визуальный предпросмотр результата с возможностью переключения desktop / tablet / mobile.
<Image
          src="/svg/chevron-left.svg"
          alt="placeholder"
          width={10}
          height={10}
        />
INSERT INTO "JsonDocument" ("name", "content")
VALUES (
'initialTags',
'[
{
"tag": "div",
"text": "default div",
"class": "default-div",
"style": "background-color: #e2e8f0;",
"children": []
}
]'::jsonb
);

grid grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] gap-2
