
import React from 'react';

const WeatherWidget: React.FC = () => {
  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-ink">Hava Durumu</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">Yakında</span>
          <span className="text-sm text-ink-3">Sakarya, Hendek</span>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <div className="text-4xl mr-4">
          ☁️
        </div>
        <div>
          <div className="text-2xl font-bold text-ink">--°C</div>
          <div className="text-sm text-ink-2">Canlı veri yakında eklenecek</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-2">Nem:</span>
          <span className="font-medium">--%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-2">Rüzgar:</span>
          <span className="font-medium">-- m/s</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-rule">
        <p className="text-xs text-ink-3">Entegrasyon hazırlık aşamasındadır</p>
      </div>
    </div>
  );
};

export default WeatherWidget;