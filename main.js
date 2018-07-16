// Packages
const request = require('request');
const mysql   = require('mysql');

exports.scrapeWaka = () => {
  // connect to db
  const connection = mysql.createConnection({
    host    : process.env.MYSQL_HOST || '127.0.0.1',
    user    : process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || 'World-123',
    database: process.env.MYSQL_DB   || 'Programming'
  });
  connection.connect();
  const sql = 'INSERT INTO ??(`Name`, `Seconds`, `Minutes`, `Hours`, `Days`, `Percent`) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `Seconds`=?, `Minutes`=?, `Hours`=?, `Days`=?, `Percent`=?';

  // Get results
  const options = {
    method: 'GET',
    url: 'https://wakatime.com/api/v1/users/DylanTackoor/stats/last_year',
    headers: {
      'Cache-Control': 'no-cache',
      'Authorization': `Basic ${process.env.WAKA_AUTH_KEY}`
    }
  };

  request(options, (error, response, body) => {
    if (error) {
      throw new Error(error);
    }

    const wakaData = JSON.parse(body).data;

    // Save editors
    wakaData.editors.forEach((editor) => {
      const percentage = Math.round(editor.percent * 100) / 100;
      const days = getDays(editor.total_seconds);
      const inserts = [
        'Editors',
        editor.name,
        editor.total_seconds,
        getMinutes(editor.total_seconds),
        editor.hours,
        days,
        percentage,
        editor.total_seconds,
        getMinutes(editor.total_seconds),
        editor.hours,
        days,
        percentage
      ];
      const queryString = mysql.format(sql, inserts);
      connection.query(queryString);

    });

    // Save languages
    wakaData.languages.forEach((language) => {
      const percentage = Math.round(language.percent * 100) / 100;
      const days = getDays(language.total_seconds);
      const inserts = [
        'Languages',
        language.name,
        language.total_seconds,
        getMinutes(language.total_seconds),
        language.hours,
        days,
        percentage,
        language.total_seconds,
        getMinutes(language.total_seconds),
        language.hours,
        days,
        percentage
      ];

      const queryString = mysql.format(sql, inserts);
      connection.query(queryString);
    });

    // Save Operating Systems
    wakaData.operating_systems.forEach((os) => {
      const percentage = Math.round(os.percent * 100) / 100;
      const days = getDays(os.total_seconds);
      const inserts = [
        'Operating Systems',
        os.name,
        os.total_seconds,
        getMinutes(os.total_seconds),
        os.hours,
        days,
        percentage,
        os.total_seconds,
        getMinutes(os.total_seconds),
        os.hours,
        days,
        percentage
      ];

      const queryString = mysql.format(sql, inserts);
      connection.query(queryString);
    });

    // TODO: wakaData.projects

    connection.end();
  });


  function getDays(totalSeconds) {
    return Math.round(totalSeconds / 86400 * 100) / 100;
  }

  function getMinutes(totalSeconds) {
    return Math.round(totalSeconds / 60 * 100) / 100;
  }
};
