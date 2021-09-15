const _ = require('lodash');
const TelegramBot = require('node-telegram-bot-api'); // подключаем node-telegram-bot-api
const token = '1991855297:AAEWr2uqCO643aUTjpkSXfQa6N6OvzSE_FM'; // тут токен кторый мы получили от botFather
const axios = require('axios')
const url = 'https://monitor.tis.tatar';
const dataUri = '/Api/Db/OpenReport/onlineStats';
const dataUriAll = '/Api/Db/OpenReport/onlineStatsAll';

Number.prototype.toDivide = function () {
    var int = String(Math.trunc(this));
    if (int.length <= 3) return int;
    var space = 0;
    var number = '';

    for (var i = int.length - 1; i >= 0; i--) {
        if (space == 3) {
            number = ' ' + number;
            space = 0;
        }
        number = int.charAt(i) + number;
        space++;
    }
    return number;
}

console.log('Бот работает')

const buttons = [
    [
        {
            text: "Татарстан",
            callback_data: "tatar",

        },
        {
            text: "Дагестан",
            callback_data: "dagestan"
        },
        {
            text: "Раменское",
            callback_data: "mo"
        }
    ],
    [
        {
            text: "КБР",
            callback_data: "kbr"
        },
        {
            text: "Иркутск",
            callback_data: "irkutsk"
        },
        {
            text: "Саратов",
            callback_data: "saratov"
        }
    ],
    [
        {
            text: "Калининград",
            callback_data: "kaliningrad"
        },
        {
            text: "Бор НО",
            callback_data: "no"
        },
        {
            text: "Тамбов",
            callback_data: "tambov"
        }
    ]
];

const key_back = [
    [{
        text: 'Показать регионы',
    }],
    [{
        text: 'Тех. поддержка',
    }],

];

const fields = [
    {
        code: 'ecg',
        name: 'ЭКГ',
    },
    {
        code: 'holter',
        name: 'XM',
    },
    {
        code: 'smad',
        name: 'СМАД',
    },
];

// включаем самого обота
const bot = new TelegramBot(token, {
    polling: true
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id; //получаем идентификатор диалога, чтобы отвечать именно тому пользователю, который нам что-то прислал
    console.log(msg)
    // отправляем сообщение
    if (msg.text === 'Тех. поддержка') {
        bot.sendMessage(chatId, 'Горячая линия: *+78005005149*\nEmail: *mail@tis.tatar*', {
            parse_mode: 'Markdown'
        });
    } else {
        bot.sendMessage(chatId, 'Выбери регион, в котором хочешь видеть статистику по Единому кардиологу', { // прикрутим клаву
            reply_markup: {
                inline_keyboard: buttons
            }
        });
    }
});
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    Promise.all([
            axios.get(`${url}/${query.data}${dataUri}`),
            axios.get(`${url}/${query.data}${dataUriAll}`)
        ])
        .then(function ([res, resAll]) {
            const button = _(buttons).flatten().find(['callback_data', query.data]);
            const total = fields.map(field => ({
                ...field,
                value: _.sumBy(res.data.rows, field.code)
            }))

            const totalAll = fields.map(field => ({
                ...field,
                value: _.sumBy(resAll.data.rows, field.code)
            }))

            bot.sendMessage(chatId, `${button.text} *за сегодня*:\n${total
                .map(t => `\t${t.name}: ${t.value.toDivide()}`)
                .join('\n')}`, {
                parse_mode: 'Markdown'
            });
            bot.sendMessage(chatId, `${button.text} *за всё время*:\n${totalAll.map(t => `\t${t.name}: ${t.value.toDivide()}`).join('\n')}`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: key_back
                }
            });
        });
})