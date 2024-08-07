import Image from 'next/image';

import Image_1 from './public/1.png';
import Image_2 from './public/2.png';
import Image_3 from './public/3.png';
import Image_4 from './public/4.png';
import Image_5 from './public/5.png';
import Image_6 from './public/6.png';

export enum SYSTEMS {
  GET = 'systems-get',
  GET_USER = 'users-systems',
  RETRIEVE = 'systems-retrieve',
  POST = 'systems-post',
  TEST = 'system-test',
}

export enum HISTORIES {
  GET = 'histories-get',
  GET_USER = 'users-histories',
  RETRIEVE = 'histories-retrieve',
  POST = 'histories-post',
}

export enum USER {
  COOKIE = 'user-by-cookie-login',
  EMAILVERIFY = 'user-email-varify',
  FORGOTPASSWORD = 'user-password-forgot',
  REGISTRATION = 'user-registration',
  PATCH = 'user-patch',
  LOGIN = 'user-login',
  LOGOUT = 'user-logout',
}

export enum ATTRIBUTES {
  GET = 'attributes-with-attributeValues-get',
}

export enum QUESTIONS {
  GET = 'questions-with-answers-get',
}

export enum OBJECTS {
  GET = 'objects-with-attributeValues-get',
}

export enum RULES {
  GET = 'rules-with-clauses-get',
}

export enum LIKES {
  GET = 'likes-get',
}

export const RUS_LETTERS_ONLY = new RegExp(/^[а-яА-Я]+$/);

export enum OPERATOR {
  EQUAL = 'Equal',
  NOT_EQUAL = 'NotEqual',
  BELOW = 'Below',
  ABOVE = 'Above',
  NO_MORE_THAN = 'NoMoreThan',
  NO_LESS_THAN = 'NoLessThan',
}

type Option = { value: OPERATOR; label: string };

export const operatorOptions: Option[] = [
  { value: OPERATOR.EQUAL, label: '=' },
  { value: OPERATOR.NOT_EQUAL, label: '!=' },
  { value: OPERATOR.BELOW, label: '<' },
  { value: OPERATOR.ABOVE, label: '>' },
  { value: OPERATOR.NO_MORE_THAN, label: '<=' },
  { value: OPERATOR.NO_LESS_THAN, label: '>=' },
];

export enum InstructionType {
  COMMON = 'common',
}

