require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

const API_KEY = process.env.WAKATIME_API_KEY;

const inputDate = process.argv[2];
const targetDate = inputDate || dayjs().format("YYYY-MM-DD");

const logDir = path.join(__dirname, "log");
const logFile = path.join(logDir, `${targetDate}.md`);

const fetchData = async () => {
  const url = `https://wakatime.com/api/v1/users/current/summaries?start=${targetDate}&end=${targetDate}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(API_KEY).toString("base64")}`,
    },
  });
  return response.data.data[0];
};

const saveLog = (summary) => {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const lines = [`📅 ${targetDate}`];

  summary.languages?.forEach((lang) => {
    lines.push(`- ${lang.name}: ${lang.text}`);
  });

  if (summary.projects?.length) {
    const projects = summary.projects.map((p) => p.name).join(", ");
    lines.push(`- Projects: ${projects}`);
  }

  fs.writeFileSync(logFile, lines.join("\n") + "\n");
  console.log(`✅ Лог сохранён в log/${targetDate}.md`);
};

(async () => {
  try {
    const summary = await fetchData();
    saveLog(summary);
  } catch (error) {
    console.error("❌ Ошибка:", error.response?.data || error.message);
  }
})();
// node waka-log.js
// node waka-log.js 2025-05-27