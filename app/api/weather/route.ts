// app/api/weather/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // 宁波的经纬度
  const latitude = 29.87;
  const longitude = 121.55;

  try {
    // 使用 Open-Meteo 免费天气 API，不需要 Key
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia/Shanghai`;

    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await res.json();

    // 转换和风天气格式，方便前端处理
    const weatherCodeMap: { [key: number]: { text: string; icon: string } } = {
      0: { text: '晴', icon: '100' },
      1: { text: '晴', icon: '100' },
      2: { text: '多云', icon: '101' },
      3: { text: '阴', icon: '104' },
      45: { text: '雾', icon: '501' },
      48: { text: '雾凇', icon: '502' },
      51: { text: '毛毛雨', icon: '300' },
      53: { text: '毛毛雨', icon: '300' },
      55: { text: '毛毛雨', icon: '300' },
      61: { text: '小雨', icon: '305' },
      63: { text: '中雨', icon: '306' },
      65: { text: '大雨', icon: '307' },
      71: { text: '小雪', icon: '400' },
      73: { text: '中雪', icon: '401' },
      75: { text: '大雪', icon: '402' },
      80: { text: '小雨', icon: '305' },
      81: { text: '中雨', icon: '306' },
      82: { text: '大雨', icon: '307' },
      95: { text: '雷阵雨', icon: '302' },
    };

    const code = data.current.weather_code;
    const weatherInfo = weatherCodeMap[code] || { text: '多云', icon: '101' };

    return NextResponse.json({
      code: "200",
      now: {
        temp: Math.round(data.current.temperature_2m).toString(),
        feelsLike: Math.round(data.current.apparent_temperature).toString(),
        humidity: data.current.relative_humidity_2m.toString(),
        windSpeed: data.current.wind_speed_10m.toString(),
        text: weatherInfo.text,
        icon: weatherInfo.icon
      }
    });

  } catch (err: any) {
    console.error('天气 API 请求失败:', err.message);
    return NextResponse.json({
      code: "500",
      message: "天气数据获取失败"
    }, { status: 500 });
  }
}