export const INSTRACTIONS = [
  {
    text: [
      ['Нажмите кнопку ', <u key="profile">«Профиль»</u>, ' в правом верхнем углу;'],
      ['Нажмите кнопку ', <u key="new-system">«Новая система»</u>, '.'],
      'Перед Вами откроется страница «Создание новой системы».',
      'Введите название создаваемой экспертной системы, при желании Вы можете прикрепить изображение для обложки системы, а также создать описание системы.',
      'На первоначальном этапе система автоматически является приватной: никто кроме создателя ее не видит. Если Вы желаете, чтобы создаваемая система в дальнейшем была общедоступной, необходимо снять «галочку» с поля «Приватная».',
      ['Для завершения создания системы нажмите кнопку ', <u key="create-system">«Создать систему»</u>, '.'],
    ],
  },
  {
    text: [
      'Далее откроется раздел с возможностью продумать работу экспертной системы: придумать объекты, атрибуты, вопросы, ответы и правила. Разберем подробнее каждый упомянутый выше раздел данной страницы на примере экспертной системы по подбору фрукта.',
      <Image key="image-1" src={Image_1} alt="image" quality={100} placeholder="blur" />,
    ],
  },
  {
    text: [
      'Нам надо подобрать пользователю фрукт. Как это сделать? Надо найти общие отличительные признаки, по которым можно определить самые приоритетные варианты. Такие признаки называются «Атрибуты». ',
      [
        'У фрукта есть ',
        <u key="color">цвет</u>,
        ', ',
        <u key="size">размер</u>,
        ', ',
        <u key="taste">вкус.</u>,
        ' Пусть это и будут атрибуты создаваемой системы.',
      ],
      'Для каждого атрибута введем возможные значения: например, атрибут «Цвет» будет иметь значения: «Зеленый», «Оранжевый», «Желтый», «Красный».',
      <Image key="image-2" src={Image_2} alt="image" quality={100} placeholder="blur" />,
      [
        'После ввода данных, не забывайте нажимать кнопку ',
        <u key="save-1">«Сохранить»</u>,
        ' в нижней части страницы!',
      ],
    ],
  },
  {
    text: [
      'Теперь заполним вкладку «Объекты». Объект – это один из возможных вариантов выбираемого фрукта. У нас объектами будут, например, варианты «Яблоко», «Лимон», «Киви» и «Апельсин». Во вкладке «Объекты» вводим все эти варианты фруктов и подбираем соответствующие им значения придуманных ранее атрибутов. ',
      [<u key="example-1">Пример.</u>, 'Характеристики лимона: желтый цвет, малый размер и кислый вкус.'],
      <Image key="image-3" src={Image_3} alt="image" quality={100} placeholder="blur" />,
      [
        'После ввода данных, не забывайте нажимать кнопку ',
        <u key="save-2">«Сохранить»</u>,
        ' в нижней части страницы!',
      ],
    ],
  },
  {
    text: [
      'Наш следующий шаг при создании собственной экспертной системы – задать вопросы и придумать ответы на них. Переходим во вкладку «Вопросы». Вопрос может быть с вариантами ответов и без них. Если вопрос типа «без вариантов ответа» (внизу под вопросом надо убрать «галочку» с поля «С вариантами ответов»), пользователь сможет ввести в поле ответа числовые значения в момент прохождения системы. ',
      [
        <u key="example-2">Пример.</u>,
        ' На вопрос «Сколько Вам лет?» со свободным ответом пользователь сможет ввести свой возраст в числовом формате.',
      ],
      'Если же вопрос с вариантами ответа, нужно ввести вопрос в поле добавления вопросов и ниже указать возможные варианты ответов. ',
      <Image key="image-4" src={Image_4} alt="image" quality={100} placeholder="blur" />,
      [
        'После ввода данных, не забывайте нажимать кнопку ',
        <u key="save-3">«Сохранить»</u>,
        ' в нижней части страницы!',
      ],
    ],
  },
  {
    text: [
      'Переходим во вкладку «Правила». Заключительной частью создания собственной экспертной системы станет этап продумывания правил работы Вашей системы. Правила должны быть построены на принципе «Если – То» с использованием логических выражений «И», «ИЛИ».',
      'Чтобы добавить логическое выражение «И», нажмите на кнопку «Добавить условие» или иконку «+» рядом с ней.',
      'Чтобы добавить логическое выражение «ИЛИ», нажмите на кнопку «Добавить логическую группу» или иконку «+» рядом с ней.',
      'Правила могут быть двух типов: «Вопрос-Вопрос» и «Вопрос-Атрибут». ',
      'Тип «Вопрос-Атрибут» напрямую влияет на определение приоритетности варианта. ',
      [
        <em key="formula-1">
          <u>Формула:</u>
        </em>,
        ' {ЕСЛИ ([Вопрос] = [Вариант ответа]), ТО ([Атрибут] – [Значение атрибута])}',
      ],
      'Наглядным примером будет одно из правил созданной системы с выбором фрукта: {ЕСЛИ (Выберете напиток = Молочный коктейль) ИЛИ (Вы сладкоежка? = Да!), ТО (Вкус – Сладкий)}',
      <Image key="image-5" src={Image_5} alt="image" quality={100} placeholder="blur" />,
      'Объяснение: если человек из списка напитков выбирает сладкий вариант (молочный коктейль сладкого вкуса) или на вопрос сладкоежка ли он дает положительный ответ, это означает, что пользователь ест сладкое и одними из самых оптимальных объектов станут фрукты, у которых атрибут «Вкус» имеет значение «Сладкий».',
      'Тип «Вопрос-Вопрос» косвенно влияет на определение приоритетности варианта. Как это работает? Человеку задается первый вопрос, и в зависимости от ответа, для другого вопроса автоматически задается определенное значение. Второй вопрос уже не будет задаваться пользователю.',
      [
        <em key="formula-2">
          <u>Формула:</u>
        </em>,
        ' {ЕСЛИ ([Вопрос] = [Вариант ответа]), ТО ([Вопрос] = [Вариант ответа])}',
      ],
      <Image key="image-6" src={Image_6} alt="image" quality={100} placeholder="blur" />,
      'Объяснение: если человек на вопрос сладкоежка ли он дает положительный ответ, это означает, что пользователь любит сладкое, и мы делаем вывод, что на вопрос про напитки он тоже выберет сладкий вариант напитка (молочный коктейль) и мы уже не будем выдавать пользователю вопрос «Выберете напиток». Это позволяет сократить количество вопросов для пользователя.',
      [
        'После ввода данных, не забывайте нажимать кнопку ',
        <u key="save-4">«Сохранить»</u>,
        ' в нижней части страницы!',
      ],
    ],
  },
];
