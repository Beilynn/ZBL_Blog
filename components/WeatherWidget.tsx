"use client";

import { useState, useEffect } from 'react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ 
    temp: number; 
    text: string; 
    feelsLike: number;
    humidity: number;
    windSpeed: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather');
        const data = await res.json();
        
        if (data.code === "200" && data.now) {
          setWeather({
            temp: parseInt(data.now.temp),
            text: data.now.text,
            feelsLike: parseInt(data.now.feelsLike),
            humidity: parseInt(data.now.humidity),
            windSpeed: parseInt(data.now.windSpeed),
          });
        } else {
          throw new Error('Weather data error');
        }
      } catch (err) {
        // 失败时用默认数据
        setWeather({
          temp: 20,
          text: '局部多云',
          feelsLike: 20,
          humidity: 73,
          windSpeed: 11,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // 每 10 分钟刷新一次
    const timer = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (text: string) => {
    if (text.includes('晴')) return '☀️';
    if (text.includes('多云')) return '⛅';
    if (text.includes('阴')) return '☁️';
    if (text.includes('雨')) return '🌧️';
    if (text.includes('雪')) return '❄️';
    return '⛅';
  };

  return (
    <div className="w-full bg-[#fdf6ec] rounded-3xl p-5 shadow-lg">
      {loading ? (
         <div className="flex flex-col items-center gap-3 text-slate-500 w-full justify-center py-8">
           <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
           <span className="text-xs font-bold">天气加载中...</span>
         </div>
      ) : weather && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-slate-700 mb-1">📍 宁波市</div>
              <div className="text-4xl font-bold text-slate-900">{weather.temp}°</div>
              <div className="text-sm text-slate-800 mt-1">{weather.text}</div>
            </div>
            <div className="text-5xl">
              {getWeatherIcon(weather.text)}
            </div>
          </div>
          
          <div className="border-t border-[#e8d5c4] my-3"></div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-[#f5ebe0] rounded-xl p-2">
              <div className="text-xs text-slate-600 mb-1">体感</div>
              <div className="text-sm font-bold text-slate-900">{weather.feelsLike}°</div>
            </div>
            <div className="text-center bg-[#f5ebe0] rounded-xl p-2">
              <div className="text-xs text-slate-600 mb-1">湿度</div>
              <div className="text-sm font-bold text-slate-900">{weather.humidity}%</div>
            </div>
            <div className="text-center bg-[#f5ebe0] rounded-xl p-2">
              <div className="text-xs text-slate-600 mb-1">风速</div>
              <div className="text-sm font-bold text-slate-900">{weather.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
