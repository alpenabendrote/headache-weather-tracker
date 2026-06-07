/**
 * Headache Weather Tracker
 * Googleフォーム送信時に実行され、OpenWeatherMap APIから
 * 当該時刻の気象データを取得してスプレッドシートに記録するスクリプト
 * gemini 3.1 proで生成、一部改変
 */

function onFormSubmit(e) {
  // 1. スクリプトプロパティから認証情報を取得
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('OPENWEATHERMAP_API_KEY');
  const city = scriptProperties.getProperty('LOCATION_CITY'); // 例: Tokyo,JP
  
  if (!apiKey || !city) {
    console.error('エラー: スクリプトプロパティ(OPENWEATHERMAP_API_KEY, LOCATION_CITY)が設定されていません。');
    return;
  }

  try {
    // 2. OpenWeatherMap APIから気象データを取得
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ja`;
    const response = UrlFetchApp.fetch(url);
    const weatherData = JSON.parse(response.getContentText());
    
    // 3. 必要なデータを抽出
    const pressure = weatherData.main.pressure;         // 気圧 (hPa)
    const temp = weatherData.main.temp;                 // 温度 (℃)
    const humidity = weatherData.main.humidity;         // 湿度 (%)
    const weather = weatherData.weather[0].description; // 天気の説明
    const lat = weatherData.coord.lat;                  // 緯度
    const lon = weatherData.coord.lon;                  // 経度

    // 4. スプレッドシートへのデータ書き込み
    // フォーム送信によって追加された最新行を取得
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    // 列構成: A: タイムスタンプ, B: 状態, C: 気圧, D: 温度, E: 湿度, F: 天気, G: 緯度, H: 経度
    // 3列目(C列)から6列分の範囲にデータをセット
    sheet.getRange(lastRow, 3, 1, 6).setValues([[pressure, temp, humidity, weather, lat, lon]]);
    
    console.log(`記録完了: 気圧 ${pressure}hPa, 天気 ${weather}`);
    
  } catch (error) {
    console.error('データ処理中にエラーが発生しました: ' + error.toString());
  }
}
