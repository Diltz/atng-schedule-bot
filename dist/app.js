"use strict";
// set timezone
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.TZ = 'Asia/Krasnoyarsk';
//
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const telegraf_1 = require("telegraf");
const querystring_1 = __importDefault(require("querystring"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: __dirname + "/.env" });
// regexp
const dateRegexp = /([0-9]{2})\.([0-9]{2}).([0-9]{4})/;
// init database
const db_path = __dirname + "/data.db";
(async () => {
    let db = new better_sqlite3_1.default(db_path);
    db.exec(`CREATE TABLE IF NOT EXISTS users (
            id     INT PRIMARY KEY,
            sgroup VARCHAR (30) 
        );
    `);
    db.close();
})();
//
const bot = new telegraf_1.Telegraf(process.env.token);
bot.start(context => {
    context.reply(`Привет, ${context.from.first_name}! В данном боте ты можешь получить расписание в Ачинском техникуме нефти и газа! Используй команду /help, чтобы узнать больше.`);
});
bot.command('help', async (context) => {
    context.reply(`Вот что я умею:\n/hook [ГРУППА] - Прикрепиться к группе, чтобы получать по ней расписание\n/help - Узнать все команды\n/my [ДАТА?] - Получить расписание по своей группе\n/groups - Получить список групп`);
});
function defineDate(arg) {
    let today = new Date();
    if (arg === "завтра") {
        today = new Date(new Date().setHours(24));
    }
    else if (dateRegexp.test(arg)) {
        return arg;
    }
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
}
// timetable
const timetable = ["8:30 - 9:50", "10:00 - 11:20", "12:00 - 13:20", "13:40 - 15:00", "15:10 - 16:30", "16:40 - 18:00"];
// util
const getschedule = require("./util/getschedule.js");
const getgroups = require("./util/getgroups.js");
// cache
let groups = [];
// get groups
(async () => {
    groups = await getgroups();
})();
//
bot.command('groups', async (context) => {
    if (!groups) {
        return context.reply('Не удалось получить список групп!');
    }
    context.reply(`Список групп к которым можно прикрепиться:\n${groups.join("\n")}`);
});
bot.command('hook', async (context) => {
    let args = context.message.text.split(' ');
    let group = args.slice(1).join(' ');
    if (group.length === 0) {
        return context.reply('Неверное использование команды. Укажите группу.');
    }
    else if (!groups.find(g => g === group)) {
        return context.reply('Такой группы нет! Вы можете получить список групп командой /groups. Убедитесь, что вы написали название группы верно.');
    }
    // connect to db
    let db = new better_sqlite3_1.default(db_path);
    //
    db.prepare(`DELETE FROM users WHERE id = ?`).run(context.from.id);
    db.prepare(`INSERT INTO users (id, sgroup) VALUES (?, ?)`).run(context.from.id, group);
    // reply
    context.reply(`Теперь вы прикреплены к группе ${group}`);
});
bot.command('my', async (context) => {
    let args = context.message.text.split(' ');
    let date = defineDate((args[1] || "").toLowerCase());
    let group;
    // connect to db
    let db = new better_sqlite3_1.default(db_path);
    // get student group
    let result = db.prepare(`SELECT sgroup FROM users WHERE id = ?`).get(context.from.id);
    group = result ? result.sgroup : null;
    // close db
    db.close();
    //
    if (!group) {
        return context.reply('Вы должны прикрепиться к группе!');
    }
    let data = await getschedule(date, group);
    if (!data) {
        return context.reply(`Не удалось получить расписание ${group} на ${date}!`);
    }
    let message = `Расписание группы ${group} на ${date}\n\n`;
    for await (let lenta of data.r) {
        let number = querystring_1.default.unescape(lenta.l).replaceAll("+", " ");
        let discipline = querystring_1.default.unescape(lenta.s).replaceAll("+", " ");
        let classroom = querystring_1.default.unescape(lenta.a).replaceAll("+", " ");
        let time = timetable[Number(number) - 1];
        if (number.length === 0) {
            message += "Лент нет!";
            break;
        }
        message += `${number}) ${time}\n${discipline} - каб. ${classroom}\n`;
    }
    context.reply(message);
});
bot.launch();
//# sourceMappingURL=app.js.map